import { Leva } from 'leva';

import BottomSlider from './BottomSlider/BottomSlider';


export default function App() {

  return (
    <div>
      <div style={{ width: '100%', minHeight: '100%', position: 'relative'}}>
        <Leva /> 
      {/* Your page content goes here. The slider is fixed to bottom via CSS. */}
      </div>

      <BottomSlider/>
    </div>
    
  )
}
