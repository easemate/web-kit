import type { Placement } from '~/elements/popover';

import { html, type TemplateResult } from 'lit-html';

import { dispatchControlEvent, setBooleanAttribute } from '../shared';

import { Component } from '~/decorators/Component';
import { Prop } from '~/decorators/Prop';
import { Query } from '~/decorators/Query';
import '../dropdown';
import '../input';
import './picker';

import { isValidHex } from './utils';

import { styleMap } from '~/utils/template-helpers';

@Component({
  tag: 'ease-color-input',
  styles: `
    :host {
      display: block;
      position: relative;
    }

    ease-dropdown {
      --ease-dropdown-panel-min-width: auto;
      --ease-dropdown-panel-width: max-content;
      --ease-dropdown-panel-max-width: max-content;
    }

    :host(:not([custom-trigger])) ease-input {
      --ease-input-padding: 0 4px 0 4px;
      display: block;
      width: 76px;
      cursor: pointer;
      font-family: var(--ease-font-mono, 'Geist Mono', monospace);

      &::part(control) {
        margin-left: -12px;
        cursor: pointer;
      }
    }

    ease-dropdown::part(trigger):disabled {
      cursor: default;
      opacity: 0.75;
    }

    :host(:not([custom-trigger])) [slot="prefix"] {
      display: block;
      width: 14px;
      height: 14px;
      margin-left: -4px;
      border-radius: 4px;
      box-shadow: inset 0 0 0 1px var(--color-white-10);
    }

    [part="value-text"] {
      font-family: var(--ease-font-mono, 'Geist Mono', monospace);
    }

    ease-dropdown::part(content) {
      padding: var(--ease-color-input-dropdown-padding, 12px 12px 8px 12px);
      overflow: visible;
    }

    ::slotted([slot="trigger"]) {
      cursor: pointer;
    }
  `
})
export class ColorInput extends HTMLElement {
  declare requestRender: () => void;

  #hasCustomTrigger = false;

  @Query('ease-dropdown') accessor dropdown!: (HTMLElement & { open: boolean }) | null;

  @Prop<string, ColorInput>({
    reflect: true,
    defaultValue: '#FF0000',
    onChange(next) {
      if (next && isValidHex(next)) {
        const normalized = next.toUpperCase();
        if (this.value !== normalized) {
          this.value = normalized;
        }
      } else if (!next) {
        this.value = '#000000';
      }
    }
  })
  accessor value!: string;

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor disabled = false;

  @Prop<Placement>({ reflect: true, defaultValue: 'bottom-start' })
  accessor placement: Placement = 'bottom-start';

  connectedCallback(): void {
    this.#hasCustomTrigger = this.querySelector('[slot="trigger"]') !== null;
    setBooleanAttribute(this, 'custom-trigger', this.#hasCustomTrigger);
  }

  afterRender(): void {
    setBooleanAttribute(this, 'disabled', Boolean(this.disabled));
  }

  #renderDefaultTrigger(): TemplateResult {
    const swatchStyle = {
      backgroundColor: this.value
    } as const;

    return html`
      <div slot="trigger" part="trigger-content">
        <ease-input part="input" type="text" .value=${this.value} @change=${this.#handleInputChange} headless>
          <div slot="prefix" style=${styleMap(swatchStyle)}></div>
        </ease-input>
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      <ease-dropdown .disabled=${this.disabled} .placement=${this.placement}>
        ${this.#hasCustomTrigger ? html`<slot name="trigger" slot="trigger"></slot>` : this.#renderDefaultTrigger()}
        <ease-color-picker slot="content"
          data-select-ignore
          .value=${this.value}
          @input=${this.#handlePickerInput}
          @change=${this.#handlePickerChange}
          @cancel=${this.#handlePickerCancel}
          @apply=${this.#handlePickerApply}
        ></ease-color-picker>
      </ease-dropdown>
    `;
  }

  #handleInputChange = (event: Event): void => {
    this.value = (event.target as HTMLInputElement).value;
    dispatchControlEvent(this, 'input', { value: this.value, event });
  };

  #handlePickerInput = (event: CustomEvent<{ value: string }>): void => {
    this.value = event.detail.value;
    dispatchControlEvent(this, 'input', { value: this.value, event });
  };

  #handlePickerChange = (event: CustomEvent<{ value: string }>): void => {
    this.value = event.detail.value;
    dispatchControlEvent(this, 'change', { value: this.value, event });
  };

  #handlePickerCancel = (event: CustomEvent<{ value: string }>): void => {
    this.value = event.detail.value;
    this.requestRender();
    if (this.dropdown) {
      this.dropdown.open = false;
    }
  };

  #handlePickerApply = (event: CustomEvent<{ value: string }>): void => {
    this.value = event.detail.value;
    dispatchControlEvent(this, 'change', { value: this.value, event });
    if (this.dropdown) {
      this.dropdown.open = false;
    }
  };
}
