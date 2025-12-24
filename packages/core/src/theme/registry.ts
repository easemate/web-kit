import type { ThemeConfig } from './tokens';

import { DARK_THEME_ALIAS, DEFAULT_THEME_NAME, defaultThemeConfig } from './presets';

// --------------------------
// Type definitions
// --------------------------

/**
 * Augmentable interface for theme names.
 * Consumers can extend this via module augmentation to add custom theme names:
 *
 * @example
 * ```ts
 * declare module '@easemate/web-kit' {
 *   interface WebKitThemeRegistry {
 *     custom: true;
 *     brand: true;
 *   }
 * }
 * ```
 */
export interface WebKitThemeRegistry {
  default: true;
  dark: true;
}

/**
 * Union of all registered theme names.
 */
export type WebKitThemeName = keyof WebKitThemeRegistry;

/**
 * A strongly-typed theme reference.
 * Use this for type-safe theme references without module augmentation.
 */
export interface WebKitThemeRef<Name extends string = string> {
  readonly __brand: 'WebKitThemeRef';
  readonly name: Name;
}

/**
 * Valid theme input for APIs: a registered theme name, a theme ref, or an inline config.
 */
export type ThemeInput = WebKitThemeName | WebKitThemeRef | ThemeConfig;

/**
 * Options for registering a theme.
 */
export interface RegisterThemeOptions {
  /**
   * Base theme to extend from.
   * - `'default'` (or any registered name) - extends that theme
   * - `null` - no base, starts from scratch
   * - `undefined` - defaults to `'default'`
   */
  base?: WebKitThemeName | WebKitThemeRef | null;
  /**
   * Theme configuration (overrides on top of base).
   */
  config?: ThemeConfig;
}

/**
 * Resolved theme entry in the registry.
 */
interface ThemeEntry {
  name: string;
  base: string | null;
  config: ThemeConfig;
  resolved: ThemeConfig | null; // lazily computed
}

// --------------------------
// Registry implementation
// --------------------------

const registry = new Map<string, ThemeEntry>();

/**
 * Deep merge two theme configs.
 */
const mergeConfigs = (base: ThemeConfig, overrides: ThemeConfig): ThemeConfig => {
  return {
    colors: {
      ...base.colors,
      ...overrides.colors,
      gray: { ...base.colors?.gray, ...overrides.colors?.gray },
      blue: { ...base.colors?.blue, ...overrides.colors?.blue },
      green: { ...base.colors?.green, ...overrides.colors?.green },
      red: { ...base.colors?.red, ...overrides.colors?.red },
      orange: { ...base.colors?.orange, ...overrides.colors?.orange },
      yellow: { ...base.colors?.yellow, ...overrides.colors?.yellow },
      whiteAlpha: { ...base.colors?.whiteAlpha, ...overrides.colors?.whiteAlpha },
      blackAlpha: { ...base.colors?.blackAlpha, ...overrides.colors?.blackAlpha }
    },
    radii: { ...base.radii, ...overrides.radii },
    spacing: { ...base.spacing, ...overrides.spacing },
    typography: { ...base.typography, ...overrides.typography },
    vars: { ...base.vars, ...overrides.vars }
  };
};

/**
 * Resolve a theme by name, following base chain.
 */
const resolveThemeConfig = (name: string, visited = new Set<string>()): ThemeConfig => {
  if (visited.has(name)) {
    throw new Error(`[web-kit] Circular theme dependency detected: ${Array.from(visited).join(' -> ')} -> ${name}`);
  }

  const entry = registry.get(name);
  if (!entry) {
    throw new Error(`[web-kit] Theme "${name}" is not registered.`);
  }

  // Return cached resolution
  if (entry.resolved) {
    return entry.resolved;
  }

  visited.add(name);

  let resolved: ThemeConfig;
  if (entry.base === null) {
    // No base - use config as-is
    resolved = entry.config;
  } else {
    // Resolve base first
    const baseConfig = resolveThemeConfig(entry.base, visited);
    resolved = mergeConfigs(baseConfig, entry.config);
  }

  // Cache the resolution
  entry.resolved = resolved;
  return resolved;
};

