import { Slider } from './Slider';
import { items } from './items';
import { a } from '@react-spring/web';

import styles from './styles.module.css'

export default function BottomSlider() {
    return (
    <>
    <div className={styles.bottomBar}>
        <Slider items={items} width={300} visible={4} style={{ height: '100%' }}>
          {({ css, url }, i) => (
            <div className={styles.content}>
              <div className={styles.marker}>{String(i).padStart(2, '0')}</div>
              <a.div
                className={styles.image}
                style={{ backgroundImage: css, cursor: url ? 'pointer' : 'default' }}
                onClick={() => {
                  if (url) {
                    window.open(url, '_blank', 'noopener,noreferrer')
                  }
                }}
                aria-label={url ? 'Open article in new tab' : undefined}
                role={url ? 'link' : undefined}
              />
            </div>
          )}
        </Slider>
      </div>
    </>
    )
}