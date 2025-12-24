import { html } from 'lit-html';

import { Component } from '~/decorators/Component';

@Component({
  tag: 'ease-icon-circle-arrow-right',
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
      <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.33333 6.66667C1.33333 6.66667 2.66999 4.84548 3.75589 3.75883C4.84179 2.67218 6.3424 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14C5.2646 14 2.95674 12.1695 2.23451 9.66667M1.33333 6.66667V2.66667M1.33333 6.66667H5.33333" />
      </svg>
    `;
  }
})
export class IconCircleArrowRight extends HTMLElement {
  declare requestRender: () => void;
}
