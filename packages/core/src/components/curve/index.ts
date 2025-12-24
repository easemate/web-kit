import type { ControlEventDetail } from '~/elements/shared';

import { html } from 'lit-html';

import { cubicBezierToLinearPoints } from './bezier-conversion';
import { containerStyles } from './styles';
import { type CubicBezierPoints, EasingType, type LinearPoints, MIN_LINEAR_POINTS } from './types';
import { MIN_LINEAR_DELTA, normalizeLinearPoints } from './utils';

import { Component } from '~/decorators/Component';
import { Listen } from '~/decorators/Listen';
import { Prop } from '~/decorators/Prop';

@Component({
  tag: 'ease-curve',
  styles: containerStyles,
  template(this: Curve) {
    return html`
      <div class="curve-container">
        <div class="curve-header">
          <ease-curve-controls
            .easingType=${this.easingType}
            .points=${this.points}
            .showGrid=${this.showGrid}
            .snapToGrid=${this.snapToGrid}
            .gridSize=${this.gridSize}
            .focusedLinearIndex=${this.focusedLinearIndex}
          ></ease-curve-controls>
        </div>

        <div class="curve-canvas-wrapper">
          <div class="curve-canvas">
            <ease-curve-canvas
              .easingType=${this.easingType}
              .points=${this.points}
              .showGrid=${this.showGrid}
              .snapToGrid=${this.snapToGrid}
              .gridSize=${this.gridSize}
              .focusedLinearIndex=${this.focusedLinearIndex}
              .simplify=${this.simplify}
              .round=${this.round}
            ></ease-curve-canvas>
          </div>
          <ease-curve-canvas-controls
            .easingType=${this.easingType}
            .points=${this.points}
            .focusedLinearIndex=${this.focusedLinearIndex}
          ></ease-curve-canvas-controls>
        </div>

        <div class="curve-toolbar">
          <ease-curve-toolbar
            .easingType=${this.easingType}
            .points=${this.points}
            .showGrid=${this.showGrid}
            .snapToGrid=${this.snapToGrid}
            .gridSize=${this.gridSize}
            .simplify=${this.simplify}
            .round=${this.round}
          ></ease-curve-toolbar>
        </div>

        <!-- <div class="curve-footer">
          <ease-curve-output
            .easingType=${this.easingType}
            .points=${this.points}
            .name=${this.name}
            .simplify=${this.simplify}
            .round=${this.round}
          ></ease-curve-output>
        </div> -->
      </div>
    `;
  }
})
export class Curve extends HTMLElement {
  declare requestRender: () => void;

  @Prop<string>({ reflect: true, defaultValue: 'ease-custom' })
  accessor name!: string;

  @Prop<EasingType, Curve>({
    reflect: true,
    defaultValue: EasingType.CUBIC_BEZIER,
    onChange(this: Curve, next: EasingType, previous: EasingType) {
      if (next !== previous) {
        this.points = this.getDefaultPointsForType(next);
        this.focusedLinearIndex = null;
      }
    }
  })
  accessor easingType!: EasingType;

  @Prop<CubicBezierPoints | LinearPoints>({
    type: Object,
    reflect: false,
    defaultValue: () => {
      return { p1: { x: 0.25, y: 0.1 }, p2: { x: 0.25, y: 1 } };
    }
  })
  accessor points!: CubicBezierPoints | LinearPoints;

  @Prop<boolean>({ type: Boolean, reflect: true, defaultValue: true })
  accessor showGrid!: boolean;

  @Prop<boolean>({ type: Boolean, reflect: true, defaultValue: false })
  accessor snapToGrid!: boolean;

  @Prop<number>({ type: Number, reflect: true, defaultValue: 8 })
  accessor gridSize!: number;

  @Prop<number>({ type: Number, reflect: true, defaultValue: 0 })
  accessor simplify!: number;

  @Prop<number>({ type: Number, reflect: true, defaultValue: 5 })
  accessor round!: number;

  @Prop<number | null>({ type: Number, reflect: false, defaultValue: null })
  accessor focusedLinearIndex: number | null = null;

