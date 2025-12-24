import type { CSSCode, CubicBezierPoints, LinearPoint, LinearPoints, Point } from './types';

export const clampPoint = (
  point: Point,
  bounds?: { minX?: number; maxX?: number; minY?: number; maxY?: number }
): Point => {
  const minX = bounds?.minX ?? 0;
  const maxX = bounds?.maxX ?? 1;
  const minY = bounds?.minY ?? 0;
  const maxY = bounds?.maxY ?? 1;

  return {
    x: Math.max(minX, Math.min(maxX, point.x)),
    y: Math.max(minY, Math.min(maxY, point.y))
  };
};

export const MIN_LINEAR_DELTA = 0.0001;

let linearPointIdCounter = 0;

const nextLinearPointId = (): string => {
  linearPointIdCounter += 1;
  return `linear-point-${linearPointIdCounter}`;
};

export const ensureLinearPointId = (point: LinearPoint): string => {
  if (!point.id) {
    point.id = nextLinearPointId();
  }
  return point.id;
};

export const cloneLinearPoint = (point: LinearPoint): LinearPoint => {
  const sourceId = ensureLinearPointId(point);
  return {
    ...point,
    id: sourceId
  };
};

export const cubicBezierPath = (points: CubicBezierPoints): string => {
  const { p1, p2 } = points;
  const startX = 0;
  const startY = 300;
  const endX = 400;
  const endY = 0;

  const cp1x = p1.x * 400;
  const cp1y = (1 - p1.y) * 300;
  const cp2x = p2.x * 400;
  const cp2y = (1 - p2.y) * 300;

  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
};

