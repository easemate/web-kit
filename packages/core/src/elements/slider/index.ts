import '../input';

import { html } from 'lit-html';

import { type ControlEventDetail, coerceNumber, dispatchControlEvent, setBooleanAttribute } from '../shared';

import { Component } from '~/decorators/Component';
import { Listen } from '~/decorators/Listen';
import { Prop } from '~/decorators/Prop';
import { Query } from '~/decorators/Query';

@Component({
  tag: 'ease-slider',
  styles: `
    :host {
      display: contents;
      --track-color: var(--ease-slider-track-color, var(--color-gray-825));
      --active-track-color: var(--ease-slider-active-track-color, var(--color-blue-1100));
      --thumb-color: var(--ease-slider-thumb-color, var(--color-blue-900));
      --thumb-size: var(--ease-slider-thumb-size, 18px);
      --track-height: var(--ease-slider-track-height, 4px);
    }

    [part="container"] {
      flex: 1;
      display: grid;
      grid-template-columns: auto var(--ease-slider-value-width, 36px);
      grid-gap: var(--ease-slider-gap, 12px);
    }

    ease-input[part="value"] {
      --ease-input-padding: 8px 0;
      min-width: 0;
      text-align: center;
      width: var(--ease-slider-value-width, 36px);
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum";
      font-family: var(--ease-font-mono, 'Geist Mono', monospace);
    }

    input[part="control"][type="range"] {
      height: var(--ease-slider-height, 30px);
      margin: 0;
      padding: 0;
      appearance: none;
      background-color: transparent;
      width: 100%;
      cursor: pointer;
    }

    input[part="control"][type="range"]::-webkit-slider-runnable-track {
      width: 100%;
      height: var(--track-height);
      background: linear-gradient(to right, var(--active-track-color) var(--progress, 0%), var(--track-color) var(--progress, 0%));
      border-radius: calc(var(--track-height) / 2);
      border: none;
    }

    input[part="control"][type="range"]::-moz-range-track {
      width: 100%;
      height: var(--track-height);
      background: var(--track-color);
      border-radius: calc(var(--track-height) / 2);
      border: none;
    }

    input[part="control"][type="range"]::-moz-range-progress {
      background-color: var(--active-track-color);
      height: var(--track-height);
      border-radius: calc(var(--track-height) / 2);
    }

    input[part="control"][type="range"]::-webkit-slider-thumb {
      appearance: none;
      height: var(--thumb-size);
      width: var(--thumb-size);
      border-radius: 50%;
      margin-top: calc((var(--track-height) - var(--thumb-size)) / 2);
      box-shadow: inset 0 0 0 .75px var(--color-white-15), inset 0 0 5px var(--color-white-20);
      transition: transform 0.2s;
      position: relative;
      background: radial-gradient(circle at center, var(--color-blue-100-50) 4.5px, var(--color-white-0) 4.5px),  var(--thumb-color) no-repeat center center;
    }
    
    input[part="control"][type="range"]:hover::-webkit-slider-thumb {
        transform: scale(1.075);
    }
    
    input[part="control"][type="range"]:active::-webkit-slider-thumb {
        transform: scale(.975);
    }

    input[part="control"][type="range"]::-moz-range-thumb {
      height: var(--thumb-size);
      width: var(--thumb-size);
      border-radius: 50%;
      background: radial-gradient(circle at center, var(--color-blue-100-50) 4.5px, var(--color-white-0) 4.5px),  var(--thumb-color) no-repeat center center;
      border: none;
      box-shadow: inset 0 0 0 .75px var(--color-white-15), inset 0 0 5px var(--color-white-20);
      transition: transform 0.2s;
      position: relative;
    }

    input[part="control"][type="range"]:hover::-moz-range-thumb {
        transform: scale(1.075);
    }

    input[part="control"][type="range"]:active::-moz-range-thumb {
        transform: scale(.975);
    }
  `,
  template(this: Slider) {
    return html`
      <div part="container">
        <input
          part="control"
          type="range"
          .min=${this.min ?? 0}
          .max=${this.max ?? 100}
          .step=${this.step ?? 1}
          .value=${String(this.value ?? 0)}
          ?disabled=${this.disabled}
          ?aria-disabled=${this.disabled}
        />
        
        <ease-input
          part="value"
          type="number"
          placeholder="-"
          .disabled=${Boolean(this.disabled)}
          .value=${this.value === null || this.value === undefined ? '' : String(this.value)}
        />
      </div>
    `;
  }
})
export class Slider extends HTMLElement {
  declare requestRender: () => void;

