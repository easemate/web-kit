import '../dropdown';

import { Component } from '@/Component';
import { Listen } from '@/Listen';
import { Prop } from '@/Prop';
import { Query } from '@/Query';

import type { Dropdown } from '../dropdown';

import { html } from 'lit-html';

import { dispatchControlEvent, setBooleanAttribute } from '../shared';

@Component({
  tag: 'ease-origin',
  styles: `
    :host {
      display: contents;
    }

    [part="container"] {
      flex: 1;
      width: 100%;
      display: grid;
      grid-template-columns: 30px auto;
      grid-gap: 8px;
    }

    [part="preview"] {
      width: 30px;
      height: 30px;
      border-radius: var(--radii-md);
      background-color: var(--color-gray-875);
      cursor: pointer;
      box-shadow: inset 0 1px .25px 0 var(--color-white-4), 0 1px 2.5px 0 var(--color-black-8);
      border-radius: var(--radii-md);
      position: relative;

      &::before,
      &::after {
        content: '';
        display: block;
        width: 3px;
        height: 3px;
        background-color: var(--color-blue-100);
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -1.5px;
        margin-left: -1.5px;
      }

      &::before {
        background-color: var(--color-gray-700);
        box-shadow: -6.5px -6.5px 0 0 var(--color-gray-700), 0 -6.5px 0 0 var(--color-gray-700), 6.5px -6.5px 0 0 var(--color-gray-700), -6.5px 0 0 0 var(--color-gray-700), 6.5px 0 0 0 var(--color-gray-700), -6.5px 6.5px 0 0 var(--color-gray-700), 0 6.5px 0 0 var(--color-gray-700), 6.5px 6.5px 0 0 var(--color-gray-700);
      }

      &::after {
        translate: var(--ease-origin-translate-x, 0) var(--ease-origin-translate-y, 0);
        scale: 1.25;
        transition: translate 0.3s cubic-bezier(0.25, 0, 0.5, 1);
      }

      &:hover {
        background-color: var(--color-gray-850);
      }

      &:focus-within {
        background-color: var(--color-gray-825);
      }

      &[data-value="top-left"] {
        --ease-origin-translate-x: -6.5px;
        --ease-origin-translate-y: -6.5px;
      }

      &[data-value="top-center"] {
        --ease-origin-translate-x: 0;
        --ease-origin-translate-y: -6.5px;  
      }
      
      &[data-value="top-right"] {
        --ease-origin-translate-x: 6.5px;
        --ease-origin-translate-y: -6.5px;
      }

      &[data-value="center-left"] {
        --ease-origin-translate-x: -6.5px;
        --ease-origin-translate-y: 0
      }

      &[data-value="center-center"] {
        --ease-origin-translate-x: 0;
        --ease-origin-translate-y: 0;
      }

      &[data-value="center-right"] {
        --ease-origin-translate-x: 6.5px;
        --ease-origin-translate-y: 0;
      }
      
      &[data-value="bottom-left"] {
        --ease-origin-translate-x: -6.5px;
        --ease-origin-translate-y: 6.5px;
      }
      
      &[data-value="bottom-center"] {
        --ease-origin-translate-x: 0;
        --ease-origin-translate-y: 6.5px;
      }
      
      &[data-value="bottom-right"] {
        --ease-origin-translate-x: 6.5px;
        --ease-origin-translate-y: 6.5px;
      }
    }

    ease-dropdown[part="dropdown"] {
      --ease-dropdown-max-height: 180px;

      width: 100%;
    }
  `,
  template(this: Origin) {
    return html`
      <div part="container">
        <div part="preview" data-value=${this.value ?? 'center-center'}></div>
        
        <ease-dropdown part="dropdown" placeholder="Select" id="origin-dropdown" .value=${this.value ?? 'center-center'} fullWidth name=${this.name} @value-change=${this.handleValueChange}>
          <button slot="content" value="top-left">Top Left</button>
          <button slot="content" value="top-center">Top Center</button>
          <button slot="content" value="top-right">Top Right</button>
          <hr slot="content" />
          <button slot="content" value="center-left">Center Left</button>
          <button slot="content" value="center-center">Center Center</button>
          <button slot="content" value="center-right">Center Right</button>
          <hr slot="content" />
          <button slot="content" value="bottom-left">Bottom Left</button>
          <button slot="content" value="bottom-center">Bottom Center</button>
          <button slot="content" value="bottom-right">Bottom Right</button>
        </ease-dropdown>
      </div>
    `;
  }
})
export class Origin extends HTMLElement {
  declare requestRender: () => void;

  @Prop<string>({ reflect: true, defaultValue: 'center-center' })
  accessor value: string = 'center-center';

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor disabled!: boolean;

  @Query<Dropdown>('ease-dropdown')
  accessor control!: Dropdown | null;

  @Prop<string>({ reflect: true, defaultValue: '' })
  accessor name: string = '';

  afterRender(): void {
    setBooleanAttribute(this, 'disabled', Boolean(this.disabled));
  }

  @Listen<Origin, Event, Dropdown>('change', { selector: 'ease-dropdown' })
  handleChange(event: Event, target?: Dropdown | null): void {
    if (!target) {
      return;
    }

    this.value = String(target.value ?? 'center-center');

    dispatchControlEvent(this, 'change', { value: this.value, event });
  }

  handleValueChange = (event: Event): void => {
    this.value = String(this.control?.value ?? 'center-center');

    dispatchControlEvent(this, 'change', { value: this.value, event });
  };
}
