import { html, type TemplateResult } from 'lit-html';

import { Component } from '~/decorators/Component';
import { Prop } from '~/decorators/Prop';

type ChevronState = 'down' | 'up';
type ChevronPath = Record<ChevronState, string>;

@Component({
  tag: 'ease-icon-chevron',
  styles: `
    :host {
      display: contents;
    }

    [part="chevron"] {
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
export class IconChevron extends HTMLElement {
  declare requestRender: () => void;

  accessor paths: ChevronPath = {
    down: 'M5 7L8 10L11 7',
    up: 'M5 9L8 6L11 9'
  };

  @Prop<ChevronState>({
    reflect: true,
    attribute: 'state',
    defaultValue: 'down',
    onAttributeChange(next: ChevronState, previous: ChevronState) {
      this.shadowRoot
        ?.querySelector<SVGPathElement>('path')
        ?.animate(
          [
            { d: `path('${(this as IconChevron).paths[previous]}')` },
            { d: `path('${(this as IconChevron).paths[next]}')` }
          ],
          {
            duration: 200,
            easing: 'cubic-bezier(0.25, 0, 0.5, 1)'
          }
        );
    }
  })
  accessor state!: ChevronState;

  render(): TemplateResult {
    return html`
      <svg part="chevron" viewBox="0 0 16 16" state=${this.state} xmlns="http://www.w3.org/2000/svg ">
        <path d=${this.paths[this.state]} />
      </svg>
    `;
  }
}
