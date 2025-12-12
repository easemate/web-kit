import {
  type ColorPalette,
  defaultColors,
  defaultRadii,
  defaultSpacing,
  defaultTypography,
  type RadiiConfig,
  type SpacingConfig,
  type ThemeConfig,
  type TypographyConfig
} from './tokens';

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
export const defineTheme = (config: ThemeConfig, element: HTMLElement = document.documentElement): void => {
  const vars = generateThemeVars(config);

  for (const [name, value] of Object.entries(vars)) {
    element.style.setProperty(name, value);
  }
};

/**
 * Remove theme configuration from an element
 *
 * @param config - Theme configuration object (to know which variables to remove)
 * @param element - Target element (default: document.documentElement)
 */
export const removeTheme = (config: ThemeConfig, element: HTMLElement = document.documentElement): void => {
  const vars = generateThemeVars(config);

  for (const name of Object.keys(vars)) {
    element.style.removeProperty(name);
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
export const getThemeValue = (token: string, element: HTMLElement = document.documentElement): string => {
  const varName = token.startsWith('--') ? token : `--${token}`;
  return getComputedStyle(element).getPropertyValue(varName).trim();
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
export const setThemeValue = (token: string, value: string, element: HTMLElement = document.documentElement): void => {
  const varName = token.startsWith('--') ? token : `--${token}`;
  element.style.setProperty(varName, value);
};

/**
 * Create a complete theme with defaults merged
 *
 * @param overrides - Partial theme configuration to merge with defaults
 * @returns Complete theme configuration
 *
 * @example
 * ```typescript
 * const theme = mergeTheme({
 *   colors: {
 *     blue: { 500: '#custom-blue' }
 *   }
 * });
 * // All other default values are preserved
 * ```
 */
export const mergeTheme = (overrides: ThemeConfig): ThemeConfig => {
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
    typography: { ...defaultTypography, ...overrides.typography }
  };
};

/**
 * Create a dark theme variant
 * Utility to swap light/dark color mappings
 *
 * @example
 * ```typescript
 * defineTheme(createDarkTheme({
 *   colors: {
 *     foreground: 'var(--color-white)'
 *   }
 * }));
 * ```
 */
export const createDarkTheme = (overrides: ThemeConfig = {}): ThemeConfig =>
  mergeTheme({
    ...overrides,
    colors: {
      foreground: 'var(--color-gray-0)',
      ...overrides.colors
    }
  });

/**
 * Create a light theme variant
 *
 * @example
 * ```typescript
 * defineTheme(createLightTheme({
 *   colors: {
 *     foreground: 'var(--color-gray-900)'
 *   }
 * }));
 * ```
 */
export const createLightTheme = (overrides: ThemeConfig = {}): ThemeConfig =>
  mergeTheme({
    ...overrides,
    colors: {
      foreground: 'var(--color-gray-900)',
      gray: {
        0: 'oklab(18.81% -0.0012 -0.006)',
        100: 'oklab(20.68% -0.0006 -0.0065)',
        300: 'oklab(24.50% -0.0012 -0.0105)',
        400: 'oklab(28.45% -0.0012 -0.0118)',
        500: 'oklab(37.92% -0.0006 -0.0179)',
        600: 'oklab(65.21% -0.0019 -0.0144)',
        700: 'oklab(81.71% -0.0002 -0.0073)',
        800: 'oklab(89.52% 0.0009 -0.0068)',
        825: 'oklab(91.49% 0.0011 -0.0039)',
        850: 'oklab(93.49% 0.0011 -0.0039)',
        875: 'oklab(95.64% 0.0004 -0.0013)',
        900: 'oklab(97.64% 0.0004 -0.0013)',
        1000: 'oklab(98.81% 0 0)'
      },
      ...overrides.colors
    }
  });
