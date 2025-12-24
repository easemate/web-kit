import { html } from 'lit-html';

import { Component } from '~/decorators/Component';
import { Prop } from '~/decorators/Prop';

type LogoLoaderState = 'idle' | 'intro' | 'loop' | 'exit';

export type LogoIntroVariant = 'wave' | 'particle';

interface DotData {
  id: string;
  cx: number;
  cy: number;
}

const CENTER = { x: 74, y: 74 };

const DOTS_DATA: DotData[] = [
  { id: 'dot-1', cx: 7.22725, cy: 73.99975 },
  { id: 'dot-2', cx: 8.0, cy: 107.63685 },
  { id: 'dot-3', cx: 41.36365, cy: 7.72734 },
  { id: 'dot-4', cx: 40.36105, cy: 40.36375 },
  { id: 'dot-5', cx: 40.36105, cy: 107.63625 },
  { id: 'dot-6', cx: 41.36365, cy: 140.77285 },
  { id: 'dot-7', cx: 73.99995, cy: 7.22725 },
  { id: 'dot-8', cx: 73.99995, cy: 140.77325 },
  { id: 'dot-9', cx: 108.13785, cy: 7.72734 },
  { id: 'dot-10', cx: 107.88425, cy: 73.99975 },
  { id: 'dot-11', cx: 108.13785, cy: 140.77285 },
  { id: 'dot-12', cx: 141.27285, cy: 40.86385 },
  { id: 'dot-13', cx: 140.77225, cy: 73.99975 },
  { id: 'dot-14', cx: 141.27285, cy: 107.63685 },
  { id: 'dot-15', cx: 40.36165, cy: 73.99925 },
  { id: 'dot-16', cx: 74.00125, cy: 40.36345 },
  { id: 'dot-17', cx: 74.00125, cy: 73.99925 },
  { id: 'dot-18', cx: 74.00125, cy: 107.63585 },
  { id: 'dot-19', cx: 107.63485, cy: 40.36345 },
  { id: 'dot-20', cx: 107.63485, cy: 107.63585 },
  { id: 'dot-21', cx: 141.77, cy: 8.23 },
  { id: 'dot-22', cx: 141.77, cy: 140.77 },
  { id: 'dot-23', cx: 7.73019, cy: 140.77 },
  { id: 'dot-24', cx: 7.72018, cy: 8.22 },
  { id: 'dot-25', cx: 7.73518, cy: 40.865 }
];

const INNER_DOT_IDS = ['dot-19', 'dot-20', 'dot-18', 'dot-15', 'dot-17', 'dot-16'];

const OUTER_DOT_IDS = DOTS_DATA.map((d) => d.id).filter((id) => !INNER_DOT_IDS.includes(id));

const forceReflow = (el: Element): void => {
  void window.getComputedStyle(el).opacity;
};

const getAngle = (dot: DotData): number => Math.atan2(dot.cy - CENTER.y, dot.cx - CENTER.x);

const sortByAngle = (ids: string[]): DotData[] =>
  ids
    .map((id) => DOTS_DATA.find((d) => d.id === id))
    .filter((dot): dot is DotData => dot != null)
    .sort((a, b) => getAngle(a) - getAngle(b));

const LOOP_DURATION = 1500;
const ROTATION_DURATION = 600;

