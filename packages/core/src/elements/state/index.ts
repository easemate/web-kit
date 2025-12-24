import { html, nothing, type TemplateResult } from 'lit-html';

import { CONTROL_CHANGE_EVENT, type ControlEventDetail, dispatchControlEvent, setBooleanAttribute } from '../shared';

import { Component } from '~/decorators/Component';
import { Listen } from '~/decorators/Listen';
import { Prop } from '~/decorators/Prop';
import { Query } from '~/decorators/Query';

type ControlElement = Element & {
  value?: unknown;
  checked?: unknown;
  name?: string;
};

type StateChangeCallback<T = unknown> = (value: T, name: string) => void;
type StateSubscription = { unsubscribe: () => void };

/**
 * Event detail for state change events
 */
export interface StateChangeEventDetail {
  /** The name of the control that changed */
  name: string;
  /** The new value */
  value: unknown;
  /** The complete state object */
  state: Record<string, unknown>;
  /** The original event */
  event: Event;
}

/**
 * Event detail for tab change events
 */
export interface TabChangeEventDetail {
  /** The index of the active tab */
  index: number;
  /** The tab id */
  id: string;
  /** The original event */
  event: Event;
}

const readControlValue = (element: ControlElement): unknown => {
  if (typeof element.value === 'string' || typeof element.value === 'number') {
    return element.value;
  }

  if (typeof element.checked === 'boolean') {
    return element.checked;
  }

  if ('getAttribute' in element) {
    const attr = (element as Element).getAttribute('value');
    if (attr !== null) {
      return attr;
    }
  }

  return element.textContent?.trim() ?? null;
};

const getControlName = (element: ControlElement): string | null => {
  if (typeof element.name === 'string' && element.name) {
    return element.name;
  }
  return element.getAttribute?.('name') ?? null;
};

