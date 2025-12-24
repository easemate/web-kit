/**
 * React integration for @easemate/web-kit
 *
 * Provides React hooks and utilities for seamless integration with
 * React and Next.js applications.
 *
 * @module @easemate/web-kit/react
 */

export type {
  EaseControlElement,
  EasePanelRef,
  EaseStateRef,
  StateChangeEventDetail,
  TabChangeEventDetail
} from './types';

export { type ControlChangeEvent, createEventHandler, type StateChangeEvent, type TabChangeEvent } from './events';
export {
  createWebKitProvider,
  type ReactHooksForProvider,
  type WebKitContextValue,
  type WebKitProviderProps
} from './provider';
export { type ReactHooksLike, type UseEaseStateOptions, type UseEaseStateReturn, useEaseState } from './use-ease-state';
export { type UseWebKitOptions, type UseWebKitReturn, useWebKit } from './use-web-kit';
