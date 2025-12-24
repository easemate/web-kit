import { html } from 'lit-html';

import { Component } from '~/decorators/Component';
import { Prop } from '~/decorators/Prop';
import { Query } from '~/decorators/Query';
import '../button';

import { dispatchControlEvent } from '../shared';

export * from './option';

interface RadioEntry {
  element: HTMLElement;
  value: string;
  label: string;
  id: string;
  handlers: {
    click: (event: Event) => void;
    keydown: (event: KeyboardEvent) => void;
  };
}
const nextOptionId = (() => {
  let counter = 0;
  return () => {
    counter += 1;
    return `ease-radio-option-${counter}`;
  };
})();

const nextPanelId = (() => {
  let counter = 0;
  return () => {
    counter += 1;
    return `ease-radio-content-${counter}`;
  };
})();

@Component({
  tag: 'ease-radio-group',
  shadowMode: 'open',
  styles: `
    :host {
      display: flex;
    }

    [part="option"] {
      flex: 0 0 50%;
      display: block;
    }

    [part="group"] {
      display: flex;
      position: relative;
      z-index: 0;
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      padding: var(--ease-radio-padding, 3px);
      border-radius: var(--ease-radio-radius, var(--radii-md));
      background-color: var(--ease-radio-background, var(--color-gray-875));
      box-shadow: var(
        --ease-radio-shadow,
        inset 0 1px 0.25px 0 var(--color-white-4),
        0 1px 2.5px 0 var(--color-black-8)
      );

      ::slotted(button) {
        padding: var(--ease-radio-option-padding, 4px 0);
        line-height: var(--ease-radio-option-line-height, 16px);
        margin: 0;
        border: none;
        outline: none;
        background: none;
        cursor: pointer;
        font-family: var(--ease-font-family, inherit);
        font-optical-sizing: auto;
        font-size: var(--ease-radio-option-font-size, var(--ease-font-size-sm, 12px));
        font-weight: var(--ease-radio-option-font-weight, 500);
        color: var(--ease-radio-option-color, var(--color-gray-600));
        transition: color 0.2s;
        flex-grow: 1;
      }

      ::slotted(button:hover),
      ::slotted(button:focus-visible) {
        color: var(--color-blue-100);
      }

      ::slotted(button[data-active="true"]) {
        color: var(--color-blue-100);
      }
    }
  `,
  template() {
    return html`
      <div part="group">
        <slot name="content"></slot>
      </div>
    `;
  }
})
export class RadioGroup extends HTMLElement {
  declare requestRender: () => void;

  @Prop<string | null, RadioGroup>({
    reflect: true,
    defaultValue: null,
    onChange(this: RadioGroup, next, previous) {
      if (next === previous) {
        return;
      }
      this.updateOptionSelectionState();
    }
  })
  accessor value: string | null = null;

  @Query<HTMLElement>('[part="group"]')
  accessor groupElement!: HTMLElement | null;

  @Query<HTMLSlotElement>('slot[name="content"]')
  accessor contentSlot!: HTMLSlotElement | null;