  private getDefaultPointsForType(type: EasingType): CubicBezierPoints | LinearPoints {
    return type === EasingType.CUBIC_BEZIER
      ? { p1: { x: 0.25, y: 0.1 }, p2: { x: 0.25, y: 1 } }
      : [
          { x: 0, y: 0 },
          { x: 1, y: 1 }
        ];
  }

  @Listen<Curve, CustomEvent<ControlEventDetail<EasingType>>>('easing-type-change', { target: 'light' })
  handleEasingTypeChange(event: CustomEvent<ControlEventDetail<EasingType>>): void {
    const { value } = event.detail;

    if (this.easingType === value) {
      return;
    }

    const previousType = this.easingType;
    const previousPoints = this.points;
    this.easingType = value;
    this.focusedLinearIndex = null;

    if (previousType === EasingType.CUBIC_BEZIER && value === EasingType.LINEAR) {
      if (previousPoints && !Array.isArray(previousPoints)) {
        const bezierPoints = previousPoints as CubicBezierPoints;
        const linearPoints = cubicBezierToLinearPoints(bezierPoints);
        this.points = linearPoints;
        this.emitPointsChange(linearPoints, event.detail.event);
        return;
      } else {
        this.points = this.getDefaultPointsForType(value);
        this.emitPointsChange(this.points, event.detail.event);
        return;
      }
    } else if (previousType === EasingType.LINEAR && value === EasingType.CUBIC_BEZIER) {
      this.points = this.getDefaultPointsForType(value);
      this.emitPointsChange(this.points, event.detail.event);
      return;
    } else {
      this.points = this.getDefaultPointsForType(value);
      this.emitPointsChange(this.points, event.detail.event);
      return;
    }
  }

  @Listen<Curve, CustomEvent<ControlEventDetail<boolean>>>('grid-toggle', { target: 'light' })
  handleGridToggle(event: CustomEvent<ControlEventDetail<boolean>>): void {
    const { value } = event.detail;

    if (this.showGrid === value) {
      return;
    }

    this.showGrid = value;
  }

  @Listen<Curve, CustomEvent<ControlEventDetail<boolean>>>('snap-toggle', { target: 'light' })
  handleSnapToggle(event: CustomEvent<ControlEventDetail<boolean>>): void {
    const { value } = event.detail;

    if (this.snapToGrid === value) {
      return;
    }

    this.snapToGrid = value;
  }

  @Listen<Curve, CustomEvent<ControlEventDetail<number>>>('grid-size-change', { target: 'light' })
  handleGridSizeChange(event: CustomEvent<ControlEventDetail<number>>): void {
    let { value } = event.detail;
    value = Math.max(1, Math.min(24, value));
    if (this.gridSize === value) {
      return;
    }
    this.gridSize = value;
    this.requestRender();
  }

  @Listen<Curve, CustomEvent<ControlEventDetail<number>>>('simplify-change', { target: 'light' })
  handleSimplifyChange(event: CustomEvent<ControlEventDetail<number>>): void {
    const { value } = event.detail;
    if (this.simplify === value) {
      return;
    }
    this.simplify = value;
    this.requestRender();
  }

  @Listen<Curve, CustomEvent<ControlEventDetail<number>>>('round-change', { target: 'light' })
  handleRoundChange(event: CustomEvent<ControlEventDetail<number>>): void {
    const { value } = event.detail;
    if (this.round === value) {
      return;
    }
    this.round = value;
    this.requestRender();
  }

  @Listen<Curve, CustomEvent<ControlEventDetail<CubicBezierPoints | LinearPoints>>>('points-change', {
    target: 'light'
  })
  handlePointsChange(event: CustomEvent<ControlEventDetail<CubicBezierPoints | LinearPoints>>): void {
    const { value } = event.detail;
    this.points = value;

    if (Array.isArray(value)) {
      if (this.focusedLinearIndex !== null) {
        if (this.focusedLinearIndex >= value.length) {
          this.focusedLinearIndex = value.length - 1;
        }
      }
    } else {
      this.focusedLinearIndex = null;
    }
  }

