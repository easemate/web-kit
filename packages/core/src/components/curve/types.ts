export enum EasingType {
  CUBIC_BEZIER = 'cubic-bezier',
  LINEAR = 'linear'
}

export interface Point {
  x: number;
  y: number;
}

export interface CSSCode {
  code: string;
  timingFunction: string;
}

export interface LinearPoint extends Point {
  cpInX?: number;
  cpInY?: number;
  cpOutX?: number;
  cpOutY?: number;
  isLinked?: boolean;
  mirrorLength?: boolean;
  id?: string;
}

export interface CubicBezierPoints {
  p1: Point;
  p2: Point;
}

export type LinearPoints = LinearPoint[];

export interface EasingData {
  type: EasingType;
  points: CubicBezierPoints | LinearPoints;
  name: string;
}

export const MIN_LINEAR_POINTS = 2;
export const MAX_LINEAR_POINTS = 30;
