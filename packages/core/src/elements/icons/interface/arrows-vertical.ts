import { html } from 'lit-html';

import { Component } from '~/decorators/Component';

@Component({
  tag: 'ease-icon-arrows-vertical',
  styles: `
    :host {
      display: block;
      width: var(--ease-icon-size, 24px);
      height: var(--ease-icon-size, 24px);
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
  template() {
    return html`
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 9.00006L11.1161 5.88394C11.6043 5.39578 12.3957 5.39578 12.8839 5.88394L16 9.00006M8 15.0001L11.1161 18.1162C11.6043 18.6043 12.3957 18.6043 12.8839 18.1162L16 15.0001"  />
      </svg>
    `;
  }
})
export class IconArrowsVertical extends HTMLElement {
  declare requestRender: () => void;
}
