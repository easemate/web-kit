import { html, type TemplateResult } from 'lit-html';

import { Component } from '~/decorators/Component';
import { Prop } from '~/decorators/Prop';

@Component({
  tag: 'ease-button',
  autoSlot: true,
  shadowMode: 'open',
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    :host([data-variant="headless"]) {
      display: inline-flex;
      width: auto;
    }

    button {
      appearance: none;
      font-family: var(--ease-font-family, inherit);
      font-optical-sizing: auto;
      font-size: var(--ease-button-font-size, var(--ease-font-size-sm, 12px));
      font-weight: 550;
      color: var(--ease-button-color, var(--color-blue-100));
      min-width: 0;
      padding: var(--ease-button-padding, 7px 8px);
      display: block;
      border-radius: var(--ease-button-radius, 5px);
      background-color: var(--ease-button-background, var(--color-gray-850));
      border: none;
      outline: none;
      margin: 0;
      line-height: var(--ease-button-line-height, 14px);
      box-shadow: inset 0 1px .25px 0 var(--color-white-4), 0 1px 2.5px 0 var(--color-black-8);
      transition: color 0.2s, background-color 0.2s, scale 0.2s, box-shadow 0.2s;
      cursor: pointer;
      min-width: var(--ease-button-min-width, 88px);
      white-space: nowrap;
      overflow: hidden;
      position: relative;
      text-overflow: ellipsis;
      text-align: center;

      &[data-pill="true"] {
        border-radius: 999px;
      }

      &[data-full-width="true"] {
        width: 100%;
      }

      &[data-block="icon"] {
        --ease-icon-size: 16px;
        width: 28px;
        height: 28px;
        min-width: 28px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-gray-700);

        &:hover,
        &:focus-visible {
          color: var(--ease-button-hover-color, var(--color-blue-100));
        }

        &[data-variant="headless"] {
          --ease-icon-size: 16px;
          width: auto;
          height: auto;
          padding: 0;
          min-width: 0;
          margin: -1px;
        }
      }
      
      &[data-block="small"] {
        padding: 5px 8px;
        font-size: 12px;
        line-height: 14px;
        border-radius: 5px;
      }
      
      &[data-block="large"] {
        padding: 9px 12px;
        font-size: 13px;
        line-height: 14px;
        border-radius: 8px;
      }

      &:hover,
      &:focus-visible {
        background-color: var(--ease-button-hover-background-color, var(--color-gray-825));
        color: var(--ease-button-hover-color, var(--color-blue-100));
      }

      &[data-variant="headless"],
      &[data-variant="headless-muted"] {
        background-color: transparent;
        box-shadow: none;
        min-width: 0;
        width: auto;
        padding: 0;
        transition: scale 0.2s, color 0.2s;

        &:hover,
        &:focus-visible {
          scale: 1.05;
        }

        &:active {
          scale: 0.95;
        }
      }

      &[data-variant="headless-muted"] {
        color: var(--ease-button-color, var(--color-gray-600));

        &:hover,
        &:focus-visible {
          color: var(--ease-button-hover-color, var(--color-blue-100));
        }
      }

      &[data-variant="link"] {
        background-color: transparent;
        box-shadow: none;

        &:hover,
        &:focus-visible {
          background-color: var(--ease-button-hover-background-color, var(--color-gray-875));
        }
      }

      &[data-variant="primary"] {
        color: var(--color-blue-100);
        font-weight: 450;
        border-radius: 36px;
        
        background: radial-gradient(217.29% 45.98% at 99.13% 4.17%, rgba(21, 24, 220, 0.40) 0%, rgba(21, 24, 220, 0.00) 100%), radial-gradient(104.75% 41.7% at 3.06% 100%, rgba(233, 208, 254, 0.30) 0%, rgba(21, 24, 220, 0.00) 100%), radial-gradient(30.53% 47.92% at 46.51% -14.58%, rgba(233, 208, 254, 0.60) 0%, rgba(21, 24, 220, 0.00) 100%), radial-gradient(22.57% 35.42% at 46.29% 112.5%, rgba(233, 208, 254, 0.20) 0%, rgba(21, 24, 220, 0.00) 100%), rgba(255, 255, 255, 0.12);
        background-repeat: no-repeat;

        box-shadow: 
          0px 1px 0px 0px rgba(255, 255, 255, 0.2), 
          inset 0px 0px 50px 0px rgba(255, 255, 255, 0.02), 
          inset 0px 0px 0px 1px rgba(255, 255, 255, 0.02), 
          inset 0px 0px 4px 0px rgba(69, 40, 255, 0.4);


        &::before {
          content: '';
          position: absolute;
          inset: 0;
          background-color: var(--color-white-2);
          box-shadow: inset 0px 0.5px 0.75px 0px var(--color-white-30);
          mix-blend-mode: overlay;
          pointer-events: none;
          z-index: 1;
          border-radius: inherit;
        }

        &:hover,
        &:focus-visible {
           filter: brightness(1.1);
        }
      }
    }
  `
})
export class Button extends HTMLElement {
  declare requestRender: () => void;

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor disabled: boolean = false;

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor pill: boolean = false;

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor fullWidth: boolean = false;

  @Prop<'submit' | 'reset' | 'button'>({ type: String, reflect: true, defaultValue: 'button' })
  accessor type!: 'submit' | 'reset' | 'button';

  @Prop<'icon' | 'small' | 'medium' | 'large'>({
    type: String,
    reflect: true,
    defaultValue: 'medium',
    onAttributeChange() {
      this.requestRender?.();
    }
  })
  accessor block: 'icon' | 'small' | 'medium' | 'large' = 'medium';

  @Prop<'default' | 'primary' | 'headless' | 'headless-muted' | 'link'>({
    type: String,
    reflect: true,
    defaultValue: 'default'
  })
  accessor variant!: 'default' | 'primary' | 'headless' | 'headless-muted' | 'link';

  render(): TemplateResult {
    return html`
      <button
        type=${this.type}
        ?disabled=${this.disabled}
        data-variant=${this.variant}
        data-full-width=${this.fullWidth}
        data-pill=${this.pill}
        data-block="${this.block}"
      >
        <slot></slot>
      </button>
    `;
  }
}
