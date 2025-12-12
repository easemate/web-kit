import { Component } from '@/Component';
import { Prop } from '@/Prop';

import { html, type TemplateResult } from 'lit-html';

import { type ControlEventDetail, dispatchControlEvent } from '../shared';
import { DEFAULT_HANDLE_LENGTH, EASING_PRESETS } from './constants';
import { controlsStyles } from './styles';
import {
  type CubicBezierPoints,
  EasingType,
  type LinearPoint,
  type LinearPoints,
  MAX_LINEAR_POINTS,
  MIN_LINEAR_POINTS
} from './types';
import {
  clampPoint,
  MIN_LINEAR_DELTA,
  normalizeLinearPoints,
  normalizeVector,
  parseCubicBezierValue,
  parseLinearTimingFunction,
  vectorLength
} from './utils';

import '../icons/interface/minus';
import '../icons/interface/plus';
import '../button';

type CurveHost = HTMLElement & {
  easingType: EasingType;
  points: CubicBezierPoints | LinearPoints;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  focusedLinearIndex: number | null;
  handleEasingTypeChange?: (event: CustomEvent<ControlEventDetail<EasingType>>) => void;
  handleGridToggle?: (event: CustomEvent<ControlEventDetail<boolean>>) => void;
  handleGridSizeChange?: (event: KeyboardEvent) => void;
  handleSnapToggle?: (event: CustomEvent<ControlEventDetail<boolean>>) => void;
  handlePointsChange?: (event: CustomEvent<ControlEventDetail<CubicBezierPoints | LinearPoints>>) => void;
  handleLinearPointFocus?: (event: CustomEvent<ControlEventDetail<number | null>>) => void;
};

const HOST_HANDLER_MAP = {
  'easing-type-change': 'handleEasingTypeChange',
  'grid-toggle': 'handleGridToggle',
  'snap-toggle': 'handleSnapToggle',
  'grid-size-change': 'handleGridSizeChange',
  'points-change': 'handlePointsChange',
  'linear-point-focus': 'handleLinearPointFocus'
} as const;

type HostEventType = keyof typeof HOST_HANDLER_MAP;

@Component({
  tag: 'ease-curve-controls',
  styles: controlsStyles,
  template(this: CurveControls) {
    const isGridAtMinimum = this.gridSize <= 1;
    const isGridAtMaximum = this.gridSize >= 24;
    return html`
      <ease-field label="Easing">
        <ease-dropdown
          placeholder="Select"
          id="demo-easing-type"
          name="demo-easing-type"
          searchable
          .value=${this._activePresetValue}
          @change=${this.handlePresetSelection}
        >
          ${EASING_PRESETS.map(
            ({ label, options }, index) => html`
            ${index > 0 ? html`<hr slot="content" />` : null}

            <h4 slot="content">${label}</h4>
            ${options.map(
              ({ value, label }) => html`
              <button slot="content" type="button" value=${value}>${label}</button>`
            )}
          `
          )}
        </ease-dropdown>
      </ease-field>

      <ease-field label="Type">
        <ease-radio-group .value=${this.easingType} @change=${this.handleTypeChange}>
          <ease-button slot="content" value=${EasingType.CUBIC_BEZIER} pill>Cubic</ease-button>
          <ease-button slot="content" value=${EasingType.LINEAR} pill>Linear</ease-button>
        </ease-radio-group>
      </ease-field>

      <div class="control-group">
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

      <!-- <div class="control-group">
        <button class="control-button" @click=${this.resetCurve}>Reset</button>
        ${
          this.easingType === EasingType.LINEAR && Array.isArray(this.points) && this.points.length > MIN_LINEAR_POINTS
            ? html`<button class="control-button" @click=${this.distributeLinearPoints}>Distribute X</button>`
            : null
        }
      </div> -->

      <!-- ${
        this.easingType === EasingType.LINEAR
          ? html`
              <div class="control-group">
                <button
                  class="control-button add-point-button"
                  @click=${this.addLinearPoint}
                  ?disabled=${this.maxPointsReached}
                >
                  Add Point
                </button>
                <button
                  class="control-button remove-point-button"
                  @click=${this.removeLinearPoint}
                  ?disabled=${this.minPointsReached}
                >
                  Remove Point
                </button>
              </div>
              ${this.renderLinearDetailsControls()}
            `
          : null
      } -->

      <!-- <div class="control-group grid-controls">
        <div class="grid-buttons">
          <button
            class="control-button ${this.showGrid ? 'active' : ''}"
            @click=${this.toggleGrid}
          >
            ${this.showGrid ? 'Hide Grid' : 'Show Grid'}
          </button>
          <button
            class="control-button ${this.snapToGrid ? 'active' : ''}"
            @click=${this.toggleSnapToGrid}
          >
            ${this.snapToGrid ? 'Snap Off' : 'Snap On'}
          </button>
        </div>
      </div> -->
    `;
  }
})
export class CurveControls extends HTMLElement {
  declare requestRender: () => void;

