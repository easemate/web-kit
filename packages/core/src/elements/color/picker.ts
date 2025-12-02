import { Component } from '@/Component';
import { Prop } from '@/Prop';
import { Query } from '@/Query';

import { html } from 'lit-html';

import { dispatchControlEvent } from '../shared';
import {
  COLOR_FORMATS,
  type ColorFormat,
  getColorComponents,
  type HSV,
  hexToHsv,
  hsvToHex,
  hsvToRgb,
  isLightColor,
  isValidHex,
  updateHsvFromComponents
} from './utils';

import { styleMap } from '~/utils/template-helpers';

@Component({
  tag: 'ease-color-picker',
  autoSlot: false,
  styles: `
    :host {
      display: grid;
      grid-gap: 8px;
      user-select: none;
      -webkit-user-select: none;

      --ease-color-picker-width: 180px;
    }

    [part="saturation"] {
      position: relative;
      width: 100%;
      height: 124px;
      cursor: pointer;
      background-image: linear-gradient(to top, black, transparent), linear-gradient(to right, white, transparent);
      border-radius: 7px;
      touch-action: none;
    }

    [part="saturation-handle"] {
      position: absolute;
      width: 10px;
      height: 10px;
      box-shadow: inset 0 0 0 2px var(--color-blue-100);
      border-radius: 50%;
      pointer-events: none;
    }

    [part="hue"] {
      position: relative;
      height: 8px;
      align-self: center;
      flex-grow: 1;
      cursor: pointer;
      border-radius: 9px;
      background-image: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
      touch-action: none;
    }

    [part="hue-handle"] {
      position: absolute;
      top: 0;
      width: 8px;
      height: 8px;
      box-shadow: inset 0 0 0 2px var(--color-blue-100);
      border-radius: 50%;
      pointer-events: none;
    }

    [part="preview"] {
      position: relative;
      width: 20px;
      height: 20px;
      border-radius: 5px;
      box-shadow: inset 0 0 0 .75px var(--color-blue-80);
      display: grid;
      place-items: center;

      &[data-eyedropper] {
        cursor: pointer;

        &:hover,
        &:focus-visible {
          ease-icon-picker {
            scale: 1.1;
          }
        }

        ease-icon-picker {
          color: var(--icon-color, var(--color-blue-100));
          transition: scale 0.2s, color 0.15s;
          filter: drop-shadow(0 0 2px var(--color-black-15));
        }
      }
    }

    [part="toolbar"] {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      position: relative;
      z-index: 1;
    }

    [part="toolbar"] ease-button {
      padding: 4px;
      width: max-content;
    }

    [part="format-container"] {
      display: grid;
      grid-template-columns: 30px 1fr;
      align-items: center;
      gap: 8px;
    }

    [part="format-inputs"] {
      padding: 2px 4px;
      width: 100%;
      border-radius: var(--radii-md);
      background-color: var(--color-gray-850);
      cursor: pointer;
      box-shadow: inset 0 1px .25px 0 var(--color-white-4), 0 1px 2.5px 0 var(--color-black-8);
      box-sizing: border-box;
      display: flex;
      justify-content: space-around;

      &:hover,
      &:focus-within {
        background-color: var(--color-gray-825);
      }
    }

    [part="format-input"] {
      appearance: none;
      -moz-appearance: textfield;
      cursor: pointer;
      box-sizing: border-box;
      font-size: 11px;
      font-weight: 500;
      color: var(--color-gray-600);
      min-width: 0;
      box-sizing: border-box;
      border: none;
      outline: none;
      padding: 4px;
      margin: 0;
      background-color: transparent;
      line-height: 12px;
      transition: color 0.2s;
      width: 100%;
      text-align: center;
      font-optical-sizing: auto;
      font-family: 'Geist Mono', monospace;

      &:hover,
      &:focus-within {
        color: var(--color-blue-100);
      }

      &::placeholder {
        color: var(--color-gray-800);
        opacity: 1;
      }

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }

    [part="color-container"] {
      display: grid;
      grid-template-columns: 1fr 20px;
      align-items: center;
      gap: 8px;
    }

    [part="format-trigger"] {
      --ease-icon-size: 10px;

      display: flex;
      align-items: center;
      gap: 2px;
      font-family: 'Geist Mono', monospace;
      font-optical-sizing: auto;
      font-size: 10px;
      font-weight: 500;
      color: var(--color-gray-400);
      cursor: pointer;
      transition: color 0.15s;
      overflow: hidden;
      position: relative;
      height: 14px;

      &:hover {
        color: var(--color-gray-200);
      }

      ease-icon-arrows-vertical {
        color: var(--color-gray-600);
        flex-shrink: 0;
      }
    }

    [part="format-label"] {
      display: inline-block;
    }

    [part="format-label"][data-animating="out"] {
      animation: formatOut 0.15s ease-in forwards;
    }

    [part="format-label"][data-animating="in"] {
      animation: formatIn 0.15s ease-out forwards;
    }

    @keyframes formatOut {
      0% {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
      100% {
        transform: translateY(6px) scale(0.8);
        opacity: 0;
      }
    }

    @keyframes formatIn {
      0% {
        transform: translateY(-6px) scale(0.8);
        opacity: 0;
      }
      100% {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }

  `,
  template(this: ColorPicker) {
    const { h, s, v } = this.hsv;
    const pureHue = hsvToRgb(h, 1, 1);
    const currentRgb = hsvToRgb(h, s, v);
    const saturationBg = `rgb(${pureHue.r}, ${pureHue.g}, ${pureHue.b})`;
    const huePercent = h / 360;
    const vInverted = 1 - v;
    // Position handles so they stay within container bounds (handle is 10px)
    const saturationHandleStyles = {
      left: `calc(${s * 100}% - ${s * 10}px)`,
      top: `calc(${vInverted * 100}% - ${vInverted * 10}px)`
    } as const;
    const hueHandleStyles = {
      left: `calc(${huePercent * 100}% - ${huePercent * 10}px)`
    } as const;
    const isLight = isLightColor(currentRgb.r, currentRgb.g, currentRgb.b);
    const hasEyeDropper = 'EyeDropper' in window;
    const previewStyles = {
      backgroundColor: this.value,
      '--icon-color': isLight ? 'var(--color-gray-900)' : 'var(--color-blue-100)'
    } as const;
    const components = getColorComponents(this.hsv, this.format);

    return html`
      <div 
        part="saturation" 
        style=${styleMap({ backgroundColor: saturationBg })}
        @pointerdown=${this.handleSaturationPointerDown}
        @pointermove=${this.handleSaturationPointerMove}
        @pointerup=${this.handleSaturationPointerUp}
        @pointercancel=${this.handleSaturationPointerUp}
      >
        <div part="saturation-handle" style=${styleMap(saturationHandleStyles)}></div>
      </div>
      <div part="color-container">
        <div 
          part="hue"
          @pointerdown=${this.handleHuePointerDown}
          @pointermove=${this.handleHuePointerMove}
          @pointerup=${this.handleHuePointerUp}
          @pointercancel=${this.handleHuePointerUp}
        >
          <div part="hue-handle" style=${styleMap(hueHandleStyles)}></div>
        </div>

        <div 
          part="preview" 
          style=${styleMap(previewStyles)}
          ?data-eyedropper=${hasEyeDropper}
          @click=${hasEyeDropper ? this.handleEyeDropperClick : null}
        >
          ${hasEyeDropper ? html`<ease-icon-picker></ease-icon-picker>` : null}
        </div>
      </div>
      <div part="format-container">
        <div part="format-trigger" @click=${this.handleFormatCycle}>
          <span part="format-label" data-animating=${this.formatAnimating}>${this.format.toUpperCase()}</span>
          <ease-icon-arrows-vertical />
        </div>
        <div part="format-inputs">
          ${
            this.format === 'hex'
              ? html`
              <input 
                part="format-input" 
                data-hex
                type="text" 
                .value=${components.values[0]}
                @input=${(e: Event) => this.handleComponentChange(0, (e.target as HTMLInputElement).value)}
              />
            `
              : components.labels.map(
                  (_, i) => html`
                <input 
                  part="format-input" 
                  type="number" 
                  min="0"
                  max=${components.max[i]}
                  .value=${String(components.values[i])}
                  @input=${(e: Event) => this.handleComponentChange(i, Number((e.target as HTMLInputElement).value))}
                />
            `
                )
          }
        </div>
      </div>
      <div part="toolbar">
        <ease-button variant="headless-muted" @click=${this.handleCancelButtonClick}>Cancel</ease-button>
        <ease-button variant="headless" @click=${this.handleApplyButtonClick}>Apply</ease-button>
      </div>
    `;
  }
})
export class ColorPicker extends HTMLElement {
  declare requestRender: () => void;