export const linearDisplayPath = (points: LinearPoints): string => {
  if (points.length < 2) {
    return '';
  }

  const toSvg = (p: Point): Point => {
    return {
      x: p.x * 400,
      y: (1 - p.y) * 300
    };
  };

  const startPoint = points[0];
  if (!startPoint) {
    return '';
  }

  const start = toSvg(startPoint);
  let d = `M ${start.x} ${start.y}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p1 = points[index];
    const p2 = points[index + 1];

    if (!p1 || !p2) {
      continue;
    }

    const cp1 = {
      x: p1.x + (p1.cpOutX ?? 0),
      y: p1.y + (p1.cpOutY ?? 0)
    };

    const cp2 = {
      x: p2.x + (p2.cpInX ?? 0),
      y: p2.y + (p2.cpInY ?? 0)
    };

    if (cp1.x === p1.x && cp1.y === p1.y && cp2.x === p2.x && cp2.y === p2.y) {
      const end = toSvg(p2);
      d += ` L ${end.x} ${end.y}`;
    } else {
      const svgCp1 = toSvg(cp1);
      const svgCp2 = toSvg(cp2);
      const end = toSvg(p2);
      d += ` C ${svgCp1.x} ${svgCp1.y}, ${svgCp2.x} ${svgCp2.y}, ${end.x} ${end.y}`;
    }
  }

  return d;
};

const perpendicularDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  if (dx === 0 && dy === 0) {
    return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);
  }

  const numerator = Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x);
  const denominator = Math.sqrt(dx * dx + dy * dy);

  return numerator / denominator;
};

const simplifyPoints = (points: Point[], epsilon: number): Point[] => {
  if (points.length < 3) {
    return points;
  }

  let dmax = 0;
  let index = 0;
  const end = points.length - 1;
  const startPoint = points[0];
  const endPoint = points[end];

  if (!startPoint || !endPoint) {
    return points;
  }

  for (let i = 1; i < end; i++) {
    const point = points[i];
    if (!point) {
      continue;
    }

    const d = perpendicularDistance(point, startPoint, endPoint);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const recResults1 = simplifyPoints(points.slice(0, index + 1), epsilon);
    const recResults2 = simplifyPoints(points.slice(index, end + 1), epsilon);

    return [...recResults1.slice(0, -1), ...recResults2];
  }

  return [startPoint, endPoint];
};

export const generateCubicBezierCSS = (
  points: CubicBezierPoints,
  name: string,
  variant: 'animation' | 'transition' = 'animation'
): CSSCode => {
  const { p1, p2 } = points;
  const timingFunction = `cubic-bezier(${p1.x.toFixed(3)}, ${p1.y.toFixed(3)}, ${p2.x.toFixed(3)}, ${p2.y.toFixed(3)})`;
  const code = `
    .${name} {
      ${variant}-timing-function: ${timingFunction};
    }
  `;

  return {
    code,
    timingFunction
  };
};

export const getLinearApproximation = (
  points: LinearPoints,
  options: { simplify?: number; round?: number } = {}
): Point[] => {
  const { simplify = 0, round = 5 } = options;

  const samples: Point[] = [];
  const numSamplesPerSegment = 20;

  const sortedPoints = [...points].sort((a, b) => a.x - b.x);

  for (let index = 0; index < sortedPoints.length - 1; index += 1) {
    const p1 = sortedPoints[index];
    const p2 = sortedPoints[index + 1];

    if (!p1 || !p2) {
      continue;
    }

    if (index === 0) {
      samples.push({ x: p1.x, y: p1.y });
    }

    const cp1 = {
      x: p1.x + (p1.cpOutX ?? 0),
      y: p1.y + (p1.cpOutY ?? 0)
    };

    const cp2 = {
      x: p2.x + (p2.cpInX ?? 0),
      y: p2.y + (p2.cpInY ?? 0)
    };

    for (let step = 1; step <= numSamplesPerSegment; step += 1) {
      const t = step / numSamplesPerSegment;
      const x = cubicBezier(t, p1.x, cp1.x, cp2.x, p2.x);
      const y = cubicBezier(t, p1.y, cp1.y, cp2.y, p2.y);
      samples.push({ x, y });
    }
  }

  const normalizedSamples: Point[] = [];
  let lastX = -Infinity;

  for (const sample of samples) {
    const clampedX = Math.max(0, Math.min(1, sample.x));
    const clampedY = Math.max(-2, Math.min(3, sample.y));

    if (clampedX > lastX + MIN_LINEAR_DELTA) {
      normalizedSamples.push({ x: clampedX, y: clampedY });
      lastX = clampedX;
    }
  }

  if (normalizedSamples.length < 2) {
    return [
      { x: 0, y: 0 },
      { x: 1, y: 1 }
    ];
  }

  const firstPoint = sortedPoints[0];
  if (firstPoint && Math.abs(firstPoint.x) < MIN_LINEAR_DELTA && normalizedSamples.length > 0) {
    const firstSample = normalizedSamples[0];
    if (firstSample) {
      firstSample.x = 0;
    }
  }

  const lastPoint = sortedPoints[sortedPoints.length - 1];
  if (lastPoint && Math.abs(lastPoint.x - 1) < MIN_LINEAR_DELTA && normalizedSamples.length > 0) {
    const lastSample = normalizedSamples[normalizedSamples.length - 1];
    if (lastSample) {
      lastSample.x = 1;
    }
  }

  let finalSamples = normalizedSamples;
  if (simplify > 0) {
    finalSamples = simplifyPoints(normalizedSamples, simplify);
  }

  return finalSamples.map((sample) => {
    return {
      x: sample.x,
      y: Number(sample.y.toFixed(round))
    };
  });
};

export const generateLinearCSS = (
  points: LinearPoints | undefined,
  name: string,
  variant: 'animation' | 'transition' = 'animation',
  options: { simplify?: number; round?: number } = {}
): CSSCode => {
  if (!Array.isArray(points) || points.length < 2) {
    return { code: '', timingFunction: '' };
  }

  const finalSamples = getLinearApproximation(points, options);

  const parts = finalSamples.map((sample) => {
    const y = sample.y;
    const x = Number((sample.x * 100).toFixed(2));
    return `${y} ${x}%`;
  });
  const timingFunction = `linear(${parts.join(', ')})`;
  const code = `
      .${name} {
        ${variant}-timing-function: ${timingFunction};
      }
    `;

  return { code, timingFunction };
};

export const cubicBezierToLinear = (points: CubicBezierPoints, steps: number = 20): LinearPoints => {
  const linearPoints: LinearPoints = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = cubicBezier(t, 0, points.p1.x, points.p2.x, 1);
    const y = cubicBezier(t, 0, points.p1.y, points.p2.y, 1);
    linearPoints.push({ x, y });
  }

  return linearPoints;
};

const cubicBezier = (t: number, p0: number, p1: number, p2: number, p3: number): number => {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
};

export const validateCubicBezierPoints = (points: CubicBezierPoints): boolean => {
  const { p1, p2 } = points;
  return p1.x >= 0 && p1.x <= 1 && p2.x >= 0 && p2.x <= 1;
};

export const validateLinearPoints = (points: LinearPoints): boolean => {
  if (points.length < 2) {
    return false;
  }

  const sortedPoints = [...points].sort((a, b) => a.x - b.x);

  for (let index = 0; index < sortedPoints.length; index += 1) {
    const point = sortedPoints[index];

    if (!point) {
      return false;
    }
    if (point.x < 0 || point.x > 1) {
      return false;
    }

    if (index >= sortedPoints.length - 1) {
      continue;
    }

    const next = sortedPoints[index + 1];

    if (!next) {
      return false;
    }

    if (next.x <= point.x + MIN_LINEAR_DELTA) {
      return false;
    }
  }

  const first = sortedPoints[0];
  const last = sortedPoints[sortedPoints.length - 1];
  if (first && Math.abs(first.x) > MIN_LINEAR_DELTA) {
    return false;
  }
  if (last && Math.abs(last.x - 1) > MIN_LINEAR_DELTA) {
    return false;
  }

  return true;
};

export const normalizeLinearPoints = (points: LinearPoints): LinearPoints => {
  if (points.length === 0) {
    return [];
  }

  const normalized: LinearPoints = [...points].sort((a, b) => a.x - b.x).map((point) => cloneLinearPoint(point));

  const first = normalized[0];
  if (first) {
    first.x = 0;
  }

  const last = normalized[normalized.length - 1];
  if (last) {
    last.x = 1;
  }

  for (let index = 0; index < normalized.length; index += 1) {
    const point = normalized[index];
    if (!point) {
      continue;
    }

    const minY = -2;
    const maxY = 3;
    point.y = Math.max(minY, Math.min(maxY, point.y));

    if ((point.cpInX ?? 0) > 0) {
      point.cpInX = 0;
    }
    if ((point.cpOutX ?? 0) < 0) {
      point.cpOutX = 0;
    }

    const handleThreshold = 0;
    if (Math.abs(point.cpInX ?? 0) < handleThreshold && Math.abs(point.cpInY ?? 0) < handleThreshold) {
      delete point.cpInX;
      delete point.cpInY;
    }
    if (Math.abs(point.cpOutX ?? 0) < handleThreshold && Math.abs(point.cpOutY ?? 0) < handleThreshold) {
      delete point.cpOutX;
      delete point.cpOutY;
    }

    if (point.cpInX === undefined && point.cpOutX === undefined) {
      delete point.isLinked;
      delete point.mirrorLength;
    } else if (point.isLinked !== true) {
      point.mirrorLength = false;
    }
  }

  return normalized;
};

const clamp01 = (value: number): number => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
};

export const parseCubicBezierValue = (input: string): CubicBezierPoints | null => {
  const match = input.trim().match(/^cubic-bezier\s*\((.+)\)$/i);

  if (!match) {
    return null;
  }

  const body = match[1];
  if (!body) {
    return null;
  }

  const parts = body
    .split(',')
    .map((part) => Number.parseFloat(part.trim()))
    .filter((value) => Number.isFinite(value));

  if (parts.length !== 4) {
    return null;
  }

  const [x1, y1, x2, y2] = parts as [number, number, number, number];

  if ([x1, y1, x2, y2].some((value) => Number.isNaN(value))) {
    return null;
  }

  return {
    p1: { x: clamp01(x1), y: y1 },
    p2: { x: clamp01(x2), y: y2 }
  };
};

type LinearStop = {
  y: number;
  x: number | null;
};

const ensureStopPositions = (stops: LinearStop[]): void => {
  if (stops.length === 0) {
    return;
  }

  const first = stops[0];
  if (first && first.x == null) {
    first.x = 0;
  }

  const lastIndex = stops.length - 1;
  const last = stops[lastIndex];
  if (last && last.x == null) {
    last.x = 1;
  }

  const assignBetween = (startIndex: number, endIndex: number): void => {
    const startStop = stops[startIndex];
    const endStop = stops[endIndex];

    if (!startStop || !endStop || startStop.x == null || endStop.x == null) {
      return;
    }

    const span = endStop.x - startStop.x;
    const segments = endIndex - startIndex;

    if (segments <= 1) {
      return;
    }

    for (let offset = 1; offset < segments; offset += 1) {
      const index = startIndex + offset;
      const ratio = offset / segments;
      const target = stops[index];
      if (target) {
        target.x = startStop.x + span * ratio;
      }
    }
  };

  let lastDefined = 0;

  for (let index = 1; index < stops.length; index += 1) {
    if (stops[index]?.x != null) {
      assignBetween(lastDefined, index);
      lastDefined = index;
    }
  }

  if (lastDefined < stops.length - 1) {
    assignBetween(lastDefined, stops.length - 1);
  }
};

export const parseLinearTimingFunction = (input: string): LinearPoints | null => {
  const match = input.trim().match(/^linear\s*\((.+)\)$/is);

  if (!match) {
    return null;
  }

  const body = match[1];
  if (!body) {
    return null;
  }

  const segments = body
    .split(',')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  if (segments.length < 2) {
    return null;
  }

  const stops: LinearStop[] = [];

  for (const segment of segments) {
    const parts = segment.split(/\s+/).filter((part) => part.length > 0);
    if (parts.length === 0) {
      continue;
    }

    const valueToken = parts[0];
    if (!valueToken) {
      continue;
    }
    const value = Number.parseFloat(valueToken);
    if (Number.isNaN(value)) {
      return null;
    }

    let position: number | null = null;

    for (let index = 1; index < parts.length; index += 1) {
      const token = parts[index];
      if (!token) {
        continue;
      }
      const percentMatch = token.match(/^(-?\d+(?:\.\d+)?)%$/);
      if (percentMatch) {
        const [, percentValue] = percentMatch;
        if (percentValue === undefined) {
          break;
        }
        const parsed = Number.parseFloat(percentValue);
        if (!Number.isNaN(parsed)) {
          position = clamp01(parsed / 100);
        }
        break;
      }
    }

    stops.push({ y: value, x: position });
  }

  if (stops.length < 2) {
    return null;
  }

  ensureStopPositions(stops);

  const rawPoints: LinearPoints = stops.map((stop) => {
    const x = stop.x ?? 0;
    return { x: clamp01(x), y: stop.y };
  });

  return normalizeLinearPoints(rawPoints);
};

export const vectorLength = (dx: number, dy: number): number => Math.sqrt(dx * dx + dy * dy);

export const normalizeVector = (dx: number, dy: number): { dx: number; dy: number } => {
  const length = vectorLength(dx, dy);

  if (length === 0) {
    return { dx: 0, dy: 0 };
  }

  return { dx: dx / length, dy: dy / length };
};

export const smoothLinearPoints = (points: LinearPoints, tension = 0.25): LinearPoints => {
  if (points.length < 2) {
    return points;
  }

  return points.map((point, index) => {
    const prev = points[index - 1];
    const next = points[index + 1];

    const smoothedPoint: LinearPoint = { ...point, isLinked: true, mirrorLength: true };

    if (index === 0 && next) {
      const dx = next.x - point.x;
      const dy = next.y - point.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const handleLength = length * tension;

      if (length > 0) {
        smoothedPoint.cpOutX = (dx / length) * handleLength;
        smoothedPoint.cpOutY = (dy / length) * handleLength;
      }
      return smoothedPoint;
    }

    if (index === points.length - 1 && prev) {
      const dx = point.x - prev.x;
      const dy = point.y - prev.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const handleLength = length * tension;

      if (length > 0) {
        smoothedPoint.cpInX = -(dx / length) * handleLength;
        smoothedPoint.cpInY = -(dy / length) * handleLength;
      }
      return smoothedPoint;
    }

    if (prev && next) {
      const tangentX = next.x - prev.x;
      const tangentY = next.y - prev.y;
      const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY);

      if (tangentLength > 0) {
        const normalizedTx = tangentX / tangentLength;
        const normalizedTy = tangentY / tangentLength;

        const distToPrev = Math.sqrt((point.x - prev.x) ** 2 + (point.y - prev.y) ** 2);
        const distToNext = Math.sqrt((next.x - point.x) ** 2 + (next.y - point.y) ** 2);

        const inHandleLength = distToPrev * tension;
        const outHandleLength = distToNext * tension;

        smoothedPoint.cpInX = -normalizedTx * inHandleLength;
        smoothedPoint.cpInY = -normalizedTy * inHandleLength;
        smoothedPoint.cpOutX = normalizedTx * outHandleLength;
        smoothedPoint.cpOutY = normalizedTy * outHandleLength;
      }
    }

    return smoothedPoint;
  });
};
