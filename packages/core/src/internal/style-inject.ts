/**
 * Style injection utilities for runtime CSS application.
 */

const STYLE_ID_PREFIX = 'ease-webkit-';

/**
 * Check if we're in a browser environment.
 */
export const isBrowser = (): boolean => typeof document !== 'undefined' && typeof window !== 'undefined';

/**
 * Inject a style tag with the given CSS content.
 */
export function injectStyle(id: string, css: string, nonce?: string): HTMLStyleElement | null {
  if (!isBrowser()) {
    return null;
  }

  const fullId = STYLE_ID_PREFIX + id;

  // Check if already injected
  let style = document.getElementById(fullId) as HTMLStyleElement | null;
  if (style) {
    // Update content if different
    if (style.textContent !== css) {
      style.textContent = css;
    }
    return style;
  }

  // Create new style element
  style = document.createElement('style');
  style.id = fullId;
  style.textContent = css;

  if (nonce) {
    style.nonce = nonce;
  }

  document.head.appendChild(style);
  return style;
}

/**
 * Remove an injected style tag.
 */
export function removeStyle(id: string): void {
  if (!isBrowser()) {
    return;
  }

  const fullId = STYLE_ID_PREFIX + id;
  const style = document.getElementById(fullId);
  if (style) {
    style.remove();
  }
}

/**
 * Check if a style is already injected.
 */
export function hasStyle(id: string): boolean {
  if (!isBrowser()) {
    return false;
  }

  const fullId = STYLE_ID_PREFIX + id;
  return document.getElementById(fullId) !== null;
}

// --------------------------
// Preset styles
// --------------------------

/**
 * Minimal reset styles (box-sizing, etc.)
 */
export const RESET_CSS = `
@layer ease-reset {
  *,
  *::after,
  *::before {
    box-sizing: border-box;
    transition-timing-function: cubic-bezier(0.25, 0, 0.5, 1);
  }

  :where(html) {
    color-scheme: light dark;
    hanging-punctuation: first allow-end last;
    interpolate-size: allow-keywords;
    scroll-behavior: smooth;
    scrollbar-gutter: stable;
    text-size-adjust: none;
    -webkit-text-size-adjust: none;
    -webkit-tap-highlight-color: transparent;
    -webkit-font-smoothing: antialiased;
  }

  :where(html.translated-rtl) {
    direction: rtl;
  }

  @media (prefers-reduced-motion: reduce) {
    :where(html) {
      scroll-behavior: auto;
    }
  }

  :where(body) {
    min-block-size: 100svb;
    min-inline-size: 300px;
  }

  :where(canvas, img, picture, svg, video) {
    block-size: auto;
    border: none;
    display: block;
    max-inline-size: 100%;
  }

  :where(button) {
    cursor: pointer;
    user-select: none;
  }

  :where(textarea) {
    resize: vertical;
  }

  :where(textarea:not([rows])) {
    field-sizing: content;
  }

  :where(fieldset, iframe) {
    border: none;
  }

  :where(p, li, h1, h2, h3, h4, h5, h6) {
    overflow-wrap: break-word;
    text-wrap: pretty;
    margin: 0;
  }

  :where(abbr[title]) {
    border: none;
    text-decoration: none;
  }

  :where(cite) {
    font-style: inherit;
  }

  :where(small) {
    font-size: inherit;
  }

  :where(li, ol, ul) {
    list-style: none;
  }

  :where(nav:not([role='list'])):is(ul, li, ol, ul) {
    margin: 0;
    padding: 0;
  }

  :where(dialog, [popover]) {
    background: transparent;
    border: none;
    color: inherit;
    margin: auto;
    max-block-size: none;
    max-inline-size: none;
    position: fixed;
  }

  :where([popover]) {
    inset: auto;
  }

  :where(dialog:not([open], [popover]), [popover]:not(:popover-open)) {
    display: none;
  }

  :where([hidden]:not([hidden='until-found'])) {
    display: none;
  }
}
`.trim();

/**
 * Base body/html styles for dark theme.
 */
export const BASE_CSS = `
html,
body {
  background-color: var(--color-gray-900);
}

body {
  font-family: var(--ease-font-family, 'Instrument Sans', sans-serif);
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  font-variation-settings: 'wdth' 100;
  min-height: 100dvh;
  color: var(--color-gray-600);
}
`.trim();

/**
 * Combined main styles (reset + base).
 */
export const MAIN_CSS = `${RESET_CSS}\n\n${BASE_CSS}`;

export type StylePreset = 'reset' | 'base' | 'main';

/**
 * Get CSS content for a preset.
 */
export function getPresetCSS(preset: StylePreset): string {
  switch (preset) {
    case 'reset':
      return RESET_CSS;
    case 'base':
      return BASE_CSS;
    case 'main':
      return MAIN_CSS;
    default:
      return '';
  }
}

/**
 * Inject preset styles.
 */
export function injectPreset(preset: StylePreset, nonce?: string): HTMLStyleElement | null {
  const css = getPresetCSS(preset);
  return injectStyle(preset, css, nonce);
}

/**
 * Remove preset styles.
 */
export function removePreset(preset: StylePreset): void {
  removeStyle(preset);
}
