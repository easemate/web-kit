import { html } from 'lit-html';

import { Component } from '~/decorators/Component';

@Component({
  tag: 'ease-icon-clear',
  styles: `
    :host {
      display: block;
      width: var(--ease-icon-size, 16px);
      height: var(--ease-icon-size, 16px);
      fill: none;
      stroke: currentColor;
      stroke-width: .75;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    [part="clear"] {
      & > path {

        &:first-child {
          translate: var(--ease-icon-clear-path-translate, 0);
          transition: translate var(--ease-icon-clear-path-duration, 0.2s);
          transition-delay: var(--ease-icon-clear-path-delay, 0s);
        }

        &:not(:first-child) {
          stroke-dasharray: 100 0 100;
          stroke-dashoffset: var(--ease-icon-clear-lines-offset, 100);
          transition: stroke-dashoffset var(--ease-icon-clear-lines-duration, 0.2s);
          transition-delay: var(--ease-icon-clear-lines-delay, 0s);
        }
      }

      g {
        path {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          transition: rotate var(--ease-icon-clear-star-duration, 0.2s), scale var(--ease-icon-clear-star-duration, 0.2s);

          &:first-child {
            rotate: var(--ease-icon-clear-star-1-rotate, 0deg);
            scale: var(--ease-icon-clear-star-1-scale, 1);
            transition-delay: var(--ease-icon-clear-star-1-delay, 0s);
          }

          &:last-child {
            rotate: var(--ease-icon-clear-star-2-rotate, 0deg);
            scale: var(--ease-icon-clear-star-2-scale, 1);
            transition-delay: var(--ease-icon-clear-star-2-delay, 0s);
          }
        }
      }
    }
  `,
  template() {
    return html`
      <svg part="clear" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.7613 10.334L13.7071 12.2798C14.1011 12.6739 14.1011 13.3127 13.7071 13.7067C13.3131 14.1007 12.6742 14.1007 12.2802 13.7067L10.3344 11.7609M11.7613 10.334L10.9541 8.08932M11.7613 10.334L10.3344 11.7609M10.3344 11.7609L8.08973 10.9537M6.69581 12.3476L12.348 6.69544C12.6942 6.34922 12.6942 5.7879 12.348 5.44168L11.892 4.98574C11.5458 4.63952 10.9845 4.63952 10.6383 4.98574L4.9861 10.6379C4.63989 10.9841 4.63989 11.5454 4.9861 11.8917L5.44204 12.3476C5.78826 12.6938 6.34959 12.6938 6.69581 12.3476Z" />
        <g>
          <path d="M3.3313 2.6645H4.66519M3.99824 1.99756V3.33145" />
          <path d="M4.66516 5.99946H5.99905M5.33211 5.33252V6.66641" />
        </g>
        <path d="M7.33301 1.99756L8.6669 3.33145" pathlength="100" />
        <path d="M3.6648 8.33386L1.99744 6.6665" pathlength="100" />
      </svg>
    `;
  }
})
export class IconClear extends HTMLElement {
  declare requestRender: () => void;
}
