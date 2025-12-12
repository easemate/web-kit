# @easemate/web-kit

A modern, lightweight Web Components UI kit built with TypeScript, lit-html, and CSS custom properties. Designed for building control panels, settings interfaces, and interactive dashboards—similar to [Leva](https://github.com/pmndrs/leva), [dat.GUI](https://github.com/dataarts/dat.gui), or [lil-gui](https://lil-gui.georgealways.com/).

## Features

- **Native Web Components** - Framework-agnostic, works with React, Vue, Svelte, or vanilla JS
- **TypeScript First** - Full type definitions and IntelliSense support
- **Tree-shakeable** - Import only what you need
- **CSS Custom Properties** - Easy theming with runtime customization
- **State Management** - Built-in `<ease-state>` component for aggregating control values
- **Accessible** - ARIA attributes and keyboard navigation
- **Modern CSS** - Uses oklab colors, CSS anchor positioning, and container queries

## Installation

```bash
# npm
npm install @easemate/web-kit

# pnpm
pnpm add @easemate/web-kit

# yarn
yarn add @easemate/web-kit
```

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="@easemate/web-kit/styles/vars.css">
</head>
<body>
  <ease-state id="controls">
    <span slot="headline">Settings</span>
    <div slot="entry">
      <ease-field label="Speed">
        <ease-slider name="speed" min="0" max="100" value="50"></ease-slider>
      </ease-field>
      <ease-field label="Enabled">
        <ease-toggle name="enabled" checked></ease-toggle>
      </ease-field>
    </div>
  </ease-state>

  <script type="module">
    import '@easemate/web-kit';
    
    const controls = document.getElementById('controls');
    controls.addEventListener('state-change', (e) => {
      console.log(e.detail.data); // { speed: 50, enabled: true }
      console.log(e.detail.key);  // 'speed' or 'enabled'
    });
  </script>
</body>
</html>
```

### With ES Modules

```typescript
import { 
  State, 
  Slider, 
  Toggle, 
  Field,
  defineTheme 
} from '@easemate/web-kit';

// Components auto-register when imported
// Access state programmatically
const controls = document.querySelector('ease-state');
controls.data = { speed: 75, enabled: false };
```

---

## State Management (Control Panel Pattern)

The `<ease-state>` component is the heart of building Leva-style control panels. It aggregates values from child controls into a single state object.

### Basic State Controller

```html
<ease-state id="scene-controls">
  <span slot="headline">Scene Settings</span>
  <div slot="entry">
    <ease-field label="Rotation X">
      <ease-slider name="rotationX" min="0" max="360" value="0"></ease-slider>
    </ease-field>
    <ease-field label="Rotation Y">
      <ease-slider name="rotationY" min="0" max="360" value="0"></ease-slider>
    </ease-field>
    <ease-field label="Scale">
      <ease-number-input name="scale" min="0.1" max="10" step="0.1" value="1"></ease-number-input>
    </ease-field>
    <ease-field label="Wireframe">
      <ease-toggle name="wireframe"></ease-toggle>
    </ease-field>
    <ease-field label="Color">
      <ease-color-input name="color" value="#FF5500"></ease-color-input>
    </ease-field>
  </div>
</ease-state>
```

### Listening to Changes

```typescript
const controls = document.getElementById('scene-controls') as State;

// Event-based approach
controls.addEventListener('state-change', (event) => {
  const { data, key, value, previousValue } = event.detail;
  
  console.log(`${key} changed from ${previousValue} to ${value}`);
  console.log('Full state:', data);
  // { rotationX: 0, rotationY: 0, scale: 1, wireframe: false, color: '#FF5500' }
});

// Subscribe pattern (returns unsubscribe function)
const unsubscribe = controls.subscribe(({ data, key, value }) => {
  updateScene(data);
});

// Later: unsubscribe();
```

### Programmatic State Updates

```typescript
// Get single value
const rotation = controls.get<number>('rotationX');

// Set single value (updates the control and triggers event)
controls.set('rotationX', 180);

// Get all values
const allValues = controls.getAll();

// Set multiple values at once
controls.setAll({
  rotationX: 90,
  rotationY: 45,
  scale: 2
});

// Reset to initial values
controls.reset();
```

### State Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `data` | `Record<string, unknown>` | `{}` | The state object. Setting this updates all matching controls. |

### State Events

| Event | Detail | Description |
|-------|--------|-------------|
| `state-change` | `{ data, key, value, previousValue, event }` | Fired when any control value changes |

### State Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `get<T>(key: string): T` | Get a single value by key |
| `set` | `set(key: string, value: unknown): void` | Set a single value |
| `getAll` | `getAll(): StateData` | Get all values as an object |
| `setAll` | `setAll(data: StateData): void` | Set multiple values at once |
| `reset` | `reset(): void` | Reset all controls to their DOM values |
| `subscribe` | `subscribe(callback): () => void` | Subscribe to changes, returns unsubscribe function |

---

## Components Reference

### Button

A versatile button component with multiple variants and sizes.

```html
<ease-button>Default</ease-button>
<ease-button variant="primary">Primary</ease-button>
<ease-button variant="link">Link</ease-button>
<ease-button variant="headless">Headless</ease-button>
<ease-button block="icon"><ease-icon-settings /></ease-button>
<ease-button block="small">Small</ease-button>
<ease-button block="large">Large</ease-button>
<ease-button pill>Pill Shape</ease-button>
<ease-button full-width>Full Width</ease-button>
<ease-button disabled>Disabled</ease-button>
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `'default' \| 'primary' \| 'headless' \| 'link'` | `'default'` | Visual style variant |
| `block` | `'icon' \| 'small' \| 'medium' \| 'large'` | `'medium'` | Size variant |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type attribute |
| `disabled` | `boolean` | `false` | Disabled state |
| `pill` | `boolean` | `false` | Pill-shaped border radius |
| `fullWidth` | `boolean` | `false` | Full width button |

#### CSS Variables

| Variable | Description |
|----------|-------------|
| `--ease-button-radius` | Border radius override |

---

### Input

A text input with optional prefix and suffix slots.

```html
<ease-input placeholder="Enter text..." value="Hello"></ease-input>
<ease-input type="email" placeholder="email@example.com"></ease-input>
<ease-input headless placeholder="Headless input"></ease-input>
<ease-input disabled value="Disabled"></ease-input>

<!-- With prefix/suffix -->
<ease-input placeholder="Search...">
  <button slot="prefix"><ease-icon-search /></button>
  <button slot="suffix"><ease-icon-clear /></button>
</ease-input>
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `string \| null` | `null` | Input value |
| `placeholder` | `string \| null` | `null` | Placeholder text |
| `type` | `string` | `'text'` | Input type (text, email, password, etc.) |
| `name` | `string \| null` | `null` | Form field name |
| `disabled` | `boolean` | `false` | Disabled state |
| `headless` | `boolean` | `false` | Remove default styling |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `input` | `{ value: string, event: Event }` | Fired on input |
| `change` | `{ value: string, event: Event }` | Fired on change |

#### CSS Variables

| Variable | Description |
|----------|-------------|
| `--ease-input-padding` | Input padding |

---

### NumberInput

A number input with increment/decrement buttons.

```html
<ease-number-input value="50" min="0" max="100" step="5"></ease-number-input>
<ease-number-input name="quantity" value="1" min="1" max="10"></ease-number-input>
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `number \| null` | `null` | Current value |
| `min` | `number \| null` | `null` | Minimum value |
| `max` | `number \| null` | `null` | Maximum value |
| `step` | `number \| null` | `1` | Step increment |
| `name` | `string \| null` | `null` | Form field name |
| `disabled` | `boolean` | `false` | Disabled state |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `input` | `{ value: number, event: Event }` | Fired on input |
| `change` | `{ value: number, event: Event }` | Fired on change |

---

### Slider

A range slider with visual value display.

```html
<ease-slider value="50" min="0" max="100"></ease-slider>
<ease-slider value="0.5" min="0" max="1" step="0.01"></ease-slider>
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `number \| null` | `null` | Current value |
| `min` | `number \| null` | `0` | Minimum value |
| `max` | `number \| null` | `100` | Maximum value |
| `step` | `number \| null` | `null` | Step increment |
| `disabled` | `boolean` | `false` | Disabled state |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `input` | `{ value: number, event: Event }` | Fired during drag |
| `change` | `{ value: number, event: Event }` | Fired on release |

#### CSS Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--track-color` | `var(--color-gray-825)` | Track background |
| `--active-track-color` | `var(--color-blue-1100)` | Active track fill |
| `--thumb-color` | `var(--color-blue-900)` | Thumb color |
| `--thumb-size` | `18px` | Thumb diameter |
| `--track-height` | `4px` | Track height |

---

### Toggle

An animated toggle switch.

```html
<ease-toggle></ease-toggle>
<ease-toggle checked></ease-toggle>
<ease-toggle disabled></ease-toggle>
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `checked` | `boolean` | `false` | Checked state |
| `disabled` | `boolean` | `false` | Disabled state |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `toggle` | `{ value: boolean, event: Event }` | Fired on toggle |

---

### Checkbox

An animated checkbox with gooey effect.

```html
<ease-checkbox></ease-checkbox>
<ease-checkbox checked></ease-checkbox>
<ease-checkbox name="agree" value="yes"></ease-checkbox>
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `checked` | `boolean` | `false` | Checked state |
| `name` | `string \| null` | `null` | Form field name |
| `value` | `string \| null` | `null` | Form value |
| `disabled` | `boolean` | `false` | Disabled state |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `checkbox` | `{ value: boolean, event: Event }` | Fired on change |

---

### Dropdown

A select/dropdown component with search support.

```html
<ease-dropdown placeholder="Select option...">
  <button slot="content" value="opt1">Option 1</button>
  <button slot="content" value="opt2">Option 2</button>
  <button slot="content" value="opt3">Option 3</button>
</ease-dropdown>

<!-- Searchable -->
<ease-dropdown searchable placeholder="Search...">
  <button slot="content" value="apple">Apple</button>
  <button slot="content" value="banana">Banana</button>
  <button slot="content" value="cherry">Cherry</button>
</ease-dropdown>

<!-- With sections -->
<ease-dropdown>
  <h4 slot="content">Fruits</h4>
  <button slot="content" value="apple">Apple</button>
  <hr slot="content" />
  <h4 slot="content">Vegetables</h4>
  <button slot="content" value="carrot">Carrot</button>
</ease-dropdown>
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `string \| null` | `null` | Selected value |
| `placeholder` | `string \| null` | `'Select an option'` | Placeholder text |
| `open` | `boolean` | `false` | Open state |
| `disabled` | `boolean` | `false` | Disabled state |
| `searchable` | `boolean` | `false` | Enable search filtering |
| `pill` | `boolean` | `false` | Pill-shaped trigger |
| `placement` | `Placement` | `'bottom-start'` | Dropdown placement |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value: string, event: Event }` | Fired on selection |
| `toggle` | `{ value: boolean, event: Event }` | Fired on open/close |
| `value-change` | `{ value: string, label: string, event: Event }` | Detailed selection event |

---

### ColorInput

A color picker input with hex value display.

```html
<ease-color-input value="#FF5500"></ease-color-input>
<ease-color-input name="primaryColor" value="#3B82F6"></ease-color-input>
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `string` | `'#FF0000'` | Hex color value |
| `disabled` | `boolean` | `false` | Disabled state |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `input` | `{ value: string, event: Event }` | Fired during color selection |
| `change` | `{ value: string, event: Event }` | Fired when color is confirmed |

---

### RadioGroup

A radio button group using button styling.

```html
<ease-radio-group value="option1">
  <ease-button slot="content" value="option1">Option 1</ease-button>
  <ease-button slot="content" value="option2">Option 2</ease-button>
  <ease-button slot="content" value="option3">Option 3</ease-button>
</ease-radio-group>
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `string \| null` | `null` | Selected value |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value: string, event: Event }` | Fired on selection |
| `value-change` | `{ value: string, label: string, event: Event }` | Detailed selection event |

---

### RadioInput

An animated radio button with gooey effect.

```html
<ease-radio-input name="choice" value="a"></ease-radio-input>
<ease-radio-input name="choice" value="b" checked></ease-radio-input>
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `checked` | `boolean` | `false` | Checked state |
| `name` | `string \| null` | `null` | Radio group name |
| `value` | `string \| null` | `null` | Radio value |
| `disabled` | `boolean` | `false` | Disabled state |

