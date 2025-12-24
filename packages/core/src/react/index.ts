/**
 * React integration for @easemate/web-kit
 *
 * Importing this module automatically adds JSX types for all ease-* custom elements.
 *
 * @example
 * ```tsx
 * import '@easemate/web-kit/react';
 *
 * // Now ease-* elements are typed in JSX
 * <ease-panel>
 *   <ease-slider name="volume" value={50} />
 * </ease-panel>
 * ```
 *
 * @module @easemate/web-kit/react
 */

// Types
export type { EaseControlElement, EasePanelRef, EaseStateRef } from './types';

// Event utilities
export { type ControlChangeEvent, createEventHandler, type StateChangeEvent, type TabChangeEvent } from './events';
// JSX type augmentation - automatically applies when this module is imported
// This must be a side-effect import (not `import type`) to trigger the global augmentation
export * from './jsx';
// Provider
export {
  createWebKitProvider,
  type ReactHooksForProvider,
  type WebKitContextValue,
  type WebKitProviderProps
} from './provider';
// Hooks
export { type ReactHooksLike, type UseEaseStateOptions, type UseEaseStateReturn, useEaseState } from './use-ease-state';
export { type UseWebKitOptions, type UseWebKitReturn, useWebKit } from './use-web-kit';