  #options: RadioEntry[] = [];
  #currentSlot: HTMLSlotElement | null = null;
  #optionsInitialized = false;
  #handleSlotChange = (): void => {
    this.#syncOptions();
  };

  connectedCallback(): void {
    this.#ensureSlotListener();
  }

  disconnectedCallback(): void {
    this.#removeSlotListener();
    this.#teardownOptions();
  }

  afterRender(): void {
    const panel = this.groupElement;

    if (panel) {
      if (!panel.id) {
        panel.id = nextPanelId();
      }
      panel.tabIndex = -1;
      panel.setAttribute('role', 'radiogroup');
    }

    this.#ensureSlotListener();

    if (!this.#optionsInitialized) {
      queueMicrotask(() => {
        this.#syncOptions();
      });
    } else {
      this.updateOptionSelectionState();
    }
  }

  #ensureSlotListener(): void {
    const slot = this.contentSlot;

    if (slot === this.#currentSlot) {
      return;
    }

    if (this.#currentSlot) {
      this.#currentSlot.removeEventListener('slotchange', this.#handleSlotChange);
    }

    if (slot) {
      slot.addEventListener('slotchange', this.#handleSlotChange);
    }

    this.#currentSlot = slot ?? null;
  }

  #removeSlotListener(): void {
    if (!this.#currentSlot) {
      return;
    }

    this.#currentSlot.removeEventListener('slotchange', this.#handleSlotChange);
    this.#currentSlot = null;
  }

  #syncOptions(): void {
    const assigned = this.contentSlot?.assignedElements({ flatten: true }) ?? [];
    const elements = assigned.filter((node): node is HTMLElement => node instanceof HTMLElement);

    this.#removeOptionListeners(this.#options);

    const options: RadioEntry[] = [];

    elements.forEach((element) => {
      if (element.hasAttribute('data-select-ignore') || element.getAttribute('role') === 'separator') {
        return;
      }

      const value = this.#resolveOptionValue(element);
      const label = this.#resolveOptionLabel(element, value);
      const id = element.id && element.id.trim().length > 0 ? element.id : nextOptionId();

      if (!element.id) {
        element.id = id;
      }

      element.setAttribute('role', 'option');
      element.setAttribute('aria-selected', 'false');
      element.setAttribute('variant', this.value === value ? 'default' : 'link');
      element.dataset.active = 'false';
      element.tabIndex = -1;

      const handlers = {
        click: (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          this.#selectOption(value, label, event);
        },
        keydown: (event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.#selectOption(value, label, event);
          }
        }
      } as RadioEntry['handlers'];

      element.addEventListener('click', handlers.click, { passive: false });
      element.addEventListener('keydown', handlers.keydown);

      options.push({ element, value, label, id, handlers });
    });

    this.#options = options;
    this.#optionsInitialized = options.length > 0;

    if (this.value === null && options.length > 0) {
      const preselected = options.find(
        (option) =>
          option.element.hasAttribute('selected') ||
          option.element.dataset.selected === 'true' ||
          option.element.getAttribute('aria-selected') === 'true'
      );

      if (preselected) {
        this.value = preselected.value;
      }
    }

    this.updateOptionSelectionState();
  }

  #teardownOptions(): void {
    this.#removeOptionListeners(this.#options);
    this.#options = [];
    this.#optionsInitialized = false;
  }

  #removeOptionListeners(options: RadioEntry[]): void {
    options.forEach((option) => {
      option.element.removeEventListener('click', option.handlers.click);
      option.element.removeEventListener('keydown', option.handlers.keydown);
      option.element.dataset.active = 'false';
      option.element.setAttribute('aria-selected', 'false');
      option.element.tabIndex = -1;
    });
  }

  updateOptionSelectionState(): void {
    if (!this.#optionsInitialized) {
      return;
    }

    let selectedLabel: string | null = null;

    const options = this.#options;

    options.forEach((option) => {
      const isSelected = this.value !== null && option.value === this.value;
      option.element.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      option.element.dataset.active = isSelected ? 'true' : 'false';
      option.element.tabIndex = isSelected ? 0 : -1;
      option.element.setAttribute('variant', isSelected ? 'default' : 'link');

      if (isSelected) {
        selectedLabel = option.label;
      }
    });

    if (!selectedLabel) {
      const fallback = options[0];
      if (fallback) {
        fallback.element.tabIndex = 0;
      }
    }
    const hasValue = Boolean(this.value && selectedLabel);
    this.toggleAttribute('data-has-value', hasValue);
  }

  #selectOption(value: string, label: string, originEvent: Event): void {
    originEvent.preventDefault();
    originEvent.stopPropagation();

    const previousValue = this.value;
    this.value = value;

    if (previousValue !== value) {
      this.#dispatchValueChange(value, label, originEvent);
    }
  }

  #resolveOptionValue(element: HTMLElement): string {
    const explicitValue = element.getAttribute('value') ?? element.getAttribute('data-value') ?? element.dataset.value;

    if (explicitValue && explicitValue.trim().length > 0) {
      return explicitValue.trim();
    }

    const text = element.textContent?.trim();

    if (text && text.length > 0) {
      return text;
    }

    const fallback = nextOptionId();
    element.dataset.value = fallback;
    return fallback;
  }

  #resolveOptionLabel(element: HTMLElement, fallback: string): string {
    const explicitLabel = element.getAttribute('data-label') ?? element.getAttribute('aria-label');

    if (explicitLabel && explicitLabel.trim().length > 0) {
      return explicitLabel.trim();
    }

    const text = element.textContent?.trim();

    if (text && text.length > 0) {
      return text;
    }

    return fallback;
  }

  #dispatchValueChange(value: string, label: string, event: Event): void {
    dispatchControlEvent(this, 'change', { value, event });

    this.dispatchEvent(
      new CustomEvent('value-change', {
        detail: { value, label, event },
        bubbles: true,
        composed: true
      })
    );
  }
}
