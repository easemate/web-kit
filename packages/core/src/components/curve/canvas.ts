import { Component } from '@/Component';
import { Prop } from '@/Prop';
import { Query } from '@/Query';

import { html, type SVGTemplateResult, svg } from 'lit-html';

import { type ControlEventDetail, dispatchControlEvent } from '../shared';
import {
  BEZIER_CONTROL_MAX_Y,
  BEZIER_CONTROL_MIN_Y,
  DEFAULT_HANDLE_LENGTH,
  DRAG_ACTIVATION_DISTANCE_PX_SQUARED,
  HIT_AREA_RADIUS,
  LINEAR_HIT_THRESHOLD,
  LINEAR_PATH_SAMPLES,
  SVG_HEIGHT,
  SVG_WIDTH
} from './constants';
import { canvasStyles } from './styles';
import { generateGridLines } from './svg-renderer';
import {
  type CubicBezierPoints,
  EasingType,
  type LinearPoint,
  type LinearPoints,
  MAX_LINEAR_POINTS,
  type Point
} from './types';
import {
  clampPoint,
  cloneLinearPoint,
  cubicBezierPath,
  ensureLinearPointId,
  linearDisplayPath,
  MIN_LINEAR_DELTA,
  normalizeLinearPoints,
  normalizeVector,
  vectorLength
} from './utils';

type CurveHost = HTMLElement & {
  points: CubicBezierPoints | LinearPoints;
  handlePointsChange?: (event: CustomEvent<ControlEventDetail<CubicBezierPoints | LinearPoints>>) => void;
};

type LinearInsertPreview = {
  path: string;
  normalizedPoints: LinearPoints;
  insertedIndex: number;
  insertedPoint: LinearPoint;
};

@Component({
  tag: 'ease-curve-canvas',
  styles: canvasStyles,
  template(this: CurveCanvas) {
    const hoverPreviewPath = this.getHoverCurvePath();
    const controlElements = this.getControlElements();
    const hoverInsertElements = this.getHoverInsertElements();
    const curvePath = this.getCurvePath();

    return html`
      <svg
        viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}"
        width="${SVG_WIDTH}"
        height="${SVG_HEIGHT}"
        @pointerdown=${this.handlePointerDown}
        @pointermove=${this.handlePointerMove}
        @pointerup=${this.handlePointerUp}
        @pointerleave=${this.handlePointerLeave}
        @pointercancel=${this.handlePointerLeave}
      >
        ${this.showGrid ? svg`<g style="view-transition-name: grid-lines">${this.getGridLines()}</g>` : null}
        ${hoverPreviewPath ? html`<path class="curve-path curve-path--preview" d=${hoverPreviewPath}></path>` : null}
        <path class="curve-path" d=${curvePath} />
        ${controlElements}
        ${hoverInsertElements}
      </svg>
    `;
  }
})
export class CurveCanvas extends HTMLElement {
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

  @Prop<number | null>({ type: Number, reflect: false, defaultValue: null })
  accessor focusedLinearIndex: number | null = null;

  @Query<SVGSVGElement>('svg')
  accessor svgElement!: SVGSVGElement | null;

  #isDragging = false;
  #dragIndex: number | null = null;
  #dragMode: 'point' | 'handleIn' | 'handleOut' | null = null;
  #hoverPoint: Point | null = null;
  #hoverInsertPreview: LinearInsertPreview | null = null;
  #dragStartPoints: Map<string, LinearPoint> | null = null;
  #dragPointId: string | null = null;
  #pendingDrag: { mode: 'point' | 'handleIn' | 'handleOut'; index: number; startX: number; startY: number } | null =
    null;

