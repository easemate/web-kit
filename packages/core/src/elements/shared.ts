/**
 * Standard control event detail interface for Leva/lil-gui style state aggregation.
 * All control components should dispatch events with this shape.
 */
export interface ControlEventDetail<TValue = unknown> {
  /** The control's name/identifier for state aggregation */
  name?: string;
  /** The current value of the control */
  value: TValue;
  /** The original DOM event that triggered this change */
  event: Event;
}

/** The standard event type for control value changes */
export const CONTROL_CHANGE_EVENT = 'control-change';

/**
 * Dispatch a control change event with standard shape.
 * Events bubble and are composed (cross shadow DOM boundaries).
 *
 * @param host - The element dispatching the event
 * @param type - Event type (prefer CONTROL_CHANGE_EVENT for standard controls)
 * @param detail - Event detail with value and optional name
 *
 * @example
 * ```ts
 * dispatchControlEvent(this, CONTROL_CHANGE_EVENT, {
 *   name: this.name,
 *   value: this.value,
 *   event: e
 * });
 * ```
 */
export const dispatchControlEvent = <THost extends HTMLElement, TValue>(
  host: THost,
  type: string,
  detail: ControlEventDetail<TValue>
): void => {
  host.dispatchEvent(
    new CustomEvent<ControlEventDetail<TValue>>(type, {
      detail,
      bubbles: true,
      composed: true
    })
  );
};

export const setBooleanAttribute = (element: Element | null | undefined, name: string, value: boolean): void => {
  if (!element) {
    return;
  }

  if (value) {
    element.setAttribute(name, '');
  } else {
    element.removeAttribute(name);
  }
};

export const coerceNumber = (value: string): number | null => {
  if (value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

type ControlElement = Element & {
  value?: unknown;
  checked?: unknown;
};

export const readControlValue = (element: ControlElement): string | null => {
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
