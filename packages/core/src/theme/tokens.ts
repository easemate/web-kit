/**
 * Color scale levels
 */
export type ColorScale = {
  100?: string;
  200?: string;
  300?: string;
  400?: string;
  500?: string;
  600?: string;
  700?: string;
  800?: string;
  900?: string;
  1000?: string;
  1100?: string;
};

/**
 * Gray color scale with additional intermediate values
 */
export type GrayScale = ColorScale & {
  0?: string;
  825?: string;
  850?: string;
  875?: string;
};

/**
 * Alpha color variations
 */
export type AlphaColors = {
  0?: string;
  2?: string;
  4?: string;
  6?: string;
  8?: string;
  10?: string;
  12?: string;
  15?: string;
  20?: string;
  30?: string;
  40?: string;
  50?: string;
  70?: string;
  80?: string;
  90?: string;
};

/**
 * Color palette configuration
 */
export interface ColorPalette {
  /** Gray scale colors */
  gray?: GrayScale;
  /** Blue scale colors */
  blue?: ColorScale;
  /** Green scale colors */
  green?: ColorScale;
  /** Red scale colors */
  red?: ColorScale;
  /** Orange scale colors */
  orange?: ColorScale;
  /** Yellow scale colors */
  yellow?: ColorScale;
  /** Base white color */
  white?: string;
  /** Base black color */
  black?: string;
  /** White alpha variations */
  whiteAlpha?: AlphaColors;
  /** Black alpha variations */
  blackAlpha?: AlphaColors;
  /** Foreground color */
  foreground?: string;
}

/**
 * Border radius configuration
 */
export interface RadiiConfig {
  /** Small radius (4px default) */
  sm?: string;
  /** Medium radius (8px default) */
  md?: string;
  /** Large radius (12px default) */
  lg?: string;
  /** Extra large radius (16px default) */
  xl?: string;
  /** Full/pill radius */
  full?: string;
}

/**
 * Spacing configuration
 */
export interface SpacingConfig {
  /** Extra small spacing */
  xs?: string;
  /** Small spacing */
  sm?: string;
  /** Medium spacing */
  md?: string;
  /** Large spacing */
  lg?: string;
  /** Extra large spacing */
  xl?: string;
}

/**
 * Typography configuration
 */
export interface TypographyConfig {
  /** Font family for body text */
  fontFamily?: string;
  /** Font family for monospace/code */
  fontMono?: string;
  /** Base font size */
  fontSize?: string;
  /** Line height */
  lineHeight?: string;
}

/**
 * Arbitrary CSS custom properties to apply alongside the theme tokens.
 *
 * Keys may be provided with or without the `--` prefix.
 *
 * @example
 * ```ts
 * vars: {
 *   '--ease-panel-padding': '16px',
 *   'ease-field-label-width': '40%'
 * }
 * ```
 */
export type ThemeVars = Record<string, string | number | null | undefined>;

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
  /** Color palette */
  colors?: ColorPalette;
  /** Border radii */
  radii?: RadiiConfig;
  /** Spacing values */
  spacing?: SpacingConfig;
  /** Typography settings */
  typography?: TypographyConfig;
  /**
   * Extra CSS variables (component tokens, app tokens, etc).
   * This is the recommended place to set `--ease-*` variables.
   */
  vars?: ThemeVars;
}

/**
 * Default color values (oklab)
 */
