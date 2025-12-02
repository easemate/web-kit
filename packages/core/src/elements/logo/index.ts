import { Component } from '@/Component';
import { Prop } from '@/Prop';

import { html } from 'lit-html';

type LogoLoaderState = 'idle' | 'enter' | 'loop' | 'exit';

@Component({
  tag: 'ease-logo-loader',
  styles: `
    :host {
      display: inline-block;
    }

    .logo-loader {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--logo-loader-size, 36px);
      height: var(--logo-loader-size, 36px);
      --ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);
      --ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);
      --color-primary: #454356;
      --color-secondary: #69677e;
      --color-node: #ffffff;
      --color-accent: #24d69d;
    }

    .logo-loader__svg {
      width: 100%;
      height: 100%;
      display: block;
      transform-origin: center;
      transition: transform 420ms var(--ease-out), filter 420ms var(--ease-out);
    }

    .logo-loader[data-state='idle'] .logo-loader__svg {
      transform: scale(1);
      filter: none;
    }

    .logo-loader[data-state='enter'] .logo-loader__svg,
    .logo-loader[data-state='loop'] .logo-loader__svg {
      transform: scale(1.02);
      filter: drop-shadow(0 0 10px rgba(36, 214, 157, 0.28));
    }

    .logo-loader[data-state='exit'] .logo-loader__svg {
      transform: scale(0.98);
      filter: none;
    }

    .logo-loader__ring--primary rect,
    .logo-loader__ring--secondary rect,
    .logo-loader__nodes rect {
      transform-origin: center;
      transition: transform 260ms var(--ease-out), opacity 260ms var(--ease-out);
    }

    .logo-loader__ring--primary rect {
      fill: var(--color-primary);
    }

    .logo-loader__ring--secondary rect {
      fill: var(--color-secondary);
    }

    .logo-loader__nodes rect {
      fill: var(--color-node);
    }

    .logo-loader[data-state='loop'] .logo-loader__ring--primary rect {
      animation: logo-loader-dot-primary 960ms var(--ease-in-out) infinite;
    }

    .logo-loader[data-state='loop'] .logo-loader__ring--secondary rect {
      animation: logo-loader-dot-secondary 1280ms var(--ease-in-out) infinite;
    }

    .logo-loader[data-state='loop'] .logo-loader__nodes rect {
      animation: logo-loader-node 1600ms var(--ease-in-out) infinite;
    }

    .logo-loader[data-state='loop'] .logo-loader__ring--primary rect:nth-child(4n + 1),
    .logo-loader[data-state='loop'] .logo-loader__ring--secondary rect:nth-child(4n + 1),
    .logo-loader[data-state='loop'] .logo-loader__nodes rect:nth-child(4n + 1) {
      animation-delay: 0ms;
    }

    .logo-loader[data-state='loop'] .logo-loader__ring--primary rect:nth-child(4n + 2),
    .logo-loader[data-state='loop'] .logo-loader__ring--secondary rect:nth-child(4n + 2),
    .logo-loader[data-state='loop'] .logo-loader__nodes rect:nth-child(4n + 2) {
      animation-delay: 120ms;
    }

    .logo-loader[data-state='loop'] .logo-loader__ring--primary rect:nth-child(4n + 3),
    .logo-loader[data-state='loop'] .logo-loader__ring--secondary rect:nth-child(4n + 3),
    .logo-loader[data-state='loop'] .logo-loader__nodes rect:nth-child(4n + 3) {
      animation-delay: 240ms;
    }

    .logo-loader[data-state='loop'] .logo-loader__ring--primary rect:nth-child(4n + 4),
    .logo-loader[data-state='loop'] .logo-loader__ring--secondary rect:nth-child(4n + 4),
    .logo-loader[data-state='loop'] .logo-loader__nodes rect:nth-child(4n + 4) {
      animation-delay: 360ms;
    }

    .logo-loader[data-state='exit'] .logo-loader__ring--primary rect,
    .logo-loader[data-state='exit'] .logo-loader__ring--secondary rect {
      animation: logo-loader-dot-exit 260ms var(--ease-out) forwards;
    }

    .logo-loader[data-state='exit'] .logo-loader__nodes rect {
      animation: logo-loader-node-exit 260ms var(--ease-out) forwards;
    }

    @keyframes logo-loader-dot-primary {
      0% {
        transform: scale(1);
        opacity: 0.7;
        fill: var(--color-primary);
      }
      45% {
        transform: scale(1.4);
        opacity: 1;
        fill: var(--color-accent);
      }
      100% {
        transform: scale(1);
        opacity: 0.7;
        fill: var(--color-primary);
      }
    }

    @keyframes logo-loader-dot-secondary {
      0% {
        transform: scale(1);
        opacity: 0.6;
      }
      50% {
        transform: scale(1.25);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 0.6;
      }
    }

    @keyframes logo-loader-node {
      0% {
        transform: scale(1);
      }
      30% {
        transform: scale(1.08);
      }
      60% {
        transform: scale(0.96);
      }
      100% {
        transform: scale(1);
      }
    }

    @keyframes logo-loader-dot-exit {
      0% {
        transform: scale(1.08);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes logo-loader-node-exit {
      0% {
        transform: scale(1.04);
      }
      100% {
        transform: scale(1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .logo-loader__svg {
        transition: none;
        transform: scale(1);
        filter: none;
      }
      .logo-loader__ring--primary rect,
      .logo-loader__ring--secondary rect,
      .logo-loader__nodes rect {
        animation: none !important;
        transition: none;
        transform: scale(1);
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
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="logo-loader__svg"
          role=${ariaLabelTrimmed ? 'img' : null}
          aria-label=${ariaLabelTrimmed || null}
          aria-hidden=${ariaLabelTrimmed ? null : 'true'}
          focusable=${ariaLabelTrimmed ? null : 'false'}
        >
          <g class="logo-loader__ring logo-loader__ring--primary">
            <rect width="1.09091" height="1.09091" rx="0.545457" transform="matrix(1 0 0 -1 1.09033 2.18115)" />
            <rect x="8.18164" y="8.18213" width="3.27274" height="3.27274" rx="1.63637" />
            <rect x="8.18164" y="24.5454" width="3.27274" height="3.27274" rx="1.63637" />
            <rect x="16.3628" width="3.27274" height="3.27274" rx="1.63637" />
            <rect x="16.3628" y="32.7275" width="3.27274" height="3.27274" rx="1.63637" />
            <rect x="25.0903" y="0.54541" width="2.18183" height="2.18183" rx="1.09091" />
            <rect x="24.5454" y="16.3633" width="3.27274" height="3.27274" rx="1.63637" />
            <rect x="32.7271" y="16.3633" width="3.27274" height="3.27274" rx="1.63637" />
          </g>
          <g class="logo-loader__ring logo-loader__ring--secondary">
            <rect width="1.09091" height="1.09091" rx="0.545457" transform="matrix(1 0 0 -1 1.09033 34.9097)" />
            <rect width="1.09091" height="1.09091" rx="0.545457" transform="matrix(1 0 0 -1 33.8179 2.18115)" />
            <rect width="1.09091" height="1.09091" rx="0.545457" transform="matrix(1 0 0 -1 33.8179 34.9097)" />
            <rect x="0.54541" y="8.72705" width="2.18183" height="2.18183" rx="1.09091" />
            <rect y="16.3633" width="3.27274" height="3.27274" rx="1.63637" />
            <rect x="0.54541" y="25.0903" width="2.18183" height="2.18183" rx="1.09091" />
            <rect x="8.72754" y="0.54541" width="2.18183" height="2.18183" rx="1.09091" />
            <rect x="8.72754" y="33.2729" width="2.18183" height="2.18183" rx="1.09091" />
            <rect x="25.0903" y="33.2729" width="2.18183" height="2.18183" rx="1.09091" />
            <rect x="33.2729" y="8.72705" width="2.18183" height="2.18183" rx="1.09091" />
            <rect x="33.2729" y="25.0903" width="2.18183" height="2.18183" rx="1.09091" />
          </g>
          <g class="logo-loader__nodes">
            <rect x="6.54492" y="14.7275" width="6.54549" height="6.54549" rx="3.27274" />
            <rect x="14.7266" y="6.54492" width="6.54549" height="6.54549" rx="3.27274" />
            <rect x="14.7266" y="14.7275" width="6.54549" height="6.54549" rx="3.27274" />
            <rect x="14.7266" y="22.9092" width="6.54549" height="6.54549" rx="3.27274" />
            <rect x="22.9087" y="6.54492" width="6.54549" height="6.54549" rx="3.27274" />
            <rect x="22.9087" y="22.9092" width="6.54549" height="6.54549" rx="3.27274" />
          </g>
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

  #state: LogoLoaderState = 'idle';
  #enterTimeoutId: number | null = null;
  #exitTimeoutId: number | null = null;

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
    if (this.loading) {
      this.handleLoadingChange(true);
    } else {
      this.state = 'idle';
    }
  }

  disconnectedCallback(): void {
    this.#clearTimers();
  }

  #clearTimers(): void {
    if (this.#enterTimeoutId !== null) {
      window.clearTimeout(this.#enterTimeoutId);
      this.#enterTimeoutId = null;
    }
    if (this.#exitTimeoutId !== null) {
      window.clearTimeout(this.#exitTimeoutId);
      this.#exitTimeoutId = null;
    }
  }

  handleLoadingChange(next: boolean): void {
    this.#clearTimers();

    if (next) {
      if (this.state === 'idle' || this.state === 'exit') {
        this.state = 'enter';
        this.#enterTimeoutId = window.setTimeout(() => {
          if (this.loading) {
            this.state = 'loop';
          }
        }, 420);
      }
    } else {
      if (this.state === 'loop' || this.state === 'enter') {
        this.state = 'exit';
        this.#exitTimeoutId = window.setTimeout(() => {
          if (!this.loading) {
            this.state = 'idle';
          }
        }, 320);
      } else {
        this.state = 'idle';
      }
    }
  }
}
