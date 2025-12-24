import { html, type TemplateResult } from 'lit-html';

import { CONTROL_CHANGE_EVENT, type ControlEventDetail, dispatchControlEvent } from '../shared';

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

/**
 * State aggregator component - collects and manages state from child controls.
 *
 * This component provides state management without any visual styling.
 * Use it standalone or wrap it with `<ease-panel>` for a styled container.
 *
 * @tag ease-state
 *
 * @slot - Default slot for controls
 *
 * @fires state-change - Fired when any control value changes
 *
 * @example
 * ```html
 * <!-- Standalone usage (no panel) -->
 * <ease-state>
 *   <ease-field label="Duration">
 *     <ease-slider name="duration" value="1" min="0" max="5"></ease-slider>
 *   </ease-field>
 *   <ease-field label="Loop">
 *     <ease-toggle name="loop"></ease-toggle>
 *   </ease-field>
 * </ease-state>
 *
 * <!-- With panel wrapper -->
 * <ease-panel>
 *   <span slot="headline">Animation Controls</span>
 *   <ease-state>
 *     <ease-field label="Duration">
 *       <ease-slider name="duration" value="1" min="0" max="5"></ease-slider>
 *     </ease-field>
 *   </ease-state>
 * </ease-panel>
 * ```
 */
@Component({
  tag: 'ease-state',
  shadowMode: 'open',
  styles: `
    :host {
      display: contents;
    }

    [part="container"] {
      display: grid;
      gap: var(--ease-state-gap, 12px);
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

  @Prop<string | null>({ reflect: true })
  accessor value!: string | null;

  @Query<HTMLSlotElement>('slot')
  accessor defaultSlot!: HTMLSlotElement | null;

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

  connectedCallback(): void {
    this.#attach();
    this.defaultSlot?.addEventListener('slotchange', this.#handleSlotChange);
  }

  disconnectedCallback(): void {
    this.#detach();
    this.defaultSlot?.removeEventListener('slotchange', this.#handleSlotChange);
  }

  render(): TemplateResult {
    return html`
      <div part="container">
        <slot></slot>
      </div>
    `;
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
    this.#detach();
    this.#attach();
  };

  #attach(): void {
    const slot = this.defaultSlot;
    if (!slot) {
      return;
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
}
