import { Component } from '@/Component';
import { Listen } from '@/Listen';
import { Prop } from '@/Prop';
import { Query } from '@/Query';

import { html } from 'lit-html';

import { dispatchControlEvent, setBooleanAttribute } from '../shared';

@Component({
  tag: 'ease-radio-input',
  shadowMode: 'open',
  styles: `
    .radio {
      display: table;
      border-radius: 12px;
      position: relative;
    }

    [part="radio"] {
      display: table;
      appearance: none;
      outline: none;
      border: none;
      background: none;
      margin: 0;
      padding: 0;
      border-radius: inherit;
    }

    [part="control"] {
      appearance: none;
      outline: none;
      border: none;
      background: none;
      display: block;
      cursor: pointer;
      margin: 0;
      padding: 0;
      border-radius: inherit;
      width: 24px;
      height: 24px;
    }

    .radio svg {
      display: block;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      pointer-events: none;
      fill: var(--color-blue-100);
      transform: scale(1.01) translateZ(0);
    }

    [part="control"] {
      box-shadow: inset 0 0 0 2px var(--color-gray-700);
    }

    .radio svg .top {
      transform-origin: 12px -12px;
      transform: translateY(0) scale(1.75, 1) translateZ(0);
      opacity: 0;
    }

    .radio svg .dot {
      transform: translateY(-17px) translateZ(0);
      opacity: 0;
    }

    .radio svg .drop {
      transform: translateY(-14px) translateZ(0);
      opacity: 0;
    }

    [part="control"]:checked {
      box-shadow: inset 0 0 0 6.75px var(--color-blue-800);
    }

    [part="control"]:checked + svg .top {
      transform: translateY(0px) scale(1.75, 1) translateZ(0);
      opacity: 1;
    }

    [part="control"]:checked + svg .dot {
      transform: translateY(0px) translateZ(0);
      opacity: 1;
    }

    [part="control"]:checked + svg .drop {
      transform: translateY(0px) translateZ(0);
      opacity: 1;
    }

    [part="control"].anim-checked {
      animation: radio-border-expand 0.8s ease-out forwards;
    }

    [part="control"].anim-checked + svg .top {
      animation: radio-top 0.8s ease-out 0.2s forwards;
    }

    [part="control"].anim-checked + svg .dot {
      animation: radio-dot 0.6s ease-out 0.2s forwards;
    }

    [part="control"].anim-checked + svg .drop {
      animation: radio-drop 0.6s ease-out 0.4s forwards;
    }

    [part="control"].anim-unchecked {
      animation: radio-border-contract 0.8s ease-out forwards;
    }

    [part="control"].anim-unchecked + svg .top {
      animation: radio-top-reverse 0.8s ease-out forwards;
    }

    [part="control"].anim-unchecked + svg .dot {
      animation: radio-dot-reverse 0.6s ease-out forwards;
    }

    [part="control"].anim-unchecked + svg .drop {
      animation: radio-drop-reverse 0.6s ease-out forwards;
    }

    @keyframes radio-border-expand {
      0% {
        box-shadow: inset 0 0 0 2px var(--color-gray-700);
      }
      25% {
        box-shadow: inset 0 0 0 12px var(--color-blue-800);
      }
      100% {
        box-shadow: inset 0 0 0 6.75px var(--color-blue-800);
      }
    }

    @keyframes radio-top {
      0% {
        transform: translateY(0) scale(1.75, 1) translateZ(0);
      }
      25% {
        transform: translateY(6px) scale(1, 1.25) translateZ(0);
      }
      100% {
        transform: translateY(0px) scale(1.75, 1) translateZ(0);
      }
    }

    @keyframes radio-dot {
      0% {
        transform: translateY(-17px) translateZ(0);
      }
      50% {
        transform: translateY(2px) translateZ(0);
      }
      100% {
        transform: translateY(0px) translateZ(0);
      }
    }

    @keyframes radio-drop {
      0% {
        transform: translateY(-14px) translateZ(0);
      }
      100% {
        transform: translateY(0px) translateZ(0);
      }
    }

    @keyframes radio-border-contract {
      0% {
        box-shadow: inset 0 0 0 6.75px var(--color-blue-800);
      }
      75% {
        box-shadow: inset 0 0 0 12px var(--color-blue-800);
      }
      100% {
        box-shadow: inset 0 0 0 2px var(--color-gray-700);
      }
    }

    @keyframes radio-top-reverse {
      0% {
        transform: translateY(0px) scale(1.75, 1) translateZ(0);
        opacity: 1;
      }
      75% {
        transform: translateY(6px) scale(1, 1.25) translateZ(0);
        opacity: 1;
      }
      100% {
        transform: translateY(0) scale(1.75, 1) translateZ(0);
        opacity: 0;
      }
    }

    @keyframes radio-dot-reverse {
      0% {
        transform: translateY(0px) translateZ(0);
        opacity: 1;
      }
      50% {
        transform: translateY(2px) translateZ(0);
        opacity: 1;
      }
      100% {
        transform: translateY(-17px) translateZ(0);
        opacity: 0;
      }
    }

    @keyframes radio-drop-reverse {
      0% {
        transform: translateY(0px) translateZ(0);
        opacity: 1;
      }
      100% {
        transform: translateY(-14px) translateZ(0);
        opacity: 0;
      }
    }
  `,
  template(this: RadioInput) {
    return html`
      <button part="radio" type="button" role="radio" aria-checked=${this.checked} ?disabled=${this.disabled}>
        <div class="radio">
          <input part="control" name=${this.name} value=${this.value} ?checked=${this.checked} ?disabled=${this.disabled} type="radio" />
          <svg viewBox="0 0 24 24" filter="url(#${this.filterId})">
              <circle class="top" cx="12" cy="-12" r="8" />
              <circle class="dot" cx="12" cy="12" r="5" />
              <circle class="drop" cx="12" cy="12" r="2" />
          </svg>
        </div>

        <svg style="display: none;">
          <defs>
            <filter id="${this.filterId}">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.25" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="gooey" />
              <feBlend in="SourceGraphic" in2="gooey" />
            </filter>
          </defs>
        </svg>
      </button>
    `;
  }
})
export class RadioInput extends HTMLElement {
  declare requestRender: () => void;

