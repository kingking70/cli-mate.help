import { CanvasTexture, SRGBColorSpace } from 'three'

import { parseInline, parseLine } from './noteMarkup'

// The note face is painted into a texture and mapped onto the front of the
// card, rather than being DOM floated over the canvas. A DOM face can only be
// tied to the card through a CSS 3D transform, and WebKit rasterises such a
// layer at its own (tiny) transform scale, so on iOS the face came out at a
// different size from the card it belongs to. Painted into the card's own
// material there is nothing left to come apart: it is the same object, it is
// hidden from behind by the depth buffer, and notes in front occlude the ones
// behind for free.

// Layout is in the same CSS pixels as the DOM note (see AppleNote.module.css),
// drawn at SCALE device pixels each. 600 x 584 matches the card's 1.9 x 1.85.
const SCALE = 1.5
const FACE = { width: 600, height: 584, radius: 16 }

const FAMILY = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif'
const INK = '#1d1d1f'
const MUTED = '#86868b'

const TITLE_BAR = { height: 42, left: 14, light: 6, gap: 8, titleGap: 14, size: 15 }
const STAMP = { size: 11.5, height: 15 }
const BODY = { left: 14, right: 14, top: 16, marker: 14, gap: 8 }
const LINE = { size: 14, height: 22 }

// Matches the .h1 / .h2 / .h3 text styles.
const HEADINGS = {
  h1: { size: 22, height: 28, weight: 700, top: 10 },
  h2: { size: 17, height: 24, weight: 700, top: 10 },
  h3: { size: 15, height: 22, weight: 600, top: 10 },
}

const font = (size, weight = 400) => `${weight} ${size}px ${FAMILY}`

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function circle(ctx, x, y, r) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.closePath()
}

// Breaks the runs of one line into visual lines that fit maxWidth, keeping each
// word's link with it.
function wrap(ctx, runs, maxWidth) {
  const lines = [[]]
  let width = 0
  for (const run of runs) {
    // Keep the spaces: they are what separates the words once drawn.
    for (const word of run.text.split(/(\s+)/)) {
      if (!word) continue
      const w = ctx.measureText(word).width
      const blank = !word.trim()
      if (width + w > maxWidth && width > 0 && !blank) {
        lines.push([])
        width = 0
      }
      if (blank && width === 0) continue
      lines[lines.length - 1].push({ text: word, href: run.href, width: w })
      width += w
    }
  }
  return lines
}

function drawRun(ctx, run, x, y) {
  ctx.fillText(run.text, x, y)
  if (run.href) {
    // Links read as the text around them; only the underline marks them.
    ctx.fillRect(x, y + LINE.size * 0.42, run.width, 1)
  }
}

function paint(ctx, { title, date, body }) {
  ctx.textBaseline = 'middle'

  // The rounded white face, clipped so nothing can paint past the card's edge.
  roundedRect(ctx, 0, 0, FACE.width, FACE.height, FACE.radius)
  ctx.clip()
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, FACE.width, FACE.height)

  // Title bar.
  const lightY = TITLE_BAR.height / 2
  const step = TITLE_BAR.light * 2 + TITLE_BAR.gap
  const lights = ['#ff5f57', '#febc2e', '#28c840']
  lights.forEach((colour, i) => {
    ctx.fillStyle = colour
    circle(ctx, TITLE_BAR.left + TITLE_BAR.light + i * step, lightY, TITLE_BAR.light)
    ctx.fill()
  })
  ctx.fillStyle = INK
  ctx.font = font(TITLE_BAR.size, 600)
  ctx.textAlign = 'left'
  const titleX = TITLE_BAR.left + lights.length * step - TITLE_BAR.gap + TITLE_BAR.titleGap
  ctx.fillText(title, titleX, lightY)

  // Date stamp.
  ctx.fillStyle = MUTED
  ctx.font = font(STAMP.size)
  ctx.textAlign = 'center'
  ctx.fillText(date, FACE.width / 2, TITLE_BAR.height + STAMP.height / 2)

  // Body.
  ctx.textAlign = 'left'
  let y = TITLE_BAR.height + STAMP.height + BODY.top
  const lines = body.split('\n')
  let clipped = false

  for (const [index, raw] of lines.entries()) {
    if (y > FACE.height) {
      clipped = true
      break
    }

    const parsed = parseLine(raw)
    const heading = HEADINGS[parsed.kind]
    const size = heading ? heading.size : LINE.size
    const height = heading ? heading.height : LINE.height
    if (heading && index > 0) y += heading.top

    ctx.font = font(size, heading ? heading.weight : 400)
    ctx.fillStyle = INK

    const indent = parsed.kind === 'text' || heading ? BODY.left : BODY.left + BODY.marker + BODY.gap
    const maxWidth = FACE.width - indent - BODY.right
    const wrapped = wrap(ctx, parseInline(parsed.text), maxWidth)

    // The marker or checkbox sits on the item's first line.
    if (parsed.kind === 'check') {
      const cx = BODY.left + 7
      const cy = y + height / 2
      circle(ctx, cx, cy, 6.25)
      if (parsed.done) {
        ctx.fillStyle = '#f5b301'
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.9
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(cx - 3.4, cy + 0.3)
        ctx.lineTo(cx - 1, cy + 2.6)
        ctx.lineTo(cx + 3.4, cy - 2.2)
        ctx.stroke()
      } else {
        ctx.strokeStyle = '#c7c7cc'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
      ctx.fillStyle = INK
    } else if (parsed.marker) {
      ctx.textAlign = 'right'
      ctx.fillText(parsed.marker, BODY.left + BODY.marker, y + height / 2)
      ctx.textAlign = 'left'
    }

    for (const line of wrapped) {
      if (y > FACE.height) {
        clipped = true
        break
      }
      let x = indent
      for (const run of line) {
        drawRun(ctx, run, x, y + height / 2)
        x += run.width
      }
      y += height
    }
  }

  // A note longer than its card fades out rather than being cut mid-word.
  if (clipped) {
    const fade = ctx.createLinearGradient(0, FACE.height - 56, 0, FACE.height)
    fade.addColorStop(0, 'rgba(255,255,255,0)')
    fade.addColorStop(1, 'rgba(255,255,255,1)')
    ctx.fillStyle = fade
    ctx.fillRect(0, FACE.height - 56, FACE.width, 56)
  }
}

// Paints one note and returns it as a texture ready for the card's front face.
// The caller owns it and should dispose it when the note goes away.
export function createNoteTexture({ title = 'New Note', date = '', body = '' }) {
  const canvas = document.createElement('canvas')
  canvas.width = FACE.width * SCALE
  canvas.height = FACE.height * SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(SCALE, SCALE)
  paint(ctx, { title, date, body })

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  // Keeps the face readable when the card is seen at a glancing angle.
  texture.anisotropy = 8
  return texture
}