@Component({
  tag: 'ease-state',
  shadowMode: 'open',
  styles: `
    :host {
      --ease-state-transition-duration: 120ms;
      --ease-state-transition-easing: cubic-bezier(.25, 0, .5, 1);
    }

    [part="section"] {
      display: block;
      width: 100%;
      max-width: var(--ease-panel-max-width, 332px);
      border-radius: var(--ease-panel-radius, 12px);
      border: 1px solid var(--ease-panel-border-color, var(--color-white-6));
      background-clip: padding-box;
      background: var(--ease-panel-background, var(--color-gray-1000));
      box-shadow: var(--ease-panel-shadow, 0 0 40px 0 var(--color-white-2) inset);
      box-sizing: border-box;
      padding: var(--ease-panel-padding, 12px);
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
      font-size: var(--ease-panel-title-font-size, 14px);
      font-weight: var(--ease-panel-title-font-weight, 500);
      line-height: var(--ease-panel-title-line-height, 24px);
      font-family: var(--ease-font-family, "Instrument Sans", sans-serif);
      color: var(--ease-panel-title-color, var(--color-blue-100));
      margin: 0 0 0 4px;
      flex-grow: 1;
      text-ellipsis: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    [part="headline"]:has(+ [part="tabs"]:not(:empty)) {
      display: none;
    }

    [part="tabs"] {
      display: flex;
      align-items: center;
      gap: 2px;
      flex-grow: 1;
      margin: 0 0 0 4px;
    }

    [part="tabs"]:empty {
      display: none;
    }

    [part="tab"] {
      appearance: none;
      font-size: var(--ease-panel-tab-font-size, 13px);
      font-weight: var(--ease-panel-tab-font-weight, 500);
      line-height: var(--ease-panel-tab-line-height, 24px);
      font-family: var(--ease-font-family, "Instrument Sans", sans-serif);
      color: var(--ease-panel-tab-color, var(--color-gray-600));
      background: transparent;
      border: none;
      padding: 4px 8px;
      margin: 0;
      cursor: pointer;
      border-radius: var(--ease-panel-tab-radius, 6px);
      transition: color 0.2s, background-color 0.2s;
    }

    [part="tab"]:hover {
      color: var(--ease-panel-tab-color-hover, var(--color-blue-100));
    }

    [part="tab"][aria-selected="true"] {
      color: var(--ease-panel-tab-color-active, var(--color-blue-100));
      background: var(--ease-panel-tab-background-active, var(--color-white-4));
    }

    [part="actions"] {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: auto;
    }

    slot[name="actions"]::slotted(button),
    slot[name="actions"]::slotted(a) {
      --ease-icon-size: var(--ease-panel-action-icon-size, 16px);

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
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    slot[name="actions"]::slotted(button:hover),
    slot[name="actions"]::slotted(button:focus-visible),
    slot[name="actions"]::slotted(a:hover),
    slot[name="actions"]::slotted(a:focus-visible) {
      color: var(--color-blue-100);
    }

    slot[name="actions"]::slotted(ease-dropdown) {
      flex: 0 0 auto;
      width: auto;

      --ease-icon-size: var(--ease-panel-action-icon-size, 16px);
      --ease-dropdown-trigger-padding: 4px;
      --ease-dropdown-radius: 6px;
      --ease-dropdown-background: transparent;
      --ease-dropdown-background-hover: transparent;
      --ease-dropdown-shadow: none;
      --ease-dropdown-color: var(--color-gray-600);
      --ease-popover-placement: bottom-end;
    }

    slot[name="actions"]::slotted(ease-dropdown:hover),
    slot[name="actions"]::slotted(ease-dropdown:focus-within) {
      --ease-dropdown-color: var(--color-blue-100);
    }

    [part="content"] {
      display: block;
      width: 100%;
      box-sizing: border-box;
      margin: auto;
      overflow: hidden;
    }

    [part="content"][data-animating="true"] {
      transition: height var(--ease-state-transition-duration) var(--ease-state-transition-easing);
    }

    [part="form"] {
      width: 100%;
      position: relative;
    }

    [part="tab-panel"] {
      width: 100%;
      pointer-events: none;
      display: none;
    }

    [part="tab-panel"][data-state="active"] {
      display: block;
      pointer-events: auto;
    }

    [part="tab-panel"][data-state="hidden"] {
      display: none;
      pointer-events: none;
    }

    [part="footer"] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--ease-panel-footer-padding, 12px);
      box-sizing: border-box;
      border-top: 1px solid var(--color-white-4);

      &:not(:has([data-has-content="true"])) {
        display: none;
      }
    }

    ::slotted([slot="entry"]),
    ::slotted([slot^="tab-"]) {
      display: grid;
      gap: 12px;
      box-sizing: border-box;
      width: 100%;
    }
  `
})
export class State extends HTMLElement {
  declare requestRender: () => void;

  #controls: Map<string, ControlElement> = new Map();
  #state: Record<string, unknown> = {};
  #initialState: Record<string, unknown> = {};
  #subscribers: Map<string | '*', Set<StateChangeCallback>> = new Map();
  #tabs: { id: string; label: string }[] = [];
  #isAnimating = false;

  @Prop<string | null>({ reflect: true })
  accessor value!: string | null;

  @Prop<number>({
    type: Number,
    reflect: true,
    attribute: 'active-tab',
    defaultValue: 0,
    onChange(next, previous) {
      const self = this as State;
      if (next !== previous && previous !== undefined) {
        self.handleActiveTabChange(previous, next);
      }
    }
  })
  accessor activeTab: number = 0;

  /** @internal */
  handleActiveTabChange(previous: number, next: number): void {
    this.performTabAnimation(previous, next);
  }

  @Query<HTMLSlotElement>('slot[name="entry"]')
  accessor entrySlot!: HTMLSlotElement | null;

  @Query<HTMLOutputElement>('output')
  accessor outputElement!: HTMLOutputElement | null;

  @Query<HTMLElement>('[part="content"]')
  accessor contentElement!: HTMLElement | null;

  @Query<HTMLElement>('[part="form"]')
  accessor formElement!: HTMLElement | null;

