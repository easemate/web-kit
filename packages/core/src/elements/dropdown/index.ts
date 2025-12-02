import { Component } from '@/Component';
import { OutsideClick, requestOutsideClickUpdate } from '@/OutsideClick';
import { Prop } from '@/Prop';
import { Query } from '@/Query';

import type { Placement } from '../popover';

import { html, type TemplateResult } from 'lit-html';

import { dispatchControlEvent, setBooleanAttribute } from '../shared';

interface OptionRecord {
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
    return `ease-dropdown-option-${counter}`;
  };
})();

const nextPanelId = (() => {
  let counter = 0;
  return () => {
    counter += 1;
    return `ease-dropdown-content-${counter}`;
  };
})();

@Component({
  tag: 'ease-dropdown',
  styles: `
    :host {
      display: grid;
      width: 100%;
    }

    ease-popover {
      --ease-popover-content-min-width: var(--ease-dropdown-panel-min-width, anchor-size(width));
      --ease-popover-content-width: var(--ease-dropdown-panel-width, anchor-size(width));
      --ease-popover-content-max-width: var(--ease-dropdown-panel-max-width, anchor-size(width));
    }

    [part="trigger"] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 8px;
      padding: 8px 8px 8px 12px;
      border-radius: var(--radii-md);
      background-color: var(--color-gray-850);
      cursor: pointer;
      box-shadow: inset 0 1px .25px 0 var(--color-white-4), 0 1px 2.5px 0 var(--color-black-8);
      font-family: inherit;
      font-optical-sizing: auto;
      box-sizing: border-box;
      font-size: 13px;
      font-weight: 500;
      color: var(--color-foreground);
      min-width: 0;
      border: none;
      outline: none;
      margin: 0;
      line-height: 14px;
      transition: color 0.2s, background-color 0.2s;
      text-align: left;

      &:hover,
      &:focus-within {
        background-color: var(--color-gray-825);
      }

      [part="trigger-icon"] {
        display: block;
        margin: -1px 0 -1px -2px;
      }

      &[data-pill="true"] {
        border-radius: 999px;
      }

      &[data-block="small"] {
        padding: 4px 8px 4px 4px;
      }

      &[data-headless="true"] {
        background: transparent;
        box-shadow: none;
        padding: 0;
        border-radius: 0;
        gap: 4px;

        &:hover,
        &:focus-within {
          background: transparent;
        }
      }
    }

    input[part="trigger-input"] {
      background: transparent;
      border: none;
      outline: none;
      color: inherit;
      font: inherit;
      width: fit-content;
      min-width: 0;
      padding: 0;
      margin: 0;
      cursor: pointer;
      field-sizing: var(--ease-dropdown-field-sizing, fixed);
    }
    
    :host([open]) input[part="trigger-input"] {
      cursor: text;
    }

    [part="trigger"][data-placeholder="true"],
    [part="trigger"] [part="trigger-label"][data-placeholder="true"],
    input[part="trigger-input"]::placeholder {
      color: var(--color-gray-600);
    }

    [part="trigger"] [part="trigger-label"] {
      flex-grow: 1;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    [part="content"] {
      border-radius: var(--radii-md);
      background: var(--color-gray-875);
      border: none;
      outline: none;
      box-shadow: 0 5px 20px 0 var(--color-black-15), 0 1px 4px 0 var(--color-black-15), 0 0 0 1px var(--color-white-4) inset, 0 1px 0 0 var(--color-white-4) inset;
      background-clip: padding-box;
      border: 1px solid var(--color-gray-825);
      box-sizing: border-box;
      padding: 4px;
    }
    
    [part="content"] ::slotted(hr) {
      margin: 4px 0;
      height: 1px;
      background-color: var(--color-white-4);
      border: none;

      &:first-child,
      &:last-child {
        display: none;
      }
    }

    [part="content"] ::slotted(h4) {
      margin: 4px 0 8px 0 !important;
      font-size: 11px;
      line-height: 1;
      padding: 0 8px;
      font-family: inherit;
      font-weight: 450;
      color: var(--color-gray-700);
      display: block;

      &:first-child,
      &:last-child {
        display: none;
      }
    }

    [part="section"] {
      flex-grow: 1;
      min-width: max(100%, var(--ease-dropdown-min-width, 140px));
      display: grid;
      grid-gap: 3px;
      max-height: var(--ease-dropdown-max-height, auto);
      overflow-y: auto;
      overscroll-behavior: contain;
      container-type: inline-size;
      container-name: scroll-area;
      mask: linear-gradient(to bottom,
        #0000,
        #ffff var(--top-fade) calc(100% - var(--bottom-fade)),
        #0000
      );
      animation: scroll;
      animation-timeline: --scroll;
      scroll-timeline: --scroll y;
      scroll-snap-type: y mandatory;
      scrollbar-width: none;
      -ms-overflow-style: none;
      box-sizing: border-box;
    }

    [part="section"]::-webkit-scrollbar {
      width: 0;
      height: 0;
      display: none;
    }

    @property --top-fade {
      syntax: '<length>';
      inherits: false;
      initial-value: 0;
    }

    @property --bottom-fade {
      syntax: '<length>';
      inherits: false;
      initial-value: 0;
    }

    @keyframes scroll {
      0% {
        --bottom-fade: 16px;
        --top-fade: 0;
      }
      10%,
      100% {
        --top-fade: 16px;
      }
      90% {
        --bottom-fade: 16px;
      }
      100% {
        --bottom-fade: 0;
      }
    }

    ::slotted(button[slot="content"]) {
      appearance: none;
      font-family: inherit;
      font-optical-sizing: auto;
      font-size: 12px;
      font-weight: 400;
      color: var(--color-blue-100);
      min-width: 0;
      padding: 7px 8px;
      display: block;
      border-radius: 5px;
      background-color: var(--color-gray-875);
      border: none;
      outline: none;
      margin: 0;
      line-height: 14px;
      transition: color 0.2s, background-color 0.2s;
      cursor: pointer;
      width: 100%;
      text-align: left;
    }

    ::slotted(button[slot="content"]:hover),
    ::slotted(button[slot="content"]:focus-visible),
    ::slotted(button[slot="content"][data-active="true"]),
    ::slotted(button[slot="content"][aria-selected="true"]) {
      background-color: var(--color-gray-825);
      color: var(--color-white);
    }
  `
})
export class Dropdown extends HTMLElement {
  declare requestRender: () => void;

