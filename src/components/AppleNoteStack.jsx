import { useThree } from '@react-three/fiber'

import AppleNote from './AppleNote'
import { notes } from './notes'

// Offset applied per note going back through the stack.
const STEP = { x: 0.07, y: 0.08, z: -0.16, yaw: 0.06 }
const BASE_YAW = -0.1

// Card width in world units (see CARD in AppleNote), plus the spread of the
// stack on either side of the origin and a little air. The camera's field of
// view is vertical, so only width ever runs out — on a portrait phone first.
const NEEDED_WIDTH = (1.9 + 2 * (notes.length - 1) * STEP.x) * 1.12

// Every note face sits above the canvas, so their own z-index decides which one
// covers which. Passing an equal low and high end pins each note to one exact
// z-index, front note highest, so a note never bleeds through the one covering
// it. (See the zIndexRange note in AppleNote.)
const stackedZ = (index) => {
  const z = 100 - index
  return [z, z]
}

export default function AppleNoteStack({ position = [0, 0, 0], onOpen }) {
  // World units visible across the screen at the stack's depth — it shrinks with
  // the window, so this scales the stack to fit narrow screens instead of
  // letting them crop it. Never scales past 1: desktop is unchanged.
  const viewportWidth = useThree((state) => state.viewport.width)
  const fit = Math.min(1, viewportWidth / NEEDED_WIDTH)

  const layoutFor = (i) => ({
    position: [i * STEP.x, i * STEP.y, i * STEP.z],
    rotation: [0, BASE_YAW + i * STEP.yaw, 0],
  })

  return (
    <group position={position} scale={fit}>
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
          zIndexRange={stackedZ(i)}
        />
      ))}
    </group>
  )
}
