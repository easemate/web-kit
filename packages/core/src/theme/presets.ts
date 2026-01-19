import type { ThemeConfig, ThemeVars } from './tokens';

import { defaultColors, defaultRadii, defaultSpacing, defaultTypography } from './tokens';

/**
 * Default ease UI kit CSS variables (--ease-*).
 * These are component-level design tokens that components consume.
 */
export const defaultEaseVars: ThemeVars = {
  // Typography aliases
  '--ease-font-family': 'var(--font-family)',
  '--ease-font-mono': 'var(--font-mono)',
  '--ease-font-size': 'var(--font-size)',
  '--ease-font-size-sm': '12px',
  '--ease-line-height': 'var(--font-line-height)',

  // Panel (ease-state)
  '--ease-panel-max-width': '332px',
  '--ease-panel-padding': 'var(--spacing-md)',
  '--ease-panel-radius': 'var(--radii-lg)',
  '--ease-panel-border-color': 'var(--color-white-6)',
  '--ease-panel-background': 'var(--color-gray-1000)',
  '--ease-panel-shadow': '0 0 40px 0 var(--color-white-2) inset',
  '--ease-panel-title-font-size': '14px',
  '--ease-panel-title-font-weight': '500',
  '--ease-panel-title-line-height': '24px',
  '--ease-panel-title-color': 'var(--color-blue-100)',

  // Panel additional tokens
  '--ease-panel-gap': 'var(--spacing-md)',
  '--ease-panel-headline-font-size': 'var(--ease-font-size)',
  '--ease-panel-headline-font-weight': '500',
  '--ease-panel-headline-line-height': '24px',
  '--ease-panel-headline-color': 'var(--color-blue-100)',
  '--ease-panel-header-spacing': 'var(--spacing-sm)',
  '--ease-panel-fade-size': '12px',

  // Panel tab tokens
  '--ease-panel-tab-font-size': 'var(--ease-font-size)',
  '--ease-panel-tab-font-weight': '500',
  '--ease-panel-tab-color': 'var(--color-gray-600)',
  '--ease-panel-tab-color-hover': 'var(--color-blue-100)',
  '--ease-panel-tab-color-active': 'var(--color-blue-100)',
  '--ease-panel-tab-background-active': 'var(--color-white-4)',
  '--ease-panel-tab-radius': 'var(--radii-sm)',

  // Folder (ease-folder)
  '--ease-folder-padding': 'var(--spacing-sm)',
  '--ease-folder-radius': 'var(--radii-md)',
  '--ease-folder-border-color': 'var(--color-white-4)',
  '--ease-folder-background': 'var(--color-white-1)',
  '--ease-folder-shadow': '0 0 24px 0 var(--color-white-2) inset',
  '--ease-folder-icon-color': 'var(--color-gray-0)',
  '--ease-folder-chevron-color': 'var(--color-gray-600)',
  '--ease-folder-chevron-color-hover': 'var(--color-gray-400)',
  '--ease-folder-title-font-size': 'var(--ease-font-size)',
  '--ease-folder-title-font-weight': '500',
  '--ease-folder-title-color': 'var(--color-gray-400)',
  '--ease-folder-gap': 'var(--spacing-sm)',
  '--ease-folder-fade-size': '16px',

  // Field (ease-field)
  '--ease-field-label-width': '36%',
  '--ease-field-column-gap': 'var(--spacing-md)',
  '--ease-field-row-gap': '6px',
  '--ease-field-min-height': '30px',
  '--ease-field-label-font-size': 'var(--ease-font-size-sm)',
  '--ease-field-label-color': 'var(--color-gray-600)',
  '--ease-field-label-padding-left': '4px'
};

/**
 * The complete default (dark) theme configuration.
 * Includes colors, radii, spacing, typography, and component-level --ease-* vars.
 */
export const defaultThemeConfig: ThemeConfig = {
  colors: defaultColors,
  radii: defaultRadii,
  spacing: defaultSpacing,
  typography: defaultTypography,
  vars: defaultEaseVars
};

/**
 * Default built-in theme name.
 */
export const DEFAULT_THEME_NAME = 'default' as const;

/**
 * Legacy alias for the built-in dark theme.
 */
export const DARK_THEME_ALIAS = 'dark' as const;
