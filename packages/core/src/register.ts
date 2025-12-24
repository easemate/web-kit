/**
 * Side-effect import that registers all custom elements.
 * Use this for browser environments where you want all components available immediately.
 *
 * @example
 * ```ts
 * import '@easemate/web-kit/register';
 * ```
 */

// JSX type augmentation - export a non-empty type to force TS to include the module
// This ensures JSX types are available when this module is imported
export type { EaseElements as WebKitJSXElements } from './react/jsx';

// Elements (side-effects - each imports and registers its custom element)
import './elements/button';
import './elements/checkbox';
import './elements/color';
import './elements/color/picker';
import './elements/dropdown';
import './elements/field';
import './elements/icons';
import './elements/input';
import './elements/logo';
import './elements/monitor';
import './elements/monitor/fps';
import './elements/number';
import './elements/origin';
import './elements/panel';
import './elements/popover';
import './elements/radio';
import './elements/radio/input';
import './elements/radio/option';
import './elements/slider';
import './elements/state';
import './elements/toggle';
import './elements/tooltip';

// Components (advanced elements)
import './components/code';
import './components/curve';
