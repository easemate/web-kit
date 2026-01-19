import { html, type TemplateResult } from 'lit-html';

import { Component } from '~/decorators/Component';
import { Prop } from '~/decorators/Prop';

type FolderState = 'open' | 'close';

@Component({
  tag: 'ease-icon-folder',
  styles: `
    :host {
      display: contents;
    }

    [part="folder"] {
      display: block;
      position: relative;
      width: var(--ease-icon-size, 16px);
      height: var(--ease-icon-size, 16px);
    }

    [part="folder"]::before {
      content: '';
      position: absolute;
      z-index: 1;
      width: 12px;
      height: 6px;
      top: 6px;
      left: 50%;
      transform: translate(-50%, .5px);
      background-color: currentColor;
      border-radius: 3px 3px 1px 1px;
      transform-origin: 50% 100%;
      transition: transform 200ms cubic-bezier(.25, 0, .5, 1);
    }

    [part="folder"][data-state="open"]::before {
      transform: translate(-50%, .5px) scaleY(0.85) skewX(-28deg);
    }

    svg {
      display: block;
      width: var(--ease-icon-size, 16px);
      height: var(--ease-icon-size, 16px);
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
  observedAttributes: ['state']
})
export class IconFolder extends HTMLElement {
  declare requestRender: () => void;

  @Prop<FolderState>({
    reflect: true,
    attribute: 'state',
    defaultValue: 'close'
  })
  accessor state!: FolderState;

  render(): TemplateResult {
    return html`
      <div part="folder" data-state=${this.state}>
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 11V5C2 3.89543 2.89543 3 4 3H5.5C6.12951 3 6.72229 3.29639 7.1 3.8L7.4 4.2C7.77771 4.70361 8.37049 5 9 5H12C13.1046 5 14 5.89543 14 7V11C14 12.1046 13.1046 13 12 13H4C2.89543 13 2 12.1046 2 11Z" />
        </svg>
      </div>
    `;
  }
}
