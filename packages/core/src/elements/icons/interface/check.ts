import { Component } from '@/Component';

import { html } from 'lit-html';

@Component({
  tag: 'ease-icon-check',
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
        <path d="M3 6.5L5.33333 9L10 4" path-length="100" />
      </svg>
    `;
  }
})
export class Check extends HTMLElement {
  declare requestRender: () => void;
}
