/**
 * Font loading utilities.
 */

import { isBrowser } from './style-inject';

const FONT_LINK_ID_PREFIX = 'ease-webkit-font-';
const PRECONNECT_ID = 'ease-webkit-preconnect-google';

/**
 * Font source configuration.
 */
export interface FontSource {
  /** Source type */
  source: 'google' | 'css';
  /** For Google fonts: the family name */
  family?: string;
  /** For Google fonts: the css2 query params (e.g., 'wght@400..700') */
  css2?: string;
  /** For CSS source: the URL to the CSS file */
  url?: string;
}

/**
 * Font configuration map.
 */
export type FontConfig = Record<string, FontSource>;

/**
 * Default fonts used by the kit.
 */
export const DEFAULT_FONTS: FontConfig = {
  'Instrument Sans': {
    source: 'google',
    family: 'Instrument Sans',
    css2: 'opsz,wght@14..32,400..700'
  },
  'Geist Mono': {
    source: 'google',
    family: 'Geist Mono',
    css2: 'wght@100..900'
  }
};

/**
 * Generate a Google Fonts URL.
 */
function buildGoogleFontUrl(family: string, css2?: string): string {
  const encodedFamily = encodeURIComponent(family).replace(/%20/g, '+');
  const params = css2 ? `:${css2}` : '';
  return `https://fonts.googleapis.com/css2?family=${encodedFamily}${params}&display=swap`;
}

/**
 * Inject preconnect links for Google Fonts.
 */
function injectPreconnect(): void {
  if (!isBrowser()) {
    return;
  }

  // Check if already added
  if (document.getElementById(PRECONNECT_ID)) {
    return;
  }

  const head = document.head;

  // preconnect to fonts.googleapis.com
  const preconnect1 = document.createElement('link');
  preconnect1.id = PRECONNECT_ID;
  preconnect1.rel = 'preconnect';
  preconnect1.href = 'https://fonts.googleapis.com';
  head.appendChild(preconnect1);

  // preconnect to fonts.gstatic.com
  const preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect';
  preconnect2.href = 'https://fonts.gstatic.com';
  preconnect2.crossOrigin = 'anonymous';
  head.appendChild(preconnect2);
}

/**
 * Inject a font link.
 */
function injectFontLink(id: string, url: string): HTMLLinkElement | null {
  if (!isBrowser()) {
    return null;
  }

  const fullId = FONT_LINK_ID_PREFIX + id;

  // Check if already injected
  let link = document.getElementById(fullId) as HTMLLinkElement | null;
  if (link) {
    return link;
  }

  link = document.createElement('link');
  link.id = fullId;
  link.rel = 'stylesheet';
  link.href = url;

  document.head.appendChild(link);
  return link;
}

/**
 * Remove a font link.
 */
function removeFontLink(id: string): void {
  if (!isBrowser()) {
    return;
  }

  const fullId = FONT_LINK_ID_PREFIX + id;
  const link = document.getElementById(fullId);
  if (link) {
    link.remove();
  }
}

/**
 * Inject fonts based on configuration.
 */
export function injectFonts(config: FontConfig | 'default' | false, preconnect = true): void {
  if (config === false) {
    return;
  }

  const fonts = config === 'default' ? DEFAULT_FONTS : config;

  if (preconnect) {
    // Check if any Google fonts are being loaded
    const hasGoogleFonts = Object.values(fonts).some((f) => f.source === 'google');
    if (hasGoogleFonts) {
      injectPreconnect();
    }
  }

  for (const [name, source] of Object.entries(fonts)) {
    const id = name.toLowerCase().replace(/\s+/g, '-');

    if (source.source === 'google' && source.family) {
      const url = buildGoogleFontUrl(source.family, source.css2);
      injectFontLink(id, url);
    } else if (source.source === 'css' && source.url) {
      injectFontLink(id, source.url);
    }
  }
}

/**
 * Remove all injected fonts.
 */
export function removeFonts(config: FontConfig | 'default'): void {
  const fonts = config === 'default' ? DEFAULT_FONTS : config;

  for (const name of Object.keys(fonts)) {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    removeFontLink(id);
  }
}
