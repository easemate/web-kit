import { Component } from '@/Component';
import { Listen } from '@/Listen';
import { Prop } from '@/Prop';
import { Query } from '@/Query';

import { html } from 'lit-html';

import { dispatchControlEvent, setBooleanAttribute } from '../shared';

type ControlElement = Element & {
  value?: unknown;
  checked?: unknown;
};

const readControlValue = (element: ControlElement): string | null => {
  if (typeof element.value === 'string' || typeof element.value === 'number') {
    return String(element.value);
  }

  if (typeof element.checked === 'boolean') {
    return element.checked ? 'true' : 'false';
  }

  if ('getAttribute' in element) {
    const attr = (element as Element).getAttribute('value');
    if (attr !== null) {
      return attr;
    }
  }

  return element.textContent?.trim() ?? null;
};

@Component({
  tag: 'ease-state',
  shadowMode: 'open',
  styles: `
    [part="section"] {
      display: block;
      width: 100%;
      max-width: 332px;
      border-radius: 12px;
      border: 1px solid var(--color-white-6);
      background-clip: padding-box;
      background: var(--color-gray-1000);
      box-shadow: 0 0 40px 0 var(--color-white-2) inset;
      box-sizing: border-box;
      padding: 12px;
      margin: auto;
    }

    [part="header"] {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      margin-bottom: 12px;
    }

    [part="headline"] {
      font-size: 14px;
      font-weight: 500;
      line-height: 24px;
      font-family: "Instrument Sans", sans-serif;
      color: var(--color-blue-100);
      margin: 0 0 0 4px;
      flex-grow: 1;
      text-ellipsis: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    [part="actions"] {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: auto;
    }

    slot[name="actions"]::slotted(button) {
      --ease-icon-size: 16px;

      appearance: none;
      flex: 0 0 24px;
      border: none;
      outline: none;
      background-color: transparent;
      padding: 4px;
      margin: 0;
      cursor: pointer;
      color: var(--color-gray-600);
      transition: color 0.2s;
    }

    slot[name="actions"]::slotted(button:hover),
    slot[name="actions"]::slotted(button:focus-visible) {
      color: var(--color-blue-100);
    }

    [part="content"] {
      display: block;
      width: 100%;
      box-sizing: border-box;
      margin: auto;
    }

    [part="footer"] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 12px;
      box-sizing: border-box;
      border-top: 1px solid var(--color-white-4);

      &:not(:has([data-has-content="true"])) {
        display: none;
      }
    }

    [part="form"] {
      width: 100%;
    }

    ::slotted([slot="entry"]) {
      display: grid;
      gap: 12px;
      box-sizing: border-box;
      width: 100%;
    }
  `,
  template() {
    return html`
      <section part="section">
        <div part="header">
          <h3 part="headline"><slot name="headline"></slot></h3>
          <div part="actions">
            <slot name="actions"></slot>
          </div>
        </div>
        <div part="content">
          <div part="form">
            <slot name="entry"></slot>
          </div>
        </div>
        <div part="footer">
          <slot name="footer"></slot>
        </div>
      </section>
    `;
  }
})
export class State extends HTMLElement {
  declare requestRender: () => void;
  #controls: ControlElement[] = [];

  @Prop<string | null>({ reflect: true })
  accessor value!: string | null;

  @Query<HTMLSlotElement>('slot')
  accessor slotElement!: HTMLSlotElement | null;

  @Query<HTMLOutputElement>('output')
  accessor outputElement!: HTMLOutputElement | null;

  connectedCallback(): void {
    this.#attach();
    this.slotElement?.addEventListener('slotchange', this.#handleSlotChange);
  }

  disconnectedCallback(): void {
    this.#detach();
    this.slotElement?.removeEventListener('slotchange', this.#handleSlotChange);
  }

  afterRender(): void {
    if (this.outputElement) {
      this.outputElement.value = this.value ?? '';
    }
  }

  @Listen<State, Event>('input', { target: (host) => host })
  handleInternalInput(event: Event): void {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (!this.#controls.includes(event.target as ControlElement)) {
      return;
    }

    this.#updateValue(event.target as ControlElement, event);
  }

  @Listen<State, Event>('change', { target: (host) => host })
  handleInternalChange(event: Event): void {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (!this.#controls.includes(event.target as ControlElement)) {
      return;
    }

    this.#updateValue(event.target as ControlElement, event);
  }

  @Listen('slotchange', { selector: 'slot[name="footer"]' })
  onFooterSlotChange(): void {
    this.updateFooterAttribute();
  }

  #handleSlotChange = (): void => {
    this.#detach();
    this.#attach();
  };

  #attach(): void {
    if (!this.slotElement) {
      return;
    }

    this.#controls = this.slotElement.assignedElements({ flatten: true }) as ControlElement[];

    const first = this.#controls[0];
    if (first) {
      this.value = readControlValue(first);
    }
  }

  #detach(): void {
    this.#controls = [];
  }

  #updateValue(element: ControlElement, event: Event): void {
    const nextValue = readControlValue(element);
    if (this.value === nextValue) {
      return;
    }

    this.value = nextValue;
    dispatchControlEvent(this, 'state-change', { value: this.value, event });
  }

  private updateFooterAttribute(): void {
    const footer = this.shadowRoot?.querySelector('[part="footer"]');

    if (!footer) {
      return;
    }

    const footerSlot = this.shadowRoot?.querySelector('slot[name="footer"]') as HTMLSlotElement;
    const hasFooter = Boolean(footerSlot?.assignedNodes({ flatten: true }).length > 0);
    setBooleanAttribute(footer, 'data-has-content', hasFooter);
  }
}
