export interface ControlEventDetail<TValue> {
  value: TValue;
  event: Event;
}

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
