import { html } from 'lit-html';

import { Component } from '~/decorators/Component';

@Component({
  tag: 'ease-icon-picker',
  styles: `
    :host {
      display: contents;
    }

    [part="picker"] {
      display: block;
      width: 12px;
      height: 12px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.25;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
  template() {
    return html`
      <svg part="picker" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3.50003L8.5 7.00003M2.14645 7.85358L7.5 2.50003C8.05228 1.94774 8.94772 1.94774 9.5 2.50003C10.0523 3.05231 10.0523 3.94774 9.5 4.50003L4.14645 9.85358C4.05268 9.94735 3.9255 10 3.79289 10H2.5C2.22386 10 2 9.77617 2 9.50003V8.20714C2 8.07453 2.05268 7.94735 2.14645 7.85358Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }
})
export class IconPicker extends HTMLElement {
  declare requestRender: () => void;
}
