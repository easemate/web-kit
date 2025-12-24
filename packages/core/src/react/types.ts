/**
 * React type definitions for @easemate/web-kit
 *
 * These types are provided for consumers using React/Next.js with this library.
 * React is NOT a dependency of this package - these are interface definitions only.
 */

import type { TabChangeEventDetail } from '~/elements/panel';
import type { StateChangeEventDetail } from '~/elements/state';

/**
 * Ref type for the ease-state web component
 */
export interface EaseStateRef extends HTMLElement {
  /** Get the current state object */
  readonly state: Record<string, unknown>;
  /** Get a specific control value */
  get(name: string): unknown;
  /** Set a specific control value */
  set(name: string, value: unknown): void;
  /** Subscribe to state changes */
  subscribe(callback: (value: unknown, name: string) => void): { unsubscribe: () => void };
  subscribe(name: string, callback: (value: unknown, name: string) => void): { unsubscribe: () => void };
  /** Reset all controls to initial values */
  reset(): void;
}

/**
 * Ref type for the ease-panel web component
 */
export interface EasePanelRef extends HTMLElement {
  /** Current active tab index */
  activeTab: number;
  /** Get the tab configuration */
  readonly tabs: ReadonlyArray<{ id: string; label: string }>;
  /** Switch to a specific tab */
  setTab(index: number): void;
}

/**
 * Event detail types re-exported for React usage
 */
export type { StateChangeEventDetail, TabChangeEventDetail };

/**
 * Generic control element interface
 */
export interface EaseControlElement extends HTMLElement {
  name?: string;
  value?: unknown;
  checked?: boolean;
  disabled?: boolean;
}
