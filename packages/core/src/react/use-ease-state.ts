/**
 * React hook for working with ease-state component
 */

import type { EasePanelRef, EaseStateRef, StateChangeEventDetail, TabChangeEventDetail } from './types';

/**
 * Options for useEaseState hook
 */
export interface UseEaseStateOptions {
  /**
   * Initial state values to set when the component mounts
   */
  initialState?: Record<string, unknown>;

  /**
   * Callback fired when any control value changes
   */
  onChange?: (detail: StateChangeEventDetail) => void;

  /**
   * Callback fired when the active tab changes (requires ease-panel)
   */
  onTabChange?: (detail: TabChangeEventDetail) => void;
}

// biome-ignore lint/suspicious/noExplicitAny: Required for React hook compatibility
type AnyFunction = (...args: any[]) => any;

/**
 * React hooks interface - compatible with React's hook signatures
 */
export interface ReactHooksLike {
  useState: <S>(initial: S) => [S, (value: S | ((prev: S) => S)) => void];
  useCallback: <F extends AnyFunction>(callback: F, deps: unknown[]) => F;
  useRef: <R>(initial: R) => { current: R };
}

/**
 * Return type for useEaseState hook
 */
export interface UseEaseStateReturn<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Ref callback to attach to the ease-state element */
  stateRef: (element: EaseStateRef | null) => void;
  /** Ref callback to attach to the ease-panel element (optional) */
  panelRef: (element: EasePanelRef | null) => void;
  /** Current state values (reactive) */
  state: T;
  /** Get a specific control value */
  get: <K extends keyof T>(name: K) => T[K] | undefined;
  /** Set a specific control value */
  set: <K extends keyof T>(name: K, value: T[K]) => void;
  /** Reset all controls to initial values */
  reset: () => void;
  /** Switch to a specific tab (requires ease-panel) */
  setTab: (index: number) => void;
  /** Current active tab index (requires ease-panel) */
  activeTab: number;
}

/**
 * React hook for working with ease-state components.
 *
 * Provides a reactive state object and methods for interacting
 * with the ease-state web component.
 *
 * @example
 * ```tsx
 * import { useState, useCallback, useRef } from 'react';
 * import { useEaseState } from '@easemate/web-kit/react';
 *
 * function AnimationControls() {
 *   const {
 *     stateRef,
 *     panelRef,
 *     state,
 *     set,
 *     reset
 *   } = useEaseState<{ duration: number; easing: string; loop: boolean }>(
 *     {
 *       onChange: ({ name, value }) => {
 *         console.log(`${name} changed to ${value}`);
 *       }
 *     },
 *     { useState, useCallback, useRef }
 *   );
 *
 *   return (
 *     <ease-panel ref={panelRef}>
 *       <span slot="headline">Animation</span>
 *       <ease-state ref={stateRef}>
 *         <ease-field label="Duration">
 *           <ease-slider name="duration" value="1" min="0" max="5" />
 *         </ease-field>
 *       </ease-state>
 *     </ease-panel>
 *   );
 * }
 * ```
 */
export function useEaseState<T extends Record<string, unknown> = Record<string, unknown>>(
  options: UseEaseStateOptions,
  hooks: ReactHooksLike
): UseEaseStateReturn<T> {
  const { useState, useCallback, useRef } = hooks;
  const { initialState, onChange, onTabChange } = options;

  const stateElementRef = useRef<EaseStateRef | null>(null);
  const panelElementRef = useRef<EasePanelRef | null>(null);
  const [state, setState] = useState<T>((initialState ?? {}) as T);
  const [activeTab, setActiveTab] = useState(0);

  // Handle state changes
  const handleStateChange = useCallback(
    (e: Event) => {
      const customEvent = e as CustomEvent<StateChangeEventDetail>;
      const { name, value } = customEvent.detail;
      setState((prev: T) => {
        return { ...prev, [name]: value };
      });
      onChange?.(customEvent.detail);
    },
    [onChange]
  );

  // Handle tab changes
  const handleTabChange = useCallback(
    (e: Event) => {
      const customEvent = e as CustomEvent<TabChangeEventDetail>;
      setActiveTab(customEvent.detail.index);
      onTabChange?.(customEvent.detail);
    },
    [onTabChange]
  );

  // Ref callback for the ease-state element
  const stateRef = useCallback(
    (element: EaseStateRef | null) => {
      // Cleanup previous element
      if (stateElementRef.current) {
        stateElementRef.current.removeEventListener('state-change', handleStateChange);
      }

      stateElementRef.current = element;

      if (element) {
        // Add event listeners
        element.addEventListener('state-change', handleStateChange);

        // Set initial state values
        if (initialState) {
          for (const [name, value] of Object.entries(initialState)) {
            element.set(name, value);
          }
        }

        // Sync current state from element
        const currentState = element.state;
        if (Object.keys(currentState).length > 0) {
          setState(currentState as T);
        }
      }
    },
    [handleStateChange, initialState]
  );

  // Ref callback for the ease-panel element
  const panelRef = useCallback(
    (element: EasePanelRef | null) => {
      // Cleanup previous element
      if (panelElementRef.current) {
        panelElementRef.current.removeEventListener('tab-change', handleTabChange);
      }

      panelElementRef.current = element;

      if (element) {
        // Add event listeners
        element.addEventListener('tab-change', handleTabChange);
        setActiveTab(element.activeTab);
      }
    },
    [handleTabChange]
  );

  // Get a specific value
  const get = useCallback(<K extends keyof T>(name: K): T[K] | undefined => state[name], [state]);

  // Set a specific value
  const set = useCallback(<K extends keyof T>(name: K, value: T[K]): void => {
    stateElementRef.current?.set(name as string, value);
  }, []);

  // Reset all values
  const reset = useCallback((): void => {
    stateElementRef.current?.reset();
  }, []);

  // Set active tab
  const setTab = useCallback((index: number): void => {
    panelElementRef.current?.setTab(index);
  }, []);

  return {
    stateRef,
    panelRef,
    state,
    get,
    set,
    reset,
    setTab,
    activeTab
  };
}
