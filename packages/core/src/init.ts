/**
 * Main initialization API for @easemate/web-kit
 */

import type { FontConfig } from './internal/fonts';
import type { LazyLoadConfig } from './internal/lazy-load';
import type { StylePreset } from './internal/style-inject';

import { applyTheme, followSystemTheme, type SystemThemeMode } from './theme';
import { getTheme, isThemeRef, type ThemeInput } from './theme/registry';

// --------------------------
// Types
// --------------------------

/**
 * Theme mode configuration for light/dark switching.
 */
export interface ThemeModeConfig {
  /** Mode selection: 'light', 'dark', or 'system' for auto-switching */
  mode: 'light' | 'dark' | 'system';
  /** Theme to use in light mode */
  light: ThemeInput;
  /** Theme to use in dark mode */
  dark: ThemeInput;
  /** Persist user preference to localStorage */
  persist?: { key: string };
}

/**
 * Style injection configuration.
 */
export type StylesConfig = false | StylePreset | { reset?: boolean; base?: boolean };

/**
 * Component replacement configuration.
 * Keys are tag names, values are either:
 * - A custom element constructor
 * - A string tag name to alias to
 */
export type ReplaceConfig = Record<string, CustomElementConstructor | string>;

/**
 * initWebKit options.
 */
export interface InitWebKitOptions {
  /**
   * Tags to include (register only these).
   * If not provided, all components are registered.
   */
  include?: readonly string[];

  /**
   * Tags to exclude (register all except these).
   * Ignored if `include` is provided.
   */
  exclude?: readonly string[];

  /**
   * Replace components with custom implementations.
   * - Constructor: registers your class under the tag name
   * - String: creates a bridge element that renders the aliased tag
   */
  replace?: ReplaceConfig;

  /**
   * Theme to apply.
   * - String: registered theme name (e.g., 'default', 'dark')
   * - WebKitThemeRef: theme reference from registerTheme()
   * - ThemeConfig: inline theme configuration
   * - ThemeModeConfig: light/dark mode configuration
   */
  theme?: ThemeInput | ThemeModeConfig;

  /**
   * Element to scope theme variables to (default: document.documentElement).
   */
  target?: HTMLElement;

  /**
   * Inject global styles.
   * - false: no styles (default)
   * - 'reset': minimal CSS reset
   * - 'base': body/html dark theme styles
   * - 'main': reset + base
   * - { reset?: boolean; base?: boolean }: fine-grained control
   */
  styles?: StylesConfig;

  /**
   * Font loading configuration.
   * - false: no font loading (default)
   * - 'default': load default fonts (Instrument Sans, Geist Mono)
   * - FontConfig: custom font configuration
   */
  fonts?: FontConfig | 'default' | false;

  /**
   * Enable lazy loading of components.
   * - false: eager loading (default)
   * - true: lazy load with default config
   * - LazyLoadConfig: custom lazy load config
   */
  lazyLoad?: boolean | LazyLoadConfig;

  /**
   * CSP nonce for injected style/link elements.
   */
  cspNonce?: string;

  /**
   * Development mode options.
   */
  dev?: {
    /** Warn about unknown tag names in include/exclude */
    warnUnknownTags?: boolean;
    /** Log component loads */
    logLoads?: boolean;
  };
}

/**
 * Controller returned by initWebKit.
 */
export interface WebKitController {
  /** Cleanup all injected styles, fonts, and listeners */
  dispose: () => void;

  /** Theme controller (if theme was configured) */
  theme?: {
    /** Set theme by name or config */
    set: (theme: ThemeInput) => void;
    /** Set theme mode (only for ThemeModeConfig) */
    mode?: (mode: 'light' | 'dark' | 'system') => void;
  };

  /** Promise that resolves when all components are loaded */
  ready: Promise<void>;
}

// --------------------------
// Helpers
// --------------------------

const isBrowser = (): boolean => typeof document !== 'undefined' && typeof window !== 'undefined';

const isThemeModeConfig = (value: unknown): value is ThemeModeConfig => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return obj.mode !== undefined && (obj.light !== undefined || obj.dark !== undefined);
};

/**
 * Register replacement components before loading built-in ones.
 */
