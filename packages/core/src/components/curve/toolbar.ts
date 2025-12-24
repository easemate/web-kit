import { html } from 'lit-html';

import { toolbarStyles } from './styles';
import {
  type CubicBezierPoints,
  EasingType,
  type LinearPoint,
  type LinearPoints,
  MAX_LINEAR_POINTS,
  MIN_LINEAR_POINTS
} from './types';
import { clampPoint, normalizeLinearPoints } from './utils';

import { Component } from '~/decorators/Component';
import { Prop } from '~/decorators/Prop';
import { type ControlEventDetail, dispatchControlEvent } from '~/elements/shared';

import '~/elements/icons/interface/minus';
import '~/elements/icons/interface/plus';
import '~/elements/button';
import '~/elements/tooltip';

type CurveHost = HTMLElement & {
  easingType: EasingType;
  points: CubicBezierPoints | LinearPoints;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  focusedLinearIndex: number | null;
  handleGridToggle?: (event: CustomEvent<ControlEventDetail<boolean>>) => void;
  handleSnapToggle?: (event: CustomEvent<ControlEventDetail<boolean>>) => void;
  handleGridSizeChange?: (event: KeyboardEvent) => void;
  handlePointsChange?: (event: CustomEvent<ControlEventDetail<CubicBezierPoints | LinearPoints>>) => void;
  handleLinearPointFocus?: (event: CustomEvent<ControlEventDetail<number | null>>) => void;
  handleSimplifyChange?: (event: CustomEvent<ControlEventDetail<number>>) => void;
  handleRoundChange?: (event: CustomEvent<ControlEventDetail<number>>) => void;
};

const HOST_HANDLER_MAP = {
  'grid-toggle': 'handleGridToggle',
  'snap-toggle': 'handleSnapToggle',
  'grid-size-change': 'handleGridSizeChange',
  'points-change': 'handlePointsChange',
  'linear-point-focus': 'handleLinearPointFocus',
  'simplify-change': 'handleSimplifyChange',
  'round-change': 'handleRoundChange'
} as const;

type HostEventType = keyof typeof HOST_HANDLER_MAP;

@Component({
  tag: 'ease-curve-toolbar',
  styles: toolbarStyles,
  template(this: CurveToolbar) {
    const isGridAtMinimum = this.gridSize <= 1;
    const isGridAtMaximum = this.gridSize >= 24;
    const isLinear = this.easingType === EasingType.LINEAR;
    const points = isLinear && Array.isArray(this.points) ? (this.points as LinearPoints) : null;

    return html`
      <div class="toolbar-container">
        <div class="toolbar-group">

          <ease-tooltip placement="top-center">
            <button
              type="button"
              class="toolbar-button ${this.showGrid ? 'active' : ''}"
              @click=${this.toggleGrid}
              slot="trigger"
            >
              <ease-icon-grid state=${this.showGrid ? 'hide' : 'show'}></ease-icon-grid>
            </button>
            Toggle Grid
          </ease-tooltip>

          <ease-tooltip placement="top-center">
            <button
              type="button"
              class="toolbar-button ${this.snapToGrid ? 'active' : ''}"
              @click=${this.toggleSnapToGrid}
              slot="trigger"
            >
              <ease-icon-snap state=${this.snapToGrid ? 'active' : 'default'}></ease-icon-snap>
            </button>
            Snap to Grid
          </ease-tooltip>

          <ease-tooltip placement="top-center">
            <button
              type="button"
              class="toolbar-button"
              @click=${this.resetCurve}
              slot="trigger"
            >
              <ease-icon-clear></ease-icon-clear>
            </button>
            Reset Curve
          </ease-tooltip>

          <ease-tooltip placement="top-center">
            <button
              type="button"
              class="toolbar-button"
              @click=${this.addLinearPoint}
              ?disabled=${(points && points.length >= MAX_LINEAR_POINTS) || !isLinear}
              slot="trigger"
            >
              <ease-icon-anchor-add></ease-icon-anchor-add>
            </button>
            Add Point
          </ease-tooltip>

          <ease-tooltip placement="top-center">
            <button
              type="button"
              class="toolbar-button"
              @click=${this.removeLinearPoint}
              ?disabled=${(points && points.length <= MIN_LINEAR_POINTS) || !isLinear}
              slot="trigger"
            >
              <ease-icon-anchor-remove></ease-icon-anchor-remove>
            </button>
            Remove Point
          </ease-tooltip>

          <ease-tooltip placement="top-center">
            <button
              type="button"
              class="toolbar-button"
              @click=${this.distributeLinearPoints}
              ?disabled=${!isLinear}
              slot="trigger"
            >
              <ease-icon-bezier-distribute></ease-icon-bezier-distribute>
            </button>
            Distribute Points
          </ease-tooltip>

          <div class="grid-size-controls">
            <ease-button
              class="grid-size-button minus"
              type="button"
              block="icon"
              pill="true"
              variant="headless"
              @click=${this.decrementGridSize}
              ?disabled=${isGridAtMinimum}
            >
              <ease-icon-minus></ease-icon-minus>
            </ease-button>
            <div class="grid-size-value">
              ${this.gridSize}x
            </div>
            <ease-button
              class="grid-size-button plus"
              type="button"
              block="icon"
              pill="true"
              variant="headless"
              @click=${this.incrementGridSize}
              ?disabled=${isGridAtMaximum}
            >
              <ease-icon-plus></ease-icon-plus>
            </ease-button>
          </div>
        </div>

        <ease-field label="Simplify">
          <ease-slider .value=${this.simplify} .min=${0} .max=${0.05} .step=${0.001} @input=${this.handleSimplifyInput}></ease-slider>
        </ease-field>

        <ease-field label="Round">
          <ease-slider .value=${this.round} .min=${0} .max=${5} .step=${1} @input=${this.handleRoundInput}></ease-slider>
        </ease-field>

      </div>
    `;
  }
})
export class CurveToolbar extends HTMLElement {
  declare requestRender: () => void;

