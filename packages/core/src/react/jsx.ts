/**
 * JSX type declarations for @easemate/web-kit
 *
 * Import this module to get JSX IntrinsicElements type support:
 * ```ts
 * import '@easemate/web-kit/react/jsx';
 * ```
 */

// Import React types to enable proper module augmentation
// This ensures 'react' and 'react/jsx-runtime' are resolvable for augmentation
import type {} from 'react';
import type {} from 'react/jsx-dev-runtime';
import type {} from 'react/jsx-runtime';
import type { StateChangeEventDetail } from '../elements/state/index';

// Re-export for convenience
export type { StateChangeEventDetail };

// Event detail types
export interface TabChangeEventDetail {
  index: number;
  id: string;
  event: Event;
}

export interface ControlEventDetail<T = unknown> {
  name?: string;
  value: T;
  event: Event;
}

// Ref types
type RefCallback<T> = (instance: T | null) => void;
type RefObject<T> = { current: T | null };
type Ref<T> = RefCallback<T> | RefObject<T> | null;

// Event handler type
type CustomEventHandler<T = unknown> = (event: CustomEvent<T>) => void;

// Base HTML attributes shared by all elements
interface BaseHTMLAttributes {
  // React's key prop for list rendering
  key?: string | number | null;
  id?: string;
  class?: string;
  className?: string;
  style?: string | Partial<CSSStyleDeclaration>;
  slot?: string;
  hidden?: boolean;
  tabIndex?: number;
  title?: string;
  name?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
  'aria-disabled'?: boolean | 'true' | 'false';
  'data-testid'?: string;
  onClick?: (event: MouseEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  children?: unknown;
}

// Element ref interfaces
export interface StateElement extends HTMLElement {
  getState(): Record<string, unknown>;
  get(name: string): unknown;
  set(name: string, value: unknown): void;
  reset(): void;
}

export interface PanelElement extends HTMLElement {
  collapsed?: boolean;
  setActiveTab(indexOrId: number | string): void;
  getActiveTab(): { index: number; id: string } | null;
}

export interface SliderElement extends HTMLElement {
  value?: number | null;
  min?: number | null;
  max?: number | null;
  step?: number | null;
  disabled?: boolean;
}

export interface ToggleElement extends HTMLElement {
  checked?: boolean;
  disabled?: boolean;
}

export interface CheckboxElement extends HTMLElement {
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
}

export interface InputElement extends HTMLElement {
  value?: string | null;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  focus(): void;
  blur(): void;
}

export interface NumberInputElement extends HTMLElement {
  value?: number | null;
  min?: number | null;
  max?: number | null;
  step?: number | null;
  disabled?: boolean;
}

export interface ColorInputElement extends HTMLElement {
  value?: string;
  disabled?: boolean;
}

export interface DropdownElement extends HTMLElement {
  value?: string;
  disabled?: boolean;
  open?: boolean;
}

export interface ButtonElement extends HTMLElement {
  disabled?: boolean;
  type?: string;
  variant?: string;
}

export interface FieldElement extends HTMLElement {
  label?: string;
}

export interface TooltipElement extends HTMLElement {
  content?: string;
  placement?: string;
}

export interface PopoverElement extends HTMLElement {
  open?: boolean;
  placement?: string;
}

export interface OriginElement extends HTMLElement {
  value?: string;
  disabled?: boolean;
}

export interface RadioGroupElement extends HTMLElement {
  value?: string;
}

export interface CurveElement extends HTMLElement {
  name?: string;
  easingType?: 'cubic-bezier' | 'linear';
  showGrid?: boolean;
  snapToGrid?: boolean;
}

// Props interfaces
export interface StateProps extends BaseHTMLAttributes {
  ref?: Ref<StateElement>;
  onStateChange?: CustomEventHandler<StateChangeEventDetail>;
}

export interface PanelProps extends BaseHTMLAttributes {
  ref?: Ref<PanelElement>;
  collapsed?: boolean;
  onTabChange?: CustomEventHandler<TabChangeEventDetail>;
}

export interface SliderProps extends BaseHTMLAttributes {
  ref?: Ref<SliderElement>;
  value?: number | string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  disabled?: boolean;
  onInput?: CustomEventHandler<ControlEventDetail<number>>;
  onChange?: CustomEventHandler<ControlEventDetail<number>>;
}

export interface ToggleProps extends BaseHTMLAttributes {
  ref?: Ref<ToggleElement>;
  checked?: boolean;
  disabled?: boolean;
  onToggle?: CustomEventHandler<ControlEventDetail<boolean>>;
  onChange?: CustomEventHandler<ControlEventDetail<boolean>>;
}

export interface CheckboxProps extends BaseHTMLAttributes {
  ref?: Ref<CheckboxElement>;
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  onChange?: CustomEventHandler<ControlEventDetail<boolean>>;
}

export interface InputProps extends BaseHTMLAttributes {
  ref?: Ref<InputElement>;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  onInput?: CustomEventHandler<ControlEventDetail<string>>;
  onChange?: CustomEventHandler<ControlEventDetail<string>>;
}

export interface NumberInputProps extends BaseHTMLAttributes {
  ref?: Ref<NumberInputElement>;
  value?: number | string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  disabled?: boolean;
  onInput?: CustomEventHandler<ControlEventDetail<number>>;
  onChange?: CustomEventHandler<ControlEventDetail<number>>;
}

export interface ColorInputProps extends BaseHTMLAttributes {
  ref?: Ref<ColorInputElement>;
  value?: string;
  disabled?: boolean;
  onInput?: CustomEventHandler<ControlEventDetail<string>>;
  onChange?: CustomEventHandler<ControlEventDetail<string>>;
}

export interface DropdownProps extends BaseHTMLAttributes {
  ref?: Ref<DropdownElement>;
  value?: string;
  disabled?: boolean;
  open?: boolean;
  placement?: string;
  onChange?: CustomEventHandler<ControlEventDetail<string>>;
}

export interface ButtonProps extends BaseHTMLAttributes {
  ref?: Ref<ButtonElement>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost';
  pill?: boolean;
  block?: string;
  fullWidth?: boolean;
}

export interface FieldProps extends BaseHTMLAttributes {
  ref?: Ref<FieldElement>;
  label?: string;
  inline?: boolean;
}

export interface TooltipProps extends BaseHTMLAttributes {
  ref?: Ref<TooltipElement>;
  content?: string;
  placement?: string;
  delay?: number | string;
}

export interface PopoverProps extends BaseHTMLAttributes {
  ref?: Ref<PopoverElement>;
  open?: boolean;
  placement?: string;
}

export interface OriginProps extends BaseHTMLAttributes {
  ref?: Ref<OriginElement>;
  value?: string;
  disabled?: boolean;
  onChange?: CustomEventHandler<ControlEventDetail<string>>;
}

export interface RadioGroupProps extends BaseHTMLAttributes {
  ref?: Ref<RadioGroupElement>;
  value?: string;
  onChange?: CustomEventHandler<ControlEventDetail<string>>;
}

export interface RadioInputProps extends BaseHTMLAttributes {
  value?: string;
  checked?: boolean;
  disabled?: boolean;
}

export interface CurveProps extends BaseHTMLAttributes {
  ref?: Ref<CurveElement>;
  name?: string;
  easingType?: 'cubic-bezier' | 'linear';
  'easing-type'?: 'cubic-bezier' | 'linear';
  showGrid?: boolean;
  'show-grid'?: boolean;
  snapToGrid?: boolean;
  'snap-to-grid'?: boolean;
  gridSize?: number | string;
  'grid-size'?: number | string;
}

export interface CodeProps extends BaseHTMLAttributes {
  language?: string;
}

export interface MonitorProps extends BaseHTMLAttributes {}

export interface MonitorFpsProps extends BaseHTMLAttributes {
  interval?: number | string;
}

export interface LogoLoaderProps extends BaseHTMLAttributes {
  intro?: 'wave' | 'particle';
  loading?: boolean;
  size?: number | string;
}

export interface ColorPickerProps extends BaseHTMLAttributes {
  ref?: Ref<ColorInputElement>;
  value?: string;
  disabled?: boolean;
  onInput?: CustomEventHandler<ControlEventDetail<string>>;
  onChange?: CustomEventHandler<ControlEventDetail<string>>;
}

// Base interface for all icon components
export interface IconProps extends BaseHTMLAttributes {}

// JSX IntrinsicElements
export interface EaseElements {
  // Layout & State
  'ease-state': StateProps;
  'ease-panel': PanelProps;
  'ease-field': FieldProps;
  'ease-popover': PopoverProps;
  'ease-tooltip': TooltipProps;

