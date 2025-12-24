import type { MonitorFpsDetail } from './fps';

import { html, type TemplateResult } from 'lit-html';

import { Component } from '~/decorators/Component';
import { Listen } from '~/decorators/Listen';
import { Watch } from '~/decorators/Watch';
import { styleObject } from '~/utils/template-helpers';
import './fps';

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  duration: number;
  interactionId?: number;
}

interface PerformanceLongTaskTiming extends PerformanceEntry {
  duration: number;
}

type CoreWebVitals = {
  LCP: number | null;
  INP: number | null;
  CLS: number;
  FCP: number | null;
  TBT: number;
};

type NavigationMetrics = {
  ttfb: number | null;
  domInteractive: number | null;
  loadTime: number | null;
};

type ResourceSummary = {
  js: { count: number; size: number };
  css: { count: number; size: number };
  img: { count: number; size: number };
  other: { count: number; size: number };
  totalSize: number;
};

type MemoryUsage = {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
} | null;

interface PerformanceMetrics {
  coreWebVitals: CoreWebVitals;
  navigation: NavigationMetrics;
  resources: ResourceSummary;
  memory: MemoryUsage;
  fps: number | null;
  longTasks: { count: number; totalDuration: number };
}

// Network Information
interface ConnectionInfo {
  effectiveType: string;
  rtt: number;
}

type MetricKey = keyof CoreWebVitals | keyof NavigationMetrics | 'fps' | 'TBT';
type MetricRating = 'good' | 'needs-improvement' | 'poor' | 'unknown';

declare global {
  interface Performance {
    memory?: {
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
      usedJSHeapSize: number;
    };
  }
  interface Navigator {
    connection?: {
      effectiveType: string;
      rtt: number;
      addEventListener: (type: string, listener: EventListener) => void;
      removeEventListener: (type: string, listener: EventListener) => void;
    };
  }
}

const METRIC_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  ttfb: { good: 800, poor: 1800 },
  loadTime: { good: 3000, poor: 6000 },
  domInteractive: { good: 1500, poor: 3500 },
  fps: { good: 55, poor: 30 },
  TBT: { good: 200, poor: 600 }
};

const GLOBAL_BENCHMARKS: Partial<Record<MetricKey, number>> = {
  LCP: 2400,
  INP: 250,
  CLS: 0.05,
  FCP: 1600,
  TBT: 300
};

const rateMetric = (metric: MetricKey, value: number | null): MetricRating => {
  if (value === null) {
    return 'unknown';
  }
  const thresholds = METRIC_THRESHOLDS[metric as keyof typeof METRIC_THRESHOLDS];
  if (!thresholds) {
    return 'unknown';
  }

  if (metric === 'fps') {
    if (value >= thresholds.good) {
      return 'good';
    }
    if (value >= thresholds.poor) {
      return 'needs-improvement';
    }
    return 'poor';
  }

  if (value <= thresholds.good) {
    return 'good';
  }
  if (value < thresholds.poor) {
    return 'needs-improvement';
  }
  return 'poor';
};

const formatMetric = (metric: MetricKey, value: number | null): string => {
  if (value === null) {
    return 'N/A';
  }
  if (metric === 'CLS') {
    return value.toFixed(3);
  }
  if (metric === 'fps') {
    return `${Math.round(value)}`;
  }
  if (value < 1000) {
    return `${Math.round(value)}ms`;
  }
  return `${(value / 1000).toFixed(2)}s`;
};

