// Shared reading of a note body. The stack paints notes into a canvas texture
// and focus mode renders them as DOM, so both go through here and can't drift
// apart. See notes.js for the markup this accepts.

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g
const HEADING_RE = /^\s*(#{1,3})\s+(.*)$/
const CHECK_RE = /^\s*(?:[-*]\s+)?\[([ xX])\]\s+(.*)$/
const NUMBER_RE = /^\s*(\d+)[.)]\s+(.*)$/
const BULLET_RE = /^\s*[-*]\s+(.*)$/

// One line of a body: a heading, a checklist / numbered / bulleted item, or
// plain text.
export function parseLine(line) {
  const heading = line.match(HEADING_RE)
  if (heading) return { kind: `h${heading[1].length}`, text: heading[2] }

  const check = line.match(CHECK_RE)
  if (check) return { kind: 'check', text: check[2], done: check[1].toLowerCase() === 'x' }

  const numbered = line.match(NUMBER_RE)
  if (numbered) return { kind: 'number', text: numbered[2], marker: `${numbered[1]}.` }

  const bullet = line.match(BULLET_RE)
  if (bullet) return { kind: 'bullet', text: bullet[1], marker: '•' }

  return { kind: 'text', text: line }
}

// Splits the text of a line into runs: [{ text, href? }].
export function parseInline(text) {
  const runs = []
  let cursor = 0
  for (const match of text.matchAll(LINK_RE)) {
    if (match.index > cursor) runs.push({ text: text.slice(cursor, match.index) })
    runs.push({ text: match[1], href: match[2] })
    cursor = match.index + match[0].length
  }
  if (cursor < text.length) runs.push({ text: text.slice(cursor) })
  return runs
}