  @Prop<boolean, RadioInput>({
    type: Boolean,
    reflect: true,
    onChange(this: RadioInput, next: boolean) {
      if (next && this.name) {
        const form = this.closest('form');
        const root = form ?? (this.getRootNode() as Document | ShadowRoot);
        const others = Array.from(root.querySelectorAll(`ease-radio-input[name="${this.name}"]`)) as RadioInput[];

        others.forEach((other) => {
          if (other !== this && other.checked) {
            other.checked = false;
          }
        });
      }
    }
  })
  accessor checked!: boolean;

  @Prop<string | null>({ reflect: true })
  accessor name!: string | null;

  @Prop<string | null>({ reflect: true })
  accessor value!: string | null;

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor disabled!: boolean;

  @Query<HTMLButtonElement>('button')
  accessor control!: HTMLButtonElement | null;

  private _prevChecked?: boolean;
  private _firstRender = true;

  filterId: string = `goo-${crypto.randomUUID()}`;

  connectedCallback(): void {
    this._prevChecked = this.checked;
  }

  afterRender(): void {
    if (!this.control) {
      return;
    }

    if (this._firstRender) {
      this._firstRender = false;
      this._prevChecked = this.checked;
    }

    const changed = typeof this._prevChecked !== 'undefined' && this.checked !== this._prevChecked;
    if (changed) {
      this._triggerAnimation(this.checked);
      this._prevChecked = this.checked;
    }

    const control = this.control;
    control.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    control.disabled = Boolean(this.disabled);
    setBooleanAttribute(this, 'disabled', Boolean(this.disabled));
  }

  private _triggerAnimation(checked: boolean): void {
    const input = this.shadowRoot?.querySelector('[part="control"]') as HTMLInputElement;
    const svg = this.shadowRoot?.querySelector('svg[viewBox="0 0 24 24"]');
    if (!input || !svg) {
      return;
    }

    input.classList.remove('anim-checked', 'anim-unchecked');
    svg.classList.remove('anim-checked', 'anim-unchecked');

    const animClass = checked ? 'anim-checked' : 'anim-unchecked';
    input.classList.add(animClass);
    svg.classList.add(animClass);

    const duration = 800; // Longest animation duration in ms

    setTimeout(() => {
      input.classList.remove(animClass);
      svg.classList.remove(animClass);
    }, duration);
  }

  @Listen<RadioInput, MouseEvent, HTMLButtonElement>('click', { selector: 'button' })
  handleClick(event: MouseEvent): void {
    if (this.disabled || this.checked) {
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    this.checked = true;

    dispatchControlEvent(this, 'radio', { value: this.checked, event });
  }
}