---

### Field

A form field layout component with label.

```html
<ease-field label="Username">
  <ease-input name="username" placeholder="Enter username"></ease-input>
</ease-field>

<ease-field label="Volume" full-width>
  <ease-slider name="volume" value="50"></ease-slider>
</ease-field>
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | `string \| null` | `null` | Field label text |
| `fullWidth` | `boolean` | `false` | Make content full width |

---

### Popover

A positioning component using CSS anchor positioning.

```html
<ease-popover placement="bottom-start">
  <button slot="trigger">Open</button>
  <div>Popover content here</div>
</ease-popover>
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `placement` | `Placement` | `'bottom-start'` | Popover placement |
| `offset` | `number` | `8` | Distance from trigger |
| `open` | `boolean` | `false` | Open state |

#### Placement Options

```typescript
type Placement =
  | 'top-start' | 'top-center' | 'top-end'
  | 'bottom-start' | 'bottom-center' | 'bottom-end'
  | 'left-start' | 'left-center' | 'left-end'
  | 'right-start' | 'right-center' | 'right-end';
```

#### CSS Variables

| Variable | Description |
|----------|-------------|
| `--ease-popover-offset` | Distance from anchor |
| `--ease-popover-content-width` | Content width |
| `--ease-popover-content-min-width` | Minimum content width |
| `--ease-popover-content-max-width` | Maximum content width |

