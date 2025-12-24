import { html } from 'lit-html';

import { DEFAULT_HANDLE_LENGTH } from './constants';
import { canvasControlsStyles } from './styles';
import { type CubicBezierPoints, EasingType, type LinearPoint, type LinearPoints } from './types';
import { normalizeLinearPoints, normalizeVector, vectorLength } from './utils';

import { Component } from '~/decorators/Component';
import { Prop } from '~/decorators/Prop';
import { type ControlEventDetail, dispatchControlEvent } from '~/elements/shared';

type CurveHost = HTMLElement & {
  easingType: EasingType;
  points: CubicBezierPoints | LinearPoints;
  focusedLinearIndex: number | null;
  handlePointsChange?: (event: CustomEvent<ControlEventDetail<CubicBezierPoints | LinearPoints>>) => void;
  handleLinearPointFocus?: (event: CustomEvent<ControlEventDetail<number | null>>) => void;
};

const HOST_HANDLER_MAP = {
  'points-change': 'handlePointsChange',
  'linear-point-focus': 'handleLinearPointFocus'
} as const;

type HostEventType = keyof typeof HOST_HANDLER_MAP;

@Component({
  tag: 'ease-curve-canvas-controls',
  styles: canvasControlsStyles,
  template(this: CanvasControls) {
    if (this.easingType !== EasingType.LINEAR || !Array.isArray(this.points)) {
      return null;
    }

    const focusedIndex = this.focusedLinearIndex;
    if (focusedIndex === null) {
      return null;
    }

    const points = this.points as LinearPoints;
    const selectedPoint = points[focusedIndex];
    if (!selectedPoint) {
      return null;
    }

    const isInnerPoint = focusedIndex > 0 && focusedIndex < points.length - 1;
    if (!isInnerPoint) {
      return null;
    }

    const hasInHandle = selectedPoint.cpInX !== undefined || selectedPoint.cpInY !== undefined;
    const hasOutHandle = selectedPoint.cpOutX !== undefined || selectedPoint.cpOutY !== undefined;
    const hasAnyHandle = hasInHandle || hasOutHandle;

    return html`
      <div class="overlay-controls">
        <button
          type="button"
          class="overlay-button ${selectedPoint.isLinked ? 'active' : 'inactive'}"
          @click=${this.handleToggleMirrorAngle}
        >
          <ease-icon-bezier-angle></ease-icon-bezier-angle>
        </button>
        <button
          type="button"
          class="overlay-button ${selectedPoint.mirrorLength !== false && selectedPoint.isLinked ? 'active' : 'inactive'}"
          @click=${this.handleToggleMirrorLength}
          ?disabled=${!selectedPoint.isLinked}
        >
          <ease-icon-bezier-length></ease-icon-bezier-length>
        </button>
        ${
          hasAnyHandle
            ? html`
            <button
              type="button"
              class="overlay-button"
              @click=${this.handleRemoveSmoothing}
            >
              <ease-icon-bezier></ease-icon-bezier>
            </button>
          `
            : html`
            <button
              type="button"
              class="overlay-button"
              @click=${this.handleAddSmoothing}
            >
              <ease-icon-bezier-mirror></ease-icon-bezier-mirror>
            </button>
          `
        }
      </div>
    `;
  }
})
export class CanvasControls extends HTMLElement {
  declare requestRender: () => void;

  @Prop<EasingType>({ reflect: true })
  accessor easingType!: EasingType;

  @Prop<CubicBezierPoints | LinearPoints>({ type: Object, reflect: false })
  accessor points!: CubicBezierPoints | LinearPoints;

  @Prop<number | null>({ type: Number, reflect: false, defaultValue: null })
  accessor focusedLinearIndex: number | null = null;

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

  readonly handleToggleMirrorAngle = (event: Event): void => {
    event.preventDefault();
    const points = this.#getLinearPoints();
    if (!points) {
      return;
    }

    const index = this.focusedLinearIndex;
    if (index === null) {
      return;
    }

    const point = points[index];
    if (!point) {
      return;
    }

    const updatedPoints = [...points];
    const updatedPoint = { ...point };
    updatedPoints[index] = updatedPoint;

    const nextState = !updatedPoint.isLinked;
    if (nextState) {
      this.#ensureSmoothHandles(updatedPoint, index, points);
      updatedPoint.mirrorLength = true;
      this.#alignMirrorLength(updatedPoint);
    } else {
      updatedPoint.mirrorLength = false;
    }
    updatedPoint.isLinked = nextState;

    const normalizedPoints = normalizeLinearPoints(updatedPoints);
    this.#emitPoints(normalizedPoints, event);
    this.focusedLinearIndex = index;
    this.#notifyHost('linear-point-focus', index, event);
  };

  readonly handleToggleMirrorLength = (event: Event): void => {
    event.preventDefault();
    const points = this.#getLinearPoints();
    if (!points) {
      return;
    }

    const index = this.focusedLinearIndex;
    if (index === null) {
      return;
    }

    const point = points[index];
    if (!point || !point.isLinked) {
      return;
    }

    const updatedPoints = [...points];
    const updatedPoint = { ...point };
    updatedPoints[index] = updatedPoint;

    const nextState = updatedPoint.mirrorLength === false;
    updatedPoint.mirrorLength = nextState;
    if (nextState) {
      this.#ensureSmoothHandles(updatedPoint, index, points);
      this.#alignMirrorLength(updatedPoint);
    }

    const normalizedPoints = normalizeLinearPoints(updatedPoints);
    this.#emitPoints(normalizedPoints, event);
    this.focusedLinearIndex = index;
    this.#notifyHost('linear-point-focus', index, event);
  };

