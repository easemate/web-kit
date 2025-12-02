import { Component } from '@/Component';

import { html } from 'lit-html';

@Component({
  tag: 'ease-icon-code',
  styles: `
    :host {
      display: block;
      width: 12px;
      height: 12px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
  template() {
    return html`
      <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 9L11 6L8 3M4 3L1 6L4 9" />
      </svg>
    `;
  }
})
export class Code extends HTMLElement {
  declare requestRender: () => void;
}
