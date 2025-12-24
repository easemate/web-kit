import { html } from 'lit-html';

import { outputStyles } from './styles';
import { type CSSCode, type CubicBezierPoints, EasingType, type LinearPoints } from './types';
import { generateCubicBezierCSS, generateLinearCSS } from './utils';

import { Component } from '~/decorators/Component';
import { Prop } from '~/decorators/Prop';
import '~/components/code';

@Component({
  tag: 'ease-curve-output',
  styles: outputStyles,
  template(this: CurveOutput) {
    return html`
      <div class="output-container">
        <div class="output-group">
          <h4 class="output-label">CSS Easing Function</h4>
          <ease-code language="css">${this.generatedCSS.code}</ease-code>
          <button class="copy-button" @click=${this.handleCopyClick}>
            ${this.copyStatus}
          </button>
        </div>
      </div>
    `;
  }
})
export class CurveOutput extends HTMLElement {
  declare requestRender: () => void;

  @Prop<EasingType>({ type: String, reflect: true })
  accessor easingType!: EasingType;

  @Prop<CubicBezierPoints | LinearPoints>({ type: Object, reflect: false })
  accessor points!: CubicBezierPoints | LinearPoints;

  @Prop<string>({ reflect: true, defaultValue: 'ease-custom' })
  accessor name!: string;

  @Prop<'animation' | 'transition'>({ reflect: true, defaultValue: 'animation' })
  accessor variant!: 'animation' | 'transition';

  @Prop<number>({ type: Number, reflect: true, defaultValue: 0 })
  accessor simplify!: number;

  @Prop<number>({ type: Number, reflect: true, defaultValue: 5 })
  accessor round!: number;

  #copyTimeout: number | null = null;
  #animationTimeout: number | null = null;
  #isAnimating = false;

  get timingFunction(): string {
    const { timingFunction } = this.generatedCSS;
    return timingFunction;
  }

  get generatedCSS(): CSSCode {
    if (this.easingType === EasingType.CUBIC_BEZIER) {
      if (!this.points || Array.isArray(this.points)) {
        const timingFunction = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
        const code = `
          .${this.name} {
            ${this.variant}-timing-function: ${timingFunction};
          }
        `;

        return { code, timingFunction };
      }

      return generateCubicBezierCSS(this.points as CubicBezierPoints, this.name, this.variant);
    }

    if (this.easingType === EasingType.LINEAR) {
      if (Array.isArray(this.points)) {
        return generateLinearCSS(this.points, this.name, this.variant, {
          simplify: this.simplify,
          round: this.round
        });
      }

      const timingFunction = 'linear(0, 1)';
      const code = `
        .${this.name} {
          ${this.variant}-timing-function: ${timingFunction};
        }
      `;

      return { code, timingFunction };
    }

    const timingFunction = 'ease';
    const code = `
      .${this.name} {
        ${this.variant}-timing-function: ${timingFunction};
      }
    `;

    return { code, timingFunction };
  }

  get copyStatus(): string {
    return this.#copyTimeout ? 'Copied!' : 'Copy CSS';
  }

  get isAnimating(): boolean {
    return this.#isAnimating;
  }

  #copyToClipboard = async (event: Event): Promise<void> => {
    event.preventDefault();

    try {
      await navigator.clipboard.writeText(this.timingFunction);

      if (this.#copyTimeout) {
        clearTimeout(this.#copyTimeout);
      }

      this.#copyTimeout = window.setTimeout(() => {
        this.#copyTimeout = null;
        this.requestRender();
      }, 2000);

      this.requestRender();
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  #playPreview = (event: Event): void => {
    event.preventDefault();

    if (this.#isAnimating) {
      this.#isAnimating = false;
      this.requestRender();
      void this.offsetHeight;
    }

    if (this.#animationTimeout) {
      clearTimeout(this.#animationTimeout);
    }

    this.#isAnimating = true;
    this.requestRender();

    this.#animationTimeout = window.setTimeout(() => {
      this.#isAnimating = false;

      this.requestRender();
    }, 2000);
  };

  readonly handleCopyClick = (event: Event): void => {
    void this.#copyToClipboard(event);
  };

  handlePreviewClick(event: Event): void {
    this.#playPreview(event);
  }

  disconnectedCallback(): void {
    if (this.#copyTimeout) {
      clearTimeout(this.#copyTimeout);

      this.#copyTimeout = null;
    }

    if (this.#animationTimeout) {
      clearTimeout(this.#animationTimeout);

      this.#animationTimeout = null;
    }
  }
}
