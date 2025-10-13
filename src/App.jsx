import { Leva } from 'leva';

import BottomSlider from './BottomSlider/BottomSlider';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import { Game1 } from './components/Game1';

function RotatingSphere() {
  const sphereRef = useRef()
  useFrame((_, delta) => {
    if (sphereRef.current) sphereRef.current.rotation.y += delta * 0.5
  })
  return (
    <mesh ref={sphereRef} rotation={[0.3, 0.6, 0]} position={[0, 0.5, 0]}>
      <sphereGeometry />
      <meshStandardMaterial wireframe color="#10b981" roughness={0.4} metalness={0.1} />
    </mesh>
  )
}

export default function App() {

  return (
    <div style={{ width: '100%', minHeight: '100%', position: 'relative' }}>
      <Canvas
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 19 // BottomSlider uses zIndex of 20, to be bigger than that to not be interactive
        }}
        camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 2]} intensity={0.8} />
        <RotatingSphere />
        <OrbitControls enableDamping dampingFactor={0.1} />
       
      </Canvas>
      <Leva />
      <div className="flex-1 lg:w-96 lg:flex-none overflow-auto">
          <Game1 
            width="100%" 
            height="100%" 
          />
      </div>
      {/* Your page content goes here. The slider is fixed to bottom via CSS. */}
      <BottomSlider />
    </div>
  )
}
