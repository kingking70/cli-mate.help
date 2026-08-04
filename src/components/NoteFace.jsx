import { parseInline, parseLine } from './noteMarkup'
import styles from './AppleNote.module.css'

// The note as DOM. Only focus mode uses this now — the notes in the stack are
// painted into the card's own texture (see noteTexture.js).

function renderInline(text) {
  return parseInline(text).map((run, i) =>
    run.href ? (
      <a key={i} className={styles.link} href={run.href} target="_blank" rel="noopener noreferrer">
        {run.text}
      </a>
    ) : (
      run.text
    ),
  )
}

function renderLine(line, key) {
  const parsed = parseLine(line)

  if (parsed.kind.startsWith('h')) {
    return (
      <div key={key} className={styles[parsed.kind]}>
        {renderInline(parsed.text)}
      </div>
    )
  }

  if (parsed.kind === 'check') {
    return (
      <div key={key} className={styles.item}>
        <span className={`${styles.checkbox} ${parsed.done ? styles.checked : ''}`}>
          {parsed.done && (
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
        <span className={styles.itemText}>{renderInline(parsed.text)}</span>
      </div>
    )
  }

  if (parsed.marker) {
    return (
      <div key={key} className={styles.item}>
        <span className={styles.marker}>{parsed.marker}</span>
        <span className={styles.itemText}>{renderInline(parsed.text)}</span>
      </div>
    )
  }

  return (
    <div key={key} className={styles.line}>
      {renderInline(parsed.text)}
    </div>
  )
}

export default function NoteFace({ title = 'New Note', date = '', body = '', className = '' }) {
  const lines = body.split('\n')

  return (
    <div data-note className={`${styles.window} ${className}`}>
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
