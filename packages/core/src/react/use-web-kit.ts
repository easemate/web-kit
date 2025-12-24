/**
 * React hook for initializing @easemate/web-kit
 *
 * This module provides hooks for React integration.
 * React is a peer dependency - users must install it separately.
 *
 * @module
 */

import type { InitWebKitOptions, WebKitController } from '../init';

/**
 * Options for useWebKit hook
 */
export interface UseWebKitOptions extends InitWebKitOptions {
  /**
   * Skip initialization (useful for conditional rendering)
   * @default false
   */
  skip?: boolean;
}

/**
 * Return type for useWebKit hook
 */
export interface UseWebKitReturn {
  /** Whether the web kit is ready */
  ready: boolean;
  /** Theme controller (if theme was configured) */
  theme?: WebKitController['theme'];
  /** Dispose function for cleanup */
  dispose: () => void;
}

// Singleton to track if web-kit has been initialized globally
let globalController: WebKitController | null = null;
let initCount = 0;

/**
 * React hook for initializing @easemate/web-kit.
 *
 * This hook handles initialization and cleanup of the web kit,
 * ensuring components are registered before rendering.
 *
 * **Important for Next.js App Router:**
 * - Use this hook in a client component (`'use client'`)
 * - Place it at the top of your component tree (e.g., in a layout)
 * - The hook is SSR-safe and will only initialize on the client
 *
 * **Note:** This hook requires React to be installed. Import React hooks
 * directly in your component and pass them to this function, or use the
 * imperative `initWebKit()` function directly.
 *
 * @example
 * ```tsx
 * // app/providers.tsx
 * 'use client';
 *
 * import { useEffect, useState, useRef } from 'react';
 * import { initWebKit } from '@easemate/web-kit';
 *
 * export function Providers({ children }: { children: React.ReactNode }) {
 *   const [ready, setReady] = useState(false);
 *   const controllerRef = useRef<WebKitController | null>(null);
 *
 *   useEffect(() => {
 *     const controller = initWebKit({
 *       theme: 'default',
 *       styles: 'main',
 *       fonts: 'default'
 *     });
 *     controllerRef.current = controller;
 *     controller.ready.then(() => setReady(true));
 *
 *     return () => controller.dispose();
 *   }, []);
 *
 *   return <>{children}</>;
 * }
 * ```
 */
export function useWebKit(
  options: UseWebKitOptions,
  hooks: {
    useState: <T>(initial: T) => [T, (value: T) => void];
    useEffect: (effect: () => (() => void) | undefined, deps?: unknown[]) => void;
    useRef: <T>(initial: T) => { current: T };
  }
): UseWebKitReturn {
  const isSSR = typeof window === 'undefined';
  const { useState, useEffect, useRef } = hooks;
  const { skip = false, ...initOptions } = options;

  const [ready, setReady] = useState(false);
  const controllerRef = useRef<WebKitController | null>(null);
  const optionsRef = useRef(initOptions);

  useEffect(() => {
    // Skip on SSR or if explicitly skipped
    if (isSSR || skip) {
      return;
    }

    let isMounted = true;

    const initialize = async () => {
      // If already initialized globally, reuse the controller
      if (globalController) {
        initCount++;
        controllerRef.current = globalController;
        await globalController.ready;
        if (isMounted) {
          setReady(true);
        }
        return;
      }

      // Dynamic import to ensure this only runs on client
      const { initWebKit } = await import('../init');

      const controller = initWebKit(optionsRef.current);
      globalController = controller;
      initCount++;
      controllerRef.current = controller;

      await controller.ready;
      if (isMounted) {
        setReady(true);
      }
    };

    initialize();

    return () => {
      isMounted = false;
      initCount--;

      // Only dispose if this was the last user of the global controller
      if (initCount <= 0 && globalController) {
        globalController.dispose();
        globalController = null;
        initCount = 0;
      }
    };
  }, [skip]);

  return {
    ready,
    theme: controllerRef.current?.theme,
    dispose: () => {
      controllerRef.current?.dispose();
      if (controllerRef.current === globalController) {
        globalController = null;
        initCount = 0;
      }
      controllerRef.current = null;
    }
  };
}
