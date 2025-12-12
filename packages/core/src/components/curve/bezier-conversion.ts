import type { CubicBezierPoints, LinearPoints } from './types';

export const cubicBezierToLinearPoints = (points: CubicBezierPoints): LinearPoints => {
  const start = {
    x: 0,
    y: 0,
    cpOutX: points.p1.x,
    cpOutY: points.p1.y,
    isLinked: true,
    mirrorLength: true
  };

  const end = {
    x: 1,
    y: 1,
    cpInX: points.p2.x - 1,
    cpInY: points.p2.y - 1,
    isLinked: true,
    mirrorLength: true
  };

  return [start, end];
};