---

### Tooltip

A hover/focus tooltip.

```html
<ease-tooltip>
  <button slot="trigger">Hover me</button>
  Tooltip content
</ease-tooltip>

<ease-tooltip placement="right-center" delay="500">
  <span slot="trigger">Info</span>
  More information here
</ease-tooltip>
```

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `open` | `boolean` | `false` | Open state |
| `delay` | `number` | `300` | Show delay in ms |
| `placement` | `Placement` | `'top-center'` | Tooltip placement |

---

## Decorators

The package includes TypeScript decorators for building custom components.

### @Component

Defines a web component with Shadow DOM, styles, and template.

```typescript
import { Component } from '@easemate/web-kit';
import { html } from 'lit-html';

@Component({
  tag: 'my-component',
  styles: `
    :host { display: block; }
    .container { padding: 16px; }
  `,
  template() {
    return html`<div class="container"><slot></slot></div>`;
  }
})
class MyComponent extends HTMLElement {}
```

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `tag` | `string` | Custom element tag name (required) |
| `template` | `TemplateResult \| Function` | lit-html template |
| `styles` | `string` | Component CSS |
| `styleUrls` | `string[]` | External stylesheet URLs |
| `observedAttributes` | `string[]` | Attributes to observe |
| `shadowMode` | `'open' \| 'closed'` | Shadow DOM mode (default: 'open') |
| `autoSlot` | `boolean` | Auto-add default slot (default: true) |

