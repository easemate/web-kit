import { html } from 'lit-html';

import { Component } from '~/decorators/Component';

@Component({
  tag: 'ease-icon-dots',
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
        <path d="M8.00008 8.66655C8.36827 8.66655 8.66675 8.36808 8.66675 7.99989C8.66675 7.6317 8.36827 7.33322 8.00008 7.33322C7.63189 7.33322 7.33341 7.6317 7.33341 7.99989C7.33341 8.36808 7.63189 8.66655 8.00008 8.66655Z" />
        <path d="M12.6667 8.66655C13.0349 8.66655 13.3334 8.36808 13.3334 7.99989C13.3334 7.6317 13.0349 7.33322 12.6667 7.33322C12.2986 7.33322 12.0001 7.6317 12.0001 7.99989C12.0001 8.36808 12.2986 8.66655 12.6667 8.66655Z" />
        <path d="M3.33341 8.66655C3.7016 8.66655 4.00008 8.36808 4.00008 7.99989C4.00008 7.6317 3.7016 7.33322 3.33341 7.33322C2.96522 7.33322 2.66675 7.6317 2.66675 7.99989C2.66675 8.36808 2.96522 8.66655 3.33341 8.66655Z" />
      </svg>
    `;
  }
})
export class IconDots extends HTMLElement {
  declare requestRender: () => void;
}
