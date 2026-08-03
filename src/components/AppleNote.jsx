import { useEffect, useRef, useState } from 'react'
import { Html, RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Euler, MathUtils, Quaternion, Vector3 } from 'three'

import styles from './AppleNote.module.css'

const CARD = { width: 1.9, height: 1.85, depth: 0.06, radius: 0.05 }

// <Html transform> maps 1 world unit to 40px at scale 1, so this sizes the DOM
// note to land exactly on the card face: 600 x 584 css pixels.
const PX_PER_UNIT = 40
const HTML_WIDTH = 600
const HTML_SCALE = (CARD.width * PX_PER_UNIT) / HTML_WIDTH
const HTML_HEIGHT = (CARD.height * PX_PER_UNIT) / HTML_SCALE

// Reused every frame so the damping doesn't allocate.
const tmpVec = new Vector3()
const tmpEuler = new Euler()
const tmpQuat = new Quaternion()
const tmpFacePos = new Vector3()
const tmpFaceQuat = new Quaternion()
const tmpNormal = new Vector3()
const tmpToCamera = new Vector3()

// A note face is DOM painted over the canvas, so the depth buffer can't hide it
// when the card turns away — it would show through the back, mirrored. Instead
// the face is faded out by how squarely it points at the camera: fully gone
// below FADE_OUT, fully solid above FADE_IN, so it is unreadable well before the
// card goes edge-on.
const FADE_OUT = 0.12
const FADE_IN = 0.3

// A second tap this soon after the first, and this close to it in screen pixels,
// opens the note — phones don't send a usable dblclick, so touch gets its own
// double-tap. The slack is generous because a finger is not a mouse.
const TAP_GAP_MS = 320
const TAP_SLOP_PX = 26

// Markdown-style links in a note body: [label](https://example.com)
const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g

// Line-level markup: "# Title" through "### Subheading", "- item", "1. item" /
// "1) item", "[ ] todo" / "[x] done" (a leading "- " before a checkbox is fine).
const HEADING_RE = /^\s*(#{1,3})\s+(.*)$/
const CHECK_RE = /^\s*(?:[-*]\s+)?\[([ xX])\]\s+(.*)$/
const NUMBER_RE = /^\s*(\d+)[.)]\s+(.*)$/
const BULLET_RE = /^\s*[-*]\s+(.*)$/

function renderInline(line) {
  const parts = []
  let cursor = 0
  for (const match of line.matchAll(LINK_RE)) {
    if (match.index > cursor) parts.push(line.slice(cursor, match.index))
    parts.push(
      <a
        key={match.index}
        className={styles.link}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
      >
        {match[1]}
      </a>,
    )
    cursor = match.index + match[0].length
  }
  if (cursor < line.length) parts.push(line.slice(cursor))
  return parts
}

