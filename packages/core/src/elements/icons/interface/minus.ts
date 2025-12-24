import { html } from 'lit-html';

import { Component } from '~/decorators/Component';

@Component({
  tag: 'ease-icon-minus',
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
        <path d="M5 7.99995H11" />
      </svg>
    `;
  }
})
export class IconMinus extends HTMLElement {
  declare requestRender: () => void;
}
