import styles from './StackCaption.module.css'

// One line under the note stack. Fixed rather than in the scene so it stays
// upright and the same size however the camera is orbited.
export default function StackCaption() {
  return (
    <p className={styles.caption}>
      double-click/tap to open note and click elsewhere to close it. built by{' '}
      <a
        className={styles.link}
        href="https://kingstonkoh.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        da kuan
      </a>
    </p>
  )
}