  private hsv: HSV = { h: 0, s: 1, v: 1 };
  private originalValue: string = '#FF0000';
  private format: ColorFormat = 'hex';
  private formatAnimating: 'out' | 'in' | 'none' = 'none';
  #isDraggingSaturation = false;
  #isDraggingHue = false;
  #activeSaturationPointer: number | null = null;
  #activeHuePointer: number | null = null;
  isInternalUpdate = false;

  @Query('[part="saturation"]') accessor saturationArea!: HTMLElement | null;
  @Query('[part="hue"]') accessor hueArea!: HTMLElement | null;
  @Query<HTMLInputElement>('[part="hex-input"]') accessor hexInput!: HTMLInputElement | null;

  @Prop({
    reflect: true,
    defaultValue: '#FF0000',
    onChange(this: ColorPicker, value: string | null) {
      if (!this.isInternalUpdate) {
        this.updateFromHex(value ?? '#FF0000');
      }
    }
  })
  accessor value!: string;

  connectedCallback(): void {
    this.originalValue = this.value;
    this.updateFromHex(this.value);
  }

  private updateFromHex(hex: string): void {
    if (!isValidHex(hex)) {
      return;
    }

    const hsv = hexToHsv(hex);

    if (hsv) {
      this.hsv = hsv;
    }
  }

