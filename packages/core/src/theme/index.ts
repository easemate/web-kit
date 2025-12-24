import {
  type ColorPalette,
  defaultColors,
  defaultRadii,
  defaultSpacing,
  defaultTypography,
  type RadiiConfig,
  type SpacingConfig,
  type ThemeConfig,
  type ThemeVars,
  type TypographyConfig
} from './tokens';

export * from './presets';
export * from './registry';
export * from './tokens';

/**
 * CSS variable prefix
 */
const CSS_PREFIX = '--color';
const RADII_PREFIX = '--radii';
const SPACING_PREFIX = '--spacing';
const TYPOGRAPHY_PREFIX = '--font';

/**
 * Convert a nested object path to CSS variable name
 * e.g., ['gray', '100'] -> '--color-gray-100'
 */
const toVarName = (prefix: string, ...parts: (string | number)[]): string => `${prefix}-${parts.join('-')}`;

/**
 * Generate CSS variables from a color scale
 */
const generateColorScaleVars = (
  name: string,
  scale: Record<string | number, string | undefined>
): Record<string, string> => {
  const vars: Record<string, string> = {};

  for (const [level, value] of Object.entries(scale)) {
    if (value !== undefined) {
      vars[toVarName(CSS_PREFIX, name, level)] = value;
    }
  }

  return vars;
};

/**
 * Add alpha to an OKLab/OKLCH color string.
 * Falls back to `color-mix()` for non-oklab/oklch formats.
 */
const withAlpha = (color: string, alpha: number): string => {
  const trimmed = color.trim();
  const match = /^(oklab|oklch)\((.+)\)$/.exec(trimmed);
  if (match) {
    const fn = match[1];
    const innerRaw = match[2];

    if (fn && innerRaw) {
      const inner = innerRaw.trim();

      // If the color already has an alpha, keep it as-is.
      if (inner.includes('/')) {
        return `${fn}(${inner})`;
      }

      return `${fn}(${inner} / ${alpha})`;
    }
  }

  // Fallback: approximate alpha using color-mix
  const pct = Math.round(alpha * 1000) / 10;
  return `color-mix(in oklab, ${trimmed} ${pct}%, transparent)`;
};

/**
 * Generate CSS variables from a color palette
 */
const generateColorVars = (colors: ColorPalette): Record<string, string> => {
  const vars: Record<string, string> = {};

  if (colors.gray) {
    Object.assign(vars, generateColorScaleVars('gray', colors.gray));
  }

  if (colors.blue) {
    Object.assign(vars, generateColorScaleVars('blue', colors.blue));
  }

  // Derived convenience tokens used by some components
  const blue = colors.blue as Record<string, string | undefined> | undefined;
  if (blue?.['200']) {
    vars[toVarName(CSS_PREFIX, 'blue', '100-50')] = withAlpha(blue['200'], 0.5);
  }
  if (blue?.['300']) {
    vars[toVarName(CSS_PREFIX, 'blue', '300-40')] = withAlpha(blue['300'], 0.4);
  }

  if (colors.green) {
    Object.assign(vars, generateColorScaleVars('green', colors.green));
  }

  if (colors.red) {
    Object.assign(vars, generateColorScaleVars('red', colors.red));
  }

  if (colors.orange) {
    Object.assign(vars, generateColorScaleVars('orange', colors.orange));
  }

  if (colors.yellow) {
    Object.assign(vars, generateColorScaleVars('yellow', colors.yellow));
  }

  if (colors.white) {
    vars[toVarName(CSS_PREFIX, 'white')] = colors.white;
  }

  if (colors.black) {
    vars[toVarName(CSS_PREFIX, 'black')] = colors.black;
  }

  if (colors.whiteAlpha) {
    for (const [level, value] of Object.entries(colors.whiteAlpha)) {
      if (value !== undefined) {
        vars[toVarName(CSS_PREFIX, 'white', level)] = value;
      }
    }
  }

  // Ensure `--color-white-0` exists (used by slider thumb gradients)
  if (!vars[toVarName(CSS_PREFIX, 'white', 0)] && colors.white) {
    vars[toVarName(CSS_PREFIX, 'white', 0)] = withAlpha(colors.white, 0);
  }

  if (colors.blackAlpha) {
    for (const [level, value] of Object.entries(colors.blackAlpha)) {
      if (value !== undefined) {
        vars[toVarName(CSS_PREFIX, 'black', level)] = value;
      }
    }
  }

  if (colors.foreground) {
    vars[toVarName(CSS_PREFIX, 'foreground')] = colors.foreground;
  }

  return vars;
};

