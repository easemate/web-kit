export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsb';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function hsvToRgb(h: number, s: number, v: number): RGB {
  let hue = ((h % 360) + 360) % 360;
  hue /= 60;

  const saturation = clamp01(s);
  const value = clamp01(v);
  const c = value * saturation;
  const x = c * (1 - Math.abs((hue % 2) - 1));
  const m = value - c;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 1) {
    r = c;
    g = x;
  } else if (hue < 2) {
    r = x;
    g = c;
  } else if (hue < 3) {
    g = c;
    b = x;
  } else if (hue < 4) {
    g = x;
    b = c;
  } else if (hue < 5) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

export function rgbToHsv(r: number, g: number, b: number): HSV {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (delta !== 0) {
    switch (max) {
      case rn:
        h = (gn - bn) / delta + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / delta + 2;
        break;
      case bn:
        h = (rn - gn) / delta + 4;
        break;
      default:
        break;
    }

    h *= 60;
  }

  return { h, s, v };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (component: number) => component.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToRgb(hex: string): RGB | null {
  let normalized = hex.trim();

  if (/^#([0-9a-f]{3})$/i.test(normalized)) {
    normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }

  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);

  if (!match || !match[1] || !match[2] || !match[3]) {
    return null;
  }

  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16)
  };
}

export function hexToHsv(hex: string): HSV | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsv(rgb.r, rgb.g, rgb.b) : null;
}

export function hsvToHex(h: number, s: number, v: number): string {
  const rgb = hsvToRgb(h, s, v);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

export function isValidHex(hex: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim());
}

export function getLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function isLightColor(r: number, g: number, b: number): boolean {
  return getLuminance(r, g, b) > 0.5;
}

export function hsvToHsl(h: number, s: number, v: number): HSL {
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return { h, s: sl, l };
}

export function hslToHsv(h: number, s: number, l: number): HSV {
  const v = l + s * Math.min(l, 1 - l);
  const sv = v === 0 ? 0 : 2 * (1 - l / v);
  return { h, s: sv, v };
}

export function formatColor(hsv: HSV, format: ColorFormat, alpha = 1): string {
  const { h, s, v } = hsv;

  switch (format) {
    case 'hex':
      return hsvToHex(h, s, v);
    case 'rgb': {
      const rgb = hsvToRgb(h, s, v);
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }
    case 'hsl': {
      const hsl = hsvToHsl(h, s, v);
      return `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%, ${alpha})`;
    }
    case 'hsb':
      return `hsb(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`;
    default:
      return hsvToHex(h, s, v);
  }
}

export interface ColorComponents {
  labels: string[];
  values: (string | number)[];
  max: number[];
  suffix: string[];
}

export function getColorComponents(hsv: HSV, format: ColorFormat): ColorComponents {
  const { h, s, v } = hsv;

  switch (format) {
    case 'hex':
      return {
        labels: ['Hex'],
        values: [hsvToHex(h, s, v)],
        max: [0],
        suffix: ['']
      };
    case 'rgb': {
      const rgb = hsvToRgb(h, s, v);
      return {
        labels: ['R', 'G', 'B'],
        values: [rgb.r, rgb.g, rgb.b],
        max: [255, 255, 255],
        suffix: ['', '', '']
      };
    }
    case 'hsl': {
      const hsl = hsvToHsl(h, s, v);
      return {
        labels: ['H', 'S', 'L'],
        values: [Math.round(hsl.h), Math.round(hsl.s * 100), Math.round(hsl.l * 100)],
        max: [360, 100, 100],
        suffix: ['°', '%', '%']
      };
    }
    case 'hsb':
      return {
        labels: ['H', 'S', 'B'],
        values: [Math.round(h), Math.round(s * 100), Math.round(v * 100)],
        max: [360, 100, 100],
        suffix: ['°', '%', '%']
      };
    default:
      return {
        labels: ['Hex'],
        values: [hsvToHex(h, s, v)],
        max: [0],
        suffix: ['']
      };
  }
}

export function updateHsvFromComponents(hsv: HSV, format: ColorFormat, index: number, value: number | string): HSV {
  const newHsv = { ...hsv };

  switch (format) {
    case 'hex': {
      if (typeof value === 'string' && isValidHex(value)) {
        const parsed = hexToHsv(value);
        if (parsed) {
          return parsed;
        }
      }
      break;
    }
    case 'rgb': {
      const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
      const vals: [number, number, number] = [rgb.r, rgb.g, rgb.b];
      vals[index] = Math.max(0, Math.min(255, Number(value)));
      return rgbToHsv(vals[0], vals[1], vals[2]);
    }
    case 'hsl': {
      const hsl = hsvToHsl(hsv.h, hsv.s, hsv.v);
      const vals: [number, number, number] = [hsl.h, hsl.s * 100, hsl.l * 100];
      vals[index] = Number(value);
      vals[0] = Math.max(0, Math.min(360, vals[0]));
      vals[1] = Math.max(0, Math.min(100, vals[1]));
      vals[2] = Math.max(0, Math.min(100, vals[2]));
      return hslToHsv(vals[0], vals[1] / 100, vals[2] / 100);
    }
    case 'hsb': {
      const vals: [number, number, number] = [hsv.h, hsv.s * 100, hsv.v * 100];
      vals[index] = Number(value);
      vals[0] = Math.max(0, Math.min(360, vals[0]));
      vals[1] = Math.max(0, Math.min(100, vals[1]));
      vals[2] = Math.max(0, Math.min(100, vals[2]));
      return { h: vals[0], s: vals[1] / 100, v: vals[2] / 100 };
    }
  }

  return newHsv;
}

export const COLOR_FORMATS: ColorFormat[] = ['hex', 'rgb', 'hsl', 'hsb'];
