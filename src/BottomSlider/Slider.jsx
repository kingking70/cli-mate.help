import React, { useRef, useCallback } from 'react'
import { useGesture } from '@use-gesture/react'
import { useSprings, a } from '@react-spring/web'

// Inline styles to keep the demo self-contained
const styles = {
  container: { position: 'relative', height: '100%', width: '100%', touchAction: 'none' },
  item: { position: 'absolute', height: '100%', willChange: 'transform' },
}

/**
 * Calculates a spring-physics driven infinite slider
 *
 * @param {Array} items - display items
 * @param {Function} children - render child
 * @param {number} width - fixed item with
 * @param {number} visible - number of items that must be visible on screen
 */
export function Slider({ items, width = 600, visible = 4, style, children }) {
  // Wrap index into [0, length) for infinite looping
  const idx = useCallback((x, l = items.length) => (x < 0 ? x + l : x) % l, [items])
  // Relative position of an item in the current visible window
  const getPos = useCallback((i, firstVis, firstVisIdx) => idx(i - firstVis + firstVisIdx), [idx])
  // One spring per card; lay them out horizontally
  const [springs, api] = useSprings(items.length, i => ({ x: (i < items.length - 1 ? i : -1) * width }))
  // Store previous first-visible state to control immediate vs animated updates
  const prev = useRef([0, 1])
  // Gesture target ref
  const target = useRef()

  // Main animator: updates all item springs based on offset (y) and direction (dy)
  const runSprings = useCallback(
    (y, dy) => {
      // Determine which item is first in view given the current offset
      const firstVis = idx(Math.floor(y / width) % items.length)
      // Bias the layout depending on scroll direction to keep the loop seamless
      const firstVisIdx = dy < 0 ? items.length - visible - 1 : 1
      api.start(i => {
        // Place each item relative to the current visible window
        const position = getPos(i, firstVis, firstVisIdx)
        const prevPosition = getPos(i, prev.current[0], prev.current[1])
        // Compute rank along the infinite rail and derive final x
        const rank = firstVis - (y < 0 ? items.length : 0) + position - firstVisIdx
        const configPos = dy > 0 ? position : items.length - position
        return {
          x: (-y % (width * items.length)) + width * rank,
          // Switch to immediate for the card(s) that wrap around to avoid visible jumps
          immediate: dy < 0 ? prevPosition > position : prevPosition < position,
          // Tweak spring stiffness/friction by distance for a natural feel
          config: { tension: (1 + items.length - configPos) * 100, friction: 30 + configPos * 40 },
        }
      })
      // Cache current state for the next frame
      prev.current = [firstVis, firstVisIdx]
    },
    [idx, getPos, width, visible, api, items.length]
  )

  // Accumulate independent offsets for wheel and drag interactions
  const wheelOffset = useRef(0)
  const dragOffset = useRef(0)

  // Bind drag and wheel interactions to the container
  useGesture(
    {
      onDrag: ({ event, offset: [x], direction: [dx] }) => {
        event.preventDefault()
        if (dx) {
          // Convert horizontal drag to our internal offset and animate
          dragOffset.current = -x
          runSprings(wheelOffset.current + -x, -dx)
        }
      },
      onWheel: ({ event, offset: [, y], direction: [, dy] }) => {
        event.preventDefault()
        if (dy) {
          // Combine drag and wheel offsets for a smooth, continuous experience
          wheelOffset.current = y
          runSprings(dragOffset.current + y, dy)
        }
      },
    },
    { target, wheel: { eventOptions: { passive: false } } }
  )

  return (
    <div ref={target} style={{ ...style, ...styles.container }}>
      {springs.map(({ x }, i) => (
        // Each card is an absolutely positioned animated div translated by its spring x
        <a.div key={i} style={{ ...styles.item, width, x }} children={children(items[i], i)} />
      ))}
    </div>
  )
}
