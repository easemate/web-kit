import '../input';

import { Component } from '@/Component';
import { Listen } from '@/Listen';
import { Prop } from '@/Prop';
import { Query } from '@/Query';

import { html } from 'lit-html';

import { coerceNumber, dispatchControlEvent, setBooleanAttribute } from '../shared';

@Component({
  tag: 'ease-slider',
  styles: `
    :host {
      display: contents;
      --track-color: var(--color-gray-825);
      --active-track-color: var(--color-blue-1100);
      --thumb-color: var(--color-blue-900);
      --thumb-size: 18px;
      --track-height: 4px;
    }

    [part="container"] {
      flex: 1;
      display: grid;
      grid-template-columns: auto 36px;
      grid-gap: 12px;
    }

    ease-input[part="value"] {
      --ease-input-padding: 8px 0;
      min-width: 0;
      text-align: center;
      width: 36px;
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum";
      font-family: 'Geist Mono', monospace;
    }

    input[part="control"][type="range"] {
      height: 30px;
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
        <input part="control" type="range" />
        
        <ease-input part="value" type="number" placeholder='-' .value=${this.value} @input=${this.handleInput} @change=${this.handleChange} />
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

  @Query<HTMLOutputElement>('output')
  accessor output!: HTMLOutputElement | null;

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

  @Listen<Slider, Event, HTMLInputElement>('input', { selector: 'input' })
  handleInput(event: Event, target?: HTMLInputElement | null): void {
    if (!target) {
      return;
    }

    const numericValue = coerceNumber(target.value);
    this.value = numericValue;
    this.updateProgress();

    dispatchControlEvent(this, 'input', { value: this.value, event });
  }

  @Listen<Slider, Event, HTMLInputElement>('change', { selector: 'input' })
  handleChange(event: Event): void {
    dispatchControlEvent(this, 'change', { value: this.value, event });
  }

  updateProgress(): void {
    if (!this.control) {
      return;
    }

    const value = this.value ?? 0;
    const min = this.min ?? 0;
    const max = this.max ?? 100;
    const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
    this.control.style.setProperty('--progress', `${percent}%`);
  }
}