/**
 * Resolve the theme target element.
 * This keeps the theme API SSR-safe (no-ops when `document` is not available).
 */
const resolveThemeTarget = (element?: HTMLElement | null): HTMLElement | null => {
  if (element) {
    return element;
  }
  if (typeof document === 'undefined') {
    return null;
  }
  return document.documentElement;
};

/**
 * Generate CSS variables from radii config
 */
const generateRadiiVars = (radii: RadiiConfig): Record<string, string> => {
  const vars: Record<string, string> = {};

  for (const [name, value] of Object.entries(radii)) {
    if (value !== undefined) {
      vars[toVarName(RADII_PREFIX, name)] = value;
    }
  }

  return vars;
};

/**
 * Generate CSS variables from spacing config
 */
const generateSpacingVars = (spacing: SpacingConfig): Record<string, string> => {
  const vars: Record<string, string> = {};

  for (const [name, value] of Object.entries(spacing)) {
    if (value !== undefined) {
      vars[toVarName(SPACING_PREFIX, name)] = value;
    }
  }

  return vars;
};

/**
 * Generate CSS variables from typography config
 */
const generateTypographyVars = (typography: TypographyConfig): Record<string, string> => {
  const vars: Record<string, string> = {};

  if (typography.fontFamily) {
    vars[toVarName(TYPOGRAPHY_PREFIX, 'family')] = typography.fontFamily;
  }

  if (typography.fontMono) {
    vars[toVarName(TYPOGRAPHY_PREFIX, 'mono')] = typography.fontMono;
  }

  if (typography.fontSize) {
    vars[toVarName(TYPOGRAPHY_PREFIX, 'size')] = typography.fontSize;
  }

  if (typography.lineHeight) {
    vars[toVarName(TYPOGRAPHY_PREFIX, 'line-height')] = typography.lineHeight;
  }

  return vars;
};

const normalizeCustomVarName = (name: string): string | null => {
  const trimmed = name.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.startsWith('--') ? trimmed : `--${trimmed}`;
};

const generateCustomVars = (vars: ThemeVars): Record<string, string> => {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(vars)) {
    if (value === null || value === undefined) {
      continue;
    }

    const name = normalizeCustomVarName(key);
    if (!name) {
      continue;
    }

    out[name] = String(value);
  }

  return out;
};

/**
 * Generate all CSS variables from a theme config
 */
const generateThemeVars = (config: ThemeConfig): Record<string, string> => {
  const vars: Record<string, string> = {};

  if (config.colors) {
    Object.assign(vars, generateColorVars(config.colors));
  }

  if (config.radii) {
    Object.assign(vars, generateRadiiVars(config.radii));
  }

  if (config.spacing) {
    Object.assign(vars, generateSpacingVars(config.spacing));
  }

  if (config.typography) {
    Object.assign(vars, generateTypographyVars(config.typography));
  }

  if (config.vars) {
    Object.assign(vars, generateCustomVars(config.vars));
  }

  return vars;
};

/**
 * Create a CSS string from theme configuration
 *
 * @param config - Theme configuration object
 * @param selector - CSS selector to apply variables to (default: ':root')
 * @returns CSS string with variables
 *
 * @example
 * ```typescript
 * const css = createTheme({
 *   colors: {
 *     blue: { 500: '#3b82f6' }
 *   }
 * });
 * // Returns: ':root { --color-blue-500: #3b82f6; }'
 * ```
 */
export const createTheme = (config: ThemeConfig, selector = ':root'): string => {
  const vars = generateThemeVars(config);
  const declarations = Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');

  return `${selector} {\n${declarations}\n}`;
};

