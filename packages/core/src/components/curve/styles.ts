export const canvasStyles = `
  :host {
    display: block;
    width: 100%;
    max-width: 500px;
    position: relative;
  }

  svg {
    width: 300px;
    height: auto;
    cursor: pointer;
    touch-action: none;
    user-select: none;
    overflow: visible;
    border-radius: 8px;
  }

  .grid-line {
    stroke: var(--color-white-4);
    stroke-width: .75;
  }

  .curve-path {
    stroke: var(--color-blue-100);
    stroke-width: 2.5;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: stroke-width 150ms ease;
  }

  .curve-path--preview {
    stroke: var(--color-blue-800);
    stroke-width: 2.5;
    stroke-dasharray: 5, 5;
    opacity: 0;
    pointer-events: none;
    animation: previewPathFade 180ms ease forwards;
  }

  .control-point {
    fill: var(--color-blue-700);
    stroke: var(--color-blue-900);
    stroke-width: 1.5;
    cursor: grab;
  }

  .control-point:active {
    cursor: grabbing;
  }

  .control-point.selected {
  }

  .anchor-point-start {
    fill: var(--color-blue-100);
    pointer-events: none;
    r: 5px;
    transition: r .2s;
  }

  .anchor-point {
    fill: var(--color-blue-900);
    stroke: var(--color-blue-900);
    stroke-width: 1;
    pointer-events: none;
    r: 5px;
    transition: r .2s;
  }

  .anchor-point:hover {
    r: 5.5px;
  }

  .control-line {
    stroke: var(--color-blue-800);
    stroke-width: 3;
    pointer-events: none;
    display: none;
  }

  .linear-point {
    fill: var(--color-blue-100);
    cursor: grab;
    r: 3px;
    transition: r .2s;
  }

  .hit-area-point:hover + .linear-point,
  .linear-point:hover,
  .linear-point:active,
  .linear-point.selected {
    r: 5px;
  }

  .linear-point.selected {
    fill: var(--color-blue-300);
    stroke-width: 1.5;
  }

  .linear-handle-line {
    stroke: var(--color-blue-800);
    stroke-width: 3;
    pointer-events: none;
    transition: opacity 150ms ease;
    display: none;
  }

  .linear-handle {
    fill: var(--color-blue-700);
    stroke: var(--color-blue-900);
    stroke-width: 1;
    cursor: grab;
  }

  .linear-handle.selected {
  }

  .linear-handle:active {
    cursor: grabbing;
  }

  .hit-area-point,
  .hit-area-handle {
    fill: transparent;
    stroke: transparent;
    pointer-events: all;
    cursor: inherit;
    r: 10px;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 1;
    }
  }

  .curve-path.animating {
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes previewPathFade {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.6;
    }
  }

  @keyframes previewElementFade {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.85;
    }
  }

  .linear-preview-group {
    pointer-events: none;
  }

  .linear-point--preview,
  .linear-handle--preview,
  .linear-handle-line--preview {
    animation: previewElementFade 180ms ease forwards;
  }

  .linear-point--preview {
    fill: var(--color-blue-100);
  }

  .linear-handle--preview {
    fill: var(--color-blue-700);
    stroke: var(--color-blue-900);
    stroke-width: 1.5;
  }

  .linear-handle-line--preview {
    stroke: var(--color-blue-800);
    stroke-width: 2.5;
    stroke-dasharray: 4 4;
    display: none;
  }
`;

export const controlsStyles = `
  :host {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
  }

  [part="radio-group"] {
    width: 100%;
    box-sizing: border-box;
  }

  [part="easing-type-dropdown"] {
    --ease-dropdown-max-height: 212px;
  }
`;

