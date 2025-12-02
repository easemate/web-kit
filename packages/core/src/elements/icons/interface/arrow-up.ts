import { Component } from '@/Component';

import { html } from 'lit-html';

@Component({
  tag: 'ease-icon-arrow-up',
  styles: `
    :host {
      display: block;
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
  template() {
    return html`
      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.99992 12.6666V3.33331M6.99992 3.33331L2.33325 7.99998M6.99992 3.33331L11.6666 7.99998" />
      </svg>
    `;
  }
})
export class ArrowUp extends HTMLElement {
  declare requestRender: () => void;
}
