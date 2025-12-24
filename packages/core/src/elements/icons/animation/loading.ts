import { html } from 'lit-html';

import { Component } from '~/decorators/Component';

@Component({
  tag: 'ease-icon-loading',
  styles: `
    :host {
      display: block;
      width: var(--ease-icon-size, 12px);
      height: var(--ease-icon-size, 12px);
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    [part="loading"] {
      transform-origin: center center;
      animation-name: loading, loading-dash, loading-dash-offset;
      animation-duration: .4s, .8s, .8s;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
      stroke-dasharray: 35 65 35 65;
      stroke-dashoffset: 75;
    }

    @keyframes loading {
      0% {
        transform: rotate(-90deg);
      }
      100% {
        transform: rotate(270deg);
      }
    }

    @keyframes loading-dash {
      33% {
        stroke-dasharray: 15 85 15 85;
      }
      66% {
        stroke-dasharray: 45 55 45 55;
      }
    }

    @keyframes loading-dash-offset {
      33% {
        stroke-dashoffset: 55;
      }
      66% {
        stroke-dashoffset: 85;
      }
    }
  `,
  template() {
    return html`
      <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="6" r="4.5" stroke-opacity="0.25" />
        <circle cx="6" cy="6" r="4.5" part="loading" pathlength="100" />
      </svg>
    `;
  }
})
export class Loading extends HTMLElement {
  declare requestRender: () => void;
}
