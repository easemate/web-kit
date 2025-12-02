import { Component } from '@/Component';
import { Listen } from '@/Listen';
import { Prop } from '@/Prop';
import { Query } from '@/Query';

import { html } from 'lit-html';

import { coerceNumber, dispatchControlEvent, setBooleanAttribute } from '../shared';

import '../input';
@Component({
  tag: 'ease-number-input',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }

    [part="container"] {
      min-width: 0;
    }

    ease-input {
      --ease-input-padding: 0;
      text-align: center;
      font-family: 'Geist Mono', monospace;
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum";
    }

    [part="button"] {
      position: relative;
      overflow: hidden;
      
      & > div {
        animation: blink .75s forwards;
        position: absolute;
        pointer-events: none;
        inset: 0;
        background-color: var(--color-white-8);
      }
    }

    @keyframes blink {
      0%,
      90%,
      100% {
        opacity: 0;
      }
      30% {
        opacity: 1;
      }
    }
  `,
  template(this: NumberInput) {
    return html`
      <div part="container">
        <ease-input
          part="control"
          type="number"
          .value=${this.value}
          ?disabled=${this.disabled}
          ?min=${this.min}
          ?max=${this.max}
          ?step=${this.step}
          @input=${this.handleInput}
          @change=${this.handleChange}
        >
          <button
            slot="prefix"
            @click=${this.handleDecrement.bind(this)}
            type="button"
            part="button"
            ?disabled=${this.disabled || this.min === null || Number(this.control?.value) <= this.min}
            ?aria-disabled=${this.disabled || this.min === null || Number(this.control?.value) <= this.min}
          >
            <ease-icon-minus />
          </button>
          <button
            slot="suffix"
            @click=${this.handleIncrement.bind(this)}
            type="button"
            part="button"
            ?disabled=${this.disabled || this.max === null || Number(this.control?.value) >= this.max}
            ?aria-disabled=${this.disabled || this.max === null || Number(this.control?.value) >= this.max}
          >
            <ease-icon-plus />
          </button>
        </ease-input>
      </div>
    `;
  }
})
export class NumberInput extends HTMLElement {
  declare requestRender: () => void;
  @Prop<number | null>({ type: Number, reflect: true })
  accessor value!: number | null;

  @Prop<number | null>({ type: Number, reflect: true })
  accessor min!: number | null;

  @Prop<number | null>({ type: Number, reflect: true })
  accessor max!: number | null;

  @Prop<number | null>({ type: Number, reflect: true })
  accessor step!: number | null;

  @Prop<string | null>({ reflect: true })
  accessor name!: string | null;

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor disabled!: boolean;

  @Query<HTMLInputElement>('input')
  accessor control!: HTMLInputElement | null;

  afterRender(): void {
    if (!this.control) {
      return;
    }

    const control = this.control;
    control.value = this.value === null || this.value === undefined ? '' : String(this.value);
    control.min = this.min === null || this.min === undefined ? '' : String(this.min);
    control.max = this.max === null || this.max === undefined ? '' : String(this.max);
    control.step = this.step === null || this.step === undefined ? '' : String(this.step);
    control.name = this.name ?? '';
    control.disabled = Boolean(this.disabled);

    setBooleanAttribute(this, 'disabled', Boolean(this.disabled));
  }

  @Listen<NumberInput, Event, HTMLInputElement>('input', { selector: 'input' })
  handleInput(event: Event, target?: HTMLInputElement | null): void {
    if (!target) {
      return;
    }

    this.value = coerceNumber(target.value);
    dispatchControlEvent(this, 'input', { value: this.value, event });
  }

  @Listen<NumberInput, Event, HTMLInputElement>('change', { selector: 'input' })
  handleChange(event: Event, target?: HTMLInputElement | null): void {
    if (!target) {
      return;
    }

    this.value = coerceNumber(target.value);
    dispatchControlEvent(this, 'change', { value: this.value, event });
  }

  addActiveLayer(button: HTMLButtonElement): void {
    const layer = document.createElement('div');
    layer.classList.add('active-layer');
    button.appendChild(layer);

    setTimeout(() => {
      layer.remove();
    }, 600);
  }

  handleDecrement(event: MouseEvent): void {
    if (this.disabled || this.min === null || Number(this.control?.value) <= this.min) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;
    this.addActiveLayer(button);

    const current = typeof this.value === 'number' ? this.value : 0;
    this.value = current - (this.step ?? 1);

    if (this.value <= this.min) {
      this.disabled = true;
    }
  }

  handleIncrement(event: MouseEvent): void {
    if (this.disabled || this.max === null || Number(this.control?.value) >= this.max) {
      return;
    }

    const button = event.currentTarget as HTMLButtonElement;
    this.addActiveLayer(button);

    const current = typeof this.value === 'number' ? this.value : 0;
    this.value = current + (this.step ?? 1);

    if (this.value >= this.max) {
      this.disabled = true;
    }
  }
}