  @Prop<boolean>({
    type: Boolean,
    reflect: true,
    onChange(next, previous) {
      (this as Dropdown).handleOpenChange(next, previous);
    }
  })
  accessor open = false;

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor disabled = false;

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor pill = false;

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor headless = false;

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor searchable = false;

  @Prop<'small' | 'medium' | 'large'>({
    type: String,
    reflect: true,
    defaultValue: 'medium',
    onAttributeChange() {
      this.requestRender?.();
    }
  })
  accessor block: 'small' | 'medium' | 'large' = 'medium';

  @Prop<string>({
    reflect: true,
    defaultValue: 'auto',
    onChange(next) {
      (this as Dropdown).style.setProperty('--ease-dropdown-max-height', next ?? 'auto');
    }
  })
  accessor maxHeight: string = 'auto';

  @Prop<string | null>({ reflect: true, defaultValue: null })
  accessor name: string | null = null;

  @Prop<string | null>({ reflect: true, defaultValue: null })
  accessor value: string | null = null;

  @Prop<string | null>({
    reflect: true,
    attribute: 'placeholder',
    defaultValue: 'Select an option'
  })
  accessor placeholder: string | null = 'Select an option';

  @Prop<Placement>({ reflect: true, defaultValue: 'bottom-start' })
  accessor placement: Placement = 'bottom-start';

  @Query<HTMLElement>('[part="trigger"]')
  accessor trigger!: HTMLElement | null;

  @Query<HTMLInputElement>('input[part="trigger-input"]')
  accessor searchInput!: HTMLInputElement | null;

  @Query<HTMLElement>('[part="content"]')
  accessor panelContent!: HTMLElement | null;

  @Query<HTMLSlotElement>('slot[name="content"]')
  accessor contentSlot!: HTMLSlotElement | null;

