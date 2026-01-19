import { html } from 'lit-html';

import { Component } from '~/decorators/Component';
import { Prop } from '~/decorators/Prop';

@Component({
  tag: 'ease-field',
  autoSlot: false,
  shadowMode: 'open',
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    [part="field"] {
      scroll-snap-align: start;
      display: grid;
      grid-template-columns: var(--ease-field-label-width, 36%) auto;
      column-gap: var(--ease-field-column-gap, 12px);
      row-gap: var(--ease-field-row-gap, 6px);
      align-items: center;
      width: 100%;
      min-height: var(--ease-field-min-height, 30px);
      margin: 0;
      padding: 0;
    }

    :host([full-width]) [part="field"] {
      grid-template-columns: 1fr;
    }

    label {
      grid-column: 1;
      font-size: var(--ease-field-label-font-size, var(--ease-font-size-sm, 12px));
      line-height: var(--ease-field-label-line-height, 1.25);
      font-weight: var(--ease-field-label-font-weight, 400);
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-left: var(--ease-field-label-padding-left, 4px);
      box-sizing: border-box;
      display: block;
      max-width: 100%;
      color: var(--ease-field-label-color, var(--color-gray-600));
    }

    [part="content"] {
      grid-column: 2;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    :host([full-width]) [part="content"] {
      grid-column: 1;
      align-items: stretch;
    }
  `,
  template(this: Field) {
    return html`
      <div part="field">
        <label>
            ${this.label ?? ''}
        </label>

        <div part="content" class=${this.fullWidth ? 'full-width' : ''}>
          <slot></slot>
        </div>
      </div>
    `;
  }
})
export class Field extends HTMLElement {
  @Prop<string | null>({ reflect: true })
  accessor label!: string | null;

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor fullWidth = false;
}
