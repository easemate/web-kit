import { html, type TemplateResult } from 'lit-html';

import { Component } from '~/decorators/Component';
import { Prop } from '~/decorators/Prop';

type GridState = 'show' | 'hide';

@Component({
  tag: 'ease-icon-grid',
  styles: `
    :host {
      display: contents;
    }

    [part="grid"] {
      --ease-icon-grid-offset: 100;
      --ease-icon-grid-rotate: 0deg;

      display: block;
      width: var(--ease-icon-size, 16px);
      height: var(--ease-icon-size, 16px);
      fill: none;
      stroke: currentColor;
      stroke-width: .75;
      stroke-linecap: round;
      stroke-linejoin: round;

      g {
        &:first-of-type {
          path {
            stroke-dasharray: 100 0 100;
            stroke-dashoffset: var(--ease-icon-grid-offset);
            transition: stroke-dashoffset 0.2s;
          }
        }

        &:last-child {
          transform-origin: 72.92% 72.92%;
          transition: rotate 0.35s linear(0, 0.472 7.5%, 0.832 15.5%, 0.97 19.7%, 1.081 24%, 1.166 28.5%, 1.226 33.2%, 1.255 36.9%, 1.271 40.8%, 1.275 44.9%, 1.266 49.4%, 1.222 57.8%, 1.092 75.1%, 1.042 83%, 1.01 91.4%, 1);
          rotate: var(--ease-icon-grid-rotate);
        }
      }

      [data-state="hide"] {
        --ease-icon-grid-offset: 200;
        --ease-icon-grid-rotate: 45deg;
      }
    }
  `,
  observedAttributes: ['state']
})
export class IconGrid extends HTMLElement {
  declare requestRender: () => void;

  @Prop<GridState>({
    reflect: true,
    attribute: 'state',
    defaultValue: 'show'
  })
  accessor state!: GridState;

  render(): TemplateResult {
    return html`
      <svg part="grid" viewBox="0 0 12 12" state=${this.state} xmlns="http://www.w3.org/2000/svg">
        <path d="M10.5018 5.49971V3.99909C10.5018 2.6178 9.38204 1.49805 8.00076 1.49805H3.99909C2.6178 1.49805 1.49805 2.6178 1.49805 3.99909V8.00076C1.49805 9.38204 2.6178 10.5018 3.99909 10.5018H5.49971" />
        <g data-state=${this.state}>
          <path d="M7.50059 1.49805V5.49971" pathlength="100" />
          <path d="M4.49937 1.49805V10.5018" pathlength="100" />
          <path d="M1.49805 7.47081H5.49971" pathlength="100" />
          <path d="M1.49805 4.46934H10.5018" pathlength="100" />
        </g>
        <path d="M8.75118 11.0019C7.50813 11.0018 6.50043 9.99415 6.50024 8.7511C6.51896 7.51461 7.5176 6.51719 8.75412 6.5C9.99728 6.50081 11.0044 7.50925 11.0036 8.75241C11.0028 9.99556 9.99434 11.0027 8.75118 11.0019" />
        <g data-state=${this.state}>
          <path d="M8.7512 7.86672V9.63523" />
          <path d="M9.63545 8.75098H7.86694" />
        </g>
      </svg>
    `;
  }
}
