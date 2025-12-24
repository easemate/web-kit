# @easemate/web-kit

A modern, framework-agnostic UI kit of web components for building animation control panels.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Basic Usage](#basic-usage)
  - [Selective Loading](#selective-loading)
  - [Theme Switching](#theme-switching)
- [Components](#components)
  - [Controls](#controls)
  - [Layout & Display](#layout--display)
  - [Advanced](#advanced)
  - [Icons](#icons)
- [Usage Examples](#usage-examples)
  - [Basic Controls](#basic-controls)
  - [State Panel](#state-panel)
    - [Header Actions](#header-actions)
    - [Tabs](#tabs)
    - [Tabs with Actions](#tabs-with-actions)
    - [Footer](#footer)
  - [JavaScript Integration](#javascript-integration)
    - [Tab Control](#tab-control)
  - [Event Handling](#event-handling)
- [Configuration](#configuration)
  - [initWebKit Options](#initwebkit-options)
  - [Theme Configuration](#theme-configuration)
  - [Font Configuration](#font-configuration)
  - [Lazy Loading](#lazy-loading)
  - [Component Replacement](#component-replacement)
- [Theming](#theming)
  - [CSS Custom Properties](#css-custom-properties)
  - [JavaScript Theme API](#javascript-theme-api)
  - [Token Reference](#token-reference)
- [API Reference](#api-reference)
  - [Controller API](#controller-api)
  - [Package Exports](#package-exports)
  - [State Panel API](#state-panel-api)
- [Accessibility](#accessibility)
- [SSR Support](#ssr-support)
- [License](#license)

---

## Features

- 🎨 **Rich Component Library** — Sliders, toggles, color pickers, dropdowns, curve editors, and more
- 🌙 **Dark Theme by Default** — Beautiful dark UI with OKLAB color palette
- 🔌 **Framework Agnostic** — Works with vanilla JS, React, Vue, Svelte, or any framework
- 📦 **Tree-Shakeable** — Import only what you need
- 🎯 **TypeScript First** — Full type definitions included
- ♿ **Accessible** — ARIA attributes and keyboard navigation
- 🎭 **Customizable** — CSS custom properties and `::part` selectors for styling
- 📡 **State Aggregation** — Control panel state management with `<ease-state>`
- 🚀 **No CSS Import Required** — `initWebKit()` handles everything programmatically

---

## Installation

```bash
npm install @easemate/web-kit
# or
pnpm add @easemate/web-kit
# or
yarn add @easemate/web-kit
```

---

## Quick Start

### Basic Usage

```typescript
import { initWebKit } from '@easemate/web-kit';

// Minimal - just register components
initWebKit();

// Full setup with theme, styles, and fonts
const kit = initWebKit({
  theme: 'default',
  styles: 'main',
  fonts: 'default'
});

// Components are now registered and ready to use!
```

This single call:
- Registers all custom elements
- Applies the dark theme variables
- Injects CSS reset and base styles
- Loads the default fonts (Instrument Sans, Geist Mono)

### Selective Loading

```typescript
import { initWebKit } from '@easemate/web-kit';

// Only register specific components
initWebKit({
  include: ['ease-button', 'ease-slider', 'ease-toggle'],
  theme: 'default'
});

// Or exclude components you don't need
initWebKit({
  exclude: ['ease-curve', 'ease-code'],
  theme: 'default'
});
```

### Theme Switching

```typescript
import { initWebKit, registerTheme } from '@easemate/web-kit';

// Register a custom light theme
registerTheme('light', {
  base: null,
  config: {
    colors: {
      gray: { 900: 'oklab(98% 0 0)', 0: 'oklab(20% 0 0)' },
      foreground: 'var(--color-gray-0)'
    },
    vars: {
      '--ease-panel-background': 'white',
      '--ease-panel-border-color': 'color-mix(in oklab, black 10%, transparent)'
    }
  }
});

// Initialize with system theme detection
const kit = initWebKit({
  theme: {
    mode: 'system', // 'light', 'dark', or 'system'
    light: 'light',
    dark: 'default'
  },
  styles: 'main',
  fonts: 'default'
});

// Switch themes at runtime
kit.theme?.mode('dark');
kit.theme?.set('light');
```

---

## Components

### Controls

| Component | Tag | Description |
|-----------|-----|-------------|
| Slider | `<ease-slider>` | Range slider with min/max/step |
| Toggle | `<ease-toggle>` | Boolean switch |
| Checkbox | `<ease-checkbox>` | Checkbox input |
| Input | `<ease-input>` | Text input |
| NumberInput | `<ease-number-input>` | Numeric input with stepper |
| ColorInput | `<ease-color-input>` | Color input with picker |
| ColorPicker | `<ease-color-picker>` | Full color picker UI |
| Dropdown | `<ease-dropdown>` | Select dropdown |
| RadioGroup | `<ease-radio-group>` | Radio button group |
| RadioInput | `<ease-radio-input>` | Individual radio option |
| Origin | `<ease-origin>` | Transform origin picker |

### Layout & Display

| Component | Tag | Description |
|-----------|-----|-------------|
| State | `<ease-state>` | State aggregation panel |
| Field | `<ease-field>` | Label + control wrapper |
| Button | `<ease-button>` | Action button |
| Tooltip | `<ease-tooltip>` | Tooltip wrapper |
| Popover | `<ease-popover>` | Floating content |

### Advanced

| Component | Tag | Description |
|-----------|-----|-------------|
| Curve | `<ease-curve>` | Cubic bezier / linear easing editor |
| Code | `<ease-code>` | Syntax highlighted code |
| Monitor | `<ease-monitor>` | Value monitor display |
| MonitorFps | `<ease-monitor-fps>` | FPS counter |
| LogoLoader | `<ease-logo-loader>` | Animated logo with intro animations and loading state |

### Icons

All icon components follow the pattern `<ease-icon-*>`:

- `ease-icon-settings`, `ease-icon-dots`, `ease-icon-plus`, `ease-icon-minus`
- `ease-icon-check`, `ease-icon-chevron`, `ease-icon-code`
- `ease-icon-bezier`, `ease-icon-bezier-*` (bezier tools)
- `ease-icon-anchor-add`, `ease-icon-anchor-remove`
- And more...

---

## Usage Examples

### Basic Controls

```html
<ease-slider name="opacity" value="0.5" min="0" max="1" step="0.01"></ease-slider>
<ease-toggle name="visible" checked></ease-toggle>
<ease-color-input name="background" value="#3b82f6"></ease-color-input>
<ease-input name="label" value="Hello"></ease-input>
<ease-number-input name="count" value="42" min="0" max="100"></ease-number-input>
```

### State Panel

Basic panel with headline and controls:

```html
<ease-state>
  <span slot="headline">Animation Controls</span>
  <div slot="entry">
    <ease-field label="Duration">
      <ease-slider name="duration" value="1" min="0" max="5" step="0.1"></ease-slider>
    </ease-field>
    <ease-field label="Easing">
      <ease-dropdown name="easing" value="ease-out">
        <button slot="content" value="linear">Linear</button>
        <button slot="content" value="ease-in">Ease In</button>
        <button slot="content" value="ease-out">Ease Out</button>
        <button slot="content" value="ease-in-out">Ease In-Out</button>
      </ease-dropdown>
    </ease-field>
    <ease-field label="Loop">
      <ease-toggle name="loop"></ease-toggle>
    </ease-field>
  </div>
</ease-state>
```

#### Header Actions

Add action buttons, links, or dropdowns to the panel header using the `actions` slot:

```html
<ease-state>
  <span slot="headline">Settings</span>
  
  <!-- Action buttons -->
  <button slot="actions" title="Settings">
    <ease-icon-settings></ease-icon-settings>
  </button>
  <a slot="actions" href="/docs" title="Documentation">
    <ease-icon-code></ease-icon-code>
  </a>
  
  <!-- Dropdown menu in actions -->
  <ease-dropdown slot="actions">
    <ease-icon-dots slot="trigger"></ease-icon-dots>
    <button slot="content" value="export">Export</button>
    <button slot="content" value="import">Import</button>
    <button slot="content" value="reset">Reset</button>
  </ease-dropdown>
  
  <div slot="entry">
    <!-- controls -->
  </div>
</ease-state>
```

Action elements are automatically styled with hover states and proper spacing. Supported elements:
- `<button>` — Action button with icon
- `<a>` — Link with icon  
- `<ease-dropdown>` — Dropdown menu (auto-positioned to bottom-end)

#### Tabs

Organize controls into tabbed sections (maximum 3 tabs). When tabs are present, the headline is automatically hidden.

```html
<ease-state active-tab="0">
  <!-- Tab content uses slot="tab-{id}" pattern -->
  <!-- Tab label comes from data-tab-label attribute -->
  
  <div slot="tab-transform" data-tab-label="Transform">
    <ease-field label="X">
      <ease-number-input name="x" value="0"></ease-number-input>
    </ease-field>
    <ease-field label="Y">
      <ease-number-input name="y" value="0"></ease-number-input>
    </ease-field>
    <ease-field label="Rotation">
      <ease-slider name="rotation" value="0" min="0" max="360"></ease-slider>
    </ease-field>
  </div>
  
  <div slot="tab-style" data-tab-label="Style">
    <ease-field label="Opacity">
      <ease-slider name="opacity" value="1" min="0" max="1" step="0.01"></ease-slider>
    </ease-field>
    <ease-field label="Color">
      <ease-color-input name="color" value="#3b82f6"></ease-color-input>
    </ease-field>
  </div>
  
  <div slot="tab-animation" data-tab-label="Animation">
    <ease-field label="Duration">
      <ease-slider name="duration" value="1" min="0" max="5" step="0.1"></ease-slider>
    </ease-field>
    <ease-field label="Delay">
      <ease-slider name="delay" value="0" min="0" max="2" step="0.1"></ease-slider>
    </ease-field>
  </div>
</ease-state>
```

**Tab Attributes:**

| Attribute | Description |
|-----------|-------------|
| `slot="tab-{id}"` | Assigns content to a tab. The `id` is used internally and for events. |
| `data-tab-label` | Display label for the tab button. Falls back to `id` if not provided. |
| `active-tab` | (on `<ease-state>`) Zero-based index of the initially active tab. |

**Tab Behavior:**
- Tabs are detected automatically from slotted elements with `slot="tab-*"` pattern
- Maximum of 3 tabs supported
- Switching tabs triggers a smooth crossfade animation with height transition
- Keyboard navigation: Arrow keys, Home, End
- State is tracked per-tab (only active tab's controls are in the state object)

#### Tabs with Actions

Combine tabs and header actions:

```html
<ease-state active-tab="0">
  <!-- Actions appear to the right of tabs -->
  <button slot="actions" title="Reset">
    <ease-icon-minus></ease-icon-minus>
  </button>
  
  <div slot="tab-basic" data-tab-label="Basic">
    <!-- controls -->
  </div>
  <div slot="tab-advanced" data-tab-label="Advanced">
    <!-- controls -->
  </div>
</ease-state>
```

#### Footer

Add footer content that appears below all tab panels:

```html
<ease-state>
  <span slot="headline">Controls</span>
  <div slot="entry">
    <!-- controls -->
  </div>
  <div slot="footer">
    <ease-button>Apply</ease-button>
    <ease-button variant="secondary">Cancel</ease-button>
  </div>
</ease-state>
```

### JavaScript Integration

```typescript
const state = document.querySelector('ease-state');

// Get current state
console.log(state.state); // { duration: 1, easing: 'ease-out', loop: false }

// Get individual value
const duration = state.get('duration');

// Set value programmatically
state.set('duration', 2.5);

// Subscribe to changes
const sub = state.subscribe((value, name) => {
  console.log(`${name} changed to:`, value);
});

// Subscribe to specific control
state.subscribe('duration', (value) => {
  myAnimation.duration = value;
});

// Reset to initial values
state.reset();

// Cleanup
sub.unsubscribe();
```

#### Tab Control

```typescript
const state = document.querySelector('ease-state');

// Get current active tab index
console.log(state.activeTab); // 0

// Switch to a specific tab programmatically
state.setTab(1); // Switch to second tab (0-indexed)

// Or set directly via property
state.activeTab = 2;
```

### Logo Loader

The `<ease-logo-loader>` component displays an animated logo with intro animations and an optional loading state.

```html
<!-- Basic usage - plays wave intro on load -->
<ease-logo-loader></ease-logo-loader>

<!-- With particle intro animation -->
<ease-logo-loader intro="particle"></ease-logo-loader>

<!-- With loading state -->
<ease-logo-loader loading></ease-logo-loader>

<!-- Custom size -->
<ease-logo-loader size="48"></ease-logo-loader>
```

#### Logo Loader Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `intro` | `'wave' \| 'particle'` | `'wave'` | Intro animation variant played on mount |
| `loading` | `boolean` | `false` | When true, plays continuous loading animation |
| `size` | `number` | `36` | Size in pixels |
| `aria-label` | `string` | - | Accessible label for the logo |

#### Intro Animations

- **Wave** (default): Inner dots appear at half scale, then expand while outer dots fade in with a staggered wave effect
- **Particle**: Dots fly in from outside with curved bezier paths, rotation, and shockwave effects on impact

#### Loading Animation

When the `loading` attribute is set:
1. Inner dots scale down and pulse with a breathing effect
2. Outer dots animate in a circular wave pattern
3. Animation completes its current cycle before stopping when `loading` is removed

#### JavaScript API

```typescript
const logo = document.querySelector('ease-logo-loader');

// Toggle loading state
logo.loading = true;
logo.loading = false;

// Replay intro animation
logo.playIntro();           // Uses current intro variant
logo.playIntro('wave');     // Force wave intro
logo.playIntro('particle'); // Force particle intro
```

#### Theming

The logo uses theme color tokens:

| CSS Variable | Default | Description |
|--------------|---------|-------------|
| `--dot-dark` | `var(--color-gray-0)` | Brightest dot color (inner dots) |
| `--dot-medium` | `var(--color-gray-600)` | Medium dot color |
| `--dot-light` | `var(--color-gray-700)` | Dimmest dot color (outer dots) |
| `--dot-accent` | `var(--color-blue-600)` | Accent color for effects |

### Event Handling

All controls dispatch standard events:

```typescript
// Standard control-change event
slider.addEventListener('control-change', (e: CustomEvent) => {
  const { name, value, event } = e.detail;
  console.log(`${name}: ${value}`);
});

// State aggregator events
state.addEventListener('state-change', (e: CustomEvent) => {
  const { name, value, state } = e.detail;
  console.log('Full state:', state);
});

// Tab change event
state.addEventListener('tab-change', (e: CustomEvent) => {
  const { index, id, event } = e.detail;
  console.log(`Switched to tab ${id} (index: ${index})`);
});
```

#### Event Types

| Event | Detail | Description |
|-------|--------|-------------|
| `control-change` | `{ name, value, event }` | Fired by individual controls when value changes |
| `state-change` | `{ name, value, state, event }` | Fired by `<ease-state>` when any control changes |
| `tab-change` | `{ index, id, event }` | Fired by `<ease-state>` when active tab changes |

---

## Configuration

### initWebKit Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `include` | `string[]` | - | Only register these component tags |
| `exclude` | `string[]` | - | Register all except these tags |
| `replace` | `Record<string, Constructor \| string>` | - | Replace components with custom implementations |
| `theme` | `string \| ThemeRef \| ThemeConfig \| ThemeModeConfig` | - | Theme to apply |
| `target` | `HTMLElement` | `document.documentElement` | Element to scope theme vars to |
| `styles` | `false \| 'reset' \| 'base' \| 'main'` | `false` | Inject global styles |
| `fonts` | `false \| 'default' \| FontConfig` | `false` | Font loading configuration |
| `lazyLoad` | `boolean \| LazyLoadConfig` | `false` | Enable lazy component loading |
| `cspNonce` | `string` | - | CSP nonce for injected elements |
| `dev` | `{ warnUnknownTags?: boolean; logLoads?: boolean }` | - | Development options |

### Theme Configuration

```typescript
// Theme mode configuration for light/dark switching
interface ThemeModeConfig {
  mode: 'light' | 'dark' | 'system';
  light: ThemeInput;
  dark: ThemeInput;
  persist?: { key: string }; // Coming soon
}

// Custom theme registration
import { initWebKit, registerTheme } from '@easemate/web-kit';

const brandTheme = registerTheme('brand', {
  base: 'default', // Inherit from default
  config: {
    typography: {
      fontFamily: '"Inter", system-ui, sans-serif'
    },
    vars: {
      '--ease-panel-radius': '16px',
      '--ease-panel-padding': '16px'
    }
  }
});

initWebKit({ theme: brandTheme });
```

### Font Configuration

```typescript
// Use default fonts (Instrument Sans, Geist Mono)
fonts: 'default'

// Custom Google fonts
fonts: {
  'Inter': { source: 'google', family: 'Inter', css2: 'wght@400..700' },
  'JetBrains Mono': { source: 'google', family: 'JetBrains Mono' }
}

// Self-hosted fonts
fonts: {
  'Custom Font': { source: 'css', url: '/fonts/custom.css' }
}
```

### Lazy Loading

```typescript
initWebKit({
  lazyLoad: true, // Auto-define components when they appear in DOM
  theme: 'default'
});

// Advanced lazy loading
initWebKit({
  lazyLoad: {
    strategy: 'mutation',
    include: ['ease-slider', 'ease-toggle'],
    preload: ['ease-button'] // Load immediately
  }
});
```

### Component Replacement

```typescript
import { initWebKit } from '@easemate/web-kit';
import { CustomInput } from './custom-input';

initWebKit({
  replace: {
    'ease-input': CustomInput, // Your custom element class
    // or alias to another tag:
    // 'ease-input': 'my-custom-input'
  },
  theme: 'default'
});
```

---

## Theming

### CSS Custom Properties

All components use CSS custom properties. Override them at any scope:

```css
:root {
  --ease-panel-padding: 16px;
  --ease-panel-radius: 14px;
  --ease-button-radius: 8px;
}

/* Or scope to specific containers */
.my-panel {
  --ease-panel-background: var(--my-bg);
}
```

Multiple themes using `data-ease-theme`:

```css
:root[data-ease-theme='dark'] {
  --ease-panel-background: var(--color-gray-1000);
}

:root[data-ease-theme='light'] {
  --ease-panel-background: white;
}
```

### JavaScript Theme API

```typescript
import { applyTheme, createTheme, mergeTheme, setThemeName } from '@easemate/web-kit/theme';

// Merge with defaults
const theme = mergeTheme({
  vars: { '--ease-panel-padding': '16px' }
});

// Apply to document
applyTheme(theme, { name: 'custom', colorScheme: 'dark' });

// Generate CSS string
const css = createTheme(theme, ':root[data-ease-theme="custom"]');

// Switch theme name
setThemeName('light', { colorScheme: 'light' });
```

### Token Reference

#### Global Tokens

| Category | Variables |
|----------|-----------|
| Colors | `--color-gray-*`, `--color-blue-*`, `--color-green-*`, `--color-red-*`, `--color-orange-*`, `--color-yellow-*` |
| Radii | `--radii-sm`, `--radii-md`, `--radii-lg`, `--radii-xl`, `--radii-full` |
| Spacing | `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl` |
| Typography | `--font-family`, `--font-mono`, `--font-size`, `--font-line-height` |

#### UI Kit Tokens (`--ease-*`)

| Category | Variables |
|----------|-----------|
| Typography | `--ease-font-family`, `--ease-font-mono`, `--ease-font-size`, `--ease-line-height` |
| Panel | `--ease-panel-max-width`, `--ease-panel-padding`, `--ease-panel-radius`, `--ease-panel-background`, `--ease-panel-border-color`, `--ease-panel-shadow` |
| Panel Title | `--ease-panel-title-font-size`, `--ease-panel-title-font-weight`, `--ease-panel-title-line-height`, `--ease-panel-title-color` |
| Panel Tabs | `--ease-panel-tab-font-size`, `--ease-panel-tab-font-weight`, `--ease-panel-tab-line-height`, `--ease-panel-tab-color`, `--ease-panel-tab-color-hover`, `--ease-panel-tab-color-active`, `--ease-panel-tab-background-active`, `--ease-panel-tab-radius` |
| Panel Actions | `--ease-panel-action-icon-size` |
| Panel Footer | `--ease-panel-footer-padding` |
| State Transitions | `--ease-state-transition-duration`, `--ease-state-transition-easing` |
| Field | `--ease-field-label-width`, `--ease-field-column-gap`, `--ease-field-row-gap` |
| Controls | Each control exposes `--ease-<component>-*` tokens |

---

## API Reference

### Controller API

`initWebKit()` returns a controller object:

```typescript
interface WebKitController {
  dispose: () => void;           // Cleanup all injected resources
  ready: Promise<void>;          // Resolves when components are loaded
  theme?: {
    set: (theme) => void;        // Set theme by name/ref/config
    mode?: (mode) => void;       // Set mode (light/dark/system)
  };
}
```

### Package Exports

| Export | Description |
|--------|-------------|
| `@easemate/web-kit` | Main entry (initWebKit + theme + types) |
| `@easemate/web-kit/register` | Side-effect registration (all components) |
| `@easemate/web-kit/elements` | UI components only |
| `@easemate/web-kit/decorators` | Component decorators |
| `@easemate/web-kit/theme` | Theming utilities |
| `@easemate/web-kit/utils` | Utility functions |
| `@easemate/web-kit/styles/*` | CSS assets (optional) |

### State Panel API

The `<ease-state>` component provides a complete API for state management.

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `string \| null` | `null` | Legacy: reflects the last changed control's value |
| `activeTab` | `number` | `0` | Zero-based index of the active tab |
| `state` | `Record<string, unknown>` | `{}` | Read-only object containing all control values |

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `(name: string) => unknown` | Get a specific control value by name |
| `set` | `(name: string, value: unknown) => void` | Set a control value programmatically |
| `subscribe` | `(callback: (value, name) => void) => { unsubscribe }` | Subscribe to all state changes |
| `subscribe` | `(name: string, callback: (value, name) => void) => { unsubscribe }` | Subscribe to a specific control |
| `reset` | `() => void` | Reset all controls to their initial values |
| `setTab` | `(index: number) => void` | Switch to a specific tab by index |

#### Slots

| Slot | Description |
|------|-------------|
| `headline` | Panel title text (hidden when tabs are present) |
| `actions` | Header action buttons, links, or dropdowns |
| `entry` | Main content area (used when no tabs) |
| `tab-{id}` | Tab panel content (use `data-tab-label` for display name) |
| `footer` | Footer content below all panels |

#### CSS Parts

| Part | Description |
|------|-------------|
| `section` | Outer container |
| `header` | Header row containing headline/tabs and actions |
| `headline` | Title element |
| `tabs` | Tab button container |
| `tab` | Individual tab button |
| `actions` | Actions container |
| `content` | Content wrapper (handles height animations) |
| `form` | Inner form container |
| `tab-panel` | Individual tab panel |
| `footer` | Footer container |

#### Events

| Event | Detail Type | Description |
|-------|-------------|-------------|
| `state-change` | `StateChangeEventDetail` | Fired when any control value changes |
| `tab-change` | `TabChangeEventDetail` | Fired when the active tab changes |

```typescript
interface StateChangeEventDetail {
  name: string;              // Control name
  value: unknown;            // New value
  state: Record<string, unknown>; // Complete state object
  event: Event;              // Original event
}

interface TabChangeEventDetail {
  index: number;             // Tab index (0-based)
  id: string;                // Tab id from slot name
  event: Event;              // Original event
}
```

---

## Accessibility

Components include:
- ARIA attributes (`role`, `aria-*`)
- Keyboard navigation (Tab, Arrow keys, Enter, Escape)
- Focus management
- Screen reader support
- `disabled` state handling

---

## SSR Support

The package is SSR-safe. `initWebKit()` is a no-op in server environments:

```typescript
import { initWebKit } from '@easemate/web-kit';

// Safe on server - returns immediately without side effects
const kit = initWebKit({ theme: 'default' });
await kit.ready; // Resolves immediately on server
```

---

## License

MIT © [Aaron Iker](https://github.com/aaroniker)
