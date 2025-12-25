/**
 * Component loader map for dynamic imports.
 * Maps tag names to their module paths for selective/lazy loading.
 */

/**
 * All root-level web-kit element tags (excludes internal sub-components).
 */
export const WEB_KIT_ELEMENT_TAGS = [
  // Controls
  'ease-button',
  'ease-checkbox',
  'ease-color-input',
  'ease-color-picker',
  'ease-dropdown',
  'ease-input',
  'ease-number-input',
  'ease-origin',
  'ease-radio-group',
  'ease-radio-input',
  'ease-slider',
  'ease-toggle',

  // Layout
  'ease-field',
  'ease-panel',
  'ease-popover',
  'ease-state',
  'ease-tooltip',

  // Display
  'ease-logo-loader',
  'ease-monitor',
  'ease-monitor-fps',

  // Icons
  'ease-icon-anchor-add',
  'ease-icon-anchor-remove',
  'ease-icon-arrow-up',
  'ease-icon-arrows-vertical',
  'ease-icon-bezier',
  'ease-icon-bezier-angle',
  'ease-icon-bezier-distribute',
  'ease-icon-bezier-length',
  'ease-icon-bezier-mirror',
  'ease-icon-check',
  'ease-icon-chevron',
  'ease-icon-circle-arrow-left',
  'ease-icon-circle-arrow-right',
  'ease-icon-clear',
  'ease-icon-code',
  'ease-icon-dots',
  'ease-icon-grid',
  'ease-icon-loading',
  'ease-icon-mention',
  'ease-icon-minus',
  'ease-icon-picker',
  'ease-icon-plus',
  'ease-icon-settings',
  'ease-icon-snap'
] as const;

/**
 * Advanced component tags (curve, code editor, etc.)
 */
export const WEB_KIT_COMPONENT_TAGS = ['ease-curve', 'ease-code'] as const;

/**
 * All public web-kit tags.
 */
export const WEB_KIT_ALL_TAGS = [...WEB_KIT_ELEMENT_TAGS, ...WEB_KIT_COMPONENT_TAGS] as const;

/**
 * Union type of all element tag names.
 */
export type WebKitElementTag = (typeof WEB_KIT_ELEMENT_TAGS)[number];

/**
 * Union type of all component tag names.
 */
export type WebKitComponentTag = (typeof WEB_KIT_COMPONENT_TAGS)[number];

/**
 * Union type of all public tag names.
 */
export type WebKitTag = (typeof WEB_KIT_ALL_TAGS)[number];

/**
 * Internal/sub-component tags that are auto-registered with their parents.
 */
export const WEB_KIT_INTERNAL_TAGS = [
  'ease-curve-canvas',
  'ease-curve-canvas-controls',
  'ease-curve-controls',
  'ease-curve-output',
  'ease-curve-toolbar',
  'radio-option'
] as const;

/**
 * Map of tag names to their loader functions.
 * These use dynamic imports so we only load what's needed.
 */
export const COMPONENT_LOADERS: Record<WebKitTag, () => Promise<unknown>> = {
  // Controls
  'ease-button': () => import('../elements/button'),
  'ease-checkbox': () => import('../elements/checkbox'),
  'ease-color-input': () => import('../elements/color'),
  'ease-color-picker': () => import('../elements/color/picker'),
  'ease-dropdown': () => import('../elements/dropdown'),
  'ease-input': () => import('../elements/input'),
  'ease-number-input': () => import('../elements/number'),
  'ease-origin': () => import('../elements/origin'),
  'ease-radio-group': () => import('../elements/radio'),
  'ease-radio-input': () => import('../elements/radio/input'),
  'ease-slider': () => import('../elements/slider'),
  'ease-toggle': () => import('../elements/toggle'),

  // Layout
  'ease-field': () => import('../elements/field'),
  'ease-panel': () => import('../elements/panel'),
  'ease-popover': () => import('../elements/popover'),
  'ease-state': () => import('../elements/state'),
  'ease-tooltip': () => import('../elements/tooltip'),

  // Display
  'ease-logo-loader': () => import('../elements/logo'),
  'ease-monitor': () => import('../elements/monitor'),
  'ease-monitor-fps': () => import('../elements/monitor/fps'),

  // Icons
  'ease-icon-anchor-add': () => import('../elements/icons/interface/anchor-add'),
  'ease-icon-anchor-remove': () => import('../elements/icons/interface/anchor-remove'),
  'ease-icon-arrow-up': () => import('../elements/icons/interface/arrow-up'),
  'ease-icon-arrows-vertical': () => import('../elements/icons/interface/arrows-vertical'),
  'ease-icon-bezier': () => import('../elements/icons/interface/bezier'),
  'ease-icon-bezier-angle': () => import('../elements/icons/interface/bezier-angle'),
  'ease-icon-bezier-distribute': () => import('../elements/icons/interface/bezier-distribute'),
  'ease-icon-bezier-length': () => import('../elements/icons/interface/bezier-length'),
  'ease-icon-bezier-mirror': () => import('../elements/icons/interface/bezier-mirror'),
  'ease-icon-check': () => import('../elements/icons/interface/check'),
  'ease-icon-chevron': () => import('../elements/icons/animation/chevron'),
  'ease-icon-circle-arrow-left': () => import('../elements/icons/interface/circle-arrow-left'),
  'ease-icon-circle-arrow-right': () => import('../elements/icons/interface/circle-arrow-right'),
  'ease-icon-clear': () => import('../elements/icons/animation/clear'),
  'ease-icon-code': () => import('../elements/icons/interface/code'),
  'ease-icon-dots': () => import('../elements/icons/interface/dots'),
  'ease-icon-grid': () => import('../elements/icons/animation/grid'),
  'ease-icon-loading': () => import('../elements/icons/animation/loading'),
  'ease-icon-mention': () => import('../elements/icons/interface/mention'),
  'ease-icon-minus': () => import('../elements/icons/interface/minus'),
  'ease-icon-picker': () => import('../elements/icons/interface/picker'),
  'ease-icon-plus': () => import('../elements/icons/interface/plus'),
  'ease-icon-settings': () => import('../elements/icons/interface/settings'),
  'ease-icon-snap': () => import('../elements/icons/animation/snap'),

  // Advanced components
  'ease-curve': () => import('../components/curve'),
  'ease-code': () => import('../components/code')
};

/**
 * Load specific components by tag name.
 */
export async function loadComponents(tags: readonly WebKitTag[]): Promise<void> {
  const promises = tags.map((tag) => {
    const loader = COMPONENT_LOADERS[tag];
    if (loader) {
      return loader();
    }
    return Promise.resolve();
  });
  await Promise.all(promises);
}

/**
 * Load all components.
 * Uses the individual component loaders to ensure all components are registered.
 */
export async function loadAllComponents(): Promise<void> {
  await loadComponents(WEB_KIT_ALL_TAGS);
}

/**
 * Resolve which tags to load based on include/exclude options.
 */
export function resolveTags(options: { include?: readonly string[]; exclude?: readonly string[] }): WebKitTag[] {
  const { include, exclude } = options;

  // If include is specified, use those (filtered to valid tags)
  if (include && include.length > 0) {
    return include.filter((tag): tag is WebKitTag => WEB_KIT_ALL_TAGS.includes(tag as WebKitTag));
  }

  // Otherwise, start with all tags and remove excluded ones
  let tags: WebKitTag[] = [...WEB_KIT_ALL_TAGS];

  if (exclude && exclude.length > 0) {
    const excludeSet = new Set(exclude);
    tags = tags.filter((tag) => !excludeSet.has(tag));
  }

  return tags;
}