---

### @Prop

Creates a reactive property that syncs with attributes.

```typescript
import { Component, Prop } from '@easemate/web-kit';

@Component({ tag: 'my-counter' })
class MyCounter extends HTMLElement {
  @Prop<number>({ type: Number, reflect: true, defaultValue: 0 })
  accessor count!: number;

  @Prop<string>({ 
    reflect: true,
    onChange(next, previous) {
      console.log(`Changed from ${previous} to ${next}`);
    }
  })
  accessor label!: string;
}
```

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | `Constructor` | Type for parsing (Boolean, Number, String, Object, Array) |
| `attribute` | `string` | Custom attribute name |
| `reflect` | `boolean` | Sync property to attribute (default: true) |
| `defaultValue` | `T \| () => T` | Default value |
| `parse` | `(value: string) => T` | Custom parser |
| `format` | `(value: T) => string` | Custom formatter |
| `compare` | `(a: T, b: T) => boolean` | Custom equality check |
| `onChange` | `(next: T, prev: T) => void` | Change callback |

---

### @Listen

Adds event listeners with delegation support.

```typescript
import { Component, Listen } from '@easemate/web-kit';

@Component({ tag: 'my-form' })
class MyForm extends HTMLElement {
  @Listen('click', { selector: 'button' })
  handleButtonClick(event: MouseEvent, button: HTMLButtonElement) {
    console.log('Button clicked:', button);
  }

  @Listen('input', { target: 'document' })
  handleGlobalInput(event: InputEvent) {
    // Listen on document
  }

  @Listen('resize', { target: 'window' })
  handleResize(event: UIEvent) {
    // Listen on window
  }
}
```

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `selector` | `string` | Delegate to matching elements |
| `target` | `'shadow' \| 'light' \| 'document' \| 'window'` | Event target |
| `prevent` | `boolean` | Call preventDefault() |
| `stop` | `boolean` | Call stopPropagation() |
| `stopImmediate` | `boolean` | Call stopImmediatePropagation() |
| `once` | `boolean` | Remove after first call |
| `passive` | `boolean` | Passive listener |
| `capture` | `boolean` | Capture phase |
| `when` | `(event, matched) => boolean` | Conditional filter |

