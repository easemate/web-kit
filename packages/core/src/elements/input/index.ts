import { html } from 'lit-html';

import { dispatchControlEvent, setBooleanAttribute } from '../shared';

import { Component } from '~/decorators/Component';
import { Listen } from '~/decorators/Listen';
import { Prop } from '~/decorators/Prop';
import { Query } from '~/decorators/Query';

@Component({
  tag: 'ease-input',
  shadowMode: 'open',
  autoSlot: true,
  styles: `
    :host {
      display: contents;
      cursor: text;
    }

    @keyframes custom-caret {
      0%,
      100% {
        caret-color: transparent;
      }
      33.33%,
      66.66% {
        caret-color: var(--color-blue-300);
      }
    }

    [part="container"] {
      display: grid;
      align-items: center;
      text-align: inherit;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      padding: var(--ease-input-padding, 8px);
      border-radius: var(--ease-input-radius, var(--radii-md));
      background-color: var(--ease-input-background, var(--color-gray-875));
      cursor: text;
      animation: custom-caret 1s infinite;
      caret-animation: manual;
      transition: background-color 0.2s;
      box-shadow: var(
        --ease-input-shadow,
        inset 0 1px 0.25px 0 var(--color-white-4),
        0 1px 2.5px 0 var(--color-black-8)
      );

      &:not([data-has-prefix]):not([data-has-suffix]) {
        padding: var(--ease-input-padding, 8px 12px);
      }

      &:has(input:disabled) {
        cursor: not-allowed;
        opacity: 0.75;
      }

      &:not(:has(input:disabled)) {

        &:hover {
          background-color: var(--ease-input-background-hover, var(--color-gray-850));
        }

        &:has(input:focus-visible) {
          background-color: var(--ease-input-background-focus, var(--color-gray-825));
        }

      }

      &[data-has-prefix][data-has-suffix] {
        padding: var(--ease-input-padding, 0);
        grid-template-columns: 30px 1fr 30px;
      }

      &[data-has-prefix]:not([data-has-suffix]) {
        padding-right: var(--ease-input-padding, 12px);
        grid-template-columns: 30px 1fr;
      }

      &[data-has-suffix]:not([data-has-prefix]) {
        padding-left: var(--ease-input-padding, 12px);
        grid-template-columns: 1fr 30px;
      }

      &[data-headless="true"] {
        background-color: transparent;
        box-shadow: none;
        border: none;
        padding: 0;
        margin: 0;
        outline: none;
        border-radius: 0;
      }
    }

   ::slotted(button) {
      --ease-icon-size: 12px;
      width: 30px;
      height: 30px;
      appearance: none;
      border: none;
      outline: none;
      background-color: transparent;
      padding: 0;
      margin: 0;
      line-height: 14px;
      transition: color 0.2s;
      cursor: pointer;
      display: grid;
      place-items: center;
      color: var(--color-gray-600);
      transition: color 0.2s;

      &:hover,
      &:focus-visible {
        color: var(--color-blue-100);
      }

      &.isActive {
        animation: blink .6s forwards;
      }

      @keyframes blink {
        50% {
          background-color: var(--color-white-8);
        }
      }
    }

    ::slotted(button[slot="prefix"]) {
      border-radius: var(--radii-md) 0 0 var(--radii-md);
      border-right: 1px solid var(--color-white-4);

      &:empty {
        display: none;
      }
    }

    ::slotted([slot="prefix"]:not(button)) {
      margin: calc(var(--ease-input-padding, 8px) * -1);
      margin-right: 0;
      margin-left: 0;
    }

    ::slotted(button[slot="suffix"]) {
      border-radius: 0 var(--radii-md) var(--radii-md) 0;
      border-left: 1px solid var(--color-white-4);

      &:empty {
        display: none;
      }
    }

    input {
      font-family: inherit;
      font-optical-sizing: auto;
      font-size: var(--ease-input-font-size, var(--ease-font-size, 13px));
      appearance: none;
      -moz-appearance: textfield;
      font-weight: var(--ease-input-font-weight, 500);
      color: var(--ease-input-color, var(--color-blue-100));
      min-width: 0;
      cursor: inherit;
      text-align: inherit;
      padding: 0;
      background-color: transparent;
      border: none;
      outline: none;
      margin: 0;
      line-height: var(--ease-input-line-height, 14px);
      transition: color 0.2s;

      &::placeholder {
        color: var(--ease-input-placeholder-color, var(--color-gray-600));
        opacity: 1;
      }

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }
  `,
  template(this: Input) {
    return html`
      <div part="container" data-headless=${Boolean(this.headless)}>
        <slot name="prefix" part="prefix"></slot>
        <input part="control" .disabled=${Boolean(this.disabled)} ?disabled=${Boolean(this.disabled)} ?aria-disabled=${Boolean(this.disabled)} />
        
        <slot name="suffix" part="suffix"></slot>
      </div>
    `;
  }
})
export class Input extends HTMLElement {
  declare requestRender: () => void;

