<h1>@easemate/web-kit</h1>

<div align="center">
  <img src="https://easemate.app/easemate-web-kit-header.png" alt="@easemate/web-kit" />
</div>

<br />

A modern, framework-agnostic UI kit of web components for building animation control panels.

<div>

[![npm version](https://img.shields.io/npm/v/@easemate/web-kit.svg?style=flat-square)](https://www.npmjs.com/package/@easemate/web-kit)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/%40easemate%2Fweb-kit?format=minzip)
[![npm downloads](https://img.shields.io/npm/dm/@easemate/web-kit.svg?style=flat-square)](https://www.npmjs.com/package/@easemate/web-kit)
[![license](https://img.shields.io/npm/l/@easemate/web-kit.svg?style=flat-square)](https://github.com/easemate/web-kit/blob/main/LICENSE)

</div>

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Basic Usage](#basic-usage)
  - [Selective Loading](#selective-loading)
  - [Theme Switching](#theme-switching)
- [React & Next.js](#react--nextjs)
  - [JSX Types](#jsx-types)
  - [Basic Setup](#basic-setup)
  - [Next.js App Router](#nextjs-app-router)
  - [useWebKit Hook](#usewebkit-hook)
  - [useEaseState Hook](#useeasestate-hook)
  - [WebKit Provider](#webkit-provider)
  - [Event Utilities](#event-utilities)
- [Components](#components)
  - [Controls](#controls)
  - [Layout & Display](#layout--display)
  - [Advanced](#advanced)
  - [Icons](#icons)
- [Usage Examples](#usage-examples)
  - [Basic Controls](#basic-controls)
  - [Panel Component](#panel-component)
  - [State Component](#state-component)
  - [Combined Panel + State](#combined-panel--state)
  - [JavaScript Integration](#javascript-integration)
  - [Event Handling](#event-handling)
- [Configuration](#configuration)
  - [initWebKit Options](#initwebkit-options)
  - [Theme Configuration](#theme-configuration)
    - [Custom Theme Registration](#custom-theme-registration)
    - [Theme Inheritance](#theme-inheritance)
    - [Creating a Theme from Scratch](#creating-a-theme-from-scratch)
    - [Theme Utilities](#theme-utilities)
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
  - [Panel API](#panel-api)
  - [State API](#state-api)
- [Accessibility](#accessibility)
- [SSR Support](#ssr-support)
- [License](#license)

---

## Features

- **Rich Component Library** - Sliders, toggles, color pickers, dropdowns, curve editors, and more
- **Dark Theme by Default** - Beautiful dark UI with OKLAB color palette
- **Framework Agnostic** - Works with vanilla JS, React, Vue, Svelte, or any framework
- **React/Next.js Ready** - First-class React integration with hooks and SSR support
- **Tree-Shakeable** - Import only what you need
- **TypeScript First** - Full type definitions included
- **Accessible** - ARIA attributes and keyboard navigation
- **Customizable** - CSS custom properties and `::part` selectors for styling
- **State Aggregation** - Control panel state management with `<ease-state>`
- **Flexible Layout** - Separate `<ease-panel>` and `<ease-state>` for maximum flexibility
- **No CSS Import Required** - `initWebKit()` handles everything programmatically

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

## React & Next.js

The library provides first-class React integration via `@easemate/web-kit/react`.

### JSX Types

Importing `@easemate/web-kit/react` automatically adds JSX types for all `ease-*` custom elements:

```tsx
import '@easemate/web-kit/react';

// Now ease-* elements are typed in JSX
<ease-panel>
  <ease-slider name="volume" value={50} />
</ease-panel>
```

You can also import just the JSX types separately:

```tsx
import '@easemate/web-kit/react/jsx';
```

### Basic Setup

```tsx
// app/providers.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { initWebKit, type WebKitController } from '@easemate/web-kit';

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const controllerRef = useRef<WebKitController | null>(null);

  useEffect(() => {
    const controller = initWebKit({
      theme: 'default',
      styles: 'main',
      fonts: 'default'
    });
    controllerRef.current = controller;
    controller.ready.then(() => setReady(true));

    return () => controller.dispose();
  }, []);

  return <>{children}</>;
}
```

### Next.js App Router

For Next.js 13+ with App Router, create a client component wrapper:

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### useWebKit Hook

The `useWebKit` hook initializes the web kit and tracks readiness:

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useWebKit } from '@easemate/web-kit/react';

function App() {
  const { ready, theme, dispose } = useWebKit(
    {
      theme: 'default',
      styles: 'main',
      fonts: 'default',
      skip: false // Optional: skip initialization
    },
    { useState, useEffect, useRef }
  );

  if (!ready) return <div>Loading...</div>;

  return (
    <ease-panel>
      <ease-slider name="value" value="0.5" />
    </ease-panel>
  );
}
```

The hook manages a singleton controller internally, so multiple components using `useWebKit` will share the same initialization.

### useEaseState Hook

The `useEaseState` hook provides reactive state management for controls:

```tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import { useEaseState } from '@easemate/web-kit/react';

interface AnimationState {
  duration: number;
  easing: string;
  loop: boolean;
}

function AnimationControls() {
  const {
    stateRef,
    panelRef,
    state,
    get,
    set,
    reset,
    setTab,
    activeTab
  } = useEaseState<AnimationState>(
    {
      initialState: { duration: 1, easing: 'ease-out', loop: false },
      onChange: ({ name, value }) => {
        console.log(`${name} changed to ${value}`);
      },
      onTabChange: ({ index }) => {
        console.log(`Switched to tab ${index}`);
      }
    },
    { useState, useCallback, useRef }
  );

  return (
    <ease-panel ref={panelRef}>
      <span slot="headline">Animation</span>
      <ease-state ref={stateRef}>
        <ease-field label="Duration">
          <ease-slider name="duration" value="1" min="0" max="5" step="0.1" />
        </ease-field>
        <ease-field label="Easing">
          <ease-dropdown name="easing" value="ease-out">
            <button slot="content" value="linear">Linear</button>
            <button slot="content" value="ease-out">Ease Out</button>
          </ease-dropdown>
        </ease-field>
        <ease-field label="Loop">
          <ease-toggle name="loop" />
        </ease-field>
      </ease-state>
      <div slot="footer">
        <ease-button onClick={() => reset()}>Reset</ease-button>
      </div>
    </ease-panel>
  );
}
```

#### useEaseState Return Values

| Property | Type | Description |
|----------|------|-------------|
| `stateRef` | `(element: EaseStateRef \| null) => void` | Ref callback for `<ease-state>` |
| `panelRef` | `(element: EasePanelRef \| null) => void` | Ref callback for `<ease-panel>` |
| `state` | `T` | Current state values (reactive) |
| `get` | `(name: keyof T) => T[keyof T]` | Get a specific control value |
| `set` | `(name: keyof T, value: T[keyof T]) => void` | Set a control value |
| `reset` | `() => void` | Reset all controls to initial values |
| `setTab` | `(index: number) => void` | Switch panel tab |
| `activeTab` | `number` | Current active tab index |

### WebKit Provider

For apps needing shared context, use `createWebKitProvider`:

```tsx
// providers.tsx
'use client';

import * as React from 'react';
import { createWebKitProvider } from '@easemate/web-kit/react';

const { WebKitProvider, useWebKitContext } = createWebKitProvider(React);

export { WebKitProvider, useWebKitContext };
```

```tsx
// layout.tsx
import { WebKitProvider } from './providers';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <WebKitProvider
      options={{ theme: 'default', styles: 'main', fonts: 'default' }}
      immediate={true} // Render children before ready (default: true)
    >
      {children}
    </WebKitProvider>
  );
}
```

```tsx
// component.tsx
import { useWebKitContext } from './providers';

function MyComponent() {
  const { ready, theme } = useWebKitContext();

  if (!ready) return <div>Loading...</div>;

  return <ease-slider name="value" value="0.5" />;
}
```

### Event Utilities

The React module exports typed event creators:

```tsx
import { createEventHandler, type ControlChangeEvent, type StateChangeEvent, type TabChangeEvent } from '@easemate/web-kit/react';

// Create typed event handlers
const handleChange = createEventHandler<ControlChangeEvent>((e) => {
  console.log(e.detail.name, e.detail.value);
});
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
| Panel | `<ease-panel>` | Visual container with tabs, header, and footer |
| State | `<ease-state>` | State aggregator for controls (no visual styling) |
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

### Panel Component

The `<ease-panel>` component provides the visual container with optional tabs, header actions, and footer. It does NOT manage state - use `<ease-state>` for that.

```html
<!-- Simple panel with headline -->
<ease-panel>
  <span slot="headline">Settings</span>
  <div>
    <!-- Your content here -->
  </div>
</ease-panel>

<!-- Panel with tabs -->
<ease-panel active-tab="0">
  <div slot="tab-general" data-tab-label="General">
    <!-- General settings -->
  </div>
  <div slot="tab-advanced" data-tab-label="Advanced">
    <!-- Advanced settings -->
  </div>
</ease-panel>

<!-- Panel with header actions -->
<ease-panel>
  <span slot="headline">Controls</span>
  <button slot="actions" title="Settings">
    <ease-icon-settings></ease-icon-settings>
  </button>
  <div>
    <!-- Content -->
  </div>
  <div slot="footer">
    <ease-button>Save</ease-button>
  </div>
</ease-panel>
```

### State Component

The `<ease-state>` component aggregates state from child controls. It can be used standalone (no panel styling) or inside a panel.

```html
<!-- Standalone state (no panel) - useful for embedding in your own UI -->
<ease-state>
  <ease-field label="Duration">
    <ease-slider name="duration" value="1" min="0" max="5" step="0.1"></ease-slider>
  </ease-field>
  <ease-field label="Easing">
    <ease-dropdown name="easing" value="ease-out">
      <button slot="content" value="linear">Linear</button>
      <button slot="content" value="ease-out">Ease Out</button>
    </ease-dropdown>
  </ease-field>
  <ease-field label="Loop">
    <ease-toggle name="loop"></ease-toggle>
  </ease-field>
</ease-state>
```

### Combined Panel + State

For a complete control panel experience, combine `<ease-panel>` with `<ease-state>`:

```html
<ease-panel>
  <span slot="headline">Animation Controls</span>
  
  <button slot="actions" title="Reset">
    <ease-icon-minus></ease-icon-minus>
  </button>
  
  <ease-state>
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
  </ease-state>
  
  <div slot="footer">
    <ease-button>Apply</ease-button>
    <ease-button variant="secondary">Cancel</ease-button>
  </div>
</ease-panel>
```

#### Panel with Tabs + State

When using tabs with state, place the `<ease-state>` inside each tab:

```html
<ease-panel active-tab="0">
  <button slot="actions" title="Reset">
    <ease-icon-minus></ease-icon-minus>
  </button>
  
  <div slot="tab-transform" data-tab-label="Transform">
    <ease-state>
      <ease-field label="X">
        <ease-number-input name="x" value="0"></ease-number-input>
      </ease-field>
      <ease-field label="Y">
        <ease-number-input name="y" value="0"></ease-number-input>
      </ease-field>
      <ease-field label="Rotation">
        <ease-slider name="rotation" value="0" min="0" max="360"></ease-slider>
      </ease-field>
    </ease-state>
  </div>
  
  <div slot="tab-style" data-tab-label="Style">
    <ease-state>
      <ease-field label="Opacity">
        <ease-slider name="opacity" value="1" min="0" max="1" step="0.01"></ease-slider>
      </ease-field>
      <ease-field label="Color">
        <ease-color-input name="color" value="#3b82f6"></ease-color-input>
      </ease-field>
    </ease-state>
  </div>
</ease-panel>
```

### JavaScript Integration

```typescript
// Working with ease-state
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

```typescript
// Working with ease-panel
const panel = document.querySelector('ease-panel');

// Get current active tab index
console.log(panel.activeTab); // 0

// Switch to a specific tab programmatically
panel.setTab(1); // Switch to second tab (0-indexed)

// Or set directly via property
panel.activeTab = 2;
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

// Panel tab change event
panel.addEventListener('tab-change', (e: CustomEvent) => {
  const { index, id, event } = e.detail;
  console.log(`Switched to tab ${id} (index: ${index})`);
});
```

#### Event Types

| Event | Component | Detail | Description |
|-------|-----------|--------|-------------|
| `control-change` | Controls | `{ name, value, event }` | Fired when value changes |
| `state-change` | `<ease-state>` | `{ name, value, state, event }` | Fired when any control changes |
| `tab-change` | `<ease-panel>` | `{ index, id, event }` | Fired when active tab changes |

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
```

#### Custom Theme Registration

Register custom themes using `registerTheme()`. No TypeScript declaration files needed - custom theme names are fully supported:

```typescript
import { initWebKit, registerTheme } from '@easemate/web-kit';

// Register a custom theme - returns a typed theme ref
const brandTheme = registerTheme('brand', {
  base: 'default', // Inherit from built-in theme ('default' or 'dark')
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

// Use the theme ref (type-safe)
initWebKit({ theme: brandTheme });

// Or use the string name directly (also works!)
initWebKit({ theme: 'brand' });
```

#### Theme Inheritance

Themes can extend other themes using the `base` option:

```typescript
// Create a base brand theme
const brandBase = registerTheme('brand-base', {
  base: 'default',
  config: {
    typography: { fontFamily: '"Inter", sans-serif' },
    vars: { '--ease-panel-radius': '16px' }
  }
});

// Create variants that extend brand-base
const brandLight = registerTheme('brand-light', {
  base: brandBase, // Can use theme ref or string name
  config: {
    colors: {
      gray: { 900: 'oklab(98% 0 0)', 0: 'oklab(20% 0 0)' }
    },
    vars: { '--ease-panel-background': 'white' }
  }
});

const brandDark = registerTheme('brand-dark', {
  base: 'brand-base', // String name works too
  config: {
    vars: { '--ease-panel-background': 'var(--color-gray-1000)' }
  }
});

// Use with theme mode switching
initWebKit({
  theme: {
    mode: 'system',
    light: brandLight,
    dark: brandDark
  }
});
```

#### Creating a Theme from Scratch

Use `base: null` to create a theme without inheriting defaults:

```typescript
const minimalTheme = registerTheme('minimal', {
  base: null, // Start fresh, no inheritance
  config: {
    colors: {
      gray: { 900: '#f5f5f5', 0: '#171717' },
      blue: { 500: '#3b82f6' }
    },
    vars: {
      '--ease-panel-background': 'white',
      '--ease-panel-border-color': '#e5e5e5'
    }
  }
});
```

#### Theme Utilities

```typescript
import { 
  registerTheme, 
  getTheme, 
  hasTheme, 
  getThemeNames,
  themeRef 
} from '@easemate/web-kit';

// Check if a theme exists
if (hasTheme('brand')) {
  console.log('Brand theme is registered');
}

// Get all registered theme names
const themes = getThemeNames(); // ['default', 'dark', 'brand', ...]

// Get resolved theme config (with inheritance applied)
const config = getTheme('brand');

// Get a theme ref for an already-registered theme
const ref = themeRef('brand');
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
| Panel Transitions | `--ease-panel-transition-duration`, `--ease-panel-transition-easing` |
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
| `@easemate/web-kit/react` | React hooks, utilities, and JSX types |
| `@easemate/web-kit/react/jsx` | JSX type augmentation only |
| `@easemate/web-kit/register` | Side-effect registration (all components) |
| `@easemate/web-kit/elements` | UI components only |
| `@easemate/web-kit/decorators` | Component decorators |
| `@easemate/web-kit/theme` | Theming utilities |
| `@easemate/web-kit/utils` | Utility functions |

### Panel API

The `<ease-panel>` component provides the visual container.

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `activeTab` | `number` | `0` | Zero-based index of the active tab |

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `setTab` | `(index: number) => void` | Switch to a specific tab by index |

#### Slots

| Slot | Description |
|------|-------------|
| `headline` | Panel title text (hidden when tabs are present) |
| `actions` | Header action buttons, links, or dropdowns |
| (default) | Main content area (used when no tabs) |
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
| `body` | Inner body container |
| `tab-panel` | Individual tab panel |
| `footer` | Footer container |

#### Events

| Event | Detail Type | Description |
|-------|-------------|-------------|
| `tab-change` | `TabChangeEventDetail` | Fired when the active tab changes |

```typescript
interface TabChangeEventDetail {
  index: number;             // Tab index (0-based)
  id: string;                // Tab id from slot name
  event: Event;              // Original event
}
```

### State API

The `<ease-state>` component provides state management for controls.

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `string \| null` | `null` | Reflects the last changed control's value |
| `state` | `Record<string, unknown>` | `{}` | Read-only object containing all control values |

#### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `(name: string) => unknown` | Get a specific control value by name |
| `set` | `(name: string, value: unknown) => void` | Set a control value programmatically |
| `subscribe` | `(callback: (value, name) => void) => { unsubscribe }` | Subscribe to all state changes |
| `subscribe` | `(name: string, callback: (value, name) => void) => { unsubscribe }` | Subscribe to a specific control |
| `reset` | `() => void` | Reset all controls to their initial values |

#### Slots

| Slot | Description |
|------|-------------|
| (default) | Controls to aggregate state from |

#### CSS Parts

| Part | Description |
|------|-------------|
| `container` | Inner container wrapping controls |

#### Events

| Event | Detail Type | Description |
|-------|-------------|-------------|
| `state-change` | `StateChangeEventDetail` | Fired when any control value changes |

```typescript
interface StateChangeEventDetail {
  name: string;              // Control name
  value: unknown;            // New value
  state: Record<string, unknown>; // Complete state object
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

For React/Next.js, all hooks check for browser environment:

```tsx
// This is safe to call on the server
const { ready, theme } = useWebKitContext();
// ready will be false on server, true after hydration
```

---

## License

MIT © [Aaron Iker](https://github.com/aaroniker)