/**
 * Apply theme configuration to an element (default: document root)
 *
 * @param config - Theme configuration object
 * @param element - Target element (default: document.documentElement)
 *
 * @example
 * ```typescript
 * // Apply to document root
 * defineTheme({
 *   colors: {
 *     blue: { 500: '#3b82f6' }
 *   }
 * });
 *
 * // Apply to specific element
 * defineTheme({ colors: { gray: { 900: '#111' } } }, myElement);
 * ```
 */
export const defineTheme = (config: ThemeConfig, element?: HTMLElement | null): void => {
  const target = resolveThemeTarget(element);
  if (!target) {
    return;
  }

  const vars = generateThemeVars(config);

  for (const [name, value] of Object.entries(vars)) {
    target.style.setProperty(name, value);
  }
};

/**
 * Remove theme configuration from an element
 *
 * @param config - Theme configuration object (to know which variables to remove)
 * @param element - Target element (default: document.documentElement)
 */
export const removeTheme = (config: ThemeConfig, element?: HTMLElement | null): void => {
  const target = resolveThemeTarget(element);
  if (!target) {
    return;
  }

  const vars = generateThemeVars(config);

  for (const name of Object.keys(vars)) {
    target.style.removeProperty(name);
  }
};

/**
 * Get the current value of a CSS theme variable
 *
 * @param token - Variable name (with or without '--' prefix)
 * @param element - Element to read from (default: document.documentElement)
 * @returns The computed value or empty string if not found
 *
 * @example
 * ```typescript
 * const blue500 = getThemeValue('color-blue-500');
 * const radius = getThemeValue('--radii-md');
 * ```
 */
export const getThemeValue = (token: string, element?: HTMLElement | null): string => {
  const target = resolveThemeTarget(element);
  if (!target || typeof getComputedStyle === 'undefined') {
    return '';
  }

  const varName = token.startsWith('--') ? token : `--${token}`;
  return getComputedStyle(target).getPropertyValue(varName).trim();
};

/**
 * Set a single theme variable
 *
 * @param token - Variable name (with or without '--' prefix)
 * @param value - Value to set
 * @param element - Target element (default: document.documentElement)
 *
 * @example
 * ```typescript
 * setThemeValue('color-blue-500', '#3b82f6');
 * ```
 */
export const setThemeValue = (token: string, value: string, element?: HTMLElement | null): void => {
  const target = resolveThemeTarget(element);
  if (!target) {
    return;
  }

  const varName = token.startsWith('--') ? token : `--${token}`;
  target.style.setProperty(varName, value);
};

export type SystemThemeMode = 'dark' | 'light';

/** Attribute used for CSS-based theme switching */
export const EASE_THEME_ATTRIBUTE = 'data-ease-theme';

/**
 * Merge a theme with the library defaults (dark baseline).
 * Use this when you want to start from the built-in design tokens and override a few values.
 */
export const mergeTheme = (overrides: ThemeConfig = {}): ThemeConfig => {
  return {
    colors: {
      ...defaultColors,
      ...overrides.colors,
      gray: { ...defaultColors.gray, ...overrides.colors?.gray },
      blue: { ...defaultColors.blue, ...overrides.colors?.blue },
      green: { ...defaultColors.green, ...overrides.colors?.green },
      red: { ...defaultColors.red, ...overrides.colors?.red },
      orange: { ...defaultColors.orange, ...overrides.colors?.orange },
      yellow: { ...defaultColors.yellow, ...overrides.colors?.yellow },
      whiteAlpha: { ...defaultColors.whiteAlpha, ...overrides.colors?.whiteAlpha },
      blackAlpha: { ...defaultColors.blackAlpha, ...overrides.colors?.blackAlpha }
    },
    radii: { ...defaultRadii, ...overrides.radii },
    spacing: { ...defaultSpacing, ...overrides.spacing },
    typography: { ...defaultTypography, ...overrides.typography },
    vars: overrides.vars ? { ...overrides.vars } : undefined
  };
};

/**
 * Alias for `mergeTheme()`.
 * This package ships a dark baseline theme; light/custom themes should be provided by the consumer.
 */
export const createDarkTheme = (overrides: ThemeConfig = {}): ThemeConfig => mergeTheme(overrides);