@Component({
  tag: 'ease-logo-loader',
  styles: `
    :host {
      display: inline-block;
      --ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);
      --ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);
      --ease-overshoot: cubic-bezier(0.34, 1.56, 0.64, 1);
      
      --dot-dark: var(--color-gray-0, oklab(98.81% 0 0));
      --dot-medium: var(--color-gray-600, oklab(65.21% -0.0019 -0.0144));
      --dot-light: var(--color-gray-700, oklab(37.92% -0.0006 -0.0179));
      --dot-accent: var(--color-blue-600, oklab(76.85% 0.0462 -0.1115));
    }

    .logo-loader {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--logo-loader-size, 36px);
      height: var(--logo-loader-size, 36px);
    }

    .logo-loader__svg {
      width: 100%;
      height: 100%;
      display: block;
      transform-origin: center;
      overflow: visible;
    }

    .logo-loader__svg rect {
      transform-box: fill-box;
      transform-origin: center;
      transition:
        transform 380ms var(--ease-out),
        fill 320ms ease,
        opacity 320ms ease;
    }

    /* State: intro - dots are animating in */
    .logo-loader[data-state='intro'] .logo-loader__svg rect {
      opacity: 0;
      transform: scale(0);
    }

    /* Outer dots loading animation */
    @keyframes loading-outer {
      0%, 100% {
        transform: scale(var(--base-scale, 1));
        fill: var(--dot-light);
        opacity: 0.4;
      }
      15% {
        transform: scale(calc(var(--base-scale, 1) * 1.35));
        fill: var(--dot-dark);
        opacity: 1;
      }
      35% {
        transform: scale(var(--base-scale, 1));
        fill: var(--dot-medium);
        opacity: 0.8;
      }
    }

    /* Inner dots loading animation */
    @keyframes loading-inner {
      0%, 100% {
        transform: scale(var(--base-scale, 0.6));
        opacity: 0.7;
        fill: var(--dot-medium);
      }
      50% {
        transform: scale(calc(var(--base-scale, 0.6) * 1.9));
        opacity: 0.1;
        fill: var(--dot-light);
      }
    }

    .dot-loading {
      animation-name: loading-outer;
      animation-duration: 600ms;
      animation-timing-function: cubic-bezier(0.3, 0.6, 0.4, 1);
      animation-iteration-count: infinite;
      animation-fill-mode: both;
      animation-delay: var(--delay, 0ms);
    }

    .dot-loading-inner {
      animation-name: loading-inner;
      animation-duration: 1500ms;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
      animation-fill-mode: both;
      animation-delay: var(--delay, 0ms);
    }

    /* Exit animation class */
    .restoring {
      transition:
        transform 450ms cubic-bezier(0.25, 0, 0.5, 1),
        fill 350ms ease,
        opacity 350ms ease;
    }

    /* Particle intro animation */
    @keyframes particle-bounce {
      0% { transform: scale(1); }
      40% { transform: scale(1.25); }
      65% { transform: scale(0.95); }
      85% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .particle-bounce {
      animation: particle-bounce 400ms var(--ease-overshoot) both;
    }

    /* Shockwave ring animation */
    @keyframes shockwave-expansion {
      0% {
        transform: scale(1);
        opacity: 1;
        stroke-width: 1.5px;
      }
      100% {
        transform: scale(4);
        opacity: 0;
        stroke-width: 0.5px;
      }
    }

    .shockwave-ring {
      fill: none;
      stroke: var(--dot-dark);
      transform-box: fill-box;
      transform-origin: center;
      animation: shockwave-expansion 900ms cubic-bezier(0.165, 0.84, 0.44, 1) both;
    }

    /* Pulse wave for intro */
    @keyframes pulse-wave {
      0% {
        transform: scale(1);
        filter: brightness(1);
      }
      50% {
        transform: scale(1.2);
        filter: brightness(1.6);
        fill: var(--dot-light);
      }
      100% {
        transform: scale(1);
        filter: brightness(1);
      }
    }

    .dot-pulse-wave {
      animation: pulse-wave var(--pulse-duration, 500ms) var(--pulse-delay, 0ms) cubic-bezier(0.455, 0.03, 0.515, 0.955);
    }

    @media (prefers-reduced-motion: reduce) {
      .logo-loader__svg {
        transition: none;
        transform: scale(1);
      }
      .logo-loader__svg rect {
        animation: none !important;
        transition: none;
        transform: scale(1);
        opacity: 1;
      }
    }
  `,
  template(host: LogoLoader) {
    const size = host.size ?? 36;
    const state = host.state;
    const ariaLabel = host.ariaLabel;
    const ariaLabelTrimmed = ariaLabel?.trim() ?? '';

    return html`
      <div
        class="logo-loader"
        data-state=${state}
        style=${`--logo-loader-size:${size}px;`}
      >
        <svg
          viewBox="0 0 148 148"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="logo-loader__svg"
          role=${ariaLabelTrimmed ? 'img' : null}
          aria-label=${ariaLabelTrimmed || null}
          aria-hidden=${ariaLabelTrimmed ? null : 'true'}
          focusable=${ariaLabelTrimmed ? null : 'false'}
        >
          <g class="shockwave-container"></g>
          
          <rect id="dot-1" x="0.5" y="67.2725" width="13.4545" height="13.4545" rx="6.72727" fill="var(--dot-medium)" />
          <rect id="dot-2" x="3.5" y="103.152" width="8.9697" height="8.9697" rx="4.48485" fill="var(--dot-medium)" />
          <rect id="dot-3" x="36.8788" y="3.24249" width="8.9697" height="8.9697" rx="4.48485" fill="var(--dot-medium)" />
          <rect id="dot-4" x="33.6338" y="33.6365" width="13.4545" height="13.4545" rx="6.72727" fill="var(--dot-medium)" />
          <rect id="dot-5" x="33.6338" y="100.909" width="13.4545" height="13.4545" rx="6.72727" fill="var(--dot-medium)" />
          <rect id="dot-6" x="36.8788" y="136.288" width="8.9697" height="8.9697" rx="4.48485" fill="var(--dot-medium)" />
          <rect id="dot-7" x="67.2727" y="0.5" width="13.4545" height="13.4545" rx="6.72727" fill="var(--dot-light)" />
          <rect id="dot-8" x="67.2727" y="134.046" width="13.4545" height="13.4545" rx="6.72727" fill="var(--dot-medium)" />
          <rect id="dot-9" x="103.653" y="3.24249" width="8.9697" height="8.9697" rx="4.48485" fill="var(--dot-medium)" />
          <rect id="dot-10" x="101.407" y="67.2725" width="13.4545" height="13.4545" rx="6.72727" fill="var(--dot-medium)" />
          <rect id="dot-11" x="103.653" y="136.288" width="8.9697" height="8.9697" rx="4.48485" fill="var(--dot-light)" />
          <rect id="dot-12" x="136.788" y="36.379" width="8.9697" height="8.9697" rx="4.48485" fill="var(--dot-light)" />
          <rect id="dot-13" x="134.045" y="67.2725" width="13.4545" height="13.4545" rx="6.72727" fill="var(--dot-light)" />
          <rect id="dot-14" x="136.788" y="103.152" width="8.9697" height="8.9697" rx="4.48485" fill="var(--dot-light)" />
          
          <rect id="dot-15" x="26.9071" y="60.5447" width="26.9091" height="26.9091" rx="13.4545" fill="var(--dot-dark)" />
          <rect id="dot-16" x="60.5467" y="26.9089" width="26.9091" height="26.9091" rx="13.4545" fill="var(--dot-dark)" />
          <rect id="dot-17" x="60.5467" y="60.5447" width="26.9091" height="26.9091" rx="13.4545" fill="var(--dot-dark)" />
          <rect id="dot-18" x="60.5467" y="94.1813" width="26.9091" height="26.9091" rx="13.4545" fill="var(--dot-dark)" />
          <rect id="dot-19" x="94.1803" y="26.9089" width="26.9091" height="26.9091" rx="13.4545" fill="var(--dot-dark)" />
          <rect id="dot-20" x="94.1803" y="94.1813" width="26.9091" height="26.9091" rx="13.4545" fill="var(--dot-dark)" />
          
          <rect id="dot-21" x="139.53" y="5.98999" width="4.48" height="4.48" rx="2.24" fill="var(--dot-light)" />
          <rect id="dot-22" x="139.53" y="138.53" width="4.48" height="4.48" rx="2.24" fill="var(--dot-light)" />
          <rect id="dot-23" x="5.49019" y="138.53" width="4.48" height="4.48" rx="2.24" fill="var(--dot-light)" />
          <rect id="dot-24" x="5.48018" y="5.97998" width="4.48" height="4.48" rx="2.24" fill="var(--dot-light)" />
          <rect id="dot-25" x="4.37018" y="37.5" width="6.73" height="6.73" rx="3.365" fill="var(--dot-light)" />
        </svg>
      </div>
    `;
  }
})
export class LogoLoader extends HTMLElement {
  declare requestRender: () => void;

