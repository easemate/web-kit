/**
 * React context provider for @easemate/web-kit
 *
 * This module provides a simple way to initialize the web kit in a React context.
 * For simpler use cases, consider using `initWebKit()` directly in a useEffect.
 */

import type { InitWebKitOptions, WebKitController } from '../init';

/**
 * WebKit context value
 */
export interface WebKitContextValue {
  /** Whether the web kit is ready */
  ready: boolean;
  /** Theme controller */
  theme?: WebKitController['theme'];
}

/**
 * Props for createWebKitProvider
 */
export interface WebKitProviderProps {
  /** Initialization options */
  options?: InitWebKitOptions;
  /**
   * Render children even before ready
   * @default true
   */
  immediate?: boolean;
}

/**
 * React hooks interface for provider creation
 */
export interface ReactHooksForProvider {
  useState: <S>(initial: S) => [S, (value: S) => void];
  useEffect: (effect: () => (() => void) | undefined, deps?: unknown[]) => void;
  useMemo: <T>(factory: () => T, deps: unknown[]) => T;
  createContext: <T>(defaultValue: T) => {
    Provider: unknown;
    Consumer: unknown;
  };
  useContext: <T>(context: { Provider: unknown; Consumer: unknown }) => T;
  createElement: (type: unknown, props: Record<string, unknown> | null, ...children: unknown[]) => unknown;
}

/**
 * Creates a WebKit provider and context hook.
 *
 * This function creates a React context and provider component
 * that initializes the web kit and provides access to its state.
 *
 * @example
 * ```tsx
 * // providers.tsx
 * 'use client';
 *
 * import * as React from 'react';
 * import { createWebKitProvider } from '@easemate/web-kit/react';
 *
 * const { WebKitProvider, useWebKitContext } = createWebKitProvider(React);
 *
 * export { WebKitProvider, useWebKitContext };
 *
 * // layout.tsx
 * import { WebKitProvider } from './providers';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <WebKitProvider options={{ theme: 'default', styles: 'main' }}>
 *       {children}
 *     </WebKitProvider>
 *   );
 * }
 * ```
 */
export function createWebKitProvider(React: ReactHooksForProvider): {
  WebKitProvider: (props: WebKitProviderProps & { children: unknown }) => unknown;
  useWebKitContext: () => WebKitContextValue;
} {
  const defaultValue: WebKitContextValue = {
    ready: false,
    theme: undefined
  };

  const WebKitContext = React.createContext<WebKitContextValue>(defaultValue);

  function WebKitProvider(props: WebKitProviderProps & { children: unknown }): unknown {
    const { options = {}, immediate = true, children } = props;
    const isSSR = typeof window === 'undefined';
    const { useState, useEffect, useMemo, createElement } = React;

    const [ready, setReady] = useState(false);
    const [controller, setController] = useState<WebKitController | null>(null);

    useEffect(() => {
      // Skip initialization on SSR
      if (isSSR) {
        return;
      }

      let isMounted = true;

      const initialize = async () => {
        const { initWebKit } = await import('../init');
        const ctrl = initWebKit(options);

        if (isMounted) {
          setController(ctrl);
        }

        await ctrl.ready;

        if (isMounted) {
          setReady(true);
        }
      };

      initialize();

      return () => {
        isMounted = false;
        controller?.dispose();
        return undefined;
      };
    }, []);

    const value = useMemo<WebKitContextValue>(() => {
      return {
        ready,
        theme: controller?.theme
      };
    }, [ready, controller]);

    // On SSR, just render children directly
    if (isSSR) {
      return children;
    }

    // Don't render children until ready if immediate is false
    if (!immediate && !ready) {
      return null;
    }

    return createElement(WebKitContext.Provider, { value }, children);
  }

  function useWebKitContext(): WebKitContextValue {
    const context = React.useContext(WebKitContext) as WebKitContextValue;
    // On SSR, context will be the default value anyway
    return context;
  }

  return {
    WebKitProvider,
    useWebKitContext
  };
}