  @Listen<Curve, KeyboardEvent>('keydown', { target: 'window', passive: false })
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (event.defaultPrevented) {
      return;
    }

    const activeElement = event.target;

    if (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      (activeElement instanceof HTMLElement && activeElement.isContentEditable)
    ) {
      return;
    }

    if (this.easingType !== EasingType.LINEAR || !Array.isArray(this.points)) {
      return;
    }

    const index = this.focusedLinearIndex;

    if (index === null) {
      return;
    }

    const lastIndex = this.points.length - 1;
    const clonedPoints: LinearPoints = this.points.map((point) => {
      return { ...point };
    });
    const point = clonedPoints[index];

    if (!point) {
      return;
    }

    const step = event.shiftKey ? 0.05 : 0.01;
    let handled = false;

    switch (event.key) {
      case 'ArrowLeft': {
        if (index <= 0 || index >= lastIndex) {
          break;
        }
        const previous = clonedPoints[index - 1];
        const next = clonedPoints[index + 1];

        if (!previous || !next) {
          break;
        }

        const minX = previous.x + MIN_LINEAR_DELTA;
        const maxX = next.x - MIN_LINEAR_DELTA;
        point.x = Math.min(Math.max(point.x - step, minX), maxX);
        handled = true;
        break;
      }
      case 'ArrowRight': {
        if (index <= 0 || index >= lastIndex) {
          break;
        }
        const previous = clonedPoints[index - 1];
        const next = clonedPoints[index + 1];

        if (!previous || !next) {
          break;
        }

        const minX = previous.x + MIN_LINEAR_DELTA;
        const maxX = next.x - MIN_LINEAR_DELTA;
        point.x = Math.min(Math.max(point.x + step, minX), maxX);
        handled = true;
        break;
      }
      case 'ArrowUp': {
        point.y = Math.min(Math.max(point.y + step, 0), 1);
        handled = true;
        break;
      }
      case 'ArrowDown': {
        point.y = Math.min(Math.max(point.y - step, 0), 1);
        handled = true;
        break;
      }
      case 'Delete':
      case 'Backspace': {
        if (clonedPoints.length <= MIN_LINEAR_POINTS || index <= 0 || index >= lastIndex) {
          break;
        }

        clonedPoints.splice(index, 1);

        const normalized = normalizeLinearPoints(clonedPoints);
        this.points = normalized;
        this.emitPointsChange(normalized, event);

        const nextFocus = index - 1;

        this.focusedLinearIndex = nextFocus;
        handled = true;
        break;
      }
      default:
        break;
    }

    if (handled && event.key !== 'Delete' && event.key !== 'Backspace') {
      const normalized = normalizeLinearPoints(clonedPoints);
      this.points = normalized;
      this.emitPointsChange(normalized, event);
      this.focusedLinearIndex = index;
    }

    if (handled) {
      event.preventDefault();
    }
  }

  @Listen<Curve, CustomEvent<ControlEventDetail<number | null>>>('linear-point-focus', { target: 'light' })
  handleLinearPointFocus(event: CustomEvent<ControlEventDetail<number | null>>): void {
    const { value } = event.detail;
    if (this.focusedLinearIndex === value) {
      return;
    }
    this.focusedLinearIndex = value ?? null;
  }

  private emitPointsChange(value: CubicBezierPoints | LinearPoints, sourceEvent?: Event): void {
    const detail: ControlEventDetail<CubicBezierPoints | LinearPoints> = {
      value,
      event: sourceEvent ?? new Event('points-change')
    };

    this.dispatchEvent(
      new CustomEvent('points-change', {
        detail,
        bubbles: true,
        composed: true
      })
    );
  }
}

import './canvas';
import './canvas-controls';
import './controls';
import './output';
import './toolbar';

export {
  type CubicBezierPoints,
  type EasingData,
  EasingType,
  type LinearPoints,
  type Point
} from './types';