export const outputStyles = `
  :host {
    display: block;
  }

  .output-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .output-group {
    position: relative;
    display: block;
  }

  .output-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-gray-1000);
    margin: 0;
  }

  .output-code {
    font-family: var(--ease-font-mono, 'Geist Mono', monospace);
    font-size: 0.8125rem;
    line-height: 1.6;
    padding: 1rem;
    background: var(--color-gray-1000);
    color: var(--color-gray-700);
    border-radius: 0.375rem;
    border: 1px solid #334155;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-x: auto;
    max-width: 100%;
    tab-size: 2;
  }

  .copy-button {
    align-self: flex-start;
    padding: 0.425rem 0.875rem;
    border: 1px solid var(--color-white-6);
    border-radius: 0.375rem;
    background: white;
    color: var(--color-gray-1000);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 150ms ease;
    user-select: none;
  }

  .copy-button:hover {
    background: var(--color-gray-1000);
    border-color: #9ca3af;
    transform: translateY(-1px);
  }

  .copy-button:active {
    transform: translateY(0);
  }

  .copy-button:focus-visible {
    outline: 2px solid var(--color-blue-700);
    outline-offset: 2px;
  }

  .copy-button.copied {
    background: var(--color-blue-100);
    border-color: var(--color-blue-100);
    color: white;
  }

  .preview-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .preview-box {
    width: 100%;
    max-width: 300px;
    height: 80px;
    background: linear-gradient(135deg, var(--color-blue-700) 0%, var(--color-blue-100) 100%);
    border-radius: 0.5rem;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: box-shadow 150ms ease;
  }

  .preview-box:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .preview-animation {
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    transition-property: transform;
    transition-duration: 2s;
  }

  .preview-animation.animate {
    transform: translateY(-50%) translateX(calc(100% - 48px));
  }
`;

export const containerStyles = `
  :host {
    display: block;
  }

  .curve-container {
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .curve-header {
  }

  .curve-canvas-wrapper {
    position: relative;
    margin-top: 16px;
  }

  .curve-canvas {
    background-color: var(--color-white-2);
    box-shadow: 0 0 32px 0 var(--color-white-2) inset;
    border-radius: 7px;
  }

  .curve-toolbar {
    margin-top: 8px;
  }
`;

export const canvasControlsStyles = `
  :host {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 4px;
    pointer-events: none;
  }

  :host([hidden]) {
    display: none;
  }

  .overlay-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    pointer-events: auto;
  }

  .overlay-button {
    --ease-icon-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    color: var(--color-gray-600);
    border-radius: var(--radii-md);
    background-color: var(--color-gray-875);
    box-shadow: inset 0 1px .25px 0 var(--color-white-4), 0 1px 2.5px 0 var(--color-black-8);
    cursor: pointer;
    transition: color 0.2s;
    appearance: none;
    border: none;
    outline: none;
    margin: 0;
  }

  .overlay-button:hover {
    color: var(--color-gray-300);
  }

  .overlay-button:disabled {
    color: var(--color-gray-700);
    cursor: not-allowed;
  }

  .overlay-button.inactive {
    color: var(--color-blue-100);
  }
`;

export const toolbarStyles = `
  :host {
    display: block;
    width: 100%;
  }

  .toolbar-container {
    width: 100%;
    display: grid;
    gap: 8px;
  }

  .toolbar-group {
    width: 100%;
    display: flex;
    gap: 8px;
    box-sizing: border-box;
    align-items: center;
    padding: 6px;
    border-radius: var(--radii-md);
    background-color: var(--color-gray-875);
    box-shadow: inset 0 1px .25px 0 var(--color-white-4), 0 1px 2.5px 0 var(--color-black-8);
  }

  .toolbar-button {
    --ease-icon-size: 16px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px;
    color: var(--color-gray-600);
    background-color: transparent;
    border: none;
    outline: none;
    margin: 0;
    appearance: none;
    cursor: pointer;
    transition: color 0.2s;
  }

  .toolbar-button:hover {
    color: var(--color-blue-100);
  }

  .toolbar-button:disabled {
    color: var(--color-gray-700);
    cursor: not-allowed;
  }

  .grid-size-controls {
    display: grid;
    grid-template-columns: 24px auto 24px;
    align-items: center;
    justify-content: center;
    margin-left: auto;
  }

  .grid-size-controls ease-button {
    --ease-icon-size: 14px;
    width: 24px;
    height: 24px;
    box-sizing: border-box;
    display: flex;
    padding: 0;
    align-items: center;
    justify-content: center;
  }

  .grid-size-value {
    display: flex;
    width: 20px;
    justify-content: center;
    align-items: center;
    font-feature-settings: 'tnum' on;
    font-variant-numeric: tabular-nums;
    font-size: 11px;
    font-weight: 500;
    line-height: 14px;
    text-align: center;
  }
`;