  @Prop<EasingType>({ reflect: true })
  accessor easingType!: EasingType;

  @Prop<CubicBezierPoints | LinearPoints>({ type: Object, reflect: false })
  accessor points!: CubicBezierPoints | LinearPoints;

  @Prop<boolean>({ type: Boolean, reflect: true, defaultValue: true })
  accessor showGrid!: boolean;

  @Prop<boolean>({ type: Boolean, reflect: true, defaultValue: false })
  accessor snapToGrid!: boolean;

  @Prop<number>({ type: Number, reflect: true, defaultValue: 8 })
  accessor gridSize: number = 8;

  @Prop<number>({ type: Number, reflect: true, defaultValue: 0 })
  accessor simplify: number = 0;

  @Prop<number>({ type: Number, reflect: true, defaultValue: 5 })
  accessor round: number = 5;

  #getEventTarget = (): CurveHost => {
    const root = this.getRootNode();
    if (root instanceof ShadowRoot && root.host instanceof HTMLElement) {
      return root.host as CurveHost;
    }
    return this as unknown as CurveHost;
  };

  #getLinearPoints = (): LinearPoints | null => {
    if (!Array.isArray(this.points)) {
      return null;
    }
    return this.points;
  };

  #notifyHost = <TValue>(type: HostEventType, value: TValue, event: Event): void => {
    const target = this.#getEventTarget();
    const detail: ControlEventDetail<TValue> = { value, event };
    dispatchControlEvent(target, type, detail);
  };

  #emitPoints = (points: LinearPoints, event: Event): void => {
    this.points = points;
    this.#notifyHost('points-change', points, event);
  };

  readonly toggleGrid = (event: Event): void => {
    event.preventDefault();
    const nextValue = !this.showGrid;
    this.showGrid = nextValue;
    this.#notifyHost('grid-toggle', nextValue, event);
  };

  readonly toggleSnapToGrid = (event: Event): void => {
    event.preventDefault();
    const nextValue = !this.snapToGrid;
    this.snapToGrid = nextValue;
    this.#notifyHost('snap-toggle', nextValue, event);
  };

  readonly resetCurve = (event: Event): void => {
    event.preventDefault();

    if (this.easingType === EasingType.CUBIC_BEZIER) {
      const defaults: CubicBezierPoints = {
        p1: { x: 0.25, y: 0.1 },
        p2: { x: 0.25, y: 1 }
      };
      this.points = defaults;
      this.#notifyHost('points-change', defaults, event);
      return;
    }

    const defaults: LinearPoints = [
      { x: 0, y: 0 },
      { x: 1, y: 1 }
    ];
    this.points = defaults;
    this.#notifyHost('points-change', defaults, event);
    this.#notifyHost('linear-point-focus', null, event);
  };

  readonly distributeLinearPoints = (event: Event): void => {
    event.preventDefault();

    const points = this.#getLinearPoints();
    if (!points || points.length <= MIN_LINEAR_POINTS) {
      return;
    }

    const lastIndex = points.length - 1;
    const step = lastIndex > 0 ? 1 / lastIndex : 0;

    const distributed: LinearPoints = points.map((point, index) => {
      const updated: LinearPoint = { ...point };

      if (index === 0) {
        updated.x = 0;
      } else if (index === lastIndex) {
        updated.x = 1;
      } else {
        updated.x = Number.parseFloat((step * index).toFixed(4));
      }

      delete updated.cpInX;
      delete updated.cpInY;
      delete updated.cpOutX;
      delete updated.cpOutY;
      delete updated.isLinked;

      return updated;
    });

    const normalizedPoints = normalizeLinearPoints(distributed);
    this.#emitPoints(normalizedPoints, event);
  };

  readonly addLinearPoint = (event: Event): void => {
    event.preventDefault();

    if (this.easingType !== EasingType.LINEAR) {
      return;
    }

    const points = this.#getLinearPoints();
    if (!points || points.length >= MAX_LINEAR_POINTS) {
      return;
    }

    let insertIndex = 0;
    let largestGap = -Infinity;

    for (let index = 0; index < points.length - 1; index += 1) {
      const start = points[index];
      const end = points[index + 1];

      if (!start || !end) {
        continue;
      }

      const gap = end.x - start.x;

      if (gap > largestGap) {
        largestGap = gap;
        insertIndex = index;
      }
    }

    const startPoint = points[insertIndex];
    const endPoint = points[insertIndex + 1];

    if (!startPoint || !endPoint) {
      return;
    }

    const newPointPosition = clampPoint(
      {
        x: (startPoint.x + endPoint.x) / 2,
        y: (startPoint.y + endPoint.y) / 2
      },
      { minY: -2, maxY: 3 }
    );
    const newPoint: LinearPoint = {
      x: newPointPosition.x,
      y: newPointPosition.y,
      cpInX: -0.1,
      cpInY: 0,
      cpOutX: 0.1,
      cpOutY: 0,
      isLinked: true,
      mirrorLength: true
    };

    const updatedPoints: LinearPoints = [
      ...points.slice(0, insertIndex + 1),
      newPoint,
      ...points.slice(insertIndex + 1)
    ];

    const insertedIndex = insertIndex + 1;
    const normalizedPoints = normalizeLinearPoints(updatedPoints);
    this.#emitPoints(normalizedPoints, event);
    this.#notifyHost('linear-point-focus', insertedIndex, event);
  };

  readonly removeLinearPoint = (event: Event): void => {
    event.preventDefault();

    if (this.easingType !== EasingType.LINEAR) {
      return;
    }

    const points = this.#getLinearPoints();
    if (!points || points.length <= MIN_LINEAR_POINTS) {
      return;
    }

    let removeIndex = 1;
    let smallestSpan = Number.POSITIVE_INFINITY;

    for (let index = 1; index < points.length - 1; index += 1) {
      const previous = points[index - 1];
      const next = points[index + 1];

      if (!previous || !next) {
        continue;
      }

      const span = next.x - previous.x;

      if (span < smallestSpan) {
        smallestSpan = span;
        removeIndex = index;
      }
    }

    if (removeIndex > 0 && removeIndex < points.length - 1) {
      const updatedPoints: LinearPoints = points
        .filter((_, pointIndex) => pointIndex !== removeIndex)
        .map((point) => {
          return { ...point };
        });

      const normalizedPoints = normalizeLinearPoints(updatedPoints);
      this.#emitPoints(normalizedPoints, event);

      const nextIndex = removeIndex - 1;
      this.#notifyHost('linear-point-focus', nextIndex, event);
    }
  };

  readonly incrementGridSize = (event: Event): void => {
    event.preventDefault();
    this.#commitGridSize(this.gridSize + 1, event);
  };

  readonly decrementGridSize = (event: Event): void => {
    event.preventDefault();
    this.#commitGridSize(this.gridSize - 1, event);
  };

  readonly handleSimplifyInput = (event: Event): void => {
    const customEvent = event as CustomEvent<ControlEventDetail<number>>;
    const value = customEvent.detail?.value ?? 0;
    this.simplify = Number(value);
    this.#notifyHost('simplify-change', this.simplify, event);
  };

  readonly handleRoundInput = (event: Event): void => {
    const customEvent = event as CustomEvent<ControlEventDetail<number>>;
    const value = customEvent.detail?.value ?? 0;
    this.round = Number(value);
    this.#notifyHost('round-change', this.round, event);
  };

  #clampGridSize = (value: number): number => Math.max(1, Math.min(24, Math.round(value)));

  #commitGridSize = (value: number, event: Event): void => {
    const nextValue = this.#clampGridSize(value);
    if (this.gridSize === nextValue) {
      this.requestRender();
      return;
    }
    this.gridSize = nextValue;
    this.#notifyHost('grid-size-change', this.gridSize, event);
    this.requestRender();
  };
}
