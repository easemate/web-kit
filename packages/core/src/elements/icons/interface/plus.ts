import { Component } from '@/Component';

import { html } from 'lit-html';

@Component({
  tag: 'ease-icon-plus',
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
        <path d="M8.00018 4.28591C8.00018 4.28591 8.00018 8.42263 8.00018 11.714M4.28613 7.99995H11.7142" />
      </svg>
    `;
  }
})
export class Plus extends HTMLElement {
  declare requestRender: () => void;
}