  /**
   * Get the current state object with all control values
   */
  get state(): Readonly<Record<string, unknown>> {
    return { ...this.#state };
  }

  /**
   * Get a specific control value by name
   * @param name - The control name
   * @returns The control value or undefined
   */
  get(name: string): unknown {
    return this.#state[name];
  }

  /**
   * Set a control value programmatically
   * @param name - The control name
   * @param value - The new value
   */
  set(name: string, value: unknown): void {
    const control = this.#controls.get(name);
    if (control) {
      // Update the control element
      if ('value' in control) {
        (control as { value: unknown }).value = value;
      } else if (typeof value === 'boolean' && 'checked' in control) {
        (control as { checked: boolean }).checked = value;
      }
    }

    this.#updateState(name, value, new Event('programmatic'));
  }

  /**
   * Subscribe to state changes
   * @param nameOrCallback - Control name to watch, '*' for all, or callback for all changes
   * @param callback - Callback when using name filter
   * @returns Subscription with unsubscribe method
   */
  subscribe(callback: StateChangeCallback): StateSubscription;
  subscribe(name: string, callback: StateChangeCallback): StateSubscription;
  subscribe(nameOrCallback: string | StateChangeCallback, callback?: StateChangeCallback): StateSubscription {
    let name: string;
    let cb: StateChangeCallback;

    if (typeof nameOrCallback === 'function') {
      name = '*';
      cb = nameOrCallback;
    } else {
      name = nameOrCallback;
      if (!callback) {
        throw new Error('[ease-state] subscribe(name, callback) requires a callback');
      }
      cb = callback;
    }

    if (!this.#subscribers.has(name)) {
      this.#subscribers.set(name, new Set());
    }
    this.#subscribers.get(name)?.add(cb);

    return {
      unsubscribe: () => {
        this.#subscribers.get(name)?.delete(cb);
      }
    };
  }

  /**
   * Reset all controls to their initial values
   */
  reset(): void {
    for (const [name, value] of Object.entries(this.#initialState)) {
      this.set(name, value);
    }
  }

  /**
   * Switch to a specific tab by index
   * @param index - The tab index (0-based)
   */
  setTab(index: number): void {
    if (index >= 0 && index < this.#tabs.length && index !== this.activeTab) {
      this.activeTab = index;
    }
  }

  connectedCallback(): void {
    this.#syncTabs();
    this.#attach();
    this.entrySlot?.addEventListener('slotchange', this.#handleSlotChange);
  }

  disconnectedCallback(): void {
    this.#detach();
    this.entrySlot?.removeEventListener('slotchange', this.#handleSlotChange);
  }

  afterRender(): void {
    if (this.outputElement) {
      this.outputElement.value = this.value ?? '';
    }
    this.#syncTabs();
  }

  render(): TemplateResult {
    const hasTabs = this.#tabs.length > 0;

    return html`
      <section part="section">
        <div part="header">
          <h3 part="headline"><slot name="headline"></slot></h3>
          ${this.#renderTabs()}
          <div part="actions">
            <slot name="actions"></slot>
          </div>
        </div>
        <div part="content">
          <div part="form">
            ${hasTabs ? this.#renderTabPanels() : html`<slot name="entry"></slot>`}
          </div>
        </div>
        <div part="footer">
          <slot name="footer"></slot>
        </div>
      </section>
    `;
  }

  #renderTabs(): TemplateResult | typeof nothing {
    if (this.#tabs.length === 0) {
      return nothing;
    }

    return html`
      <div part="tabs" role="tablist">
        ${this.#tabs.map(
          (tab, index) => html`
            <button
              part="tab"
              role="tab"
              aria-selected=${index === this.activeTab ? 'true' : 'false'}
              aria-controls=${`panel-${tab.id}`}
              tabindex=${index === this.activeTab ? 0 : -1}
              @click=${(e: Event) => this.#handleTabClick(index, tab.id, e)}
              @keydown=${(e: KeyboardEvent) => this.#handleTabKeydown(e, index)}
            >
              ${tab.label}
            </button>
          `
        )}
      </div>
    `;
  }

  #renderTabPanels(): TemplateResult {
    return html`
      ${this.#tabs.map(
        (tab, index) => html`
          <div
            part="tab-panel"
            role="tabpanel"
            id=${`panel-${tab.id}`}
            aria-labelledby=${`tab-${tab.id}`}
            data-state=${index === this.activeTab ? 'active' : 'hidden'}
            data-index=${index}
          >
            <slot name=${`tab-${tab.id}`}></slot>
          </div>
        `
      )}
    `;
  }

  #handleTabClick(index: number, id: string, event: Event): void {
    if (index === this.activeTab) {
      return;
    }

    this.activeTab = index;

    dispatchControlEvent(this, 'tab-change', {
      index,
      id,
      event
    } as TabChangeEventDetail & { value: unknown });
  }

  #handleTabKeydown(event: KeyboardEvent, currentIndex: number): void {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : this.#tabs.length - 1;
        break;
      case 'ArrowRight':
        event.preventDefault();
        newIndex = currentIndex < this.#tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = this.#tabs.length - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      this.activeTab = newIndex;

      // Focus the new tab button
      queueMicrotask(() => {
        const tabButtons = this.shadowRoot?.querySelectorAll('[part="tab"]');
        const newTabButton = tabButtons?.[newIndex] as HTMLButtonElement | undefined;
        newTabButton?.focus();
      });
    }
  }

  async performTabAnimation(fromIndex: number, toIndex: number): Promise<void> {
    if (this.#isAnimating) {
      return;
    }

    this.#isAnimating = true;

    const duration = 120;
    const easing = 'cubic-bezier(.25, 0, .5, 1)';

    const content = this.contentElement;

    if (!content) {
      this.#isAnimating = false;
      this.requestRender();
      return;
    }

    // Get the panels by data-index attribute for reliability
    const fromPanel = this.shadowRoot?.querySelector(
      `[part="tab-panel"][data-index="${fromIndex}"]`
    ) as HTMLElement | null;
    const toPanel = this.shadowRoot?.querySelector(`[part="tab-panel"][data-index="${toIndex}"]`) as HTMLElement | null;

    if (!fromPanel || !toPanel) {
      this.#isAnimating = false;
      this.requestRender();
      return;
    }

    // Lock the current height
    const startHeight = content.getBoundingClientRect().height;
    content.style.height = `${startHeight}px`;

    // FIX: Ensure the new panel is hidden immediately.
    // Changing activeTab triggers a render which sets data-state="active" (display: block).
    // We must override this with inline styles to prevent the content from showing during the fade-out.
    toPanel.style.display = 'none';
    toPanel.style.opacity = '0';

    // Fade out old content via WAAPI (avoids any "one-frame" flashes)
    try {
      const fadeOut = fromPanel.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing, fill: 'forwards' });
      await fadeOut.finished;
      fadeOut.cancel();
    } catch {
      // ignore
    }

