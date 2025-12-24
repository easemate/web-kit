import { html, type TemplateResult } from 'lit-html';

import { Component } from '~/decorators/Component';
import { Prop } from '~/decorators/Prop';
import { Query } from '~/decorators/Query';

export type MonitorFpsDetail = {
  fps: number | null;
  refreshRate: number | null;
  frameTimeAvg: number | null;
  frameTimeP95: number | null;
  frameTimeMax: number | null;
  droppedFrames: number;
  jankFrames: number;
  longFrames: number;
};

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const mean = (values: readonly number[]): number | null => {
  if (values.length === 0) {
    return null;
  }
  let sum = 0;
  for (const value of values) {
    sum += value;
  }
  return sum / values.length;
};

const quantile = (sorted: readonly number[], q: number): number | null => {
  if (sorted.length === 0) {
    return null;
  }
  const clamped = clamp(q, 0, 1);
  const index = Math.floor(clamped * (sorted.length - 1));
  return sorted[index] ?? null;
};

const computePercentile = (values: readonly number[], q: number): number | null => {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  return quantile(sorted, q);
};

const computeMedian = (values: readonly number[]): number | null => computePercentile(values, 0.5);

const formatNumber = (value: number | null, decimals = 0): string => {
  if (value === null || !Number.isFinite(value)) {
    return '—';
  }
  return value.toFixed(decimals);
};

const formatMs = (value: number | null, decimals = 1): string => {
  if (value === null || !Number.isFinite(value)) {
    return '—';
  }
  return `${value.toFixed(decimals)}ms`;
};

const rateFps = (fps: number | null, targetFps: number | null): 'good' | 'needs-improvement' | 'poor' | 'unknown' => {
  if (fps === null || !Number.isFinite(fps)) {
    return 'unknown';
  }
  const target = targetFps && Number.isFinite(targetFps) ? targetFps : 60;
  const ratio = fps / target;
  if (ratio >= 0.92) {
    return 'good';
  }
  if (ratio >= 0.75) {
    return 'needs-improvement';
  }
  return 'poor';
};

@Component({
  tag: 'ease-monitor-fps',
  autoSlot: false,
  shadowMode: 'open',
  styles: `
    :host {
      display: block;
      width: 100%;
      color: var(--color-foreground);
      font-family: var(--ease-font-family, "Instrument Sans", sans-serif);
      font-variant-numeric: tabular-nums;
    }

    [part="container"] {
      display: grid;
      gap: 8px;
      width: 100%;
    }

    [part="header"] {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
    }

    [part="title"] {
      display: inline-flex;
      align-items: baseline;
      gap: 6px;
      min-width: 0;
    }

    [part="fps"] {
      font-size: var(--ease-monitor-fps-font-size, 14px);
      font-weight: 650;
      letter-spacing: -0.01em;
      line-height: 1;
    }

    [part="fps"][data-rating="good"] {
      color: #22c55e;
    }
    [part="fps"][data-rating="needs-improvement"] {
      color: #eab308;
    }
    [part="fps"][data-rating="poor"] {
      color: #ef4444;
    }
    [part="fps"][data-rating="unknown"] {
      color: var(--color-gray-600);
    }

    [part="unit"] {
      font-size: var(--ease-monitor-unit-font-size, var(--ease-font-size-sm, 12px));
      color: var(--color-gray-600);
      font-weight: 500;
    }

    [part="subtitle"] {
      font-size: var(--ease-monitor-subtitle-font-size, 11px);
      color: var(--color-gray-600);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      min-width: 0;
      text-align: right;
    }

    canvas[part="graph"] {
      width: 100%;
      height: 44px;
      display: block;
      background: var(--color-gray-900);
      box-shadow: inset 0 0 0 1px var(--color-white-4);
    }

    [part="stats"] {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      font-size: var(--ease-monitor-stats-font-size, var(--ease-font-size-sm, 12px));
      padding-left: var(--ease-monitor-stats-padding-left, 4px);
      color: var(--color-gray-600);
    }

    [part="stat"] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-width: 0;
    }

    [part="stat"] strong {
      font-weight: 550;
      color: var(--color-gray-700);
    }
  `
})
export class MonitorFps extends HTMLElement {
  declare requestRender: () => void;