  @Prop<string | null>({ reflect: true })
  accessor value!: string | null;

  @Prop<string | null>({ reflect: true })
  accessor placeholder!: string | null;

  @Prop<string>({ reflect: true, defaultValue: 'text' })
  accessor type!: string;

  @Prop<string | null>({ reflect: true })
  accessor name!: string | null;

  @Prop<boolean>({ type: Boolean, reflect: true, defaultValue: false })
  accessor disabled = false;

  @Prop<boolean>({ type: Boolean, reflect: true, defaultValue: false })
  accessor headless = false;

  @Query<HTMLInputElement>('input')
  accessor control!: HTMLInputElement | null;

  private updatePrefixAttribute(): void {
    const container = this.shadowRoot?.querySelector('[part="container"]');
    if (!container) {
      return;
    }

    const prefixSlot = this.shadowRoot?.querySelector('slot[name="prefix"]') as HTMLSlotElement;
    const hasPrefix = Boolean(prefixSlot?.assignedNodes({ flatten: true }).length > 0);
    setBooleanAttribute(container, 'data-has-prefix', hasPrefix);
  }

  private updateSuffixAttribute(): void {
    const container = this.shadowRoot?.querySelector('[part="container"]');
    if (!container) {
      return;
    }

    const suffixSlot = this.shadowRoot?.querySelector('slot[name="suffix"]') as HTMLSlotElement;
    const hasSuffix = Boolean(suffixSlot?.assignedNodes({ flatten: true }).length > 0);
    setBooleanAttribute(container, 'data-has-suffix', hasSuffix);
  }

  afterRender(): void {
    if (!this.control) {
      return;
    }

    const control = this.control;
    const value = this.value ?? '';

    if (control.value !== value) {
      control.value = value;
    }

    control.type = this.type ?? 'text';
    control.placeholder = this.placeholder ?? '';
    control.name = this.name ?? '';
    control.disabled = Boolean(this.disabled);

    this.updatePrefixAttribute();
    this.updateSuffixAttribute();

    setBooleanAttribute(this, 'disabled', Boolean(this.disabled));
  }

  @Listen('slotchange', { selector: 'slot[name="prefix"]' })
  onPrefixSlotChange(): void {
    this.updatePrefixAttribute();
  }

  @Listen('slotchange', { selector: 'slot[name="suffix"]' })
  onSuffixSlotChange(): void {
    this.updateSuffixAttribute();
  }

  @Listen<Input, Event, HTMLInputElement>('input', { selector: 'input' })
  handleInput(event: Event, target?: HTMLInputElement | null): void {
    if (!target) {
      return;
    }

    this.value = target.value;
    dispatchControlEvent(this, 'input', { value: this.value ?? '', event });
  }

  @Listen<Input, Event, HTMLInputElement>('change', { selector: 'input' })
  handleChange(event: Event, target?: HTMLInputElement | null): void {
    if (!target) {
      return;
    }

    this.value = target.value;
    dispatchControlEvent(this, 'change', { value: this.value ?? '', event });
  }
}