    fromPanel.setAttribute('data-state', 'hidden');

    // Prepare and measure new panel while completely invisible
    const previousToState = toPanel.getAttribute('data-state');

    // Reset display to block (overriding our 'none' above) but keep invisible for measuring
    toPanel.style.display = 'block';
    toPanel.style.visibility = 'hidden';
    toPanel.style.opacity = '0';

    // Force layout, then measure
    void toPanel.offsetHeight;
    const endHeight = toPanel.getBoundingClientRect().height;

    // Animate height
    if (startHeight !== endHeight) {
      content.setAttribute('data-animating', 'true');
      void content.offsetHeight;
      content.style.height = `${endHeight}px`;
      await this.#wait(duration);
    }

    // Show panel but keep opacity at 0, then fade in
    toPanel.style.visibility = 'visible';
    toPanel.style.opacity = '0';

    // Ensure the 0-opacity state is committed
    void toPanel.offsetHeight;

    try {
      const fadeIn = toPanel.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing, fill: 'forwards' });
      await fadeIn.finished;
      fadeIn.cancel();
    } catch {
      // ignore
    }

    // Finalize new tab state and cleanup
    toPanel.style.display = '';
    toPanel.style.visibility = '';
    toPanel.style.opacity = '';

    // Restore state attribute (we only want one active)
    if (previousToState !== 'active') {
      toPanel.setAttribute('data-state', 'active');
    }

    content.style.height = '';
    content.removeAttribute('data-animating');
    this.#isAnimating = false;

    this.#detach();
    this.#attach();
  }

  #wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  #syncTabs(): void {
    const tabs: { id: string; label: string }[] = [];

    for (const child of Array.from(this.children)) {
      const slot = child.getAttribute('slot');
      if (slot?.startsWith('tab-')) {
        const id = slot.replace('tab-', '');
        const label = child.getAttribute('data-tab-label') || id;
        tabs.push({ id, label });
      }
    }

    this.#tabs = tabs.slice(0, 3);

    if (this.activeTab >= this.#tabs.length && this.#tabs.length > 0) {
      this.activeTab = 0;
    }
  }

  @Listen<State, CustomEvent<ControlEventDetail>>('input', { target: (host) => host })
  handleInternalInput(event: CustomEvent<ControlEventDetail>): void {
    this.#handleControlEvent(event);
  }

  @Listen<State, CustomEvent<ControlEventDetail>>('change', { target: (host) => host })
  handleInternalChange(event: CustomEvent<ControlEventDetail>): void {
    this.#handleControlEvent(event);
  }

  @Listen<State, CustomEvent<ControlEventDetail>>(CONTROL_CHANGE_EVENT, { target: (host) => host })
  handleControlChange(event: CustomEvent<ControlEventDetail>): void {
    this.#handleControlEvent(event);
  }

  @Listen('slotchange', { selector: 'slot[name="footer"]' })
  onFooterSlotChange(): void {
    this.updateFooterAttribute();
  }

  #handleControlEvent(event: Event | CustomEvent<ControlEventDetail>): void {
    if ('detail' in event && event.detail?.name) {
      this.#updateState(event.detail.name, event.detail.value, event);
      return;
    }

    if (!(event.target instanceof Element)) {
      return;
    }

    const control = event.target as ControlElement;
    const name = getControlName(control);

    if (!name || !this.#controls.has(name)) {
      return;
    }

    const value = readControlValue(control);
    this.#updateState(name, value, event);
  }

  #handleSlotChange = (): void => {
    this.#syncTabs();
    this.#detach();
    this.#attach();
  };

  #attach(): void {
    const slots: HTMLSlotElement[] = [];

    if (this.#tabs.length === 0) {
      if (this.entrySlot) {
        slots.push(this.entrySlot);
      }
    } else {
      const activeTab = this.#tabs[this.activeTab];
      if (activeTab) {
        const tabSlot = this.shadowRoot?.querySelector(`slot[name="tab-${activeTab.id}"]`) as HTMLSlotElement | null;
        if (tabSlot) {
          slots.push(tabSlot);
        }
      }
    }

    const findControls = (el: Element): ControlElement[] => {
      const controls: ControlElement[] = [];
      const name = getControlName(el as ControlElement);

      if (name) {
        controls.push(el as ControlElement);
      }

      if (el.shadowRoot) {
        for (const child of el.shadowRoot.querySelectorAll('[name]')) {
          const childName = getControlName(child as ControlElement);
          if (childName) {
            controls.push(child as ControlElement);
          }
        }
      }

      for (const child of el.querySelectorAll('[name]')) {
        const childName = getControlName(child as ControlElement);
        if (childName) {
          controls.push(child as ControlElement);
        }
      }

      return controls;
    };

    this.#controls.clear();
    this.#state = {};

    for (const slot of slots) {
      const elements = slot.assignedElements({ flatten: true });

      for (const element of elements) {
        const controls = findControls(element);
        for (const control of controls) {
          const name = getControlName(control);
          if (name) {
            this.#controls.set(name, control);
            const value = readControlValue(control);
            this.#state[name] = value;
            this.#initialState[name] = value;
          }
        }
      }
    }

    const first = this.#controls.values().next().value;
    if (first) {
      const name = getControlName(first);
      this.value = name && this.#state[name] != null ? String(this.#state[name]) : null;
    }
  }

  #detach(): void {
    this.#controls.clear();
  }

  #updateState(name: string, value: unknown, event: Event): void {
    const prevValue = this.#state[name];
    if (prevValue === value) {
      return;
    }

    this.#state[name] = value;

    this.value = String(value);

    for (const cb of this.#subscribers.get(name) ?? []) {
      cb(value, name);
    }
    for (const cb of this.#subscribers.get('*') ?? []) {
      cb(value, name);
    }

    dispatchControlEvent(this, 'state-change', {
      name,
      value,
      state: this.state,
      event
    } as StateChangeEventDetail & { event: Event });
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