---

### @Query

Query DOM elements in shadow or light DOM.

```typescript
import { Component, Query } from '@easemate/web-kit';

@Component({ tag: 'my-component' })
class MyComponent extends HTMLElement {
  @Query<HTMLInputElement>('input')
  accessor input!: HTMLInputElement | null;

  @Query<HTMLElement[]>('.item', { all: true })
  accessor items!: HTMLElement[];

  @Query<HTMLElement>('.container', { from: 'light' })
  accessor container!: HTMLElement | null;

  @Query<HTMLFormElement>('form', { closest: true })
  accessor form!: HTMLFormElement | null;
}
```

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `from` | `'shadow' \| 'light' \| 'document'` | Query root |
| `all` | `boolean` | Return all matches as array |
| `closest` | `boolean` | Use Element.closest() |
| `fallback` | `T \| () => T` | Fallback value |

---

### @Watch

Creates a reactive accessor that triggers re-render on change.

```typescript
import { Component, Watch } from '@easemate/web-kit';

@Component({ tag: 'my-component' })
class MyComponent extends HTMLElement {
  @Watch<number>({
    onChange(next, previous) {
      console.log(`Count: ${previous} -> ${next}`);
    }
  })
  accessor internalCount = 0;
}
```

---

### @OutsideClick

Handle clicks outside an element.

```typescript
import { Component, OutsideClick, Prop } from '@easemate/web-kit';

@Component({ tag: 'my-dropdown' })
class MyDropdown extends HTMLElement {
  @Prop<boolean>({ type: Boolean })
  accessor open = false;

  @OutsideClick({
    content: (host) => host.shadowRoot?.querySelector('.panel'),
    triggers: (host) => [host.shadowRoot?.querySelector('.trigger')],
    disabled: (host) => !host.open
  })
  handleOutsideClick() {
    this.open = false;
  }
}
```

---

## Theming

The package uses CSS custom properties for theming, with a JavaScript API for runtime customization.

### CSS Variables

Include the base styles in your HTML:

```html
<link rel="stylesheet" href="@easemate/web-kit/styles/vars.css">
```

Or import in JavaScript:

```javascript
import '@easemate/web-kit/styles/vars.css';
```

### Color Palette

The default theme includes these color scales (using oklab for perceptual uniformity):

- **Gray**: 0, 100, 300, 400, 500, 600, 700, 800, 825, 850, 875, 900, 1000
- **Blue**: 100-1100
- **Green**: 100-1000
- **Red**: 100-1000
- **Orange**: 100-1000
- **Yellow**: 100-800

```css
/* Example usage */
.my-element {
  background: var(--color-gray-900);
  color: var(--color-blue-100);
  border: 1px solid var(--color-white-10);
}
```