  readonly handleRemoveSmoothing = (event: Event): void => {
    event.preventDefault();
    const points = this.#getLinearPoints();
    if (!points) {
      return;
    }

    const index = this.focusedLinearIndex;
    if (index === null) {
      return;
    }

    const existingPoint = points[index];
    if (!existingPoint) {
      return;
    }

    const updatedPoints = [...points];
    const updatedPoint: LinearPoint = { ...existingPoint };
    updatedPoints[index] = updatedPoint;

    delete updatedPoint.cpInX;
    delete updatedPoint.cpInY;
    delete updatedPoint.cpOutX;
    delete updatedPoint.cpOutY;
    delete updatedPoint.isLinked;
    delete updatedPoint.mirrorLength;

    const normalizedPoints = normalizeLinearPoints(updatedPoints);
    this.#emitPoints(normalizedPoints, event);
    this.focusedLinearIndex = index;
    this.#notifyHost('linear-point-focus', index, event);
  };

  readonly handleAddSmoothing = (event: Event): void => {
    event.preventDefault();
    const points = this.#getLinearPoints();
    if (!points) {
      return;
    }

    const index = this.focusedLinearIndex;
    if (index === null) {
      return;
    }

    const point = points[index];
    if (!point) {
      return;
    }

    const updatedPoints = [...points];
    const updatedPoint = { ...point };
    updatedPoints[index] = updatedPoint;

    this.#ensureSmoothHandles(updatedPoint, index, points);
    updatedPoint.isLinked = true;
    updatedPoint.mirrorLength = true;
    this.#alignMirrorLength(updatedPoint);

    const normalizedPoints = normalizeLinearPoints(updatedPoints);
    this.#emitPoints(normalizedPoints, event);
    this.focusedLinearIndex = index;
    this.#notifyHost('linear-point-focus', index, event);
  };

  #ensureSmoothHandles(point: LinearPoint, index: number, points: LinearPoints): void {
    const prev = points[index - 1];
    const next = points[index + 1];

    let refDx = point.cpOutX ?? -(point.cpInX ?? 0);
    let refDy = point.cpOutY ?? -(point.cpInY ?? 0);

    if (refDx === 0 && refDy === 0) {
      let dirX = 0;
      let dirY = 0;

      if (prev && next) {
        dirX = next.x - prev.x;
        dirY = next.y - prev.y;
      } else if (next) {
        dirX = next.x - point.x;
        dirY = next.y - point.y;
      } else if (prev) {
        dirX = point.x - prev.x;
        dirY = point.y - prev.y;
      } else {
        dirX = 1;
        dirY = 0;
      }

      const direction = normalizeVector(dirX, dirY);
      const length = DEFAULT_HANDLE_LENGTH;

      point.cpInX = -direction.dx * length;
      point.cpInY = -direction.dy * length;
      point.cpOutX = direction.dx * length;
      point.cpOutY = direction.dy * length;
      refDx = point.cpOutX;
      refDy = point.cpOutY;
    }

    if (refDx === 0 && refDy === 0) {
      return;
    }

    const normalized = normalizeVector(refDx, refDy);
    const referenceLength = vectorLength(refDx, refDy);

    const inLength = vectorLength(point.cpInX ?? 0, point.cpInY ?? 0) || referenceLength;
    point.cpInX = -normalized.dx * inLength;
    point.cpInY = -normalized.dy * inLength;

    const outLength = vectorLength(point.cpOutX ?? 0, point.cpOutY ?? 0) || referenceLength;
    point.cpOutX = normalized.dx * outLength;
    point.cpOutY = normalized.dy * outLength;
  }

  #alignMirrorLength(point: LinearPoint): void {
    if (!point.isLinked) {
      point.mirrorLength = false;
      return;
    }

    const outLength = vectorLength(point.cpOutX ?? 0, point.cpOutY ?? 0);
    const inLength = vectorLength(point.cpInX ?? 0, point.cpInY ?? 0);
    const targetLength = Math.max(outLength, inLength);

    if (targetLength <= 0) {
      return;
    }

    if (outLength > 0) {
      const outDirection = normalizeVector(point.cpOutX ?? 0, point.cpOutY ?? 0);
      point.cpOutX = outDirection.dx * targetLength;
      point.cpOutY = outDirection.dy * targetLength;
    } else if (inLength > 0) {
      const inDirection = normalizeVector(point.cpInX ?? 0, point.cpInY ?? 0);
      point.cpOutX = -inDirection.dx * targetLength;
      point.cpOutY = -inDirection.dy * targetLength;
    }

    if (inLength > 0) {
      const inDirection = normalizeVector(point.cpInX ?? 0, point.cpInY ?? 0);
      point.cpInX = inDirection.dx * targetLength;
      point.cpInY = inDirection.dy * targetLength;
    } else if (outLength > 0) {
      const outDirection = normalizeVector(point.cpOutX ?? 0, point.cpOutY ?? 0);
      point.cpInX = -outDirection.dx * targetLength;
      point.cpInY = -outDirection.dy * targetLength;
    }
  }
}
