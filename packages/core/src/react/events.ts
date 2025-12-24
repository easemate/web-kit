/**
 * React event handling utilities for @easemate/web-kit
 */

import type { TabChangeEventDetail } from '~/elements/panel';
import type { ControlEventDetail } from '~/elements/shared';
import type { StateChangeEventDetail } from '~/elements/state';

/**
 * Control change event type for React
 */
export interface ControlChangeEvent<T = unknown> extends CustomEvent<ControlEventDetail<T>> {
  detail: ControlEventDetail<T>;
}

/**
 * State change event type for React
 */
export interface StateChangeEvent extends CustomEvent<StateChangeEventDetail> {
  detail: StateChangeEventDetail;
}

/**
 * Tab change event type for React
 */
export interface TabChangeEvent extends CustomEvent<TabChangeEventDetail> {
  detail: TabChangeEventDetail;
}

/**
 * Creates a type-safe event handler for control-change events.
 *
 * @example
 * ```tsx
 * <ease-slider
 *   name="opacity"
 *   value={0.5}
 *   onControlChange={createEventHandler<number>((value, name) => {
 *     console.log(`${name} changed to ${value}`);
 *   })}
 * />
 * ```
 */
export function createEventHandler<T = unknown>(
  callback: (value: T, name: string | undefined, event: Event) => void
): (e: CustomEvent<ControlEventDetail<T>>) => void {
  return (e: CustomEvent<ControlEventDetail<T>>) => {
    callback(e.detail.value, e.detail.name, e.detail.event);
  };
}