  #options: OptionRecord[] = [];
  #selectedLabel: string | null = null;
  #currentSlot: HTMLSlotElement | null = null;
  #pendingFocus: 'first' | 'last' | null = null;
  #optionsInitialized = false;
  #lastToggleOrigin: Event | null = null;
  #handleSlotChange = (): void => {
    this.#syncOptions();
  };

  connectedCallback(): void {
    this.#ensureSlotListener();
  }

  disconnectedCallback(): void {
    this.#removeSlotListener();
    this.#teardownOptions();
    this.#lastToggleOrigin = null;
  }

  afterRender(): void {
    const trigger = this.trigger;

    if (trigger) {
      if (trigger instanceof HTMLButtonElement) {
        trigger.disabled = Boolean(this.disabled);
      }
      trigger.setAttribute('aria-expanded', this.open && !this.disabled ? 'true' : 'false');
      trigger.setAttribute('aria-haspopup', 'listbox');
    }

    if (this.searchInput) {
      this.searchInput.disabled = Boolean(this.disabled);
    }

    const panel = this.panelContent;
    const isInteractive = this.open && !this.disabled;

    if (panel) {
      if (!panel.id) {
        panel.id = nextPanelId();
      }
      panel.tabIndex = -1;
      panel.setAttribute('role', 'listbox');
      panel.setAttribute('aria-hidden', isInteractive ? 'false' : 'true');

      if (trigger) {
        trigger.setAttribute('aria-controls', panel.id);
      }
    } else if (trigger) {
      trigger.removeAttribute('aria-controls');
    }

    setBooleanAttribute(this, 'disabled', Boolean(this.disabled));

    this.#ensureSlotListener();

    if (!this.#optionsInitialized) {
      queueMicrotask(() => {
        this.#syncOptions();
      });
    } else {
      this.#updateOptionSelectionState();
    }

    if (this.disabled && this.open) {
      this.#lastToggleOrigin = null;
      this.open = false;
    }
  }

  render(): TemplateResult {
    const placeholderActive = this.#isPlaceholderActive();

    return html`
      <ease-popover
        .placement=${this.placement}
        .open=${this.open && !this.disabled}
      >
        ${this.searchable ? this.#renderSearchTrigger(placeholderActive) : this.#renderButtonTrigger(placeholderActive)}
        <div
          part="content"
          role="listbox"
          tabindex="-1"
          data-open=${this.open && !this.disabled ? 'true' : 'false'}
          ?hidden=${!this.open || this.disabled}
          @keydown=${this.#handlePanelKeydown}
        >
          <div part="section">
            <slot name="content"></slot>
          </div>
        </div>
      </ease-popover>
    `;
  }

  #renderButtonTrigger(placeholderActive: boolean) {
    return html`
        <button
          part="trigger"
          slot="trigger"
          type="button"
          data-placeholder=${placeholderActive ? 'true' : 'false'}
          data-headless=${this.headless}
          @keydown=${this.#handleTriggerKeydown}
          @click=${this.#handleTriggerClick}
          data-pill=${this.pill}
        >
          <slot name="trigger">
            <span part="trigger-label" data-placeholder=${placeholderActive ? 'true' : 'false'}>
              ${this.#getTriggerLabel()}
            </span>

            <ease-icon-chevron part="trigger-icon" state=${this.open ? 'up' : 'down'} />
          </slot>
        </button>
      `;
  }

  #renderSearchTrigger(placeholderActive: boolean) {
    return html`
        <div
          part="trigger"
          slot="trigger"
          data-placeholder=${placeholderActive ? 'true' : 'false'}
          data-headless=${this.headless}
          @click=${this.#handleSearchTriggerClick}
          data-pill=${this.pill}
        >
          <slot name="trigger">
             <input 
                part="trigger-input"
                type="text"
                .value=${this.open ? (this.searchInput?.value ?? '') : this.#getTriggerLabel()}
                placeholder=${this.placeholder ?? ''}
                ?readonly=${!this.open}
                @input=${this.#handleSearchInput}
                @keydown=${this.#handleTriggerKeydown}
             />
            <ease-icon-chevron part="trigger-icon" state=${this.open ? 'up' : 'down'} />
          </slot>
        </div>
      `;
  }

  #handleSearchTriggerClick = (event: Event): void => {
    if (this.disabled) {
      return;
    }

    if (!this.open) {
      this.toggle(true, event);

      if (this.searchInput) {
        this.searchInput.value = '';
        this.#filterOptions('');
        this.searchInput.focus();
      }
    } else {
      if (event.target !== this.searchInput) {
        this.toggle(false, event);
      }
    }
  };

  #handleSearchInput = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    this.#filterOptions(input.value);

    if (!this.open) {
      this.toggle(true, event);
    }
  };

  #filterOptions(query: string): void {
    const lowerQuery = query.toLowerCase();
    this.#options.forEach((option) => {
      const match = option.label.toLowerCase().includes(lowerQuery);
      if (match) {
        option.element.style.display = '';
      } else {
        option.element.style.display = 'none';
      }
    });
  }

  toggle(force?: boolean, originEvent?: Event): void {
    if (this.disabled) {
      return;
    }

    const current = this.open;
    const next = force ?? !current;

    if (current === next) {
      return;
    }

    this.#lastToggleOrigin = originEvent ?? null;
    this.open = next;

    if (!next) {
      this.#pendingFocus = null;
      // Reset filter when closing
      this.#filterOptions('');
      // Restore label in input if searchable
      if (this.searchable && this.searchInput) {
        this.searchInput.value = this.#getTriggerLabel();
        this.searchInput.blur(); // Blur to look like static text
      }
    }
  }

  handleOpenChange(next: boolean, previous: boolean): void {
    if (next === previous) {
      return;
    }

    if (!next) {
      this.#pendingFocus = null;
    }

    const origin = this.#lastToggleOrigin ?? new Event(next ? 'open' : 'close');
    this.#lastToggleOrigin = null;

    if (next) {
      if (this.searchable && this.searchInput) {
        this.searchInput.focus();
      } else {
        queueMicrotask(() => this.#focusActiveOption());
      }
    }

    dispatchControlEvent(this, 'toggle', { value: next, event: origin });
    requestOutsideClickUpdate(this);
  }

  @OutsideClick<Dropdown>({
    content: (host) => host.panelContent,
    triggers: (host) => [host.trigger, host.panelContent],
    disabled: (host) => host.disabled || !host.open
  })
  handleOutsideDismiss(event: Event): void {
    if (!this.open) {
      return;
    }

    this.toggle(false, event);
  }

  #handleTriggerKeydown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.#pendingFocus = 'first';
        this.toggle(true, event);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.#pendingFocus = 'last';
        this.toggle(true, event);
        break;
      case 'Enter':
        if (!this.searchable) {
          event.preventDefault();
          this.toggle(true, event);
        }
        break;
      case ' ': // Space
        if (!this.searchable) {
          event.preventDefault();
          this.toggle(true, event);
        }
        break;
      case 'Escape':
        if (this.open) {
          event.preventDefault();
          this.toggle(false, event);
        }
        break;
      default:
        break;
    }
  };

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

  #handleTriggerClick = (event: Event): void => {
    this.toggle(!this.open, event);
  };

  #syncOptions(): void {
    const assigned = this.contentSlot?.assignedElements({ flatten: true }) ?? [];
    const elements = assigned.filter((node): node is HTMLElement => node instanceof HTMLElement);

    this.#removeOptionListeners(this.#options);

    const options: OptionRecord[] = [];

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
      } as OptionRecord['handlers'];

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

    this.#updateOptionSelectionState();
  }

  #teardownOptions(): void {
    this.#removeOptionListeners(this.#options);
    this.#options = [];
    this.#optionsInitialized = false;
    this.#selectedLabel = null;
  }

  #removeOptionListeners(options: OptionRecord[]): void {
    options.forEach((option) => {
      option.element.removeEventListener('click', option.handlers.click);
      option.element.removeEventListener('keydown', option.handlers.keydown);
      option.element.dataset.active = 'false';
      option.element.setAttribute('aria-selected', 'false');
      option.element.tabIndex = -1;
    });
  }

  #updateOptionSelectionState(): void {
    if (!this.#optionsInitialized) {
      this.toggleAttribute('data-has-value', false);
      return;
    }

    let selectedLabel: string | null = null;
    const previousLabel = this.#selectedLabel;

    const options = this.#options;

    options.forEach((option) => {
      const isSelected = this.value !== null && option.value === this.value;
      option.element.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      option.element.dataset.active = isSelected ? 'true' : 'false';
      option.element.tabIndex = isSelected ? 0 : -1;

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

    this.#selectedLabel = selectedLabel;
    const hasValue = Boolean(this.value && this.#selectedLabel);
    this.toggleAttribute('data-has-value', hasValue);

    if (previousLabel !== this.#selectedLabel && typeof this.requestRender === 'function') {
      this.requestRender();
    }
  }

  #isPlaceholderActive(): boolean {
    return !this.value || !this.#selectedLabel;
  }

  #getTriggerLabel(): string {
    if (this.#selectedLabel) {
      return this.#selectedLabel;
    }

    if (typeof this.placeholder === 'string' && this.placeholder.trim().length > 0) {
      return this.placeholder.trim();
    }

    return 'Select';
  }

  #focusActiveOption(): void {
    if (!this.open) {
      return;
    }

    const options = this.#options.filter((o) => o.element.style.display !== 'none');

    if (options.length === 0) {
      this.panelContent?.focus();
      return;
    }

    let target: OptionRecord | undefined = options[0];

    if (this.#pendingFocus === 'first') {
      target = options[0];
    } else if (this.#pendingFocus === 'last') {
      target = options[options.length - 1];
    } else if (this.#pendingFocus === null && this.value !== null) {
      const match = this.#findOptionByValue(this.value);
      if (match && match.element.style.display !== 'none') {
        target = match;
      }
    }

    if (target) {
      this.#focusOption(target);
    }
    this.#pendingFocus = null;
  }

  #focusOption(option: OptionRecord): void {
    this.#options.forEach((entry) => {
      entry.element.tabIndex = entry === option ? 0 : -1;
    });

    option.element.focus({ preventScroll: true });
  }

  #focusOptionByIndex(index: number): void {
    const options = this.#options.filter((o) => o.element.style.display !== 'none');

    if (options.length === 0) {
      this.panelContent?.focus();
      return;
    }

    const normalized = Math.max(0, Math.min(index, options.length - 1));
    const option = options[normalized];
    if (option) {
      this.#focusOption(option);
    }
  }

  #findOptionByValue(value: string | null): OptionRecord | undefined {
    if (value === null) {
      return undefined;
    }

    return this.#options.find((option) => option.value === value);
  }

  #moveFocus(step: number): void {
    const options = this.#options.filter((o) => o.element.style.display !== 'none');

    if (options.length === 0) {
      this.panelContent?.focus();
      return;
    }

    const activeElement = document.activeElement as HTMLElement | null;
    const currentIndex = options.findIndex((option) => option.element === activeElement);

    if (currentIndex === -1) {
      this.#focusOptionByIndex(step > 0 ? 0 : options.length - 1);
      return;
    }

    const nextIndex = (currentIndex + step + options.length) % options.length;
    this.#focusOptionByIndex(nextIndex);
  }

  #handlePanelKeydown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.#moveFocus(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.#moveFocus(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.#focusOptionByIndex(0);
        break;
      case 'End':
        event.preventDefault();
        this.#focusOptionByIndex(this.#options.length - 1);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        this.#activateFocusedOption(event);
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.toggle(false, event);
        this.trigger?.focus();
        break;
      default:
        break;
    }
  };

  #activateFocusedOption(event: Event): void {
    const active = this.#options.find((option) => option.element === document.activeElement);

    if (active) {
      this.#selectOption(active.value, active.label, event);
    }
  }

  #selectOption(value: string, label: string, originEvent: Event): void {
    if (this.disabled) {
      return;
    }

    originEvent.preventDefault();
    originEvent.stopPropagation();

    const previousValue = this.value;
    this.value = value;
    this.#selectedLabel = label;
    this.#updateOptionSelectionState();

    this.toggle(false, originEvent);

    if (previousValue !== value) {
      this.#dispatchValueChange(value, label, originEvent);
    }

    if (!this.searchable) {
      queueMicrotask(() => this.trigger?.focus());
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