export interface SetThemeNameOptions {
  /** Target element (defaults to `document.documentElement` in the browser). */
  element?: HTMLElement | null;
  /** Attribute name to set (defaults to `data-ease-theme`). */
  attribute?: string;
  /** Optional `color-scheme` value to set on the target element. */
  colorScheme?: SystemThemeMode;
  /** Set `element.style.colorScheme` (default: true when `colorScheme` is provided). */
  setColorScheme?: boolean;
}

/**
 * Set the active theme name on an element via `[data-ease-theme="<name>"]`.
 * Useful for CSS-scoped themes.
 */
export const setThemeName = (name: string, options: SetThemeNameOptions = {}): void => {
  const target = resolveThemeTarget(options.element);
  if (!target) {
    return;
  }

  const attribute = options.attribute ?? EASE_THEME_ATTRIBUTE;
  target.setAttribute(attribute, name);

  if (options.colorScheme && options.setColorScheme !== false) {
    target.style.colorScheme = options.colorScheme;
  }
};

export const getThemeName = (element?: HTMLElement | null, attribute = EASE_THEME_ATTRIBUTE): string | null => {
  const target = resolveThemeTarget(element);
  if (!target) {
    return null;
  }

  return target.getAttribute(attribute);
};

export interface ApplyThemeOptions {
  /** Target element (defaults to `document.documentElement` in the browser). */
  element?: HTMLElement | null;
  /** Optional theme name to set as `[data-ease-theme="<name>"]`. */
  name?: string;
  /** Attribute name to use when `name` is provided. Defaults to `data-ease-theme`. */
  attribute?: string;
  /** Optional `color-scheme` value to set on the target element. */
  colorScheme?: SystemThemeMode;
  /** Set `[data-ease-theme]` when `name` is provided (default: true). */
  setAttribute?: boolean;
  /** Set `element.style.colorScheme` when `colorScheme` is provided (default: true). */
  setColorScheme?: boolean;
  /**
   * If true, the provided theme is first merged with the library defaults via `mergeTheme()`.
   * Use this when you only pass partial overrides.
   */
  mergeWithDefaults?: boolean;
}

/**
 * Apply a theme config (and optional theme name + color-scheme) to an element.
 * This is SSR-safe: it becomes a no-op when `document` is not available.
 */
export const applyTheme = (theme: ThemeConfig, options: ApplyThemeOptions = {}): ThemeConfig => {
  const target = resolveThemeTarget(options.element);
  const attribute = options.attribute ?? EASE_THEME_ATTRIBUTE;

  const config = options.mergeWithDefaults ? mergeTheme(theme) : theme;

  defineTheme(config, target);

  if (!target) {
    return config;
  }

  if (options.name && options.setAttribute !== false) {
    target.setAttribute(attribute, options.name);
  }

  if (options.colorScheme && options.setColorScheme !== false) {
    target.style.colorScheme = options.colorScheme;
  }

  return config;
};

export const getSystemThemeMode = (): SystemThemeMode => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export interface FollowSystemThemeOptions extends Omit<ApplyThemeOptions, 'name' | 'colorScheme'> {
  /** Theme name for dark mode (default: 'dark'). */
  darkName?: string;
  /** Theme name for light mode (default: 'light'). */
  lightName?: string;
}

/**
 * Follow `prefers-color-scheme` and apply the provided themes.
 *
 * This package does NOT ship a light theme preset; you supply both themes.
 * Returns a cleanup function to remove the media query listener.
 */
export const followSystemTheme = (
  themes: { dark: ThemeConfig; light: ThemeConfig },
  options: FollowSystemThemeOptions = {}
): (() => void) => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  const media = window.matchMedia('(prefers-color-scheme: light)');
  const apply = (): void => {
    const mode: SystemThemeMode = media.matches ? 'light' : 'dark';
    const theme = mode === 'light' ? themes.light : themes.dark;

    applyTheme(theme, {
      ...options,
      name: mode === 'light' ? (options.lightName ?? 'light') : (options.darkName ?? 'dark'),
      colorScheme: mode
    });
  };

  apply();

  media.addEventListener('change', apply);
  return () => media.removeEventListener('change', apply);
};
