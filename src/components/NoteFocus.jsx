import { useEffect } from 'react'

import { NoteFace } from './AppleNote'
import { notes } from './notes'
import styles from './AppleNote.module.css'

// Focus mode. Deliberately plain DOM outside the canvas: the note sits still in
// the middle of the screen, so scrolling it is native and can't fight the
// per-frame transform that drives the note faces in the stack.
export default function NoteFocus({ index, onClose }) {
  const open = index !== null && index !== undefined

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const note = open ? notes[index] : null
  if (!note) return null

  return (
    <div
      className={styles.backdrop}
      // Anywhere outside the note closes it. The note is the only child, so
      // anything that starts on the backdrop itself — including the gap around
      // the note — is a click away; a drag that begins on the scrollbar or on
      // the text does not reach here.
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <NoteFace
        className={styles.focused}
        title={note.title}
        date={note.date}
        body={note.body}
      />
    </div>
  )
}