  #getEventTarget = (): CurveHost => {
    const root = this.getRootNode();
    if (root instanceof ShadowRoot && root.host instanceof HTMLElement) {
      return root.host as CurveHost;
    }
    return this as CurveHost;
  };

  #renderCubicBezier = (): SVGTemplateResult[] => {
    const points = this.#getCubicBezierPoints();

    if (!points) {
      console.warn('Invalid cubic-bezier points for rendering:', this.points);
      return [];
    }

    try {
      const anchorStart = this.#toSvgCoords({ x: 0, y: 0 });
      const anchorEnd = this.#toSvgCoords({ x: 1, y: 1 });
      const controlOne = this.#toSvgCoords(points.p1);
      const controlTwo = this.#toSvgCoords(points.p2);

      const elements: SVGTemplateResult[] = [];

      elements.push(svg`<line
        class="control-line"
        x1="${anchorStart.x}"
        y1="${anchorStart.y}"
        x2="${controlOne.x}"
        y2="${controlOne.y}"
      />`);
      elements.push(svg`<line
        class="control-line"
        x1="${anchorEnd.x}"
        y1="${anchorEnd.y}"
        x2="${controlTwo.x}"
        y2="${controlTwo.y}"
      />`);

      elements.push(svg`<circle class="anchor-point-start" cx="${anchorStart.x}" cy="${anchorStart.y}" />`);
      elements.push(svg`<circle class="anchor-point-start" cx="${anchorEnd.x}" cy="${anchorEnd.y}" />`);

      elements.push(svg`<circle
        class="hit-area-point"
        cx="${controlOne.x}"
        cy="${controlOne.y}"
        r="${HIT_AREA_RADIUS}"
        data-index="0"
        data-role="point"
      />`);
      elements.push(svg`<circle
        class="hit-area-point"
        cx="${controlTwo.x}"
        cy="${controlTwo.y}"
        r="${HIT_AREA_RADIUS}"
        data-index="1"
        data-role="point"
      />`);

      elements.push(svg`<circle
        class="control-point ${this.#dragIndex === 0 && this.#dragMode === 'point' ? 'selected' : ''}"
        cx="${controlOne.x}"
        cy="${controlOne.y}"
        data-index="0"
        data-role="point"
      />`);
      elements.push(svg`<circle
        class="control-point ${this.#dragIndex === 1 && this.#dragMode === 'point' ? 'selected' : ''}"
        cx="${controlTwo.x}"
        cy="${controlTwo.y}"
        data-index="1"
        data-role="point"
      />`);

      return elements;
    } catch (error) {
      console.error('Error rendering cubic-bezier elements:', error);
      return [];
    }
  };

  #toSvgCoords = (p: Point) => {
    return {
      x: p.x * SVG_WIDTH,
      y: (1 - p.y) * SVG_HEIGHT
    };
  };

  #renderLinear = (): SVGTemplateResult[] => {
    const points = this.#getLinearPoints();

    if (!points) {
      return [];
    }

    try {
      const elements: SVGTemplateResult[] = [];
      const focusedIndex = this.focusedLinearIndex;

      points.forEach((point, index) => {
        if (!point) {
          return;
        }

        const isPointFocused = focusedIndex === index;
        const isDraggingPoint = this.#isDragging && this.#dragIndex === index;

        if (!isPointFocused && !isDraggingPoint) {
          return;
        }

        const anchorSvg = this.#toSvgCoords(point);

        if (index > 0 && (point.cpInX !== undefined || point.cpInY !== undefined)) {
          this.#renderLinearHandle(elements, point, anchorSvg, index, 'In');
        }

        if (index < points.length - 1 && (point.cpOutX !== undefined || point.cpOutY !== undefined)) {
          this.#renderLinearHandle(elements, point, anchorSvg, index, 'Out');
        }
      });

      points.forEach((point, index) => {
        if (!point) {
          return;
        }

        const isPointFocused = focusedIndex === index;
        const isPointActive = (this.#dragMode === 'point' && this.#dragIndex === index) || isPointFocused;

        const anchorSvg = this.#toSvgCoords(point);

        elements.push(svg`<circle
          class="hit-area-point"
          cx="${anchorSvg.x}"
          cy="${anchorSvg.y}"
          r="${HIT_AREA_RADIUS}"
          data-index="${index}"
          data-role="point"
        />`);
        elements.push(svg`<circle
          class="linear-point ${isPointActive ? 'selected' : ''}"
          cx="${anchorSvg.x}"
          cy="${anchorSvg.y}"
          data-index="${index}"
          data-role="point"
          title="Point P${index + 1}: ${Math.round(point.x * 100)}%, ${Math.round(point.y * 100)}%"
        />`);
      });

      return elements;
    } catch (error) {
      console.error('Error rendering linear points:', error);
      return [];
    }
  };

  #renderLinearHandle(
    elements: SVGTemplateResult[],
    point: LinearPoint,
    anchorSvg: Point,
    index: number,
    direction: 'In' | 'Out'
  ): void {
    const dx = direction === 'In' ? (point.cpInX ?? 0) : (point.cpOutX ?? 0);
    const dy = direction === 'In' ? (point.cpInY ?? 0) : (point.cpOutY ?? 0);

    const handlePos = { x: point.x + dx, y: point.y + dy };
    const handleSvg = this.#toSvgCoords(handlePos);
    const role = direction === 'In' ? 'handleIn' : 'handleOut';
    const dragMode = direction === 'In' ? 'handleIn' : 'handleOut';

    const isHandleActive = this.#dragMode === dragMode && this.#dragIndex === index;

    elements.push(svg`<line
        class="linear-handle-line"
        x1="${anchorSvg.x}"
        y1="${anchorSvg.y}"
        x2="${handleSvg.x}"
        y2="${handleSvg.y}"
    />`);

    elements.push(svg`<circle
        class="hit-area-handle"
        cx="${handleSvg.x}"
        cy="${handleSvg.y}"
        r="${HIT_AREA_RADIUS}"
        data-index="${index}"
        data-role="${role}"
    />`);

    elements.push(svg`<circle
        class="linear-handle ${isHandleActive ? 'selected' : ''}"
        cx="${handleSvg.x}"
        cy="${handleSvg.y}"
        data-index="${index}"
        data-role="${role}"
        title="Handle ${direction}: ${Math.round(handlePos.x * 100)}%, ${Math.round(handlePos.y * 100)}%"
    />`);
  }

  #getCurvePath = (): string => {
    try {
      if (this.easingType === EasingType.CUBIC_BEZIER) {
        const points = this.#getCubicBezierPoints();

        if (!points) {
          console.warn('Invalid cubic-bezier points:', this.points);
          return '';
        }

        return cubicBezierPath(points);
      }

      const points = this.#getLinearPoints();

      if (!points || points.length < 2) {
        return '';
      }

      return linearDisplayPath(points);
    } catch (error) {
      console.error('Error generating curve path:', error);
      return '';
    }
  };

  #getHoverCurvePath = (): string => {
    if (this.#isDragging) {
      return '';
    }

    try {
      if (this.easingType === EasingType.CUBIC_BEZIER) {
        const hoverPoint = this.#hoverPoint;
        if (!hoverPoint) {
          return '';
        }

        const points = this.#getCubicBezierPoints();
        if (!points) {
          return '';
        }

        return cubicBezierPath({
          p1: hoverPoint,
          p2: points.p2
        });
      }

      if (this.easingType === EasingType.LINEAR) {
        return this.#hoverInsertPreview?.path ?? '';
      }

      return '';
    } catch (error) {
      console.error('Error generating hover curve path:', error);
      return '';
    }
  };

  getHoverInsertElements(): SVGTemplateResult | null {
    if (this.easingType !== EasingType.LINEAR) {
      return null;
    }

    const preview = this.#hoverInsertPreview;
    if (!preview || !preview.insertedPoint) {
      return null;
    }

    const point = preview.insertedPoint;
    const anchor = this.#toSvgCoords(point);
    const elements: SVGTemplateResult[] = [];

    if (point.cpInX !== undefined || point.cpInY !== undefined) {
      const handlePoint = this.#toSvgCoords({
        x: point.x + (point.cpInX ?? 0),
        y: point.y + (point.cpInY ?? 0)
      });
      elements.push(
        svg`<line
          class="linear-handle-line linear-handle-line--preview"
          x1="${anchor.x}"
          y1="${anchor.y}"
          x2="${handlePoint.x}"
          y2="${handlePoint.y}"
        />`
      );
      elements.push(
        svg`<circle
          class="linear-handle linear-handle--preview"
          cx="${handlePoint.x}"
          cy="${handlePoint.y}"
        />`
      );
    }

    if (point.cpOutX !== undefined || point.cpOutY !== undefined) {
      const handlePoint = this.#toSvgCoords({
        x: point.x + (point.cpOutX ?? 0),
        y: point.y + (point.cpOutY ?? 0)
      });
      elements.push(
        svg`<line
          class="linear-handle-line linear-handle-line--preview"
          x1="${anchor.x}"
          y1="${anchor.y}"
          x2="${handlePoint.x}"
          y2="${handlePoint.y}"
        />`
      );
      elements.push(
        svg`<circle
          class="linear-handle linear-handle--preview"
          cx="${handlePoint.x}"
          cy="${handlePoint.y}"
        />`
      );
    }

    elements.push(svg`<circle class="linear-point linear-point--preview" cx="${anchor.x}" cy="${anchor.y}" />`);

    return svg`<g class="linear-preview-group" pointer-events="none">${elements}</g>`;
  }

  #getCubicBezierPoints = (): CubicBezierPoints | null => {
    if (Array.isArray(this.points)) {
      return null;
    }

    return this.points ?? null;
  };

  #getLinearPoints = (): LinearPoints | null => {
    if (!Array.isArray(this.points)) {
      return null;
    }

    this.#ensureLinearPointIds(this.points);
    return this.points;
  };

  #ensureLinearPointIds = (points: LinearPoints | null): void => {
    if (!points) {
      return;
    }

    for (const point of points) {
      if (!point) {
        continue;
      }
      ensureLinearPointId(point);
    }
  };

  #createLinearStartPointMap = (points: LinearPoints | null): Map<string, LinearPoint> | null => {
    if (!points) {
      return null;
    }

    const map = new Map<string, LinearPoint>();

    for (const point of points) {
      if (!point) {
        continue;
      }
      const id = ensureLinearPointId(point);
      map.set(id, cloneLinearPoint(point));
    }

    return map;
  };

  #getDistanceToLinearPath(point: Point, points: LinearPoints): number {
    if (points.length < 2) {
      return Number.POSITIVE_INFINITY;
    }

    let minDistanceSquared = Number.POSITIVE_INFINITY;

    for (let index = 0; index < points.length - 1; index += 1) {
      const start = points[index];
      const end = points[index + 1];

      if (!start || !end) {
        continue;
      }

      const cp1 = {
        x: start.x + (start.cpOutX ?? 0),
        y: start.y + (start.cpOutY ?? 0)
      };

      const cp2 = {
        x: end.x + (end.cpInX ?? 0),
        y: end.y + (end.cpInY ?? 0)
      };

      for (let sample = 0; sample <= LINEAR_PATH_SAMPLES; sample += 1) {
        const t = sample / LINEAR_PATH_SAMPLES;
        const samplePoint = evaluateCubicPointNormalized(t, start, cp1, cp2, end);
        const dx = point.x - samplePoint.x;
        const dy = point.y - samplePoint.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < minDistanceSquared) {
          minDistanceSquared = distanceSquared;
        }
      }
    }

    return Math.sqrt(minDistanceSquared);
  }

  #isPointNearLinearPath(point: Point, points: LinearPoints): boolean {
    const distance = this.#getDistanceToLinearPath(point, points);
    return distance <= LINEAR_HIT_THRESHOLD;
  }

  #isNearExistingPointOrHandle(position: Point, points: LinearPoints): boolean {
    const mouseSvg = this.#toSvgCoords(position);
    const thresholdSquared = HIT_AREA_RADIUS * HIT_AREA_RADIUS;

    for (const point of points) {
      if (!point) {
        continue;
      }

      const pointSvg = this.#toSvgCoords(point);
      const dx = pointSvg.x - mouseSvg.x;
      const dy = pointSvg.y - mouseSvg.y;

      if (dx * dx + dy * dy < thresholdSquared) {
        return true;
      }

      if (point.cpInX !== undefined || point.cpInY !== undefined) {
        const handleIn = {
          x: point.x + (point.cpInX ?? 0),
          y: point.y + (point.cpInY ?? 0)
        };
        const handleInSvg = this.#toSvgCoords(handleIn);
        const hdx = handleInSvg.x - mouseSvg.x;
        const hdy = handleInSvg.y - mouseSvg.y;

        if (hdx * hdx + hdy * hdy < thresholdSquared) {
          return true;
        }
      }

      if (point.cpOutX !== undefined || point.cpOutY !== undefined) {
        const handleOut = {
          x: point.x + (point.cpOutX ?? 0),
          y: point.y + (point.cpOutY ?? 0)
        };
        const handleOutSvg = this.#toSvgCoords(handleOut);
        const hdx = handleOutSvg.x - mouseSvg.x;
        const hdy = handleOutSvg.y - mouseSvg.y;

        if (hdx * hdx + hdy * hdy < thresholdSquared) {
          return true;
        }
      }
    }

    return false;
  }

  #getMousePosition = (event: PointerEvent, options?: { skipSnap?: boolean }): Point => {
    const svgElement = this.svgElement;

    if (!svgElement) {
      return { x: 0, y: 0 };
    }

    const rect = svgElement.getBoundingClientRect();
    const svgX = event.clientX - rect.left;
    const svgY = event.clientY - rect.top;

    let x = svgX / rect.width;
    let y = 1 - svgY / rect.height;

    const skipSnap = options?.skipSnap ?? false;

    const shouldSnap =
      !skipSnap &&
      this.snapToGrid &&
      !(this.#isDragging && (this.#dragMode === 'handleIn' || this.#dragMode === 'handleOut'));

    if (shouldSnap) {
      const ratioX = SVG_WIDTH / this.gridSize;
      const ratioY = SVG_HEIGHT / this.gridSize;
      x = Math.round(x * ratioX) / ratioX;
      y = Math.round(y * ratioY) / ratioY;
    }

    const bezierBounds =
      this.easingType === EasingType.CUBIC_BEZIER
        ? { minY: BEZIER_CONTROL_MIN_Y, maxY: BEZIER_CONTROL_MAX_Y }
        : undefined;

    return clampPoint({ x, y }, bezierBounds);
  };

  #constrainLinearPoint = (index: number, position: Point, points: LinearPoints): LinearPoint => {
    const previousPoint = index > 0 ? points[index - 1] : undefined;
    const nextPoint = index < points.length - 1 ? points[index + 1] : undefined;

    const minimumX = previousPoint ? previousPoint.x + MIN_LINEAR_DELTA : 0;
    const maximumX = nextPoint ? nextPoint.x - MIN_LINEAR_DELTA : 1;

    let x = position.x;

    if (index === 0) {
      x = 0;
    } else if (index === points.length - 1) {
      x = 1;
    } else {
      x = Math.min(Math.max(x, minimumX), maximumX);
    }

    const clamped = clampPoint({ x, y: position.y });
    const sourcePoint = points[index];

    return {
      ...sourcePoint,
      x: clamped.x,
      y: clamped.y
    };
  };

  #emitPoints = (value: CubicBezierPoints | LinearPoints, event: Event): void => {
    const target = this.#getEventTarget();
    const detail: ControlEventDetail<CubicBezierPoints | LinearPoints> = { value, event };

    dispatchControlEvent(target, 'points-change', detail);
  };

  #notifyLinearFocus = (index: number | null, event: Event): void => {
    if (this.easingType !== EasingType.LINEAR) {
      return;
    }
    const target = this.#getEventTarget();
    const detail: ControlEventDetail<number | null> = { value: index, event };
    dispatchControlEvent(target, 'linear-point-focus', detail);
  };

  #toggleLinearHandleLinking = (index: number, event: Event): void => {
    const points = this.#getLinearPoints();
    if (!points || index < 0 || index >= points.length) {
      return;
    }

    const point = points[index];
    if (!point) {
      return;
    }

    const updatedPoints = [...points];
    const updatedPoint = { ...point };
    updatedPoints[index] = updatedPoint;

    const newLinkingState = !updatedPoint.isLinked;
    updatedPoint.isLinked = newLinkingState;
    updatedPoint.mirrorLength = Boolean(newLinkingState);

    if (newLinkingState) {
      this.#ensureLinkedHandles(updatedPoint, index, points);
    }

    const normalizedPoints = normalizeLinearPoints(updatedPoints);
    this.points = normalizedPoints;
    this.#emitPoints(normalizedPoints, event);
    this.#notifyLinearFocus(index, event);
    this.requestRender();
  };

  #ensureLinkedHandles(point: LinearPoint, index: number, points: LinearPoints): void {
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
    const referenceLength = vectorLength(refDx, refDy) || DEFAULT_HANDLE_LENGTH;

    const inLength = vectorLength(point.cpInX ?? 0, point.cpInY ?? 0) || referenceLength;
    point.cpInX = -normalized.dx * inLength;
    point.cpInY = -normalized.dy * inLength;

    const outLength = vectorLength(point.cpOutX ?? 0, point.cpOutY ?? 0) || referenceLength;
    point.cpOutX = normalized.dx * outLength;
    point.cpOutY = normalized.dy * outLength;

    if (point.mirrorLength !== false) {
      this.#alignLinkedHandleLengths(point);
    }
  }

  #alignLinkedHandleLengths(point: LinearPoint): void {
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

  getGridLines(): SVGTemplateResult[] {
    return generateGridLines(this.gridSize);
  }

  getControlElements(): SVGTemplateResult[] {
    return this.easingType === EasingType.CUBIC_BEZIER ? this.#renderCubicBezier() : this.#renderLinear();
  }

  getCurvePath(): string {
    return this.#getCurvePath();
  }

  getHoverCurvePath(): string {
    return this.#getHoverCurvePath();
  }

  readonly handlePointerDown = (event: PointerEvent): void => {
    event.preventDefault();
    let linearPoints = this.easingType === EasingType.LINEAR ? this.#getLinearPoints() : null;
    this.#dragStartPoints = this.#createLinearStartPointMap(linearPoints);
    this.#pendingDrag = null;
    this.#dragPointId = null;

    const target = event.target;

    if (!(target instanceof SVGElement)) {
      return;
    }

    const role = target.getAttribute('data-role');
    const indexAttribute = target.getAttribute('data-index');

    if (indexAttribute !== null) {
      const index = Number.parseInt(indexAttribute, 10);
      if (Number.isNaN(index)) {
        return;
      }

      if (this.easingType === EasingType.LINEAR) {
        if (role === 'handleIn' || role === 'handleOut') {
          const point = linearPoints?.[index];
          if (point) {
            this.#dragPointId = ensureLinearPointId(point);
          }
          this.svgElement?.setPointerCapture(event.pointerId);
          this.#isDragging = true;
          this.#dragMode = role;
          this.#dragIndex = index;
          this.#pendingDrag = null;
          this.#hoverPoint = null;
          this.#notifyLinearFocus(index, event);
          this.handlePointerMove(event);
          this.requestRender();
          return;
        }

        if (role === 'point') {
          if (event.detail === 2) {
            this.#toggleLinearHandleLinking(index, event);
            return;
          }

          const point = linearPoints?.[index];
          if (point) {
            this.#dragPointId = ensureLinearPointId(point);
          }
          this.#notifyLinearFocus(index, event);
          this.svgElement?.setPointerCapture(event.pointerId);
          this.#isDragging = false;
          this.#dragMode = 'point';
          this.#dragIndex = index;
          this.#pendingDrag = {
            mode: 'point',
            index,
            startX: event.clientX,
            startY: event.clientY
          };
          this.#hoverPoint = null;
          this.requestRender();
          return;
        }
      }

      if (this.easingType === EasingType.CUBIC_BEZIER && role === 'point') {
        this.svgElement?.setPointerCapture(event.pointerId);
        this.#isDragging = true;
        this.#dragMode = 'point';
        this.#dragIndex = index;
        this.#hoverPoint = null;
        this.requestRender();
        return;
      }
    }

    if (indexAttribute === null) {
      if (this.easingType === EasingType.LINEAR) {
        const insertResult = this.#insertLinearPoint(this.#getMousePosition(event), event);

        if (insertResult) {
          linearPoints = this.#getLinearPoints();
          this.#dragStartPoints = this.#createLinearStartPointMap(linearPoints);
          this.#dragPointId = insertResult.pointId;
          this.svgElement?.setPointerCapture(event.pointerId);
          this.#isDragging = true;
          this.#dragMode = 'point';
          this.#dragIndex = insertResult.index;
          this.#pendingDrag = null;
          this.#hoverPoint = null;
          this.#notifyLinearFocus(insertResult.index, event);
          this.requestRender();
          return;
        } else {
          this.#notifyLinearFocus(null, event);
        }
      }

      if (this.easingType === EasingType.CUBIC_BEZIER) {
        this.#hoverPoint = this.#getMousePosition(event);
        this.svgElement?.setPointerCapture(event.pointerId);
        this.#isDragging = true;
        this.#dragMode = 'point';
        this.#dragIndex = 0;
        this.#pendingDrag = null;
        this.handlePointerMove(event);
        this.requestRender();
        return;
      }
    }
  };

  readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.svgElement) {
      return;
    }

    const skipSnapForPending = !this.#isDragging && this.#pendingDrag !== null && this.#pendingDrag.mode === 'point';
    let position = this.#getMousePosition(event, { skipSnap: skipSnapForPending });

    if (this.#pendingDrag && !this.#isDragging) {
      const deltaX = event.clientX - this.#pendingDrag.startX;
      const deltaY = event.clientY - this.#pendingDrag.startY;
      const distanceSquared = deltaX * deltaX + deltaY * deltaY;

      if (distanceSquared >= DRAG_ACTIVATION_DISTANCE_PX_SQUARED) {
        this.#isDragging = true;
        this.#pendingDrag = null;

        if (skipSnapForPending) {
          position = this.#getMousePosition(event);
        }
      } else {
        return;
      }
    }

    if (this.#isDragging && this.#dragIndex !== null) {
      event.preventDefault();
      this.#hoverInsertPreview = null;

      if (this.easingType === EasingType.LINEAR) {
        const points = this.#getLinearPoints();
        if (!points || this.#dragIndex >= points.length) {
          return;
        }

        if (this.#dragMode === 'point') {
          this.#handleLinearPointDrag(points, this.#dragIndex, position, event);
          return;
        }

        if (this.#dragMode === 'handleIn' || this.#dragMode === 'handleOut') {
          this.#handleLinearHandleDrag(points, this.#dragIndex, position, event);
          return;
        }
      }

      if (this.easingType === EasingType.CUBIC_BEZIER) {
        const points = this.#getCubicBezierPoints();
        if (!points) {
          return;
        }

        const updatedPoints: CubicBezierPoints = { ...points };
        let adjustedPosition = position;

        if (event.shiftKey) {
          const reference = this.#dragIndex === 0 ? points.p1 : points.p2;

          if (reference) {
            const deltaX = Math.abs(position.x - reference.x);
            const deltaY = Math.abs(position.y - reference.y);

            adjustedPosition = deltaX > deltaY ? { x: position.x, y: reference.y } : { x: reference.x, y: position.y };
          }
        }

        const clampedPosition = clampPoint(adjustedPosition, {
          minY: BEZIER_CONTROL_MIN_Y,
          maxY: BEZIER_CONTROL_MAX_Y
        });

        if (this.#dragIndex === 0) {
          updatedPoints.p1 = clampedPosition;
        } else if (this.#dragIndex === 1) {
          updatedPoints.p2 = clampedPosition;
        } else {
          return;
        }

        this.points = updatedPoints;
        this.#emitPoints(updatedPoints, event);
        this.requestRender();
        return;
      }

      return;
    }

    if (this.easingType === EasingType.LINEAR) {
      const points = this.#getLinearPoints();
      // Use rawPosition for the hit test to avoid flickering when snapToGrid is on
      if (points && this.#isNearExistingPointOrHandle(position, points)) {
        this.#hoverInsertPreview = null;
        this.#hoverPoint = null;
        this.requestRender();
        return;
      }

      const preview = this.#buildLinearInsertPreview(position);
      this.#hoverInsertPreview = preview;
      if (!preview) {
        this.#hoverPoint = null;
        this.requestRender();
        return;
      }
    } else {
      this.#hoverInsertPreview = null;
    }

    this.#hoverPoint = position;
    this.requestRender();
  };

  #handleLinearPointDrag(points: LinearPoints, index: number, position: Point, event: PointerEvent): void {
    let workingPosition = position;
    const currentPoint = points[index];
    const activePointId = currentPoint ? (this.#dragPointId ?? ensureLinearPointId(currentPoint)) : null;

    if (event.shiftKey && this.#dragStartPoints && activePointId) {
      const startPoint = this.#dragStartPoints.get(activePointId);
      if (startPoint) {
        const deltaX = Math.abs(position.x - startPoint.x);
        const deltaY = Math.abs(position.y - startPoint.y);
        workingPosition = deltaX > deltaY ? { x: position.x, y: startPoint.y } : { x: startPoint.x, y: position.y };
      }
    }

    const constrainedPoint = this.#constrainLinearPoint(index, workingPosition, points);
    const updatedPoints: LinearPoints = points.map((point, i) => {
      if (i === index) {
        return constrainedPoint;
      }
      return { ...point };
    });

    const normalizedPoints = normalizeLinearPoints(updatedPoints);
    this.points = normalizedPoints;
    this.#emitPoints(normalizedPoints, event);

    if (activePointId) {
      const newIndex = normalizedPoints.findIndex((point) => point?.id === activePointId);
      if (newIndex !== -1) {
        this.#dragIndex = newIndex;
        this.#dragPointId = activePointId;
        this.#notifyLinearFocus(newIndex, event);
      } else {
        this.#notifyLinearFocus(index, event);
      }
    } else {
      this.#notifyLinearFocus(index, event);
    }

    this.requestRender();
  }

  #handleLinearHandleDrag(points: LinearPoints, index: number, position: Point, event: PointerEvent): void {
    const point = points[index];
    if (!point) {
      return;
    }

    const activePointId = this.#dragPointId ?? ensureLinearPointId(point);
    const direction = this.#dragMode === 'handleIn' ? 'In' : 'Out';

    let dx = position.x - point.x;
    const dy = position.y - point.y;

    if (direction === 'In') {
      dx = Math.min(0, dx);
    } else {
      dx = Math.max(0, dx);
    }

    let isLinked = point.isLinked ?? false;
    if (event.shiftKey) {
      isLinked = false;
    }

    const updatedPoints = [...points];
    const updatedPoint = { ...point };
    updatedPoints[index] = updatedPoint;

    updatedPoint.isLinked = isLinked;

    if (direction === 'In') {
      updatedPoint.cpInX = dx;
      updatedPoint.cpInY = dy;
    } else {
      updatedPoint.cpOutX = dx;
      updatedPoint.cpOutY = dy;
    }

    const mirrorAngle = isLinked;
    const mirrorLength = mirrorAngle && updatedPoint.mirrorLength !== false;

    if (mirrorAngle || mirrorLength) {
      const draggedLength = vectorLength(dx, dy);

      if (draggedLength <= MIN_LINEAR_DELTA) {
        if (direction === 'In') {
          delete updatedPoint.cpInX;
          delete updatedPoint.cpInY;
          if (mirrorAngle) {
            delete updatedPoint.cpOutX;
            delete updatedPoint.cpOutY;
          }
        } else {
          delete updatedPoint.cpOutX;
          delete updatedPoint.cpOutY;
          if (mirrorAngle) {
            delete updatedPoint.cpInX;
            delete updatedPoint.cpInY;
          }
        }
      } else {
        const normalized = normalizeVector(dx, dy);

        if (mirrorAngle) {
          if (direction === 'In') {
            const existingLength = mirrorLength
              ? draggedLength
              : vectorLength(updatedPoint.cpOutX ?? 0, updatedPoint.cpOutY ?? 0) || draggedLength;
            updatedPoint.cpOutX = -normalized.dx * existingLength;
            updatedPoint.cpOutY = -normalized.dy * existingLength;
          } else {
            const existingLength = mirrorLength
              ? draggedLength
              : vectorLength(updatedPoint.cpInX ?? 0, updatedPoint.cpInY ?? 0) || draggedLength;
            updatedPoint.cpInX = -normalized.dx * existingLength;
            updatedPoint.cpInY = -normalized.dy * existingLength;
          }
        } else if (mirrorLength) {
          if (direction === 'In') {
            const inDirection = normalizeVector(updatedPoint.cpInX ?? 0, updatedPoint.cpInY ?? 0);
            const outDirection = normalizeVector(updatedPoint.cpOutX ?? 0, updatedPoint.cpOutY ?? 0);
            const outLength = vectorLength(updatedPoint.cpOutX ?? 0, updatedPoint.cpOutY ?? 0);
            if (outLength > 0) {
              updatedPoint.cpOutX = outDirection.dx * draggedLength;
              updatedPoint.cpOutY = outDirection.dy * draggedLength;
            }
            updatedPoint.cpInX = inDirection.dx * draggedLength;
            updatedPoint.cpInY = inDirection.dy * draggedLength;
          } else {
            const inDirection = normalizeVector(updatedPoint.cpInX ?? 0, updatedPoint.cpInY ?? 0);
            const outDirection = normalizeVector(updatedPoint.cpOutX ?? 0, updatedPoint.cpOutY ?? 0);
            const inLength = vectorLength(updatedPoint.cpInX ?? 0, updatedPoint.cpInY ?? 0);
            if (inLength > 0) {
              updatedPoint.cpInX = inDirection.dx * draggedLength;
              updatedPoint.cpInY = inDirection.dy * draggedLength;
            }
            updatedPoint.cpOutX = outDirection.dx * draggedLength;
            updatedPoint.cpOutY = outDirection.dy * draggedLength;
          }
        }

        if (mirrorLength) {
          this.#alignLinkedHandleLengths(updatedPoint);
        }
      }
    }

    const normalizedPoints = normalizeLinearPoints(updatedPoints);
    this.points = normalizedPoints;
    this.#emitPoints(normalizedPoints, event);

    if (activePointId) {
      const newIndex = normalizedPoints.findIndex((candidate) => candidate?.id === activePointId);
      if (newIndex !== -1) {
        this.#dragIndex = newIndex;
        this.#dragPointId = activePointId;
        this.#notifyLinearFocus(newIndex, event);
      } else {
        this.#notifyLinearFocus(index, event);
      }
    } else {
      this.#notifyLinearFocus(index, event);
    }

    this.requestRender();
  }

  readonly handlePointerUp = (event: PointerEvent): void => {
    const previousIndex = this.#dragIndex;

    if (this.svgElement?.hasPointerCapture(event.pointerId)) {
      this.svgElement.releasePointerCapture(event.pointerId);
    }

    this.#isDragging = false;
    this.#dragIndex = null;
    this.#dragMode = null;
    this.#dragStartPoints = null;
    this.#dragPointId = null;
    this.#pendingDrag = null;
    this.#hoverInsertPreview = null;

    if (previousIndex !== null && this.easingType === EasingType.LINEAR) {
      this.#notifyLinearFocus(previousIndex, event);
    }
    this.requestRender();
  };

  readonly handlePointerLeave = (event: PointerEvent): void => {
    if (this.#isDragging) {
      this.handlePointerUp(event);
    }

    this.#pendingDrag = null;
    this.#hoverPoint = null;
    this.#dragPointId = null;
    this.#hoverInsertPreview = null;
    this.requestRender();
  };

  #insertLinearPoint(position: Point, event: PointerEvent): { index: number; pointId: string | null } | null {
    const preview = this.#hoverInsertPreview ?? this.#buildLinearInsertPreview(position);
    if (!preview) {
      return null;
    }

    const { normalizedPoints, insertedIndex, insertedPoint } = preview;
    const insertedPointId = insertedPoint ? ensureLinearPointId(insertedPoint) : null;

    this.points = normalizedPoints;
    this.#emitPoints(normalizedPoints, event);
    this.requestRender();
    this.#hoverInsertPreview = null;

    return {
      index: insertedIndex,
      pointId: insertedPointId
    };
  }

  #buildLinearInsertPreview(position: Point): LinearInsertPreview | null {
    if (this.easingType !== EasingType.LINEAR) {
      return null;
    }

    const points = this.#getLinearPoints();
    if (!points || points.length >= MAX_LINEAR_POINTS) {
      return null;
    }

    const clamped = clampPoint(position);
    if (!this.#isPointNearLinearPath(clamped, points)) {
      return null;
    }

    const insertIndex = points.findIndex((point) => clamped.x < point.x);
    if (insertIndex <= 0) {
      return null;
    }

    const prev = points[insertIndex - 1];
    const next = points[insertIndex];

    if (!prev || !next) {
      return null;
    }

    if (clamped.x - prev.x < MIN_LINEAR_DELTA || next.x - clamped.x < MIN_LINEAR_DELTA) {
      return null;
    }

    let updatedPoints: LinearPoints;
    let insertedPointId: string | null = null;

    const splitResult = splitCurveSegment(prev, next, clamped);

    if (splitResult) {
      const { prev: newPrev, newPoint, next: newNext } = splitResult;
      insertedPointId = ensureLinearPointId(newPoint);
      updatedPoints = [
        ...points.slice(0, insertIndex - 1),
        newPrev,
        newPoint,
        newNext,
        ...points.slice(insertIndex + 1)
      ];
    } else {
      const newPoint: LinearPoint = {
        x: clamped.x,
        y: clamped.y,
        cpInX: -0.1,
        cpInY: 0,
        cpOutX: 0.1,
        cpOutY: 0,
        isLinked: true,
        mirrorLength: true
      };
      insertedPointId = ensureLinearPointId(newPoint);
      updatedPoints = [...points.slice(0, insertIndex), newPoint, ...points.slice(insertIndex)];
    }

    const normalizedPoints = normalizeLinearPoints(updatedPoints);
    const normalizedIndex =
      insertedPointId !== null ? normalizedPoints.findIndex((point) => point?.id === insertedPointId) : -1;

    const insertedIndex = normalizedIndex !== -1 ? normalizedIndex : insertIndex;
    const insertedPoint = normalizedPoints[insertedIndex];

    if (!insertedPoint) {
      return null;
    }

    return {
      path: linearDisplayPath(normalizedPoints),
      normalizedPoints,
      insertedIndex,
      insertedPoint
    };
  }
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const lerpPoint = (p1: Point, p2: Point, t: number): Point => {
  return {
    x: lerp(p1.x, p2.x, t),
    y: lerp(p1.y, p2.y, t)
  };
};