function registerReplacements(replace: ReplaceConfig): void {
  if (!isBrowser()) {
    return;
  }

  for (const [tag, replacement] of Object.entries(replace)) {
    // Skip if already defined
    if (customElements.get(tag)) {
      continue;
    }

    if (typeof replacement === 'function') {
      // Register custom constructor
      customElements.define(tag, replacement);
    } else if (typeof replacement === 'string') {
      // Create a bridge element that renders the aliased tag
      const aliasTag = replacement;
      class BridgeElement extends HTMLElement {
        private _inner: HTMLElement | null = null;

        connectedCallback(): void {
          // Create the aliased element
          this._inner = document.createElement(aliasTag);

          // Copy attributes
          for (const attr of this.attributes) {
            this._inner.setAttribute(attr.name, attr.value);
          }

          // Move children
          while (this.firstChild) {
            this._inner.appendChild(this.firstChild);
          }

          // Use shadow DOM to contain the aliased element
          const shadow = this.attachShadow({ mode: 'open' });
          shadow.appendChild(this._inner);
        }

        disconnectedCallback(): void {
          this._inner = null;
        }
      }
      customElements.define(tag, BridgeElement);
    }
  }
}

/**
 * Resolve and apply styles configuration.
 */
async function applyStyles(styles: StylesConfig, nonce?: string): Promise<{ dispose: () => void }> {
  if (styles === false) {
    return { dispose: () => {} };
  }

  const { injectPreset, removePreset } = await import('./internal/style-inject');

  const injected: StylePreset[] = [];

  if (typeof styles === 'string') {
    injectPreset(styles, nonce);
    injected.push(styles);
  } else if (typeof styles === 'object') {
    if (styles.reset) {
      injectPreset('reset', nonce);
      injected.push('reset');
    }
    if (styles.base) {
      injectPreset('base', nonce);
      injected.push('base');
    }
  }

  return {
    dispose: () => {
      for (const preset of injected) {
        removePreset(preset);
      }
    }
  };
}

/**
 * Resolve and apply theme configuration.
 */
function applyThemeConfig(
  theme: ThemeInput | ThemeModeConfig,
  target?: HTMLElement
): { dispose: () => void; controller?: WebKitController['theme'] } {
  if (isThemeModeConfig(theme)) {
    // Light/dark mode configuration
    const lightConfig = getTheme(theme.light);
    const darkConfig = getTheme(theme.dark);

    if (theme.mode === 'system') {
      const cleanup = followSystemTheme({ light: lightConfig, dark: darkConfig }, { element: target });

      return {
        dispose: cleanup,
        controller: {
          set: (t: ThemeInput) => {
            const config = getTheme(t);
            applyTheme(config, { element: target });
          },
          mode: (m: 'light' | 'dark' | 'system') => {
            if (m === 'system') {
              // Re-apply system theme
              const systemMode: SystemThemeMode = window.matchMedia('(prefers-color-scheme: light)').matches
                ? 'light'
                : 'dark';
              const config = systemMode === 'light' ? lightConfig : darkConfig;
              applyTheme(config, {
                element: target,
                name: systemMode,
                colorScheme: systemMode
              });
            } else {
              const config = m === 'light' ? lightConfig : darkConfig;
              applyTheme(config, {
                element: target,
                name: m,
                colorScheme: m
              });
            }
          }
        }
      };
    }

    // Fixed mode
    const config = theme.mode === 'light' ? lightConfig : darkConfig;
    applyTheme(config, {
      element: target,
      name: theme.mode,
      colorScheme: theme.mode
    });

    return {
      dispose: () => {},
      controller: {
        set: (t: ThemeInput) => {
          const resolvedConfig = getTheme(t);
          applyTheme(resolvedConfig, { element: target });
        }
      }
    };
  }

  // Simple theme (name, ref, or config)
  const config = getTheme(theme);
  const name = isThemeRef(theme) ? theme.name : typeof theme === 'string' ? theme : undefined;

  applyTheme(config, {
    element: target,
    name,
    colorScheme: 'dark'
  });

  return {
    dispose: () => {},
    controller: {
      set: (t: ThemeInput) => {
        const resolvedConfig = getTheme(t);
        const themeName = isThemeRef(t) ? t.name : typeof t === 'string' ? t : undefined;
        applyTheme(resolvedConfig, { element: target, name: themeName });
      }
    }
  };
}

