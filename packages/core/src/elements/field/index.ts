import { Component } from '@/Component';
import { Prop } from '@/Prop';

import { html } from 'lit-html';

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
      display: grid;
      grid-template-columns: 36%  auto;
      column-gap: 12px;
      row-gap: 6px;
      align-items: center;
      width: 100%;
      min-height: 30px;
      margin: 0;
      padding: 0;
    }

    label {
      grid-column: 1;
      font-size: 12px;
      line-height: 1.25;
      font-weight: 400;
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-left: 4px;
      box-sizing: border-box;
      display: block;
      max-width: 100%;
      color: var(--color-gray-600);
    }

    [part="content"] {
      grid-column: 2;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
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
