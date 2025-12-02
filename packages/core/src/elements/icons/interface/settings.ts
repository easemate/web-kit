import { Component } from '@/Component';

import { html } from 'lit-html';

@Component({
  tag: 'ease-icon-settings',
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
        <path d="M2 5.33319L10 5.33319M10 5.33319C10 6.43776 10.8954 7.33319 12 7.33319C13.1046 7.33319 14 6.43776 14 5.33319C14 4.22862 13.1046 3.33319 12 3.33319C10.8954 3.33319 10 4.22862 10 5.33319ZM6 10.6665L14 10.6665M6 10.6665C6 11.7711 5.10457 12.6665 4 12.6665C2.89543 12.6665 2 11.7711 2 10.6665C2 9.56195 2.89543 8.66652 4 8.66652C5.10457 8.66652 6 9.56195 6 10.6665Z" />
      </svg>
    `;
  }
})
export class Settings extends HTMLElement {
  declare requestRender: () => void;
}
