import { Component } from '@/Component';
import { Listen } from '@/Listen';
import { Prop } from '@/Prop';
import { Query } from '@/Query';

import { html } from 'lit-html';

import { dispatchControlEvent, setBooleanAttribute } from '../shared';

@Component({
  tag: 'ease-checkbox',
  styles: `
    .checkbox {
      display: table;
      border-radius: 5px;
      position: relative;

      svg {
        display: block;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        pointer-events: none;
        fill: var(--color-blue-100);
        transform: scale(1.01) translateZ(0);

        .tick {
          fill: none;
          stroke-width: 3px;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke: var(--color-blue-100);
          transform-origin: 10.5px 16px;
          transform: scale(1) translateZ(0);
        }

        .dot {
          transform-origin: 10.5px 15.5px;
          transform: scale(1) translateZ(0);
          transform-box: fill-box;
        }

         .drop {
          transform-origin: 25px -1px;
          transform: scale(1) translateZ(0);
          opacity: 0;
        }
      }
    }

    [part="checkbox"] {
      display: table;
      margin: 0;
      padding: 0;
      appearance: none;
      cursor: pointer;
      background: none;
      border: none;
      outline: none;
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

    [part="control"] {
      box-shadow: inset 0 0 0 2px var(--color-gray-700);
    }

    .tick {
      stroke-dasharray: 16px 33px;
      stroke-dashoffset: 20.5px;
    }

    .dot {
      transform: translate(14px, -14px) scale(1) translateZ(0);
      opacity: 0;
    }

    [part="control"]:checked {
      box-shadow: inset 0 0 0 12px var(--color-blue-800);
    }

    [part="control"]:checked + svg .tick {
      stroke-dasharray: 16.5px 33px;
      stroke-dashoffset: 46.5px;
    }

    [part="control"]:checked + svg .dot {
      transform: translate(0px, 0px) scale(1) translateZ(0);
      opacity: 1;
    }

    [part="checkbox"] [part="control"].anim-checked {
      animation: checkbox-border-fill 0.2s ease-out forwards, checkbox-morph 0.5s ease-out forwards;
    }

    [part="checkbox"] [part="control"].anim-checked + svg {
      .tick {
        animation: checkbox-tick 0.65s ease-out forwards;
      }

      .dot {
        animation: checkbox-dot-move 0.6s ease-out forwards;
      }
    }

    [part="checkbox"] [part="control"].anim-unchecked {
      animation: checkbox-border-default 0.4s ease-out forwards;
    }

    [part="checkbox"] [part="control"].anim-unchecked + svg {
      .tick {
        animation: checkbox-tick-default 0.2s ease-out forwards;
      }
      .dot {
        animation: checkbox-dot-hide 0.2s ease-out forwards;
      }
    }
      
    @keyframes checkbox-border-fill {
      0% {
        box-shadow: inset 0 0 0 2px var(--color-gray-700);
      }
        100% {
            box-shadow: inset 0 0 0 12px var(--color-blue-800);
        }
    }

    @keyframes checkbox-morph {
      0%, 40% {
        border-radius: 5px 14px 5px 5px;
      }
      100% {
        border-radius: 5px;
      }
    }

    @keyframes checkbox-tick {
        0% {
            stroke-dasharray: 16px 33px;
            stroke-dashoffset: 20.5px;
        }
        47% {
            stroke-dasharray: 14px 33px;
            stroke-dashoffset: 48px;
        }
        100% {
            stroke-dasharray: 16.5px 33px;
            stroke-dashoffset: 46.5px;
        }
    }

    @keyframes checkbox-dot-move {
        0%, 40% {
            transform: translate(14px, -14px) scale(1) translateZ(0);
            opacity: 0;
        }
        100% {
            transform: translate(0px, 0px) scale(1) translateZ(0);
            opacity: 1;
        }
    }

    @keyframes checkbox-dot-hide {
        0% {
            transform: translate(0px, 0px) scale(1) translateZ(0);
            opacity: 1;
        }
        100% {
            transform: translate(14px, -14px) scale(1) translateZ(0);
            opacity: 0;
        }
    }

    @keyframes checkbox-border-default {
        0%,
        40% {
            box-shadow: inset 0 0 0 12px var(--color-blue-800);
        }
        100% {
            box-shadow: inset 0 0 0 2px var(--color-gray-700);
        }
    }

    @keyframes checkbox-tick-default {
        0% {
            stroke-dasharray: 16.5px 33px;
            stroke-dashoffset: 46.5px;
        }
        100% {
            stroke-dasharray: 16px 33px;
            stroke-dashoffset: 20.5px;
        }
    }
  `,
  template(this: Checkbox) {
    return html`
      <button
        part="checkbox"
        type="button"
        role="checkbox"
        aria-checked=${this.checked}
        ?disabled=${this.disabled}
      >
        <div class="checkbox">
          <input
            part="control"
            name=${this.name}
            value=${this.value}
            ?checked=${this.checked}
            ?disabled=${this.disabled}
            type="checkbox"
          />
          <svg viewBox="0 0 24 24" filter="url(#${this.filterId})">
            <path class="tick" d="M4.5 10L10.5 16L24.5 1" />
            <circle class="dot" cx="10.5" cy="15.5" r="1.5" />
            <circle class="drop" cx="25" cy="-1" r="2" />
          </svg>
        </div>

        <svg style="display: none;">
          <defs>
            <filter id="${this.filterId}">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="1.25"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
                result="gooey"
              />
              <feBlend in="SourceGraphic" in2="gooey" />
            </filter>
          </defs>
        </svg>
      </button>
    `;
  }
})
export class Checkbox extends HTMLElement {
  declare requestRender: () => void;

  @Prop<boolean>({ type: Boolean, reflect: true })
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

  filterId: string = `goo-${crypto.randomUUID()}`;

  connectedCallback(): void {
    this._prevChecked = this.checked;
  }

  afterRender(): void {
    if (!this.control) {
      return;
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
    const control = this.shadowRoot?.querySelector('[part="control"]');
    const svg = this.shadowRoot?.querySelector('svg');
    if (!control || !svg) {
      return;
    }

    control.classList.remove('anim-checked', 'anim-unchecked');
    svg.classList.remove('anim-checked', 'anim-unchecked');

    const animClass = checked ? 'anim-checked' : 'anim-unchecked';
    const duration = checked ? 650 : 400;

    control.classList.add(animClass);
    svg.classList.add(animClass);

    setTimeout(() => {
      control.classList.remove(animClass);
      svg.classList.remove(animClass);
    }, duration);
  }

  @Listen<Checkbox, MouseEvent, HTMLButtonElement>('click', {
    selector: 'button'
  })
  handleClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    this.checked = !this.checked;

    dispatchControlEvent(this, 'checkbox', { value: this.checked, event });
  }
}