function renderLine(line, key) {
  const heading = line.match(HEADING_RE)
  if (heading) {
    const level = styles[`h${heading[1].length}`]
    return (
      <div key={key} className={level}>
        {renderInline(heading[2])}
      </div>
    )
  }

  const check = line.match(CHECK_RE)
  if (check) {
    const done = check[1].toLowerCase() === 'x'
    return (
      <div key={key} className={styles.item}>
        <span className={`${styles.checkbox} ${done ? styles.checked : ''}`}>
          {done && (
            <svg className={styles.tick} viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M2.6 6.3 5 8.6 9.4 3.8"
                fill="none"
                stroke="#fff"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className={styles.itemText}>{renderInline(check[2])}</span>
      </div>
    )
  }

  const numbered = line.match(NUMBER_RE)
  if (numbered) {
    return (
      <div key={key} className={styles.item}>
        <span className={styles.marker}>{numbered[1]}.</span>
        <span className={styles.itemText}>{renderInline(numbered[2])}</span>
      </div>
    )
  }

  const bullet = line.match(BULLET_RE)
  if (bullet) {
    return (
      <div key={key} className={styles.item}>
        <span className={styles.marker}>•</span>
        <span className={styles.itemText}>{renderInline(bullet[1])}</span>
      </div>
    )
  }

  return (
    <div key={key} className={styles.line}>
      {renderInline(line)}
    </div>
  )
}

// The note itself, as plain DOM. Used twice: pasted onto the 3D card in the
// stack, and blown up in the middle of the screen in focus mode.
export function NoteFace({ title = 'New Note', date = '', body = '', className = '', style, rootRef }) {
  const lines = body.split('\n')

  return (
    <div data-note ref={rootRef} className={`${styles.window} ${className}`} style={style}>
      <div className={styles.titleBar}>
        <span className={`${styles.light} ${styles.red}`} />
        <span className={`${styles.light} ${styles.yellow}`} />
        <span className={`${styles.light} ${styles.green}`} />
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.stamp}>{date}</div>

      <div className={styles.body}>
        {body ? lines.map((line, i) => renderLine(line, i)) : <div className={styles.caret} />}
      </div>
    </div>
  )
}

export default function AppleNote({
  title,
  date,
  body,
  position = [0, 0, 0],
  rotation = [0, -0.1, 0],
  scale = 1,
  onDoubleClick,
  floatPhase = 0,
  floatAmount = 1,
  zIndexRange = [1000, 0],
}) {
  const groupRef = useRef()
  const faceRef = useRef()
  const faceOpacity = useRef(1)
  const lastTap = useRef({ time: 0, x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  // Only the mount values — every later move is damped in useFrame instead of
  // snapping when the stack re-renders.
  const initial = useRef({ position, rotation }).current

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])

  useFrame((state, delta) => {
    const group = groupRef.current
    if (!group) return
    const damp = 1 - Math.exp(-6 * delta)

    const t = state.clock.elapsedTime + floatPhase
    tmpVec.set(position[0], position[1] + Math.sin(t * 0.6) * 0.04 * floatAmount, position[2])
    tmpEuler.set(
      rotation[0] + Math.sin(t * 0.5) * 0.02 * floatAmount,
      rotation[1] + Math.sin(t * 0.4) * 0.06 * floatAmount,
      rotation[2] ?? 0,
    )
    tmpQuat.setFromEuler(tmpEuler)

    group.position.lerp(tmpVec, damp)
    group.quaternion.slerp(tmpQuat, damp)

    const targetScale = scale * (hovered ? 1.04 : 1)
    group.scale.setScalar(MathUtils.lerp(group.scale.x, targetScale, damp))

    // Hide the face once the card starts turning away from the camera.
    const face = faceRef.current
    if (face) {
      group.getWorldPosition(tmpFacePos)
      tmpNormal.set(0, 0, 1).applyQuaternion(group.getWorldQuaternion(tmpFaceQuat))
      tmpToCamera.subVectors(state.camera.position, tmpFacePos).normalize()
      const facing = tmpNormal.dot(tmpToCamera)
      const opacity = MathUtils.clamp((facing - FADE_OUT) / (FADE_IN - FADE_OUT), 0, 1)
      if (Math.abs(opacity - faceOpacity.current) > 0.005) {
        face.style.opacity = opacity
        face.style.visibility = opacity > 0 ? 'visible' : 'hidden'
        faceOpacity.current = opacity
      }
    }
  })

  return (
    <group
      ref={groupRef}
      position={initial.position}
      rotation={initial.rotation}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onDoubleClick?.()
      }}
      onPointerUp={(e) => {
        if (e.pointerType !== 'touch') return
        const { time, x, y } = lastTap.current
        const now = performance.now()
        if (now - time < TAP_GAP_MS && Math.hypot(e.clientX - x, e.clientY - y) < TAP_SLOP_PX) {
          lastTap.current = { time: 0, x: 0, y: 0 }
          e.stopPropagation()
          onDoubleClick?.()
        } else {
          lastTap.current = { time: now, x: e.clientX, y: e.clientY }
        }
      }}
      onPointerOver={(e) => {
        // A finger isn't hovering — it would stick the note at hover scale and
        // leave the cursor as a pointer with nothing under it.
        if (e.pointerType === 'touch') return
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox
        args={[CARD.width, CARD.height, CARD.depth]}
        radius={CARD.radius}
        smoothness={4}
      >
        <meshStandardMaterial color="#e8e8ed" roughness={0.55} metalness={0.05} />
      </RoundedBox>

      <Html
        transform
        // The face is decoration only: it takes no pointer events, so hovering
        // and double-clicking are raycast against the card underneath and no
        // note ever swallows a click meant for the one in front of it. Reading
        // and clicking links happens in focus mode, which is ordinary DOM.
        pointerEvents="none"
        scale={HTML_SCALE}
        position={[0, 0, CARD.depth / 2 + 0.002]}
        // Left to itself drei spreads the z-index across the camera's whole
        // near/far range, and notes a fraction of a unit apart round to the
        // *same* value — content then bleeds between them. The stack pins each
        // note to one exact z-index instead.
        zIndexRange={zIndexRange}
      >
        <NoteFace
          rootRef={faceRef}
          title={title}
          date={date}
          body={body}
          style={{ width: HTML_WIDTH, height: HTML_HEIGHT }}
        />
      </Html>
    </group>
  )
}