  #updateValue(event: Event | null): void {
    const newValue = hsvToHex(this.hsv.h, this.hsv.s, this.hsv.v);

    if (this.value !== newValue) {
      this.isInternalUpdate = true;
      this.value = newValue;
      this.isInternalUpdate = false;

      if (this.hexInput && document.activeElement !== this.hexInput) {
        this.hexInput.value = newValue;
      }

      if (event) {
        dispatchControlEvent(this, 'input', { value: this.value, event });
      }
    }
  }

  readonly handleSaturationPointerDown = (event: PointerEvent): void => {
    if (!this.saturationArea) {
      return;
    }

    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.#isDraggingSaturation = true;
    this.#activeSaturationPointer = event.pointerId;
    this.saturationArea.setPointerCapture(event.pointerId);
    this.updateSaturationValue(event);
  };

  readonly handleSaturationPointerMove = (event: PointerEvent): void => {
    if (!this.#isDraggingSaturation || event.pointerId !== this.#activeSaturationPointer) {
      return;
    }

    event.preventDefault();
    this.updateSaturationValue(event);
  };

  readonly handleSaturationPointerUp = (event: PointerEvent): void => {
    if (!this.#isDraggingSaturation || event.pointerId !== this.#activeSaturationPointer) {
      return;
    }

    this.#isDraggingSaturation = false;
    this.#activeSaturationPointer = null;

    if (this.saturationArea?.hasPointerCapture(event.pointerId)) {
      this.saturationArea.releasePointerCapture(event.pointerId);
    }

    dispatchControlEvent(this, 'change', { value: this.value, event });
  };

  private updateSaturationValue(event: PointerEvent): void {
    if (!this.saturationArea) {
      return;
    }
    const rect = this.saturationArea.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));

    this.hsv.s = x / rect.width;
    this.hsv.v = 1 - y / rect.height;

    this.#updateValue(event);
    this.requestRender();
  }

  readonly handleHuePointerDown = (event: PointerEvent): void => {
    if (!this.hueArea) {
      return;
    }

    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.#isDraggingHue = true;
    this.#activeHuePointer = event.pointerId;
    this.hueArea.setPointerCapture(event.pointerId);
    this.updateHue(event);
  };

  readonly handleHuePointerMove = (event: PointerEvent): void => {
    if (!this.#isDraggingHue || event.pointerId !== this.#activeHuePointer) {
      return;
    }

    event.preventDefault();
    this.updateHue(event);
  };

  readonly handleHuePointerUp = (event: PointerEvent): void => {
    if (!this.#isDraggingHue || event.pointerId !== this.#activeHuePointer) {
      return;
    }

    this.#isDraggingHue = false;
    this.#activeHuePointer = null;

    if (this.hueArea?.hasPointerCapture(event.pointerId)) {
      this.hueArea.releasePointerCapture(event.pointerId);
    }

    dispatchControlEvent(this, 'change', { value: this.value, event });
  };

  private updateHue(event: PointerEvent): void {
    if (!this.hueArea) {
      return;
    }
    const rect = this.hueArea.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));

    this.hsv.h = (x / rect.width) * 360;

    this.#updateValue(event);
    this.requestRender();
  }

  readonly handleHexInputChange = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;

    if (isValidHex(newValue)) {
      this.updateFromHex(newValue);
      this.#updateValue(event);
      this.requestRender();
      dispatchControlEvent(this, 'change', { value: this.value, event });
    } else if (this.hexInput) {
      this.hexInput.value = this.value;
    }
  };

  readonly handleComponentChange = (index: number, value: number | string): void => {
    this.hsv = updateHsvFromComponents(this.hsv, this.format, index, value);
    this.#updateValue(null);
    this.requestRender();
  };

  readonly handleFormatChange = (format: ColorFormat): void => {
    this.format = format;
    this.requestRender();
  };

  readonly handleFormatCycle = (): void => {
    // Start exit animation
    this.formatAnimating = 'out';
    this.requestRender();

    // After exit animation, change format and start enter animation
    setTimeout(() => {
      const currentIndex = COLOR_FORMATS.indexOf(this.format);
      const nextIndex = (currentIndex + 1) % COLOR_FORMATS.length;
      this.format = COLOR_FORMATS[nextIndex] as ColorFormat;
      this.formatAnimating = 'in';
      this.requestRender();

      // Clear animation state after enter animation
      setTimeout(() => {
        this.formatAnimating = 'none';
        this.requestRender();
      }, 150);
    }, 150);
  };

  readonly handleCancelButtonClick = (event: Event): void => {
    this.updateFromHex(this.originalValue);
    this.isInternalUpdate = true;
    this.value = this.originalValue;
    this.isInternalUpdate = false;
    this.requestRender();
    dispatchControlEvent(this, 'cancel', { value: this.originalValue, event });
  };

  readonly handleApplyButtonClick = (event: Event): void => {
    this.originalValue = this.value;
    dispatchControlEvent(this, 'apply', { value: this.value, event });
  };

  readonly handleEyeDropperClick = async (event: Event): Promise<void> => {
    if (!('EyeDropper' in window)) {
      return;
    }

    try {
      const eyeDropper = new (
        window as typeof window & { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }
      ).EyeDropper();
      const result = await eyeDropper.open();

      if (result.sRGBHex) {
        this.updateFromHex(result.sRGBHex);
        this.#updateValue(event);
        this.requestRender();
        dispatchControlEvent(this, 'change', { value: this.value, event });
      }
    } catch {
      // User cancelled or API error - silently ignore
    }
  };
}

export default {
  ColorPicker
};
