import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

import AppleNote from './AppleNote'
import { notes } from './notes'

// Seconds for the stack to turn all the way round. Slow enough that a face can
// still be read as it drifts past, and that it never competes with the orbit
// the visitor is driving themselves.
const SPIN_SECONDS = 75
const TWO_PI = Math.PI * 2

// Offset applied per note going back through the stack.
const STEP = { x: 0.14, y: 0.16, z: -0.32, yaw: 0.06 }
const BASE_YAW = -0.1

// Card width in world units (see CARD in AppleNote), plus the spread of the
// stack on either side of the origin and a little air. The camera's field of
// view is vertical, so only width ever runs out — on a portrait phone first.
const NEEDED_WIDTH = (1.9 + 2 * (notes.length - 1) * STEP.x) * 1.12

export default function AppleNoteStack({ position = [0, 0, 0], onOpen }) {
  // World units visible across the screen at the stack's depth — it shrinks with
  // the window, so this scales the stack to fit narrow screens instead of
  // letting them crop it. Never scales past 1: desktop is unchanged.
  const viewportWidth = useThree((state) => state.viewport.width)
  const fit = Math.min(1, viewportWidth / NEEDED_WIDTH)

  // Turned here rather than by orbiting the camera, so a visitor dragging the
  // scene around is never fighting the drift — the two just add up. Wrapped so
  // the angle can't grow without bound over a long-lived tab.
  const stackRef = useRef()
  useFrame((_, delta) => {
    const stack = stackRef.current
    if (!stack) return
    stack.rotation.y = (stack.rotation.y + (delta * TWO_PI) / SPIN_SECONDS) % TWO_PI
  })

  const layoutFor = (i) => ({
    position: [i * STEP.x, i * STEP.y, i * STEP.z],
    rotation: [0, BASE_YAW + i * STEP.yaw, 0],
  })

  return (
    <group ref={stackRef} position={position} scale={fit}>
      {notes.map((note, i) => (
        <AppleNote
          key={note.id}
          title={note.title}
          date={note.date}
          body={note.body}
          {...layoutFor(i)}
          onDoubleClick={() => onOpen?.(i)}
          floatPhase={i * 1.3}
          floatAmount={Math.max(0.4, 1 - i * 0.15)}
        />
      ))}
    </group>
  )
}