  // Controls
  'ease-slider': SliderProps;
  'ease-toggle': ToggleProps;
  'ease-checkbox': CheckboxProps;
  'ease-input': InputProps;
  'ease-number-input': NumberInputProps;
  'ease-color-input': ColorInputProps;
  'ease-color-picker': ColorPickerProps;
  'ease-dropdown': DropdownProps;
  'ease-button': ButtonProps;
  'ease-origin': OriginProps;
  'ease-radio-group': RadioGroupProps;
  'ease-radio-input': RadioInputProps;

  // Advanced
  'ease-curve': CurveProps;
  'ease-code': CodeProps;

  // Display
  'ease-monitor': MonitorProps;
  'ease-monitor-fps': MonitorFpsProps;
  'ease-logo-loader': LogoLoaderProps;

  // Icons - Interface
  'ease-icon-anchor-add': IconProps;
  'ease-icon-anchor-remove': IconProps;
  'ease-icon-arrow-up': IconProps;
  'ease-icon-arrows-vertical': IconProps;
  'ease-icon-bezier': IconProps;
  'ease-icon-bezier-angle': IconProps;
  'ease-icon-bezier-distribute': IconProps;
  'ease-icon-bezier-length': IconProps;
  'ease-icon-bezier-mirror': IconProps;
  'ease-icon-check': IconProps;
  'ease-icon-circle-arrow-left': IconProps;
  'ease-icon-circle-arrow-right': IconProps;
  'ease-icon-code': IconProps;
  'ease-icon-dots': IconProps;
  'ease-icon-mention': IconProps;
  'ease-icon-minus': IconProps;
  'ease-icon-picker': IconProps;
  'ease-icon-plus': IconProps;
  'ease-icon-settings': IconProps;

  // Icons - Animation
  'ease-icon-chevron': IconProps;
  'ease-icon-clear': IconProps;
  'ease-icon-grid': IconProps;
  'ease-icon-loading': IconProps;
  'ease-icon-snap': IconProps;
}

// Augment global JSX namespace
// This provides type support in both React and non-React environments
declare global {
  namespace JSX {
    interface IntrinsicElements extends EaseElements {}
  }
}

// Augment React's JSX namespace for React 17/18/19 (classic JSX transform)
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends EaseElements {}
  }
}

// Augment React's jsx-runtime for React 17+ (new JSX transform)
// This is required for Next.js App Router and other projects using the new transform
declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface IntrinsicElements extends EaseElements {}
  }
}

// Augment React's jsx-dev-runtime for development mode
declare module 'react/jsx-dev-runtime' {
  export namespace JSX {
    interface IntrinsicElements extends EaseElements {}
  }
}

// Runtime marker to ensure this module is processed by TypeScript
// This is needed because purely type-only modules may not trigger augmentation
export const __JSX_TYPES_LOADED__ = true;
