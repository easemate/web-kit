import type { LinearPoint, Point } from './types';

import { DRAG_ACTIVATION_DISTANCE_PX_SQUARED, GRID_SNAP_THRESHOLD } from './constants';

export interface DragState {
  isActive: boolean;
  hasMoved: boolean;
  startX: number;
  startY: number;
  startPoint?: Point;
  target?: 'p1' | 'p2' | 'linear' | 'handle-in' | 'handle-out' | null;
  pointIndex?: number;
  pointerId?: number;
}

export const isDragActivated = (clientX: number, clientY: number, dragState: DragState): boolean => {
  const dx = clientX - dragState.startX;
  const dy = clientY - dragState.startY;
  return dx * dx + dy * dy >= DRAG_ACTIVATION_DISTANCE_PX_SQUARED;
};

export const applyGridSnap = (point: Point, snapToGrid: boolean, gridSize: number): Point => {
  if (!snapToGrid) {
    return point;
  }

  const snapX = Math.round(point.x / gridSize) * gridSize * GRID_SNAP_THRESHOLD;
  const snapY = Math.round(point.y / gridSize) * gridSize * GRID_SNAP_THRESHOLD;

  return { x: snapX, y: snapY };
};

export const calculateNewLinearPointPosition = (
  clickPoint: Point,
  existingPoints: LinearPoint[]
): { point: LinearPoint; insertIndex: number } | null => {
  if (existingPoints.length < 2) {
    return null;
  }

  let insertIndex = 1;
  for (let i = 0; i < existingPoints.length - 1; i++) {
    const p1 = existingPoints[i];
    const p2 = existingPoints[i + 1];

    if (p1 && p2 && clickPoint.x >= p1.x && clickPoint.x <= p2.x) {
      insertIndex = i + 1;
      break;
    }
  }

  const prevPoint = existingPoints[insertIndex - 1];
  const nextPoint = existingPoints[insertIndex] || existingPoints[existingPoints.length - 1];

  if (!prevPoint || !nextPoint) {
    return null;
  }

  const t = (clickPoint.x - prevPoint.x) / (nextPoint.x - prevPoint.x);
  const y = prevPoint.y + t * (nextPoint.y - prevPoint.y);

  const newPoint: LinearPoint = {
    x: clickPoint.x,
    y: Math.max(0, Math.min(1, y))
  };

  return { point: newPoint, insertIndex };
};

export const updateLinkedHandles = (
  point: LinearPoint,
  movedHandle: 'in' | 'out',
  dx: number,
  dy: number
): LinearPoint => {
  const updatedPoint = { ...point };

  if (!point.isLinked) {
    if (movedHandle === 'in') {
      updatedPoint.cpInX = (updatedPoint.cpInX ?? 0) + dx;
      updatedPoint.cpInY = (updatedPoint.cpInY ?? 0) + dy;
    } else {
      updatedPoint.cpOutX = (updatedPoint.cpOutX ?? 0) + dx;
      updatedPoint.cpOutY = (updatedPoint.cpOutY ?? 0) + dy;
    }
    return updatedPoint;
  }

  if (movedHandle === 'in') {
    updatedPoint.cpInX = (updatedPoint.cpInX ?? 0) + dx;
    updatedPoint.cpInY = (updatedPoint.cpInY ?? 0) + dy;

    if (point.mirrorLength) {
      updatedPoint.cpOutX = -(updatedPoint.cpInX ?? 0);
      updatedPoint.cpOutY = -(updatedPoint.cpInY ?? 0);
    } else {
      const inLength = Math.sqrt((updatedPoint.cpInX ?? 0) ** 2 + (updatedPoint.cpInY ?? 0) ** 2);

      if (inLength > 0) {
        const outLength = Math.sqrt((point.cpOutX ?? 0) ** 2 + (point.cpOutY ?? 0) ** 2);

        const scale = outLength / inLength;
        updatedPoint.cpOutX = -(updatedPoint.cpInX ?? 0) * scale;
        updatedPoint.cpOutY = -(updatedPoint.cpInY ?? 0) * scale;
      }
    }
  } else {
    updatedPoint.cpOutX = (updatedPoint.cpOutX ?? 0) + dx;
    updatedPoint.cpOutY = (updatedPoint.cpOutY ?? 0) + dy;

    if (point.mirrorLength) {
      updatedPoint.cpInX = -(updatedPoint.cpOutX ?? 0);
      updatedPoint.cpInY = -(updatedPoint.cpOutY ?? 0);
    } else {
      const outLength = Math.sqrt((updatedPoint.cpOutX ?? 0) ** 2 + (updatedPoint.cpOutY ?? 0) ** 2);

      if (outLength > 0) {
        const inLength = Math.sqrt((point.cpInX ?? 0) ** 2 + (point.cpInY ?? 0) ** 2);

        const scale = inLength / outLength;
        updatedPoint.cpInX = -(updatedPoint.cpOutX ?? 0) * scale;
        updatedPoint.cpInY = -(updatedPoint.cpOutY ?? 0) * scale;
      }
    }
  }

  return updatedPoint;
};

export const getKeyboardStepSize = (event: KeyboardEvent): number => {
  if (event.shiftKey) {
    return 0.1;
  }
  if (event.altKey) {
    return 0.001;
  }
  return 0.01;
};

export const handleKeyboardNavigation = (
  key: string,
  currentValue: number,
  min: number,
  max: number,
  step: number
): number | null => {
  switch (key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      return Math.max(min, currentValue - step);
    case 'ArrowRight':
    case 'ArrowUp':
      return Math.min(max, currentValue + step);
    case 'Home':
      return min;
    case 'End':
      return max;
    default:
      return null;
  }
};