const formatBytes = (bytes: number | null | undefined, decimals = 1): string => {
  if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

const estimateCarbonFootprint = (totalBytes: number): string => {
  if (totalBytes <= 0) {
    return '0g CO2 eq.';
  }
  const emissions = (totalBytes / 1000000000) * 0.81;
  return `${emissions.toFixed(3)}g CO2 eq.`;
};

@Component({
  tag: 'ease-monitor',
  styles: `
    :host {
      position: relative;
      z-index: 100000;
      user-select: none;
      -webkit-user-select: none;
      
    }

    [part="container"] {
      width: 320px;
      overflow: hidden; 
    }

    [part="header"] {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    [part="title"] {
        display: flex;
        align-items: center;
        gap: 0.5em;
    }

    [part="content"] {
      display: grid;
      gap: 1em;
      max-height: 80vh;
      overflow-y: auto;
    }

    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        gap: 0.5em;
    }

    .metric-box {
        text-align: center;
        cursor: help;
    }

    .metric-value {
        font-variant-numeric: tabular-nums; 
    }

    .rating-good {
      color: #22c55e;
    }
    .rating-needs-improvement {
      color: #eab308;
    }
    .rating-poor {
      color: #ef4444;
    }
    .rating-unknown {
      color: #6b7280;
    }

    .status-indicator.rating-good {
      background-color: #22c55e;
    }
    .status-indicator.rating-needs-improvement {
      background-color: #eab308;
    }
    .status-indicator.rating-poor {
      background-color: #ef4444;
    }
    .status-indicator.rating-unknown {
      background-color: #6b7280;
    }

    .memory-used.rating-good {
      background-color: #22c55e;
    }
    .memory-used.rating-needs-improvement {
      background-color: #eab308;
    }
    .memory-used.rating-poor {
      background-color: #ef4444;
    }

    .resource-list, .memory-usage, .network-info {
        display: grid;
        gap: 0.25em;
    }

    .resource-item, .network-item, .longtask-item {
        display: flex;
        justify-content: space-between;
        font-variant-numeric: tabular-nums;
    }

    .memory-bar {
        height: 10px;
        overflow: hidden;
        position: relative;
    }

    .memory-used {
        height: 100%;
        transition: width 0.5s ease-in-out;
    }

    .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }
    
    .carbon-estimate {
        text-align: right;
    }

    .trend-indicator {
        display: inline-block;
        width: 1em;
        text-align: center;
    }
  `
})
export class Monitor extends HTMLElement {
  declare requestRender: () => void;

  @Watch<PerformanceMetrics>({})
  accessor metrics: PerformanceMetrics = {
    navigation: { loadTime: null, domInteractive: null, ttfb: null },
    coreWebVitals: { LCP: null, INP: null, CLS: 0, FCP: null, TBT: 0 },
    resources: {
      js: { count: 0, size: 0 },
      css: { count: 0, size: 0 },
      img: { count: 0, size: 0 },
      other: { count: 0, size: 0 },
      totalSize: 0
    },
    memory: null,
    fps: null,
    longTasks: { count: 0, totalDuration: 0 }
  };

  @Watch<ConnectionInfo>({})
  accessor network: ConnectionInfo = {
    effectiveType: 'N/A',
    rtt: 0
  };

  private observers: PerformanceObserver[] = [];
  private memoryInterval: number | null = null;

  private clsEntries: LayoutShift[] = [];

  private inpEntries: PerformanceEventTiming[] = [];
  private maxINP = 0;

  private longTaskEntries: PerformanceLongTaskTiming[] = [];

  private trendHistory: Partial<Record<MetricKey, number[]>> = {};
  private maxTrendLength = 5;

  connectedCallback(): void {
    this.initObservers();
    this.collectInitialMetrics();
    this.startMemoryMonitoring();
    this.initNetworkMonitoring();

    if (document.readyState !== 'complete') {
      window.addEventListener('load', this.handlePageLoad);
    } else {
      this.handlePageLoad();
    }
  }

  disconnectedCallback(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers = [];
    this.stopMemoryMonitoring();
    this.stopNetworkMonitoring();
    window.removeEventListener('load', this.handlePageLoad);
  }

  @Listen<Monitor, CustomEvent<MonitorFpsDetail>>('monitor-fps')
  handleFpsUpdate(event: CustomEvent<MonitorFpsDetail>): void {
    const fps = event.detail?.fps ?? null;
    this.metrics.fps = fps;
    this.updateTrend('fps', fps);
    this.requestRender();
  }

  private handlePageLoad = (): void => {
    setTimeout(() => {
      this.collectNavigationTiming();
      this.requestRender();
    }, 500);
  };

  private initObservers(): void {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver API not supported.');
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      observer.observe({ type: 'event', buffered: true });
      observer.observe({ type: 'layout-shift', buffered: true });
      observer.observe({ type: 'paint', buffered: true });
      observer.observe({ type: 'resource', buffered: true });
      observer.observe({ type: 'longtask', buffered: true });

      this.observers.push(observer);
    } catch (e) {
      console.error('Error initializing PerformanceObserver:', e);
    }
  }

  private collectInitialMetrics(): void {
    this.collectNavigationTiming();
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    this.processResourceEntries(resourceEntries);
  }

  private collectNavigationTiming(): void {
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const navTiming = navigationEntries[0] as PerformanceNavigationTiming;

      let ttfb = null;
      if (navTiming.responseStart > 0 && navTiming.fetchStart > 0) {
        ttfb = navTiming.responseStart - navTiming.fetchStart;
      }

      let loadTime = null;
      if (navTiming.loadEventEnd > 0) {
        loadTime = navTiming.loadEventEnd - navTiming.startTime;
      }

      let domInteractive = null;
      if (navTiming.domInteractive > 0) {
        domInteractive = navTiming.domInteractive - navTiming.startTime;
      }

      this.metrics.navigation = { ttfb, loadTime, domInteractive };
      this.updateTrend('loadTime', loadTime);
      this.updateTrend('ttfb', ttfb);
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'largest-contentful-paint':
        this.metrics.coreWebVitals.LCP = entry.startTime;
        this.updateTrend('LCP', entry.startTime);
        break;
      case 'event': {
        const eventEntry = entry as PerformanceEventTiming;
        if (eventEntry.interactionId && eventEntry.duration > this.maxINP) {
          this.maxINP = eventEntry.duration;
          this.metrics.coreWebVitals.INP = this.maxINP;
          this.updateTrend('INP', this.maxINP);
        }
        this.inpEntries.push(eventEntry);
        break;
      }
      case 'layout-shift': {
        const lsEntry = entry as LayoutShift;
        if (!lsEntry.hadRecentInput) {
          this.clsEntries.push(lsEntry);
          this.calculateSessionWindowCLS();
        }
        break;
      }
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.coreWebVitals.FCP = entry.startTime;
          this.updateTrend('FCP', entry.startTime);
        }
        break;
      case 'resource':
        this.processResourceEntries([entry as PerformanceResourceTiming]);
        return;
      case 'longtask': {
        const ltEntry = entry as PerformanceLongTaskTiming;
        this.longTaskEntries.push(ltEntry);
        this.calculateLongTasksAndTBT();
        break;
      }
    }
    this.requestRender();
  }

  private calculateSessionWindowCLS(): void {
    let maxCls = 0;
    let currentSessionCls = 0;
    let sessionStartTime = Infinity;
    let lastTime = -Infinity;

    this.clsEntries.sort((a, b) => a.startTime - b.startTime);

    for (const entry of this.clsEntries) {
      const timeDiff = entry.startTime - lastTime;

      if (timeDiff > 1000 || entry.startTime - sessionStartTime > 5000) {
        if (currentSessionCls > 0) {
          maxCls = Math.max(maxCls, currentSessionCls);
        }
        currentSessionCls = 0;
        sessionStartTime = entry.startTime;
      }

      currentSessionCls += entry.value;
      lastTime = entry.startTime;
    }

    maxCls = Math.max(maxCls, currentSessionCls);
    this.metrics.coreWebVitals.CLS = maxCls;
    this.updateTrend('CLS', maxCls);
  }

  private processResourceEntries(entries: PerformanceResourceTiming[]): void {
    const summary = this.metrics.resources;

    entries.forEach((entry) => {
      const size = entry.transferSize || 0;
      const initiator = entry.initiatorType;
      const name = entry.name.toLowerCase();

      if (initiator === 'script' || name.endsWith('.js')) {
        summary.js.count++;
        summary.js.size += size;
      } else if (initiator === 'css' || name.endsWith('.css') || initiator === 'link') {
        summary.css.count++;
        summary.css.size += size;
      } else if (initiator === 'img' || initiator === 'image' || /\.(jpg|jpeg|png|gif|svg|webp|avif)$/.test(name)) {
        summary.img.count++;
        summary.img.size += size;
      } else {
        summary.other.count++;
        summary.other.size += size;
      }
      summary.totalSize += size;
    });
  }

  private calculateLongTasksAndTBT(): void {
    let tbt = 0;
    let count = 0;
    const referenceTime = this.metrics.coreWebVitals.FCP ?? 0;

    this.longTaskEntries.forEach((task) => {
      if (task.startTime >= referenceTime) {
        count++;
        if (task.duration > 50) {
          tbt += task.duration - 50;
        }
      }
    });
    this.metrics.longTasks = { count, totalDuration: tbt };
    this.metrics.coreWebVitals.TBT = tbt;
    this.updateTrend('TBT', tbt);
  }

  private startMemoryMonitoring(): void {
    if (!performance.memory) {
      return;
    }

    const updateMemory = () => {
      if (performance.memory) {
        const mem = performance.memory;
        this.metrics.memory = {
          jsHeapSizeLimit: Number(mem.jsHeapSizeLimit) || 0,
          totalJSHeapSize: Number(mem.totalJSHeapSize) || 0,
          usedJSHeapSize: Number(mem.usedJSHeapSize) || 0
        };
        this.requestRender();
      }
    };

    updateMemory();
    this.memoryInterval = window.setInterval(updateMemory, 3000);
  }

  private stopMemoryMonitoring(): void {
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
      this.memoryInterval = null;
    }
  }

  private initNetworkMonitoring(): void {
    if (navigator.connection) {
      this.updateNetworkInfo();
      navigator.connection.addEventListener('change', this.updateNetworkInfo);
    }
  }

  private stopNetworkMonitoring(): void {
    if (navigator.connection) {
      navigator.connection.removeEventListener('change', this.updateNetworkInfo);
    }
  }

  private updateNetworkInfo = (): void => {
    if (navigator.connection) {
      this.network = {
        effectiveType: navigator.connection.effectiveType ?? 'N/A',
        rtt: navigator.connection.rtt ?? 0
      };
    }
  };

  private updateTrend(key: MetricKey, value: number | null): void {
    if (value === null) {
      return;
    }
    const history = this.trendHistory[key] || [];
    history.push(value);
    if (history.length > this.maxTrendLength) {
      history.shift();
    }
    this.trendHistory[key] = history;
  }

  private getTrendDirection(key: MetricKey): string {
    const history = this.trendHistory[key];
    if (!history || history.length < 2) {
      return '';
    }

    const currentValue = history[history.length - 1];
    const previousAvg = history.slice(0, history.length - 1).reduce((a, b) => a + b, 0) / (history.length - 1);

    const threshold = Math.abs(previousAvg * 0.05);
    const delta = currentValue ?? 0 - previousAvg;

    if (Math.abs(delta) < threshold) {
      return '→';
    }

    if (key === 'fps') {
      return delta > 0 ? '↑' : '↓';
    } else {
      return delta < 0 ? '↓' : '↑';
    }
  }

  private getOverallStatus(): MetricRating {
    const ratings: MetricRating[] = [
      rateMetric('LCP', this.metrics.coreWebVitals.LCP),
      rateMetric('CLS', this.metrics.coreWebVitals.CLS),
      rateMetric('INP', this.metrics.coreWebVitals.INP),
      rateMetric('fps', this.metrics.fps)
    ];

    if (ratings.includes('poor')) {
      return 'poor';
    }
    if (ratings.includes('needs-improvement')) {
      return 'needs-improvement';
    }
    if (ratings.every((r) => r === 'unknown')) {
      return 'unknown';
    }

    if (ratings.some((r) => r === 'good')) {
      return 'good';
    }

    return 'unknown';
  }

  render(): TemplateResult {
    return html`
      <div part="container">
        ${this.renderExpanded()}
      </div>
    `;
  }

  private renderExpanded(): TemplateResult {
    return html`
      <div part="header">
        <div part="title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            Performance Monitor
        </div>
      </div>
      <div part="content">
        ${this.renderVitalsAndTiming()}
        ${this.renderRealtime()}
        ${this.renderNetworkInfo()}
        ${this.renderResources()}
      </div>
    `;
  }

  private renderMetricBox(label: string, key: MetricKey, value: number | null, description: string): TemplateResult {
    const rating = rateMetric(key, value);
    const formattedValue = formatMetric(key, value);
    const trend = this.getTrendDirection(key);
    const benchmark = GLOBAL_BENCHMARKS[key];
    const vsBenchmark = benchmark ? ` (vs avg ${formatMetric(key, benchmark)})` : '';
    return html`
        <div class="metric-box" title="${description}${vsBenchmark}">
            <div part="metric-label" class="metric-label">${label}</div>
            <div part="metric-value" class="metric-value rating-${rating}" data-rating=${rating}>
                ${formattedValue}
                <span class="trend-indicator">${trend}</span>
            </div>
        </div>
    `;
  }

  private renderVitalsAndTiming(): TemplateResult {
    const { LCP, INP, CLS, FCP, TBT } = this.metrics.coreWebVitals;
    const { ttfb, loadTime } = this.metrics.navigation;
    return html`
        <section>
            <div part="section-title" class="section-title">Vitals & Timing</div>
            <div class="metrics-grid">
                ${this.renderMetricBox('LCP', 'LCP', LCP, 'Largest Contentful Paint: Measures loading performance.')}
                ${this.renderMetricBox('INP', 'INP', INP, 'Interaction to Next Paint: Measures responsiveness.')}
                ${this.renderMetricBox('CLS', 'CLS', CLS, 'Cumulative Layout Shift: Measures visual stability.')}
                ${this.renderMetricBox('FCP', 'FCP', FCP, 'First Contentful Paint: When the browser renders the first bit of content.')}
                ${this.renderMetricBox('TBT', 'TBT', TBT, 'Total Blocking Time: Sum of blocking portions of long tasks.')}
                ${this.renderMetricBox('TTFB', 'ttfb', ttfb, 'Time to First Byte: Measures server responsiveness.')}
                ${this.renderMetricBox('Load', 'loadTime', loadTime, 'Total Page Load Time.')}
            </div>
        </section>
    `;
  }

  private renderRealtime(): TemplateResult {
    const { memory, longTasks } = this.metrics;

    return html`
        <section>
            <div part="section-title" class="section-title">Realtime Monitoring</div>
            <ease-monitor-fps></ease-monitor-fps>
            <div class="longtask-item">
                <span>Long Tasks (Count / Blocked ms)</span>
                <span>${longTasks.count} / ${longTasks.totalDuration.toFixed(0)}ms</span>
            </div>
            ${this.renderMemory(memory)}
        </section>
    `;
  }

  private renderMemory(memory: MemoryUsage): TemplateResult {
    if (!memory) {
      return html`
            <div class="memory-usage">
                (performance.memory API not supported)
            </div>
        `;
    }

    const usedPercent = memory.totalJSHeapSize > 0 ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 0;

    let rating: MetricRating = 'good';
    if (usedPercent > 85) {
      rating = 'poor';
    } else if (usedPercent > 60) {
      rating = 'needs-improvement';
    }

    return html`
        <div class="memory-usage">
            <div class="resource-item">
                <span>Used / Total Heap</span>
                <span>${formatBytes(memory.usedJSHeapSize)} / ${formatBytes(memory.totalJSHeapSize)}</span>
            </div>
            <div class="memory-bar" title="${usedPercent.toFixed(1)}% Used">
                <div class="memory-used rating-${rating}" style=${styleObject({ width: `${Math.min(100, usedPercent)}%` })} data-rating=${rating}></div>
            </div>
            <div class="resource-item">
                <span>Heap Limit</span>
                <span>${formatBytes(memory.jsHeapSizeLimit)}</span>
            </div>
        </div>
    `;
  }

  private renderNetworkInfo(): TemplateResult {
    const { effectiveType, rtt } = this.network;
    return html`
        <section>
            <div part="section-title" class="section-title">Network Connection</div>
            <div class="network-info">
                <div class="network-item">
                    <span>Effective Type</span>
                    <span>${effectiveType.toUpperCase()}</span>
                </div>
                 <div class="network-item">
                    <span>Round Trip Time (RTT)</span>
                    <span>${rtt > 0 ? `${rtt}ms` : 'N/A'}</span>
                </div>
            </div>
        </section>
    `;
  }

  private renderResources(): TemplateResult {
    const { js, css, img, other, totalSize } = this.metrics.resources;
    const totalCount = js.count + css.count + img.count + other.count;

    const renderItem = (label: string, data: { count: number; size: number }) => html`
        <div class="resource-item">
            <span>${label} (${data.count})</span>
            <span>${formatBytes(data.size)}</span>
        </div>
    `;

    return html`
        <section>
            <div part="section-title" class="section-title">Resources (Total: ${formatBytes(totalSize)} / ${totalCount} reqs)</div>
            <div class="resource-list">
                ${renderItem('JS', js)}
                ${renderItem('CSS/Links', css)}
                ${renderItem('Images', img)}
                ${renderItem('Other', other)}
            </div>
            <div part="carbon-estimate" class="carbon-estimate">
                Est. Carbon: ${estimateCarbonFootprint(totalSize)}
            </div>
            <div>
              Overall Status: ${this.getOverallStatus()}
            </div>
        </section>
    `;
  }
}
