import { html } from 'lit-html';

import { Component } from '~/decorators/Component';

@Component({
  tag: 'ease-icon-anchor-remove',
  styles: `
    :host {
      display: block;
      width: var(--ease-icon-size, 12px);
      height: var(--ease-icon-size, 12px);
      fill: none;
      stroke: currentColor;
      stroke-width: 0.75;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
  template() {
    return html`
      <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.70508 10.5003L5.30008 7.90527" />
        <path d="M6.59557 6.61121C6.95348 6.96913 6.95348 7.54942 6.59557 7.90734C6.23765 8.26525 5.65736 8.26525 5.29944 7.90734C4.94153 7.54942 4.94153 6.96913 5.29944 6.61121C5.65736 6.25329 6.23765 6.25329 6.59557 6.61121" />
        <path d="M9.20703 6.50016L8.39453 8.93866C8.27903 9.28516 7.98353 9.54066 7.62453 9.60616L2.70703 10.5002L3.39036 6.74393M9.20006 6.50016L9.72739 5.98984C10.2895 5.4459 10.2968 4.54693 9.74375 3.99385L9.22391 3.47402C8.68351 2.93361 7.80957 2.92644 7.26038 3.45792L6.98022 3.72904" />
        <path d="M3.49931 5.54525C2.36926 5.54516 1.45317 4.62914 1.453 3.49909C1.47001 2.37501 2.37788 1.46826 3.50198 1.45264C4.63212 1.45337 5.54769 2.37013 5.54695 3.50028C5.54621 4.63042 4.62945 5.54599 3.49931 5.54525" />
        <path d="M4.30317 3.49902H2.69543" />
      </svg>
    `;
  }
})
export class IconAnchorRemove extends HTMLElement {
  declare requestRender: () => void;
}