export const defaultColors: Required<ColorPalette> = {
  gray: {
    0: 'oklab(98.81% 0 0)',
    100: 'oklab(97.64% 0.0004 -0.0013)',
    300: 'oklab(93.49% 0.0011 -0.0039)',
    400: 'oklab(89.52% 0.0009 -0.0068)',
    500: 'oklab(81.71% -0.0002 -0.0073)',
    600: 'oklab(65.21% -0.0019 -0.0144)',
    700: 'oklab(37.92% -0.0006 -0.0179)',
    800: 'oklab(28.45% -0.0012 -0.0118)',
    825: 'oklab(26.45% -0.0012 -0.0105)',
    850: 'oklab(24.50% -0.0012 -0.0105)',
    875: 'oklab(22.66% -0.0009 -0.0097)',
    900: 'oklab(20.68% -0.0006 -0.0065)',
    1000: 'oklab(18.81% -0.0012 -0.006)'
  },
  blue: {
    100: 'oklab(98.65% 0.0019 -0.0063)',
    200: 'oklab(97.45% 0.0057 -0.0121)',
    300: 'oklab(95.88% 0.0086 -0.0183)',
    400: 'oklab(91.21% 0.0179 -0.0399)',
    500: 'oklab(84.61% 0.0327 -0.0725)',
    600: 'oklab(76.85% 0.0462 -0.1115)',
    700: 'oklab(68.28% 0.0582 -0.1575)',
    800: 'oklab(59.36% 0.0641 -0.2083)',
    900: 'oklab(50.69% 0.0492 -0.2575)',
    1000: 'oklab(46.82% 0.0475 -0.2273)',
    1100: 'oklch(0.4013 0.171 284.66)'
  },
  green: {
    100: 'oklab(98.44% -0.009 0.0042)',
    200: 'oklab(97.57% -0.0127 0.0058)',
    300: 'oklab(96.32% -0.0176 0.0071)',
    400: 'oklab(93.66% -0.0341 0.0149)',
    500: 'oklab(89.96% -0.0529 0.0237)',
    600: 'oklab(85.44% -0.0759 0.0346)',
    700: 'oklab(80.59% -0.1005 0.0484)',
    800: 'oklab(75.87% -0.1245 0.0639)',
    900: 'oklab(71.18% -0.1439 0.0799)',
    1000: 'oklab(64.89% -0.1265 0.0677)'
  },
  red: {
    100: 'oklab(99.04% 0.0031 0.0009)',
    200: 'oklab(97.85% 0.0072 0.0022)',
    300: 'oklab(95.52% 0.0159 0.0036)',
    400: 'oklab(89.9% 0.037 0.0091)',
    500: 'oklab(82.78% 0.0664 0.0181)',
    600: 'oklab(74.46% 0.105 0.031)',
    700: 'oklab(65.73% 0.1467 0.0503)',
    800: 'oklab(58.28% 0.1811 0.0773)',
    900: 'oklab(53.11% 0.1914 0.1028)',
    1000: 'oklab(48.4% 0.1727 0.0903)'
  },
  orange: {
    100: 'oklab(99.47% 0.0009 0.0044)',
    200: 'oklab(98.95% 0.0018 0.0088)',
    300: 'oklab(97.58% 0.0073 0.0133)',
    400: 'oklab(94.81% 0.0136 0.0305)',
    500: 'oklab(90.97% 0.0248 0.0519)',
    600: 'oklab(86.55% 0.0389 0.0778)',
    700: 'oklab(81.73% 0.0568 0.1053)',
    800: 'oklab(77.05% 0.0777 0.1296)',
    900: 'oklab(72.25% 0.108 0.143)',
    1000: 'oklab(65.81% 0.092 0.1281)'
  },
  yellow: {
    100: 'oklab(99.14% 0.0004 0.0098)',
    200: 'oklab(97.98% 0.0003 0.0248)',
    300: 'oklab(96.81% -0.0002 0.0409)',
    400: 'oklab(95.68% -0.0003 0.0555)',
    500: 'oklab(91.97% 0.0002 0.102)',
    600: 'oklab(88.75% 0.0018 0.1409)',
    700: 'oklab(85.67% 0.0101 0.1648)',
    800: 'oklab(76.85% 0.0212 0.1568)'
  },
  white: 'oklab(95.14% -0.0013 -0.0186)',
  black: 'oklab(0% 0 0)',
  whiteAlpha: {
    0: 'oklab(95.14% -0.0013 -0.0186 / 0)',
    2: 'oklab(95.14% -0.0013 -0.0186 / 0.02)',
    4: 'oklab(95.14% -0.0013 -0.0186 / 0.04)',
    6: 'oklab(95.14% -0.0013 -0.0186 / 0.06)',
    8: 'oklab(95.14% -0.0013 -0.0186 / 0.08)',
    10: 'oklab(95.14% -0.0013 -0.0186 / 0.1)',
    12: 'oklab(95.14% -0.0013 -0.0186 / 0.12)',
    15: 'oklab(95.14% -0.0013 -0.0186 / 0.15)',
    20: 'oklab(95.14% -0.0013 -0.0186 / 0.2)',
    30: 'oklab(95.14% -0.0013 -0.0186 / 0.3)',
    40: 'oklab(95.14% -0.0013 -0.0186 / 0.4)',
    50: 'oklab(95.14% -0.0013 -0.0186 / 0.5)',
    70: 'oklab(95.14% -0.0013 -0.0186 / 0.7)',
    80: 'oklab(95.14% -0.0013 -0.0186 / 0.8)',
    90: 'oklab(95.14% -0.0013 -0.0186 / 0.9)'
  },
  blackAlpha: {
    0: 'oklab(0% 0 0 / 0)',
    2: 'oklab(0% 0 0 / 0.02)',
    4: 'oklab(0% 0 0 / 0.04)',
    6: 'oklab(0% 0 0 / 0.06)',
    8: 'oklab(0% 0 0 / 0.08)',
    10: 'oklab(0% 0 0 / 0.1)',
    12: 'oklab(0% 0 0 / 0.12)',
    15: 'oklab(0% 0 0 / 0.15)',
    20: 'oklab(0% 0 0 / 0.2)',
    30: 'oklab(0% 0 0 / 0.3)',
    40: 'oklab(0% 0 0 / 0.4)',
    50: 'oklab(0% 0 0 / 0.5)',
    70: 'oklab(0% 0 0 / 0.7)',
    80: 'oklab(0% 0 0 / 0.8)',
    90: 'oklab(0% 0 0 / 0.9)'
  },
  foreground: 'var(--color-gray-0)'
};

/**
 * Default border radius values
 */
export const defaultRadii: Required<RadiiConfig> = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px'
};

/**
 * Default spacing values
 */
export const defaultSpacing: Required<SpacingConfig> = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px'
};

/**
 * Default typography values
 */
export const defaultTypography: Required<TypographyConfig> = {
  fontFamily: '"Instrument Sans", system-ui, sans-serif',
  fontMono: '"Geist Mono", monospace',
  fontSize: '13px',
  lineHeight: '1.5'
};