  @Prop<number | null>({ type: Number, reflect: true })
  accessor value!: number | null;

  @Prop<number | null>({ type: Number, reflect: true })
  accessor min!: number | null;

  @Prop<number | null>({ type: Number, reflect: true })
  accessor max!: number | null;

  @Prop<number | null>({ type: Number, reflect: true })
  accessor step!: number | null;

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor disabled!: boolean;

  @Query<HTMLInputElement>('input')
  accessor control!: HTMLInputElement | null;

  @Query<HTMLElement>('ease-input')
  accessor valueControl!: (HTMLElement & { value?: string | null }) | null;

  afterRender(): void {
    if (!this.control) {
      return;
    }

    const control = this.control;
    const value = this.value ?? 0;

    control.value = String(value);
    control.min = this.min === null || this.min === undefined ? '' : String(this.min);
    control.max = this.max === null || this.max === undefined ? '' : String(this.max);
    control.step = this.step === null || this.step === undefined ? '' : String(this.step);
    control.type = 'range';
    control.setAttribute('part', 'control');
    control.disabled = Boolean(this.disabled);

    setBooleanAttribute(this, 'disabled', Boolean(this.disabled));
    this.updateProgress();
  }

  @Listen<Slider, Event, HTMLInputElement>('input', { selector: 'input[type="range"]' })
  handleRangeInput(event: Event, target?: HTMLInputElement | null): void {
    if (!target) {
      return;
    }

    const numericValue = coerceNumber(target.value);
    this.value = numericValue;
    this.updateProgress();

    if (this.valueControl) {
      this.valueControl.value = numericValue === null ? '' : String(numericValue);
    }

    dispatchControlEvent(this, 'input', { value: this.value, event });
  }

  @Listen<Slider, Event, HTMLInputElement>('change', { selector: 'input[type="range"]' })
  handleRangeChange(event: Event, target?: HTMLInputElement | null): void {
    if (target) {
      const numericValue = coerceNumber(target.value);
      this.value = numericValue;
      this.updateProgress();

      if (this.valueControl) {
        this.valueControl.value = numericValue === null ? '' : String(numericValue);
      }
    }

    dispatchControlEvent(this, 'change', { value: this.value, event });
  }

  @Listen<Slider, CustomEvent<ControlEventDetail<string>>, HTMLElement>('input', {
    selector: 'ease-input',
    when: (event) => event instanceof CustomEvent && typeof (event as CustomEvent).detail?.value === 'string'
  })
  handleValueInput(event: CustomEvent<ControlEventDetail<string>>): void {
    const rawValue = event.detail?.value ?? '';
    const numericValue = coerceNumber(rawValue);
    this.value = numericValue;
    this.updateProgress();

    if (this.control) {
      this.control.value = String(numericValue ?? 0);
    }

    dispatchControlEvent(this, 'input', { value: this.value, event: event.detail?.event ?? event });
  }

  @Listen<Slider, CustomEvent<ControlEventDetail<string>>, HTMLElement>('change', {
    selector: 'ease-input',
    when: (event) => event instanceof CustomEvent && typeof (event as CustomEvent).detail?.value === 'string'
  })
  handleValueChange(event: CustomEvent<ControlEventDetail<string>>): void {
    const rawValue = event.detail?.value ?? '';
    const numericValue = coerceNumber(rawValue);
    this.value = numericValue;
    this.updateProgress();

    if (this.control) {
      this.control.value = String(numericValue ?? 0);
    }

    dispatchControlEvent(this, 'change', { value: this.value, event: event.detail?.event ?? event });
  }

  updateProgress(): void {
    if (!this.control) {
      return;
    }

    // Ensure numeric coercion for proper calculation
    const value = Number(this.value) || 0;
    const min = Number(this.min) || 0;
    const max = Number(this.max) || 100;
    const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
    this.control.style.setProperty('--progress', `${Math.max(0, Math.min(100, percent))}%`);
  }
}
