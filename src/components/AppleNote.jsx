import { useEffect, useMemo, useRef, useState } from 'react'
import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Euler, MathUtils, Quaternion, Vector3 } from 'three'

import { createNoteTexture } from './noteTexture'

const CARD = { width: 1.9, height: 1.85, depth: 0.06, radius: 0.05 }

// The face is a plane sitting just proud of the card's front, so the two can't
// z-fight. It is part of the same object, which is the point: a DOM face could
// only be tied to the card through a CSS 3D transform, and WebKit rasterises
// such a layer at its own scale — on iOS the note came out sized and placed
// differently from the card it belongs to. Painted into a texture it moves with
// the card exactly, on every browser, and the depth buffer hides it behind the
// notes in front. (See noteTexture.js.)
const FACE_GAP = 0.002

// Reused every frame so the damping doesn't allocate.
const tmpVec = new Vector3()
const tmpEuler = new Euler()
const tmpQuat = new Quaternion()

// A second tap this soon after the first, and this close to it in screen pixels,
// opens the note — phones don't send a usable dblclick, so touch gets its own
// double-tap. The slack is generous because a finger is not a mouse.
const TAP_GAP_MS = 320
const TAP_SLOP_PX = 26

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
}) {
  const groupRef = useRef()
  const lastTap = useRef({ time: 0, x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  // Only the mount values — every later move is damped in useFrame instead of
  // snapping when the stack re-renders.
  const initial = useRef({ position, rotation }).current

  const texture = useMemo(() => createNoteTexture({ title, date, body }), [title, date, body])
  useEffect(() => () => texture.dispose(), [texture])

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

      <mesh
        position={[0, 0, CARD.depth / 2 + FACE_GAP]}
        // Decoration only. A group's handler runs once per intersected child,
        // so leaving the face hittable turned one tap into two events on top of
        // each other — a single tap opened the note. The card behind it is the
        // one thing that takes pointer events.
        raycast={() => null}
      >
        <planeGeometry args={[CARD.width, CARD.height]} />
        {/* Unlit and untone-mapped so the note reads at the same contrast the
            DOM one did, wherever the card happens to be facing. The texture is
            transparent outside its rounded corners, so the card's own corners
            show through. A plane is front-facing only, so nothing of the note
            shows from behind. */}
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}