### Runtime Theming API

```typescript
import { 
  defineTheme, 
  createTheme, 
  getThemeValue, 
  setThemeValue,
  mergeTheme,
  createDarkTheme,
  createLightTheme 
} from '@easemate/web-kit';

// Apply theme to document root
defineTheme({
  colors: {
    blue: {
      500: '#3B82F6',
      600: '#2563EB'
    }
  },
  radii: {
    md: '12px'
  }
});

// Apply to specific element
defineTheme({ colors: { foreground: '#fff' } }, myElement);

// Generate CSS string (for SSR or style injection)
const css = createTheme({
  colors: {
    gray: { 900: '#111827' }
  }
}, '.dark-theme');
// Returns: '.dark-theme { --color-gray-900: #111827; }'

// Read current value
const blueColor = getThemeValue('color-blue-500');

// Set single value
setThemeValue('color-blue-500', '#60A5FA');

// Create merged theme with defaults
const customTheme = mergeTheme({
  colors: {
    blue: { 500: '#custom' }
  }
});

// Built-in dark/light theme helpers
defineTheme(createDarkTheme());
defineTheme(createLightTheme());
```

### Theme Configuration Types

```typescript
interface ThemeConfig {
  colors?: ColorPalette;
  radii?: RadiiConfig;
  spacing?: SpacingConfig;
  typography?: TypographyConfig;
}

interface ColorPalette {
  gray?: GrayScale;
  blue?: ColorScale;
  green?: ColorScale;
  red?: ColorScale;
  orange?: ColorScale;
  yellow?: ColorScale;
  white?: string;
  black?: string;
  whiteAlpha?: AlphaColors;
  blackAlpha?: AlphaColors;
  foreground?: string;
}

interface RadiiConfig {
  sm?: string;  // 4px
  md?: string;  // 8px
  lg?: string;  // 12px
  xl?: string;  // 16px
  full?: string; // 9999px
}
```

---

## Icons

The package includes a set of SVG icons as web components:

### Animation Icons

- `<ease-icon-chevron state="up|down|left|right">` - Animated chevron
- `<ease-icon-loading>` - Loading spinner

### Interface Icons

- `<ease-icon-arrow-up>`
- `<ease-icon-check>`
- `<ease-icon-circle-arrow-left>`
- `<ease-icon-circle-arrow-right>`
- `<ease-icon-code>`
- `<ease-icon-dots>`
- `<ease-icon-mention>`
- `<ease-icon-minus>`
- `<ease-icon-plus>`
- `<ease-icon-settings>`

```html
<ease-button block="icon">
  <ease-icon-settings />
</ease-button>
```

### Icon Sizing

```css
/* Icons inherit size from CSS variable */
.my-container {
  --ease-icon-size: 24px;
}
```

---

## TypeScript

All components and utilities are fully typed:

```typescript
import type { 
  StateData, 
  StateChangeDetail,
  Placement,
  ThemeConfig,
  ColorPalette,
  ControlEventDetail
} from '@easemate/web-kit';

// Type-safe state access
const controls = document.querySelector('ease-state') as State;
const speed = controls.get<number>('speed');

// Typed event handler
controls.addEventListener('state-change', (e: CustomEvent<StateChangeDetail>) => {
  const { data, key, value } = e.detail;
});
```

---

## Browser Support

This package requires modern browser features:

- **CSS Anchor Positioning** - For popover/tooltip positioning
- **Container Queries** - For responsive components
- **CSS Custom Properties** - For theming
- **Shadow DOM** - For component encapsulation
- **ES2022+** - For decorators and class fields

### Supported Browsers

- Chrome/Edge 125+
- Safari 18+
- Firefox 128+ (with flags for anchor positioning)

### Polyfills

For older browsers, you may need polyfills for:
- CSS Anchor Positioning: [CSS Anchor Positioning Polyfill](https://github.com/nicell/css-anchor-positioning-polyfill)
- Custom Elements: [@webcomponents/webcomponentsjs](https://github.com/webcomponents/polyfills)

---

## License

MIT © Aaron Iker
