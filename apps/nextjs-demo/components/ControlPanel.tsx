'use client';

import { useRef, useCallback } from 'react';
// Import types from the react subpath
import type { StateElement, StateChangeEventDetail } from '@easemate/web-kit/react';

export function ControlPanel() {
  const stateRef = useRef<StateElement>(null);

  const handleStateChange = useCallback((event: CustomEvent<StateChangeEventDetail>) => {
    console.log('State changed:', event.detail);
  }, []);

  const handleGetState = useCallback(() => {
    if (stateRef.current) {
      const state = stateRef.current.getState();
      console.log('Current state:', state);
      alert(`Current state: ${JSON.stringify(state, null, 2)}`);
    }
  }, []);

  return (
    <div>
      <ease-panel>
        <span slot="headline">Control Panel</span>
        
        <ease-state ref={stateRef} onStateChange={handleStateChange}>
          <ease-field label="Volume">
            <ease-slider name="volume" value={50} min={0} max={100} />
          </ease-field>
          
          <ease-field label="Brightness">
            <ease-slider name="brightness" value={75} min={0} max={100} />
          </ease-field>
          
          <ease-field label="Enable Feature">
            <ease-toggle name="enabled" checked />
          </ease-field>
          
          <ease-field label="Color">
            <ease-color-input name="color" value="#3b82f6" />
          </ease-field>
        </ease-state>
        
        <div slot="footer" style={{ display: 'flex', gap: '8px' }}>
          <ease-button onClick={handleGetState}>Get State</ease-button>
        </div>
      </ease-panel>
    </div>
  );
}
