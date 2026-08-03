import { useEffect, useState } from 'react';
import { Leva } from 'leva';

import BottomSlider from './BottomSlider/BottomSlider';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Game1 from './components/Game1';
import AppleNoteStack from './components/AppleNoteStack';
import NoteFocus from './components/NoteFocus';
import StackCaption from './components/StackCaption';

const COMPACT = '(max-width: 600px)';

export default function App() {
  // Which note is open in focus mode, if any. It lives out here because focus
  // mode is DOM outside the canvas, while the stack is inside it.
  const [focusedNote, setFocusedNote] = useState(null);
  const [compact, setCompact] = useState(() => window.matchMedia(COMPACT).matches);

  useEffect(() => {
    const query = window.matchMedia(COMPACT);
    const onChange = (e) => setCompact(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return (
    <div style={{ width: '100%', minHeight: '100%', position: 'relative' }}>
      <Canvas
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 19 // BottomSlider uses zIndex of 20, to be bigger than that to not be interactive
        }}
        // Capped so a phone with a 3x screen doesn't render three times the
        // pixels it needs.
        dpr={[1, 2]}
        camera={{ position: [-2, 3, 4], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 2]} intensity={0.8} />
        <AppleNoteStack position={[0, 0, 0]} onOpen={setFocusedNote} />
        {/* Two-finger pan can push the stack off a small screen with no obvious
            way back, so phones get orbit and pinch-zoom only. */}
        <OrbitControls enableDamping dampingFactor={0.1} enablePan={!compact} />

      </Canvas>
      <StackCaption />
      <NoteFocus index={focusedNote} onClose={() => setFocusedNote(null)} />
      {/* An empty dev panel isn't worth a corner of a phone screen. */}
      <Leva hidden={compact} />
     
      
      
      {/* Your page content goes here. The slider is fixed to bottom via CSS. */}
    </div>
  )
}