/**
 * Initialize built-in themes.
 */
const initBuiltInThemes = (): void => {
  if (registry.has(DEFAULT_THEME_NAME)) {
    return;
  }

  // Register 'default' theme
  registry.set(DEFAULT_THEME_NAME, {
    name: DEFAULT_THEME_NAME,
    base: null,
    config: defaultThemeConfig,
    resolved: defaultThemeConfig
  });

  // Register 'dark' as alias to 'default'
  registry.set(DARK_THEME_ALIAS, {
    name: DARK_THEME_ALIAS,
    base: DEFAULT_THEME_NAME,
    config: {},
    resolved: null
  });
};

// Initialize on module load
initBuiltInThemes();

// --------------------------
// Public API
// --------------------------

/**
 * Check if a value is a theme ref.
 */
export const isThemeRef = (value: unknown): value is WebKitThemeRef =>
  typeof value === 'object' && value !== null && '__brand' in value && value.__brand === 'WebKitThemeRef';

/**
 * Check if a value is a theme config object.
 */
export const isThemeConfig = (value: unknown): value is ThemeConfig => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (isThemeRef(value)) {
    return false;
  }
  // Check if it looks like a ThemeConfig
  const obj = value as Record<string, unknown>;
  return (
    obj.colors !== undefined ||
    obj.radii !== undefined ||
    obj.spacing !== undefined ||
    obj.typography !== undefined ||
    obj.vars !== undefined
  );
};

/**
 * Register a custom theme.
 *
 * @param name - Theme name (must be unique)
 * @param options - Theme options (base + config)
 * @returns A typed theme reference
 *
 * @example
 * ```ts
 * const custom = registerTheme('custom', {
 *   base: 'default',
 *   config: {
 *     vars: { '--ease-panel-radius': '14px' }
 *   }
 * });
 *
 * initWebKit({ theme: custom });
 * ```
 */
export function registerTheme<Name extends string>(
  name: Name,
  options: RegisterThemeOptions = {}
): WebKitThemeRef<Name> {
  const { base = DEFAULT_THEME_NAME, config = {} } = options;

  // Resolve base name
  let baseName: string | null = null;
  if (base !== null) {
    baseName = isThemeRef(base) ? base.name : base;
    // Validate base exists
    if (!registry.has(baseName)) {
      throw new Error(`[web-kit] Base theme "${baseName}" is not registered.`);
    }
  }

  // Invalidate cache for themes that depend on this one (if re-registering)
  if (registry.has(name)) {
    for (const entry of registry.values()) {
      if (entry.base === name) {
        entry.resolved = null;
      }
    }
  }

  registry.set(name, {
    name,
    base: baseName,
    config,
    resolved: null
  });

  return {
    __brand: 'WebKitThemeRef',
    name
  } as WebKitThemeRef<Name>;
}

/**
 * Get a theme's resolved configuration.
 *
 * @param theme - Theme name, ref, or inline config
 * @returns Resolved theme configuration
 */
export function getTheme(theme: ThemeInput): ThemeConfig {
  if (isThemeConfig(theme)) {
    return theme;
  }

  const name = isThemeRef(theme) ? theme.name : theme;
  return resolveThemeConfig(name);
}

/**
 * Check if a theme is registered.
 */
export function hasTheme(name: string): boolean {
  return registry.has(name);
}

/**
 * Get all registered theme names.
 */
export function getThemeNames(): string[] {
  return Array.from(registry.keys());
}

/**
 * Create a theme ref for a registered theme name.
 * Useful for type-safe references without module augmentation.
 */
export function themeRef<Name extends WebKitThemeName>(name: Name): WebKitThemeRef<Name> {
  if (!registry.has(name)) {
    throw new Error(`[web-kit] Theme "${name}" is not registered.`);
  }
  return {
    __brand: 'WebKitThemeRef',
    name
  } as WebKitThemeRef<Name>;
}
