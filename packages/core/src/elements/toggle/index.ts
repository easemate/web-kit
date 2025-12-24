import { html } from 'lit-html';

import { dispatchControlEvent, setBooleanAttribute } from '../shared';

import { Component } from '~/decorators/Component';
import { Listen } from '~/decorators/Listen';
import { Prop } from '~/decorators/Prop';
import { Query } from '~/decorators/Query';

@Component({
  tag: 'ease-toggle',
  styles: `
    :host {
      display: contents;
    }

    [part="control"] {
      display: block;
      border-radius: var(--ease-toggle-radius, 10px);
      padding: var(--ease-toggle-padding, 4px);
      margin: 0;
      border: none;
      outline: none;
      appearance: none;
      cursor: pointer;
      background-color: var(--ease-toggle-on-background, var(--color-blue-900));
      transition: box-shadow 0.2s, background-color 0.2s;
    }

    [part="control"] svg {
      width: var(--ease-toggle-width, 26px);
      height: var(--ease-toggle-height, 12px);
      display: block;
      fill: none;
      overflow: visible;

      path {
        transition: scale 0.2s, translate 0.2s, opacity 0.2s;
        stroke: var(--color-white);
        fill: var(--color-white-80);
        stroke-width: 1.5;
      }

      [part="default"] {
        transform-origin: 6px 6px;
      }

      [part="active"] {
        transform-origin: 23px 6px;
      }

    }

    :host([disabled]) [part="control"] {
      cursor: default;
      opacity: 0.75;
    }

    :host([checked]) [part="control"] {
      box-shadow: inset 0 0 0 1px var(--color-white-15), inset 0 1px 0 0 var(--color-white-20), inset 0 4px 6px 0 var(--ease-toggle-shadow, var(--color-white-12));

      &:hover {
        --ease-toggle-shadow: var(--color-white-30);
      }

      svg {
        [part="default"] {
          scale: .25;
          translate: 10px 0;
          opacity: 0;
        }

        [part="active"] {
          scale: 1;
          translate: 0 0;
        }
      }
    }

    :host(:not([checked])) [part="control"] {
      background-color: var(--ease-toggle-off-background, var(--color-gray-800));
      box-shadow: inset 0 0 0 1px var(--color-white-10), inset 0 1px 0 0 var(--color-white-10), inset 0 4px 6px 0 var(--ease-toggle-shadow, var(--color-white-6));

      &:hover {
        --ease-toggle-shadow: var(--color-white-12);
      }

       svg {
        [part="default"] {
          scale: 1;
          translate: 0 0;
        }

        [part="active"] {
          scale: .25;
          translate: -10px 0;
          opacity: 0;
        }
      }
    }
  `,
  template(this: Toggle) {
    return html`
      <button part="control" type="button" aria-pressed="false">
        <svg viewBox="0 0 26 12" fill="none" xmlns="http://www.w3.org/2000/svg" filter="url(#${this.filterId})">
          <path part="default" d="M0 6C0 2.68629 2.68629 0 6 0V0C9.31371 0 12 2.68629 12 6V6C12 9.31371 9.31371 12 6 12V12C2.68629 12 0 9.31371 0 6V6Z" />
          <path part="active" d="M14 6C14 2.68629 16.6863 0 20 0V0C23.3137 0 26 2.68629 26 6V6C26 9.31371 23.3137 12 20 12V12C16.6863 12 14 9.31371 14 6V6Z" />
        </svg>

        <svg style="display: none;">
          <defs>
            <filter id="${this.filterId}">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="gooey" />
              <feBlend in="SourceGraphic" in2="gooey" />
            </filter>
          </defs>
        </svg>
      </button>
    `;
  }
})
export class Toggle extends HTMLElement {
  declare requestRender: () => void;
  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor checked!: boolean;

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor disabled!: boolean;

  @Query<HTMLButtonElement>('button')
  accessor control!: HTMLButtonElement | null;

  filterId: string = `filter-${crypto.randomUUID()}`;

  afterRender(): void {
    if (!this.control) {
      return;
    }

    const control = this.control;
    control.setAttribute('aria-pressed', this.checked ? 'true' : 'false');
    control.disabled = Boolean(this.disabled);
    setBooleanAttribute(this, 'disabled', Boolean(this.disabled));
  }

  @Listen<Toggle, MouseEvent, HTMLButtonElement>('click', { selector: 'button' })
  handleClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    this.checked = !this.checked;

    dispatchControlEvent(this, 'toggle', { value: this.checked, event });
  }
}