// Helper to find t for a given x on a cubic bezier curve
const findTForX = (x: number, p0: Point, cp1: Point, cp2: Point, p3: Point): number => {
  let minT = 0;
  let maxT = 1;
  let t = 0.5;
  const tolerance = 0.0001;
  const maxIterations = 20;

  // Use binary search since x is monotonic
  for (let i = 0; i < maxIterations; i++) {
    const px = (1 - t) ** 3 * p0.x + 3 * (1 - t) ** 2 * t * cp1.x + 3 * (1 - t) * t ** 2 * cp2.x + t ** 3 * p3.x;

    if (Math.abs(px - x) < tolerance) {
      return t;
    }

    if (px < x) {
      minT = t;
    } else {
      maxT = t;
    }
    t = (minT + maxT) / 2;
  }

  return t;
};

const splitCurveSegment = (
  prev: LinearPoint,
  next: LinearPoint,
  position: Point
): { prev: LinearPoint; newPoint: LinearPoint; next: LinearPoint } | null => {
  const cp1 = {
    x: prev.x + (prev.cpOutX ?? 0),
    y: prev.y + (prev.cpOutY ?? 0)
  };
  const cp2 = {
    x: next.x + (next.cpInX ?? 0),
    y: next.y + (next.cpInY ?? 0)
  };

  const wasCurved = prev.cpOutX || prev.cpOutY || next.cpInX || next.cpInY;

  if (!wasCurved) {
    return null;
  }

  // Find the correct t parameter that corresponds to the mouse X position
  const t = findTForX(position.x, prev, cp1, cp2, next);

  const P01 = lerpPoint(prev, cp1, t);
  const P12 = lerpPoint(cp1, cp2, t);
  const P23 = lerpPoint(cp2, next, t);

  const P012 = lerpPoint(P01, P12, t);
  const P123 = lerpPoint(P12, P23, t);

  const P_new = lerpPoint(P012, P123, t);

  const newPoint: LinearPoint = {
    x: P_new.x,
    y: P_new.y,
    cpInX: P012.x - P_new.x,
    cpInY: P012.y - P_new.y,
    cpOutX: P123.x - P_new.x,
    cpOutY: P123.y - P_new.y,
    isLinked: true,
    mirrorLength: prev.mirrorLength === false && next.mirrorLength
  };
  ensureLinearPointId(newPoint);

  const newPrev: LinearPoint = {
    ...prev,
    cpOutX: P01.x - prev.x,
    cpOutY: P01.y - prev.y
  };

  const newNext: LinearPoint = {
    ...next,
    cpInX: P23.x - next.x,
    cpInY: P23.y - next.y
  };

  return {
    prev: newPrev,
    newPoint,
    next: newNext
  };
};

const evaluateCubicPointNormalized = (t: number, p0: Point, cp1: Point, cp2: Point, p3: Point): Point => {
  const P01 = lerpPoint(p0, cp1, t);
  const P12 = lerpPoint(cp1, cp2, t);
  const P23 = lerpPoint(cp2, p3, t);

  const P012 = lerpPoint(P01, P12, t);
  const P123 = lerpPoint(P12, P23, t);

  return lerpPoint(P012, P123, t);
};