  @Prop<boolean>({ type: Boolean, reflect: true, defaultValue: false })
  accessor paused: boolean = false;

  @Query<HTMLCanvasElement>('canvas[part="graph"]')
  accessor canvasEl!: HTMLCanvasElement | null;

  #rafId: number | null = null;
  #lastNow = 0;
  #lastSampleNow = 0;
  #framesSinceSample = 0;

  #frameDeltas: number[] = [];
  #fpsSamples: number[] = [];

  #maxFrameDeltas = 240;
  #maxFpsSamples = 90; // 90 * 250ms = ~22.5s
  #sampleIntervalMs = 250;
  #statsWindowFrames = 120;

  #data: MonitorFpsDetail = {
    fps: null,
    refreshRate: null,
    frameTimeAvg: null,
    frameTimeP95: null,
    frameTimeMax: null,
    droppedFrames: 0,
    jankFrames: 0,
    longFrames: 0
  };

  connectedCallback(): void {
    this.#attachVisibilityHandling();
    if (!this.paused && !document.hidden) {
      this.#start();
    }
  }

  disconnectedCallback(): void {
    this.#stop();
    document.removeEventListener('visibilitychange', this.#handleVisibilityChange);
  }

  afterRender(): void {
    this.#syncCanvasSize();
    this.#draw();
  }

  render(): TemplateResult {
    const fps = this.#data.fps;
    const hz = this.#data.refreshRate;
    const rating = rateFps(fps, hz);

    const subtitleParts = [
      this.#data.frameTimeAvg !== null ? `avg ${formatMs(this.#data.frameTimeAvg)}` : null,
      this.#data.frameTimeP95 !== null ? `p95 ${formatMs(this.#data.frameTimeP95)}` : null
    ].filter(Boolean);

    return html`
      <div part="container">
        <div part="header">
          <div part="title">
            <span part="fps" data-rating=${rating}>${formatNumber(fps, 0)}</span>
            <span part="unit">FPS</span>
          </div>
          <div part="subtitle">${subtitleParts.join(' · ')}</div>
        </div>

        <canvas part="graph" aria-label="FPS graph"></canvas>

        <div part="stats">
          <div part="stat"><span>Refresh</span><strong>${hz ? `~${formatNumber(hz, 0)}Hz` : '—'}</strong></div>
          <div part="stat"><span>Dropped</span><strong>${this.#data.droppedFrames}</strong></div>
          <div part="stat"><span>Jank</span><strong>${this.#data.jankFrames}</strong></div>
          <div part="stat"><span>Long frames</span><strong>${this.#data.longFrames}</strong></div>
          <div part="stat"><span>Worst</span><strong>${formatMs(this.#data.frameTimeMax)}</strong></div>
          <div part="stat"><span>Avg</span><strong>${formatMs(this.#data.frameTimeAvg)}</strong></div>
        </div>
      </div>
    `;
  }

  #attachVisibilityHandling(): void {
    document.removeEventListener('visibilitychange', this.#handleVisibilityChange);
    document.addEventListener('visibilitychange', this.#handleVisibilityChange, { passive: true });
  }

  #handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.#stop();
      return;
    }

    if (!this.paused) {
      this.#start();
    }
  };

  #start(): void {
    if (this.#rafId !== null) {
      return;
    }

    const now = performance.now();
    this.#lastNow = now;
    this.#lastSampleNow = now;
    this.#framesSinceSample = 0;

    this.#rafId = requestAnimationFrame(this.#tick);
  }

  #stop(): void {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  #tick = (now: number): void => {
    if (this.paused) {
      this.#stop();
      return;
    }

    const delta = now - this.#lastNow;
    this.#lastNow = now;

    // Ignore huge deltas (tab switch / breakpoints).
    if (delta > 0 && delta < 250) {
      this.#frameDeltas.push(delta);
      if (this.#frameDeltas.length > this.#maxFrameDeltas) {
        this.#frameDeltas.shift();
      }
    }

    this.#framesSinceSample += 1;

    if (now - this.#lastSampleNow >= this.#sampleIntervalMs) {
      const elapsed = now - this.#lastSampleNow;
      const fpsSample = elapsed > 0 ? (this.#framesSinceSample * 1000) / elapsed : 0;

      this.#fpsSamples.push(fpsSample);
      if (this.#fpsSamples.length > this.#maxFpsSamples) {
        this.#fpsSamples.shift();
      }

      this.#lastSampleNow = now;
      this.#framesSinceSample = 0;

      this.#updateStats();
      this.#emit();
      this.requestRender();
    }

    this.#rafId = requestAnimationFrame(this.#tick);
  };

  #updateStats(): void {
    const frameWindow = this.#frameDeltas.slice(-this.#statsWindowFrames);
    const fpsWindow = this.#fpsSamples.slice(-Math.min(4, this.#fpsSamples.length));

    const frameAvg = mean(frameWindow);
    const frameP95 = computePercentile(frameWindow, 0.95);
    const frameMax = frameWindow.length > 0 ? Math.max(...frameWindow) : null;
    const median = computeMedian(frameWindow);

    const refreshRate =
      median && median > 0 ? clamp((1000 / median) as number, 30, 240) : (this.#data.refreshRate ?? null);

    const ideal = refreshRate ? 1000 / refreshRate : 1000 / 60;

    let droppedFrames = 0;
    let jankFrames = 0;
    let longFrames = 0;

    for (const ft of frameWindow) {
      const missed = Math.max(0, Math.round(ft / ideal) - 1);
      droppedFrames += missed;

      if (ft > ideal * 1.5) {
        jankFrames += 1;
      }

      if (ft > Math.max(50, ideal * 3)) {
        longFrames += 1;
      }
    }

    const fps = fpsWindow.length > 0 ? mean(fpsWindow) : null;

    this.#data = {
      fps,
      refreshRate,
      frameTimeAvg: frameAvg,
      frameTimeP95: frameP95,
      frameTimeMax: frameMax,
      droppedFrames,
      jankFrames,
      longFrames
    };
  }

  #emit(): void {
    this.dispatchEvent(
      new CustomEvent<MonitorFpsDetail>('monitor-fps', {
        detail: this.#data,
        bubbles: true,
        composed: true
      })
    );
  }

  #syncCanvasSize(): void {
    const canvas = this.canvasEl;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  #draw(): void {
    const canvas = this.canvasEl;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const samples = this.#fpsSamples;
    if (samples.length < 2) {
      return;
    }

    const target = this.#data.refreshRate ?? 60;
    const scaleMax = Math.max(60, Math.round(target / 10) * 10);

    const rating = rateFps(this.#data.fps, this.#data.refreshRate);
    const stroke =
      rating === 'good'
        ? '#22c55e'
        : rating === 'needs-improvement'
          ? '#eab308'
          : rating === 'poor'
            ? '#ef4444'
            : '#6b7280';

    // guide lines
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const drawGuide = (fps: number) => {
      const y = height - clamp(fps / scaleMax, 0, 1) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    };

    drawGuide(Math.min(60, scaleMax));
    drawGuide(Math.min(30, scaleMax));

    ctx.restore();

    const toY = (fps: number) => height - clamp(fps / scaleMax, 0, 1) * height;

    // area fill
    ctx.beginPath();
    for (let i = 0; i < samples.length; i += 1) {
      const value = samples[i] ?? 0;
      const x = (i / (samples.length - 1)) * width;
      const y = toY(value);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = stroke;
    ctx.fill();

    // line
    ctx.beginPath();
    for (let i = 0; i < samples.length; i += 1) {
      const value = samples[i] ?? 0;
      const x = (i / (samples.length - 1)) * width;
      const y = toY(value);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.75;
    ctx.setLineDash([]);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}