  @Prop<boolean, LogoLoader>({
    type: Boolean,
    attribute: 'loading',
    defaultValue: false,
    onChange(next) {
      (this as LogoLoader).handleLoadingChange(next);
    }
  })
  accessor loading = false;

  @Prop<LogoIntroVariant, LogoLoader>({
    type: 'string',
    attribute: 'intro',
    defaultValue: 'wave'
  })
  accessor intro: LogoIntroVariant = 'wave';

  @Prop<number | null, LogoLoader>({
    type: Number,
    attribute: 'size',
    defaultValue: 36
  })
  accessor size: number | null = 36;

  @Prop<string | null, LogoLoader>({
    type: 'string',
    attribute: 'aria-label',
    defaultValue: null
  })
  accessor ariaLabel: string | null = null;

  #state: LogoLoaderState = 'intro';
  #loopStartTime = 0;
  #animationTimers: number[] = [];
  #introCompleted = false;

  get state(): LogoLoaderState {
    return this.#state;
  }

  set state(value: LogoLoaderState) {
    if (this.#state === value) {
      return;
    }
    this.#state = value;
    if (typeof this.requestRender === 'function') {
      this.requestRender();
    }
  }

  connectedCallback(): void {
    // Wait for first render before starting intro animation
    // The Component decorator renders after connectedCallback via requestAnimationFrame
    requestAnimationFrame(() => {
      // Double RAF to ensure render is complete
      requestAnimationFrame(() => {
        if (this.loading) {
          this.#runIntro(() => {
            this.#introCompleted = true;
            this.#startLoopAnimation();
          });
        } else {
          this.#runIntro(() => {
            this.#introCompleted = true;
            this.state = 'idle';
          });
        }
      });
    });
  }

  disconnectedCallback(): void {
    this.#clearTimers();
  }

  #clearTimers(): void {
    for (const id of this.#animationTimers) {
      window.clearTimeout(id);
    }
    this.#animationTimers = [];
  }

  #setTimeout(fn: () => void, delay: number): number {
    const id = window.setTimeout(fn, delay);
    this.#animationTimers.push(id);
    return id;
  }

  #getDot(id: string): SVGRectElement | null {
    const svg = this.shadowRoot?.querySelector('.logo-loader__svg');
    return svg?.querySelector(`#${id}`) as SVGRectElement | null;
  }

  #getShockwaveContainer(): SVGGElement | null {
    return this.shadowRoot?.querySelector('.shockwave-container') as SVGGElement | null;
  }

  #resetDotsState(instant = false, keepOpacity = false): void {
    const container = this.#getShockwaveContainer();
    if (container) {
      container.innerHTML = '';
    }

    for (const dot of DOTS_DATA) {
      const el = this.#getDot(dot.id);
      if (!el) {
        continue;
      }

      if (instant) {
        el.style.transition = 'none';
      } else {
        el.style.transition = '';
      }

      // Remove all animation classes
      el.classList.remove('dot-loading', 'dot-loading-inner', 'restoring', 'dot-pulse-wave', 'particle-bounce');

      el.style.removeProperty('--base-scale');
      el.style.removeProperty('--delay');
      el.style.removeProperty('--pulse-delay');
      el.style.removeProperty('--pulse-duration');

      // Reset inline styles
      el.style.transform = 'scale(1)';

      if (!keepOpacity) {
        el.style.opacity = instant ? '1' : '';
      }
      el.style.removeProperty('fill');
      el.style.removeProperty('filter');

      if (instant) {
        forceReflow(el);
        el.style.removeProperty('transition');
      }
    }
  }

  /** Ensure all dots are visible */
  #ensureVisibility(): void {
    for (const dot of DOTS_DATA) {
      const el = this.#getDot(dot.id);
      if (el && (el.style.opacity === '0' || el.style.opacity === '')) {
        el.style.transition = 'opacity 200ms ease-out';
        el.style.opacity = '1';
      }
    }
  }

  /** Run wave intro animation */
  #runWaveIntro(onComplete?: () => void): void {
    this.state = 'intro';

    // Prepare dots hidden
    for (const dot of DOTS_DATA) {
      const el = this.#getDot(dot.id);
      if (!el) {
        continue;
      }
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'scale(0)';
      forceReflow(el);
    }

    const innerDotIds = new Set(INNER_DOT_IDS);
    const innerDots = DOTS_DATA.filter((d) => innerDotIds.has(d.id));
    const outerDots = DOTS_DATA.filter((d) => !innerDotIds.has(d.id));

    // WAVE 1: Inner dots appear at half scale
    const orderedInner = sortByAngle(innerDots.map((d) => d.id));
    orderedInner.forEach((dot, index) => {
      const el = this.#getDot(dot.id);
      if (!el) {
        return;
      }

      el.style.fill = 'var(--dot-medium)';
      forceReflow(el);
      el.style.removeProperty('transition');

      const delay = index * 75;
      this.#setTimeout(() => {
        el.style.transition = 'transform 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 400ms ease-out';
        el.style.opacity = '1';
        el.style.transform = 'scale(0.5)';
      }, delay);
    });

    // WAVE 2: Inner to full scale + outer appear
    this.#setTimeout(() => {
      // Inner dots to full scale
      orderedInner.forEach((dot, index) => {
        const el = this.#getDot(dot.id);
        if (!el) {
          return;
        }

        const delay = index * 65;
        this.#setTimeout(() => {
          el.style.transition = 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1), fill 450ms ease-out';
          el.style.transform = 'scale(1)';
          el.style.removeProperty('fill');
        }, delay);
      });

      // Outer dots appear
      const orderedOuter = sortByAngle(outerDots.map((d) => d.id));
      orderedOuter.forEach((dot, index) => {
        const el = this.#getDot(dot.id);
        if (!el) {
          return;
        }

        el.style.removeProperty('transition');
        const delay = 150 + index * 40;
        this.#setTimeout(() => {
          el.style.transition = 'transform 650ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 550ms ease-out';
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
        }, delay);
      });
    }, 650);

    // Completion
    this.#setTimeout(() => {
      onComplete?.();
    }, 1400);
  }

  /** Run particle intro animation */
  #runParticleIntro(onComplete?: () => void): void {
    this.state = 'intro';

    // Prepare dots hidden
    for (const dot of DOTS_DATA) {
      const el = this.#getDot(dot.id);
      if (!el) {
        continue;
      }
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'scale(0)';
      forceReflow(el);
    }

    const innerDotIds = new Set(INNER_DOT_IDS);

    // Create particle animation data
    const particles = DOTS_DATA.map((dot, index) => {
      const finalAngle = getAngle(dot);
      const startDistance = 110 + Math.random() * 80;
      const angleVariation = (Math.random() - 0.5) * Math.PI * 0.35;
      const startAngle = finalAngle + angleVariation;
      const startX = Math.cos(startAngle) * startDistance;
      const startY = Math.sin(startAngle) * startDistance;

      const curvature = Math.random() * 0.4 + 0.3;
      const controlAngle = startAngle + (Math.random() - 0.5) * Math.PI * curvature;
      const controlDistance = startDistance * 0.6;
      const controlX = Math.cos(controlAngle) * controlDistance;
      const controlY = Math.sin(controlAngle) * controlDistance;

      const group = Math.floor(index / 5);
      const groupDelay = group * 110;
      const withinGroupDelay = (index % 5) * 40;
      const delay = groupDelay + withinGroupDelay + Math.random() * 40;
      const duration = 600 + Math.random() * 300;

      return {
        ...dot,
        startX,
        startY,
        controlX,
        controlY,
        delay,
        duration,
        impactTime: delay + duration,
        rotationSpeed: 720 + Math.random() * 360,
        isInner: innerDotIds.has(dot.id)
      };
    });

    particles.sort((a, b) => a.delay - b.delay);

    // First 3 inner dots for shockwaves
    const shockwaveParticles = particles
      .filter((p) => p.isInner)
      .sort((a, b) => a.impactTime - b.impactTime)
      .slice(0, 3);
    const shockwaveSet = new Set(shockwaveParticles.map((p) => p.id));

    // Animate each particle
    for (const particle of particles) {
      const el = this.#getDot(particle.id);
      if (!el) {
        continue;
      }

      el.style.transform = `translate(${particle.startX}px, ${particle.startY}px) scale(0.05)`;

      this.#setTimeout(() => {
        el.style.opacity = '1';

        const steps = 30;
        let step = 0;

        const animateStep = (): void => {
          step++;
          const progress = step / steps;
          const t = progress;
          const mt = 1 - t;

          const x = mt * mt * particle.startX + 2 * mt * t * particle.controlX + t * t * 0;
          const y = mt * mt * particle.startY + 2 * mt * t * particle.controlY + t * t * 0;

          const easeOut = 1 - (1 - progress) ** 4;
          const scale = 0.05 + easeOut * 0.95;
          const rotation = progress * particle.rotationSpeed;

          el.style.transition = 'transform 33ms linear';
          el.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`;

          if (step < steps) {
            requestAnimationFrame(animateStep);
          } else {
            // Impact - clear all transforms
            const bounceDuration = 250;
            el.style.transition = `transform ${bounceDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
            el.style.transform = 'scale(1)';

            if (shockwaveSet.has(particle.id)) {
              this.#triggerShockwave(particle);
            }

            this.#setTimeout(() => {
              el.classList.add('particle-bounce');
              this.#setTimeout(() => {
                el.classList.remove('particle-bounce');
              }, 400);
            }, bounceDuration);
          }
        };

        requestAnimationFrame(animateStep);
      }, particle.delay);
    }

    // Early completion
    const earlyRevealTime = Math.max(...particles.map((p) => p.delay)) * 0.6;
    this.#setTimeout(() => {
      onComplete?.();
    }, earlyRevealTime);

    // Final cleanup
    const maxTime = Math.max(...particles.map((p) => p.impactTime + 500));
    this.#setTimeout(() => {
      this.#resetDotsState(false, true);
    }, maxTime);
  }

  #triggerShockwave(dot: DotData): void {
    const container = this.#getShockwaveContainer();
    if (!container) {
      return;
    }

    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', String(dot.cx));
    ring.setAttribute('cy', String(dot.cy));
    ring.setAttribute('r', '13.45');
    ring.classList.add('shockwave-ring');

    container.appendChild(ring);

    this.#setTimeout(() => {
      ring.remove();
    }, 900);
  }

  #runIntro(onComplete?: () => void): void {
    if (this.intro === 'particle') {
      this.#runParticleIntro(onComplete);
    } else {
      this.#runWaveIntro(onComplete);
    }
  }

  #startLoopAnimation(): void {
    this.#loopStartTime = performance.now();
    this.#ensureVisibility();

    // Inner dots - scale down with transition, then add animation class
    const orderedInnerDots = sortByAngle(INNER_DOT_IDS);
    let seedDelay = 0;

    orderedInnerDots.forEach((dot) => {
      this.#setTimeout(() => {
        const el = this.#getDot(dot.id);
        if (!el) {
          return;
        }

        const targetScale = 0.6;

        el.style.transition = 'all 450ms cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.transform = `scale(${targetScale})`;
        el.style.fill = 'var(--dot-medium)';
        el.style.opacity = '0.7';

        el.style.setProperty('--base-scale', `${targetScale}`);

        const angle = getAngle(dot);
        const normalizedAngle = (angle + Math.PI) / (2 * Math.PI);
        const animationDelayMs = normalizedAngle * LOOP_DURATION;
        el.style.setProperty('--delay', `${animationDelayMs}ms`);

        this.#setTimeout(() => {
          el.classList.add('dot-loading-inner');
        }, 100);
      }, seedDelay);

      seedDelay += 60;
    });

    const orderedOuterDots = sortByAngle(OUTER_DOT_IDS);
    this.#setTimeout(() => {
      orderedOuterDots.forEach((dot) => {
        const el = this.#getDot(dot.id);
        if (!el) {
          return;
        }

        el.style.transition = 'all 350ms ease-out';

        const baseScale = 1.2;
        el.style.setProperty('--base-scale', `${baseScale}`);

        const angle = getAngle(dot);
        const normalizedAngle = (angle + Math.PI) / (2 * Math.PI);
        const animationDelayMs = normalizedAngle * ROTATION_DURATION;
        el.style.setProperty('--delay', `${animationDelayMs}ms`);

        this.#setTimeout(() => {
          el.classList.add('dot-loading');
        }, 50);
      });

      this.state = 'loop';
    }, seedDelay + 100);
  }

  #endLoopAnimation(): void {
    const now = performance.now();
    const elapsed = Math.max(0, now - this.#loopStartTime);

    const timeInCycle = elapsed % LOOP_DURATION;
    const timeLeft = LOOP_DURATION - timeInCycle + 50;

    this.state = 'exit';

    this.#setTimeout(() => {
      const orderedAllDots = sortByAngle(DOTS_DATA.map((d) => d.id));

      orderedAllDots.forEach((dot, i) => {
        const el = this.#getDot(dot.id);
        if (!el) {
          return;
        }

        const delay = i * 18;

        this.#setTimeout(() => {
          el.classList.remove('dot-loading', 'dot-loading-inner');
          el.style.removeProperty('--delay');
          el.style.removeProperty('--base-scale');

          el.classList.add('restoring');
          el.style.transform = 'scale(1)';
          el.style.opacity = '1';
          el.style.removeProperty('fill');

          this.#setTimeout(() => {
            el.classList.remove('restoring');
          }, 500);
        }, delay);
      });

      this.#setTimeout(
        () => {
          this.state = 'idle';
        },
        orderedAllDots.length * 18 + 500
      );
    }, timeLeft);
  }

  handleLoadingChange(next: boolean): void {
    if (!this.#introCompleted) {
      return;
    }

    this.#clearTimers();

    if (next) {
      if (this.state === 'idle' || this.state === 'exit') {
        this.#resetDotsState(true, true);
        this.#startLoopAnimation();
      }
    } else {
      if (this.state === 'loop') {
        this.#endLoopAnimation();
      } else if (this.state !== 'intro' && this.state !== 'exit') {
        this.state = 'idle';
      }
    }
  }

  playIntro(variant?: LogoIntroVariant): void {
    this.#clearTimers();
    this.#resetDotsState(true);

    const originalIntro = this.intro;
    if (variant) {
      this.intro = variant;
    }

    this.#runIntro(() => {
      this.#introCompleted = true;
      if (this.loading) {
        this.#startLoopAnimation();
      } else {
        this.state = 'idle';
      }
    });

    if (variant) {
      this.intro = originalIntro;
    }
  }
}
