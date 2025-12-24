// JSX type augmentation - export a non-empty type to force TS to include the module
// This ensures JSX types are available when the package is imported (no consumer .d.ts needed)
export type { EaseElements as WebKitJSXElements } from './react/jsx';

// Components
export * from './components';
// Decorators
export * from './decorators';
// Elements (components)
export * from './elements';
// Init API
export {
  type FontConfig,
  type FontSource,
  type InitWebKitOptions,
  initWebKit,
  type LazyLoadConfig,
  type LazyLoader,
  type ReplaceConfig,
  type StylePreset,
  type StylesConfig,
  type ThemeModeConfig,
  type WebKitComponentTag,
  type WebKitController,
  type WebKitElementTag,
  type WebKitTag
} from './init';
// Theming
export * from './theme';
// Utilities
export {
  classMap,
  ifDefined,
  optionalAttribute,
  renderIf,
  renderList,
  repeat,
  styleMap,
  styleObject,
  unsafeHTML,
  when
} from './utils/template-helpers';