  @Prop<EasingType>({ reflect: true })
  accessor easingType!: EasingType;

  @Prop<CubicBezierPoints | LinearPoints, CurveControls>({
    type: Object,
    reflect: false,
    onChange(this: CurveControls) {
      this.handlePointsPropChange();
    }
  })
  accessor points!: CubicBezierPoints | LinearPoints;

  @Prop<boolean>({ type: Boolean, reflect: true, defaultValue: true })
  accessor showGrid!: boolean;

  @Prop<boolean>({ type: Boolean, reflect: true, defaultValue: false })
  accessor snapToGrid!: boolean;

  @Prop<number>({ type: Number, reflect: true, defaultValue: 8 })
  accessor gridSize: number = 8;

  @Prop<number | null, CurveControls>({
    type: Number,
    reflect: false,
    defaultValue: null,
    onChange(this: CurveControls, value: number | null) {
      this.handleFocusedLinearIndexPropChange(value);
    }
  })
  accessor focusedLinearIndex: number | null = null;

  private _activePresetValue: string | null = null;
  private isApplyingPreset = false;

  #setActivePreset(value: string | null): void {
    if (this._activePresetValue === value) {
      return;
    }
    this._activePresetValue = value;
    this.requestRender();
  }

  #clearActivePreset(): void {
    if (this._activePresetValue === null) {
      return;
    }
    this._activePresetValue = null;
    this.requestRender();
  }

  handleFocusedLinearIndexPropChange(_value: number | null): void {
    this.requestRender();
  }

  handlePointsPropChange(): void {
    if (this.isApplyingPreset) {
      return;
    }
    this.#clearActivePreset();
  }

  get maxPointsReached(): boolean {
    const points = this.#getLinearPoints();
    return points !== null && points.length >= MAX_LINEAR_POINTS;
  }

  get minPointsReached(): boolean {
    const points = this.#getLinearPoints();
    return points !== null && points.length <= MIN_LINEAR_POINTS;
  }

  #getEventTarget = (): CurveHost => {
    const root = this.getRootNode();
    if (root instanceof ShadowRoot && root.host instanceof HTMLElement) {
      return root.host as CurveHost;
    }
    return this as CurveHost;
  };

  #getLinearPoints = (): LinearPoints | null => {
    if (!Array.isArray(this.points)) {
      return null;
    }

    return this.points;
  };

  renderLinearDetailsControls(): TemplateResult | null {
    const points = this.#getLinearPoints();

    if (!points) {
      return null;
    }

    if (points.length < MIN_LINEAR_POINTS) {
      return html`
        <div class="control-group details-group">
          <span class="details-empty">Curve requires at least 2 points.</span>
        </div>
      `;
    }

    const focusedIndex = this.focusedLinearIndex;

    if (focusedIndex === null) {
      return html`
        <div class="control-group details-group">
            <div class="details-panel">
              <span class="details-empty">Select a point on the canvas to edit its details.</span>
            </div>
        </div>
      `;
    }

    const selectedPoint = points[focusedIndex];
    if (!selectedPoint) {
      return null;
    }

    const previousIndex = focusedIndex > 0 ? focusedIndex - 1 : null;
    const nextIndex = focusedIndex < points.length - 1 ? focusedIndex + 1 : null;

    const isInnerPoint = focusedIndex > 0 && focusedIndex < points.length - 1;

    const pointMeta = `${(selectedPoint.x * 100).toFixed(0)}%, ${(selectedPoint.y * 100).toFixed(0)}%`;
    const pointType = selectedPoint.isLinked ? 'Smooth' : 'Corner';
    const hasInHandle = selectedPoint.cpInX !== undefined || selectedPoint.cpInY !== undefined;
    const hasOutHandle = selectedPoint.cpOutX !== undefined || selectedPoint.cpOutY !== undefined;
    const hasAnyHandle = hasInHandle || hasOutHandle;

    return html`
      <div class="control-group details-group">
        <div class="details-panel" role="group" aria-label="Linear point details">
          <div class="point-navigation">
            <button
              type="button"
              class="control-button"
              @click=${(event: Event) => this.#focusIndex(event, previousIndex)}
              ?disabled=${previousIndex === null}
            >
              Previous
            </button>
            <div class="point-state" aria-live="polite">
              <span>P${focusedIndex + 1}</span>
              <span>${pointMeta}</span>
              <span>(${pointType})</span>
            </div>
            <button
              type="button"
              class="control-button"
              @click=${(event: Event) => this.#focusIndex(event, nextIndex)}
              ?disabled=${nextIndex === null}
            >
              Next
            </button>
          </div>

          <div class="coordinate-editor" role="group" aria-label="Point coordinates">
            <label class="coordinate-field">
              <span>X</span>
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                .value=${selectedPoint.x.toFixed(2)}
                data-axis="x"
                ?disabled=${!isInnerPoint}
                @change=${this.#handleCoordinateInput}
              />
            </label>
            <label class="coordinate-field">
              <span>Y</span>
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                .value=${selectedPoint.y.toFixed(2)}
                data-axis="y"
                @change=${this.#handleCoordinateInput}
              />
            </label>
            <button
              type="button"
              class="coordinate-remove"
              ?disabled=${!isInnerPoint || points.length <= MIN_LINEAR_POINTS}
              @click=${this.#handleRemoveSelectedPoint}
            >
              Remove
            </button>
          </div>

          ${
            isInnerPoint
              ? html`
                  <div class="point-type-controls" role="group" aria-label="Point type controls">
                    <button
                      type="button"
                      class="control-button ${!selectedPoint.isLinked ? 'active' : ''}"
                      data-type="corner"
                      @click=${this.#handlePointTypeChange}
                    >
                      Corner (Independent)
                    </button>
                    <button
                      type="button"
                      class="control-button ${selectedPoint.isLinked ? 'active' : ''}"
                      data-type="smooth"
                      @click=${this.#handlePointTypeChange}
                    >
                      Smooth (Linked)
                    </button>
                    <button
                      type="button"
                      class="control-button ${selectedPoint.isLinked ? 'active' : ''}"
                      data-type="mirror-angle"
                      @click=${this.#handlePointTypeChange}
                    >
                      Mirror Angle: ${selectedPoint.isLinked ? 'On' : 'Off'}
                    </button>
                    <button
                      type="button"
                      class="control-button ${selectedPoint.mirrorLength !== false ? 'active' : ''}"
                      data-type="mirror-length"
                      @click=${this.#handlePointTypeChange}
                      ?disabled=${!selectedPoint.isLinked}
                    >
                      Mirror Length: ${selectedPoint.mirrorLength === false ? 'Off' : 'On'}
                    </button>
                  </div>

                  <div class="handle-actions" role="group" aria-label="Handle removal controls">
                    <button
                      type="button"
                      class="control-button"
                      data-handle="both"
                      @click=${this.#handleRemoveHandles}
                      ?disabled=${!hasAnyHandle}
                    >
                      Remove Both Handles
                    </button>
                    <button
                      type="button"
                      class="control-button"
                      data-handle="in"
                      @click=${this.#handleRemoveHandles}
                      ?disabled=${!hasInHandle}
                    >
                      Remove Incoming Handle
                    </button>
                    <button
                      type="button"
                      class="control-button"
                      data-handle="out"
                      @click=${this.#handleRemoveHandles}
                      ?disabled=${!hasOutHandle}
                    >
                      Remove Outgoing Handle
                    </button>
                  </div>
                `
              : this.#renderEndpointHandleControls(selectedPoint, focusedIndex)
          }
        </div>
      </div>
    `;
  }

  #handleCoordinateInput = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const axis = target.dataset.axis;
    if (axis !== 'x' && axis !== 'y') {
      return;
    }

    const points = this.#getLinearPoints();
    if (!points) {
      return;
    }

    const index = this.focusedLinearIndex;
    if (index === null) {
      return;
    }

    const selectedPoint = points[index];
    if (!selectedPoint) {
      return;
    }

    const parsed = Number.parseFloat(target.value);

    if (Number.isNaN(parsed)) {
      target.value = selectedPoint[axis].toFixed(2);
      return;
    }

    const updatedPoints: LinearPoints = points.map((point, pointIndex) => {
      if (pointIndex !== index) {
        return { ...point };
      }

      const updated: LinearPoint = { ...point };

      if (axis === 'x') {
        if (index === 0 || index === points.length - 1) {
          return updated;
        }

        const previous = points[index - 1];
        const next = points[index + 1];
        const minX = previous ? previous.x + MIN_LINEAR_DELTA : 0;
        const maxX = next ? next.x - MIN_LINEAR_DELTA : 1;
        updated.x = Math.min(Math.max(parsed, minX), maxX);
      } else {
        updated.y = Math.min(Math.max(parsed, 0), 1);
      }

      return updated;
    });

    const normalizedPoints = normalizeLinearPoints(updatedPoints);
    this.#emitPoints(normalizedPoints, event);
    this.focusedLinearIndex = index;
    this.#notifyHost('linear-point-focus', index, event);

    const refreshedPoint = normalizedPoints[index];

    if (refreshedPoint) {
      target.value = refreshedPoint[axis].toFixed(2);
    }
  };

  #handleRemoveSelectedPoint = (event: Event): void => {
    const index = this.focusedLinearIndex;

    if (index === null) {
      return;
    }

    this.#removeLinearPointAt(index, event);
  };

  #handlePointTypeChange = (event: Event): void => {
    event.preventDefault();
    const target = event.currentTarget;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const type = target.dataset.type;
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

    switch (type) {
      case 'corner': {
        updatedPoint.isLinked = false;
        updatedPoint.mirrorLength = false;
        break;
      }
      case 'smooth': {
        this.#ensureSmoothHandles(updatedPoint, index, points);
        updatedPoint.isLinked = true;
        updatedPoint.mirrorLength = true;
        this.#alignMirrorLength(updatedPoint);
        break;
      }
      case 'mirror-angle': {
        const nextState = !updatedPoint.isLinked;
        if (nextState) {
          this.#ensureSmoothHandles(updatedPoint, index, points);
          updatedPoint.mirrorLength = true;
          this.#alignMirrorLength(updatedPoint);
        } else {
          updatedPoint.mirrorLength = false;
        }
        updatedPoint.isLinked = nextState;
        break;
      }
      case 'mirror-length': {
        if (!updatedPoint.isLinked) {
          break;
        }
        const nextState = updatedPoint.mirrorLength === false;
        updatedPoint.mirrorLength = nextState;
        if (nextState) {
          this.#ensureSmoothHandles(updatedPoint, index, points);
          this.#alignMirrorLength(updatedPoint);
        }
        break;
      }
      default:
        return;
    }

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

  #handleRemoveHandles = (event: Event): void => {
    event.preventDefault();
    const target = event.currentTarget;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const mode = (target.dataset.handle as 'in' | 'out' | 'both' | undefined) ?? 'both';

    const points = this.#getLinearPoints();
    if (!points) {
      return;
    }

    const index = this.focusedLinearIndex;
    if (index === null) {
      return;
    }

    const updatedPoints = [...points];
    const existingPoint = updatedPoints[index];
    if (!existingPoint) {
      return;
    }

    const updatedPoint: LinearPoint = { ...existingPoint };
    updatedPoints[index] = updatedPoint;

    const removeIncoming = mode === 'both' || mode === 'in';
    const removeOutgoing = mode === 'both' || mode === 'out';

    if (removeIncoming) {
      delete updatedPoint.cpInX;
      delete updatedPoint.cpInY;
    }

    if (removeOutgoing) {
      delete updatedPoint.cpOutX;
      delete updatedPoint.cpOutY;
    }

    if (removeIncoming && removeOutgoing) {
      delete updatedPoint.isLinked;
      delete updatedPoint.mirrorLength;
    } else if (removeIncoming || removeOutgoing) {
      updatedPoint.isLinked = false;
      updatedPoint.mirrorLength = false;
    }

    const normalizedPoints = normalizeLinearPoints(updatedPoints);
    this.#emitPoints(normalizedPoints, event);
    this.focusedLinearIndex = index;
    this.#notifyHost('linear-point-focus', index, event);
  };

  #renderEndpointHandleControls(point: LinearPoint, index: number): TemplateResult {
    const isStart = index === 0;
    const handleKey: 'in' | 'out' = isStart ? 'out' : 'in';
    const handleLabel = isStart ? 'Outgoing' : 'Incoming';
    const hasHandle =
      handleKey === 'out'
        ? point.cpOutX !== undefined || point.cpOutY !== undefined
        : point.cpInX !== undefined || point.cpInY !== undefined;

    return html`
      <div class="handle-actions" role="group" aria-label="${handleLabel} handle controls">
        <button
          type="button"
          class="control-button"
          data-handle=${handleKey}
          @click=${this.#handleEndpointHandleAdd}
          ?disabled=${hasHandle}
        >
          Add ${handleLabel} Handle
        </button>
        <button
          type="button"
          class="control-button"
          data-handle=${handleKey}
          @click=${this.#handleRemoveHandles}
          ?disabled=${!hasHandle}
        >
          Remove ${handleLabel} Handle
        </button>
      </div>
    `;
  }

  #handleEndpointHandleAdd = (event: Event): void => {
    event.preventDefault();
    const target = event.currentTarget;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const handle = target.dataset.handle;
    if (handle !== 'in' && handle !== 'out') {
      return;
    }

    const points = this.#getLinearPoints();
    if (!points) {
      return;
    }

    const index = this.focusedLinearIndex;
    if (index === null) {
      return;
    }

    const neighborIndex = handle === 'out' ? index + 1 : index - 1;
    const neighbor = points[neighborIndex];
    if (!neighbor) {
      return;
    }

    const updatedPoints = [...points];
    const existingPoint = updatedPoints[index];
    if (!existingPoint) {
      return;
    }

    const updatedPoint: LinearPoint = { ...existingPoint };
    updatedPoints[index] = updatedPoint;

    this.#createEndpointHandle(updatedPoint, neighbor, handle);

    const normalizedPoints = normalizeLinearPoints(updatedPoints);
    this.#emitPoints(normalizedPoints, event);
    this.focusedLinearIndex = index;
    this.#notifyHost('linear-point-focus', index, event);
  };

  #createEndpointHandle(point: LinearPoint, neighbor: LinearPoint, handle: 'in' | 'out'): void {
    const dx = neighbor.x - point.x;
    const dy = neighbor.y - point.y;

    const direction = normalizeVector(dx, dy);
    const fallbackDirection = handle === 'out' ? { dx: 1, dy: 0 } : { dx: -1, dy: 0 };
    const finalDirection = direction.dx === 0 && direction.dy === 0 ? fallbackDirection : direction;

    const gap = Math.abs(dx);
    const baseLength = gap > 0 ? gap * 0.5 : MIN_LINEAR_DELTA * 0.5;
    const length = Math.min(DEFAULT_HANDLE_LENGTH, Math.max(MIN_LINEAR_DELTA * 0.5, baseLength));

    if (handle === 'out') {
      point.cpOutX = finalDirection.dx * length;
      point.cpOutY = finalDirection.dy * length;
    } else {
      point.cpInX = finalDirection.dx * length;
      point.cpInY = finalDirection.dy * length;
    }

    point.isLinked = false;
    point.mirrorLength = false;
  }

  #removeLinearPointAt(index: number, event: Event): void {
    const points = this.#getLinearPoints();

    if (!points || points.length <= MIN_LINEAR_POINTS) {
      return;
    }

    if (index <= 0 || index >= points.length - 1) {
      return;
    }

    const updatedPoints: LinearPoints = points
      .filter((_, pointIndex) => pointIndex !== index)
      .map((point) => {
        return { ...point };
      });

    const normalizedPoints = normalizeLinearPoints(updatedPoints);
    this.#emitPoints(normalizedPoints, event);

    const nextIndex = index - 1;

    this.focusedLinearIndex = nextIndex;
    this.#notifyHost('linear-point-focus', nextIndex, event);
  }

  readonly resetCurve = (event: Event): void => {
    event.preventDefault();
    this.#clearActivePreset();

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
    this.focusedLinearIndex = null;
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

    if (this.focusedLinearIndex !== null) {
      this.#notifyHost('linear-point-focus', this.focusedLinearIndex, event);
    }
  };

  #focusIndex = (event: Event, index: number | null): void => {
    event.preventDefault();
    if (index !== null) {
      this.focusedLinearIndex = index;
      this.#notifyHost('linear-point-focus', index, event);
    }
  };

  #setEasingType = (type: EasingType, event: Event): void => {
    if (this.easingType === type) {
      return;
    }

    if (!this.isApplyingPreset) {
      this.#clearActivePreset();
    }

    this.easingType = type;
    this.#notifyHost('easing-type-change', type, event);
  };

  #emitPoints = (points: LinearPoints, event: Event): void => {
    if (!this.isApplyingPreset) {
      this.#clearActivePreset();
    }
    this.points = points;
    this.#notifyHost('points-change', points, event);
  };

  #applyPreset = (
    points: CubicBezierPoints | LinearPoints,
    type: EasingType,
    presetValue: string,
    event: Event
  ): void => {
    this.isApplyingPreset = true;
    if (this.easingType !== type) {
      this.#setEasingType(type, event);
    }

    this.points = points;
    this.focusedLinearIndex = null;
    this.#setActivePreset(presetValue);
    this.#notifyHost('points-change', points, event);

    if (type === EasingType.LINEAR) {
      this.#notifyHost('linear-point-focus', null, event);
    }

    this.isApplyingPreset = false;
  };

  readonly handleTypeChange = (event: CustomEvent<ControlEventDetail<string>>): void => {
    const detail = event.detail;

    if (!detail) {
      return;
    }

    const { value, event: originEvent } = detail;

    if (value === EasingType.CUBIC_BEZIER || value === EasingType.LINEAR) {
      this.#clearActivePreset();
      this.#setEasingType(value, originEvent ?? event);
    }
  };

  readonly handlePresetSelection = (event: CustomEvent<ControlEventDetail<string>>): void => {
    const detail = event.detail;

    if (!detail) {
      return;
    }

    const rawValue = detail.value;
    const originEvent = detail.event ?? event;

    if (typeof rawValue !== 'string') {
      return;
    }

    const cssValue = rawValue.trim();

    if (cssValue.length === 0) {
      this.#clearActivePreset();
      return;
    }

    if (cssValue.startsWith(EasingType.CUBIC_BEZIER)) {
      const parsed = parseCubicBezierValue(cssValue);
      if (!parsed) {
        this.#clearActivePreset();
        return;
      }
      this.#applyPreset(parsed, EasingType.CUBIC_BEZIER, cssValue, originEvent);
      return;
    }

    if (cssValue.startsWith(EasingType.LINEAR)) {
      const parsedLinear = parseLinearTimingFunction(cssValue);
      if (!parsedLinear) {
        this.#clearActivePreset();
        return;
      }
      this.#applyPreset(parsedLinear, EasingType.LINEAR, cssValue, originEvent);
      return;
    }

    this.#clearActivePreset();
  };

  readonly handleSelectCubic = (event: Event): void => {
    event.preventDefault();
    this.#setEasingType(EasingType.CUBIC_BEZIER, event);
  };

  readonly handleSelectLinear = (event: Event): void => {
    event.preventDefault();
    this.#setEasingType(EasingType.LINEAR, event);
  };

  readonly addLinearPoint = (event: Event): void => {
    event.preventDefault();

    if (this.easingType !== EasingType.LINEAR) {
      return;
    }

    const points = this.#getLinearPoints();
    if (!points || this.maxPointsReached) {
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

    const newPointPosition = clampPoint({
      x: (startPoint.x + endPoint.x) / 2,
      y: (startPoint.y + endPoint.y) / 2
    });
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
    this.focusedLinearIndex = insertedIndex;
    this.#notifyHost('linear-point-focus', insertedIndex, event);
  };

  readonly removeLinearPoint = (event: Event): void => {
    event.preventDefault();

    if (this.easingType !== EasingType.LINEAR) {
      return;
    }

    const points = this.#getLinearPoints();
    if (!points || this.minPointsReached) {
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
      this.#removeLinearPointAt(removeIndex, event);
    }
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

  readonly incrementGridSize = (event: Event): void => {
    event.preventDefault();

    this.#commitGridSize(this.gridSize + 1, event);
  };

  readonly decrementGridSize = (event: Event): void => {
    event.preventDefault();

    this.#commitGridSize(this.gridSize - 1, event);
  };

  readonly handleGridSliderInput = (event: Event): void => {
    event.preventDefault();
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.#commitGridSize(Number(target.value), event);
  };

  readonly handleGridSizeChange = (event: Event): void => {
    event.preventDefault();
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    const parsed = Number(target.value);
    if (Number.isNaN(parsed)) {
      target.value = String(this.gridSize);
      return;
    }
    this.#commitGridSize(parsed, event);
    target.value = String(this.gridSize);
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

  #notifyHost = <TValue>(type: HostEventType, value: TValue, event: Event): void => {
    const target = this.#getEventTarget();
    const detail: ControlEventDetail<TValue> = { value, event };

    dispatchControlEvent(target, type, detail);
  };
}
