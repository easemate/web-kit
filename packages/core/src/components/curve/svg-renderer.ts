import type { LinearPoint, Point } from './types';

import { type SVGTemplateResult, svg } from 'lit-html';

import { HANDLE_RADIUS, HIT_AREA_RADIUS, POINT_RADIUS, SVG_HEIGHT, SVG_WIDTH } from './constants';

export const generateGridLines = (gridStep: number): SVGTemplateResult[] => {
  const lines: SVGTemplateResult[] = [];

  const xSteps = Math.ceil(SVG_WIDTH / gridStep);
  const ySteps = Math.ceil(SVG_HEIGHT / gridStep);

  // Vertical lines
  for (let i = 0; i <= xSteps; i++) {
    const x = i * gridStep;
    if (x > SVG_WIDTH) {
      break;
    }

    lines.push(svg`
      <line
        class="grid-line"
        x1=${x}
        y1="0"
        x2=${x}
        y2=${SVG_HEIGHT}
      />
    `);
  }

  // Horizontal lines
  for (let i = 0; i <= ySteps; i++) {
    const y = i * gridStep;
    if (y > SVG_HEIGHT) {
      break;
    }

    lines.push(svg`
      <line
        class="grid-line"
        x1="0"
        y1=${y}
        x2=${SVG_WIDTH}
        y2=${y}
      />
    `);
  }

  return lines;
};

export const renderBezierControlPoint = (
  point: Point,
  anchor: Point,
  isSelected: boolean,
  onPointerDown: (event: PointerEvent) => void
): SVGTemplateResult => {
  const x = point.x * SVG_WIDTH;
  const y = (1 - point.y) * SVG_HEIGHT;
  const anchorX = anchor.x * SVG_WIDTH;
  const anchorY = (1 - anchor.y) * SVG_HEIGHT;

  return svg`
    <g>
      <line
        class="control-line"
        x1=${anchorX}
        y1=${anchorY}
        x2=${x}
        y2=${y}
      />
      <circle
        class="control-point ${isSelected ? 'selected' : ''}"
        cx=${x}
        cy=${y}
        r=${POINT_RADIUS}
        @pointerdown=${onPointerDown}
      />
      <circle
        class="hit-area-point"
        cx=${x}
        cy=${y}
        r=${HIT_AREA_RADIUS}
        @pointerdown=${onPointerDown}
      />
    </g>
  `;
};

export const renderLinearPoint = (
  point: LinearPoint,
  index: number,
  isSelected: boolean,
  isFocused: boolean,
  onPointerDown: (event: PointerEvent) => void,
  onHandlePointerDown?: (event: PointerEvent, handleType: 'in' | 'out') => void
): SVGTemplateResult => {
  const x = point.x * SVG_WIDTH;
  const y = (1 - point.y) * SVG_HEIGHT;

  const handles: SVGTemplateResult[] = [];

  if (point.cpInX !== undefined && point.cpInY !== undefined) {
    const handleX = x + point.cpInX * SVG_WIDTH;
    const handleY = y - point.cpInY * SVG_HEIGHT;

    handles.push(svg`
      <g>
        <line
          class="linear-handle-line"
          x1=${x}
          y1=${y}
          x2=${handleX}
          y2=${handleY}
        />
        <circle
          class="linear-handle ${isSelected ? 'selected' : ''}"
          cx=${handleX}
          cy=${handleY}
          r=${HANDLE_RADIUS}
          @pointerdown=${(e: PointerEvent) => onHandlePointerDown?.(e, 'in')}
        />
        <circle
          class="hit-area-handle"
          cx=${handleX}
          cy=${handleY}
          r=${HIT_AREA_RADIUS}
          @pointerdown=${(e: PointerEvent) => onHandlePointerDown?.(e, 'in')}
        />
      </g>
    `);
  }

  if (point.cpOutX !== undefined && point.cpOutY !== undefined) {
    const handleX = x + point.cpOutX * SVG_WIDTH;
    const handleY = y - point.cpOutY * SVG_HEIGHT;

    handles.push(svg`
      <g>
        <line
          class="linear-handle-line"
          x1=${x}
          y1=${y}
          x2=${handleX}
          y2=${handleY}
        />
        <circle
          class="linear-handle ${isSelected ? 'selected' : ''}"
          cx=${handleX}
          cy=${handleY}
          r=${HANDLE_RADIUS}
          @pointerdown=${(e: PointerEvent) => onHandlePointerDown?.(e, 'out')}
        />
        <circle
          class="hit-area-handle"
          cx=${handleX}
          cy=${handleY}
          r=${HIT_AREA_RADIUS}
          @pointerdown=${(e: PointerEvent) => onHandlePointerDown?.(e, 'out')}
        />
      </g>
    `);
  }

  return svg`
    <g>
      ${handles}
      <circle
        class="linear-point ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''}"
        cx=${x}
        cy=${y}
        r=${POINT_RADIUS}
        tabindex=${isFocused ? '0' : '-1'}
        role="slider"
        aria-label="Linear point ${index + 1}"
        aria-valuenow=${point.x}
        aria-valuemin="0"
        aria-valuemax="1"
        @pointerdown=${onPointerDown}
      />
      <circle
        class="hit-area-point"
        cx=${x}
        cy=${y}
        r=${HIT_AREA_RADIUS}
        @pointerdown=${onPointerDown}
      />
    </g>
  `;
};

export const toSvgCoords = (point: Point): Point => {
  return {
    x: point.x * SVG_WIDTH,
    y: (1 - point.y) * SVG_HEIGHT
  };
};

export const fromSvgCoords = (x: number, y: number): Point => {
  return {
    x: x / SVG_WIDTH,
    y: 1 - y / SVG_HEIGHT
  };
};

export const getSvgBounds = (svg: SVGSVGElement): DOMRect => svg.getBoundingClientRect();

export const clientToSvgCoords = (clientX: number, clientY: number, svgBounds: DOMRect): Point => {
  const x = ((clientX - svgBounds.left) / svgBounds.width) * SVG_WIDTH;
  const y = ((clientY - svgBounds.top) / svgBounds.height) * SVG_HEIGHT;

  return { x, y };
};