// --------------------------
// Main API
// --------------------------

/**
 * Initialize the web-kit.
 *
 * @example
 * ```ts
 * // Basic usage - register all components with default theme
 * initWebKit({ theme: 'default' });
 *
 * // Selective loading
 * initWebKit({
 *   include: ['ease-button', 'ease-slider'],
 *   theme: 'default'
 * });
 *
 * // With styles
 * initWebKit({
 *   theme: 'default',
 *   styles: 'main',
 *   fonts: 'default'
 * });
 *
 * // Light/dark mode
 * initWebKit({
 *   theme: {
 *     mode: 'system',
 *     light: myLightTheme,
 *     dark: 'default'
 *   }
 * });
 * ```
 */
export function initWebKit(options: InitWebKitOptions = {}): WebKitController {
  // SSR safety - no-op on server
  if (!isBrowser()) {
    return {
      dispose: () => {},
      ready: Promise.resolve()
    };
  }

  const {
    include,
    exclude,
    replace,
    theme,
    target,
    styles = false,
    fonts = false,
    lazyLoad = false,
    cspNonce,
    dev
  } = options;

  const disposers: Array<() => void> = [];

  // Controller object that will be populated
  const controller: WebKitController = {
    dispose: () => {
      for (const dispose of disposers) {
        dispose();
      }
    },
    theme: undefined,
    ready: Promise.resolve()
  };

  // Build the ready promise
  const readyPromise = (async () => {
    // 1. Register replacements first (before loading any components)
    if (replace) {
      registerReplacements(replace);
    }

    // 2. Apply styles
    const stylesResult = await applyStyles(styles, cspNonce);
    disposers.push(stylesResult.dispose);

    // 3. Apply theme
    if (theme) {
      const themeResult = applyThemeConfig(theme, target);
      disposers.push(themeResult.dispose);
      controller.theme = themeResult.controller;
    }

    // 4. Load fonts
    if (fonts !== false) {
      const { injectFonts, removeFonts } = await import('./internal/fonts');
      injectFonts(fonts);
      const fontsToRemove = fonts;
      disposers.push(() => removeFonts(fontsToRemove));
    }

    // 5. Load components
    if (lazyLoad) {
      // Lazy loading mode
      const { createLazyLoader } = await import('./internal/lazy-load');
      const lazyConfig: LazyLoadConfig = typeof lazyLoad === 'object' ? lazyLoad : {};

      // Apply include/exclude to lazy loader
      if (include) {
        lazyConfig.include = include;
      } else if (exclude) {
        lazyConfig.exclude = exclude;
      }

      const loader = createLazyLoader(lazyConfig);
      disposers.push(loader.dispose);
    } else {
      // Eager loading mode
      const { loadAllComponents, loadComponents, resolveTags } = await import('./internal/component-loaders');

      if (include || exclude) {
        const tags = resolveTags({ include, exclude });

        if (dev?.warnUnknownTags) {
          const { WEB_KIT_ALL_TAGS } = await import('./internal/component-loaders');
          const allTags = new Set(WEB_KIT_ALL_TAGS);
          const unknown = (include ?? exclude ?? []).filter((t) => !allTags.has(t as never));
          if (unknown.length > 0) {
            console.warn('[web-kit] Unknown tags:', unknown);
          }
        }

        if (dev?.logLoads) {
          console.log('[web-kit] Loading components:', tags);
        }

        await loadComponents(tags);
      } else {
        if (dev?.logLoads) {
          console.log('[web-kit] Loading all components');
        }
        await loadAllComponents();
      }
    }
  })();

  controller.ready = readyPromise;
  return controller;
}

export type { WebKitComponentTag, WebKitElementTag, WebKitTag } from './internal/component-loaders';
// Re-export useful types
export type { FontConfig, FontSource } from './internal/fonts';
export type { LazyLoadConfig, LazyLoader } from './internal/lazy-load';
export type { StylePreset } from './internal/style-inject';
