import { Component } from '@/Component';
import { Prop } from '@/Prop';

import { html, type TemplateResult } from 'lit-html';

export type Placement =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'
  | 'left-start'
  | 'left-center'
  | 'left-end'
  | 'right-start'
  | 'right-center'
  | 'right-end';

const nextAnchorName = (): string => `--ease-popover-anchor-${crypto.randomUUID()}`;

@Component({
  tag: 'ease-popover',
  autoSlot: false,
  shadowMode: 'open',
  styles: `
    :host {
      display: contents;
      --ease-popover-offset: 8px;
      --ease-popover-anchor-name: --ease-popover-anchor;
      --ease-popover-transform-origin: center center;
      --ease-popover-duration: 200ms;
      --ease-popover-content-min-width: auto;
      --ease-popover-content-max-width: none;
      --ease-popover-content-width: max-content;
    }

    ::slotted([slot="trigger"]) {
      anchor-name: var(--ease-popover-anchor-name);
    }

    [part="content"] {
      position-anchor: var(--ease-popover-anchor-name);
      position: fixed;
      margin: 0;
      transform-origin: var(--ease-popover-transform-origin);
      width: var(--ease-popover-content-width);
      min-width: var(--ease-popover-content-min-width);
      max-width: var(--ease-popover-content-max-width);
      box-sizing: border-box;
      overscroll-behavior: contain;
      z-index: 100;
      display: none;
    }

    :host([open]) [part="content"] {
      display: block;
    }

    :host([placement="top-start"]) [part="content"] {
      position-area: top right;
      top: anchor(bottom);
      left: anchor(left);
      translate: 0 calc(var(--ease-popover-offset) * -1);
    }

    :host([placement="top-center"]) [part="content"] {
      position-area: top center;
      top: anchor(top);
      left: anchor(center);
      translate: 0 calc(var(--ease-popover-offset) * -1);
    }

    :host([placement="top-end"]) [part="content"] {
      position-area: top right;
      top: anchor(bottom);
      right: anchor(right);
      translate: 0 calc(var(--ease-popover-offset) * -1);
    }

    :host([placement="bottom-start"]) [part="content"] {
      position-area: bottom right;
      top: anchor(bottom);
      left: anchor(left);
      translate: 0 var(--ease-popover-offset);
    }

    :host([placement="bottom-center"]) [part="content"] {
      position-area: bottom center;
      top: anchor(bottom);
      left: anchor(left);
      translate: 0 var(--ease-popover-offset);
    }

    :host([placement="bottom-end"]) [part="content"] {
      position-area: bottom left;
      top: anchor(bottom);
      right: anchor(right);
      translate: 0 var(--ease-popover-offset);
    }

    :host([placement="left-start"]) [part="content"] {
      position-area: left bottom;
      top: anchor(top);
      left: anchor(left);
      translate: calc(var(--ease-popover-offset) * -1) 0;
    }

    :host([placement="left-center"]) [part="content"] {
      position-area: left center;
      top: anchor(top);
      left: anchor(left);
      translate: calc(var(--ease-popover-offset) * -1) 0;
    }

    :host([placement="left-end"]) [part="content"] {
      position-area: left top;
      top: anchor(top);
      left: anchor(left);
      translate: calc(var(--ease-popover-offset) * -1) 0;
    }

    :host([placement="right-start"]) [part="content"] {
      position-area: right end;
      top: anchor(top);
      left: anchor(right);
      translate: var(--ease-popover-offset) 0;
    }

    :host([placement="right-center"]) [part="content"] {
      position-area: right center;
      top: anchor(top);
      left: anchor(right);
      translate: var(--ease-popover-offset) 0;
    }

    :host([placement="right-end"]) [part="content"] {
      position-area: right start;
      top: anchor(top);
      left: anchor(right);
      translate: var(--ease-popover-offset) 0;
    }
  `
})
export class Popover extends HTMLElement {
  #anchorName = nextAnchorName();
  #contentElement: HTMLElement | null = null;
  #initialized = false;

  declare requestRender: () => void;

  public get contentElement(): HTMLElement | null {
    return this.#contentElement;
  }

  @Prop<Placement>({
    reflect: true,
    defaultValue: 'bottom-start',
    onChange() {
      (this as Popover).handlePlacementChange();
    }
  })
  accessor placement!: Placement;

  @Prop<number>({
    type: Number,
    reflect: true,
    defaultValue: 8,
    onChange() {
      (this as Popover).handleOffsetChange();
    }
  })
  accessor offset = 8;

  @Prop<boolean>({ type: Boolean, reflect: true })
  accessor open = false;

  connectedCallback(): void {
    this.#syncAnchorName();
    this.#syncOffset();
  }

  disconnectedCallback(): void {
    this.#contentElement = null;
    this.#initialized = false;
  }

  render(): TemplateResult {
    return html`
      <slot slot="trigger" name="trigger"></slot>
      <div
        part="content"
        data-popover-content
        role="region"
        data-placement=${this.placement}
      >
        <slot></slot>
      </div>
    `;
  }

  handlePlacementChange(): void {
    if (!this.#initialized) {
      this.requestRender();
      return;
    }
    this.#syncPlacement();
  }

  handleOffsetChange(): void {
    if (!this.#initialized) {
      this.requestRender();
      return;
    }
    this.#syncOffset();
  }

  #syncPlacement(): void {
    this.dataset.placement = this.placement;

    if (this.#contentElement) {
      this.#contentElement.dataset.placement = this.placement;
    }
  }

  #syncOffset(): void {
    const offset = Number.isFinite(this.offset) ? this.offset : 0;
    this.style.setProperty('--ease-popover-offset', `${offset}px`);
  }

  #syncAnchorName(): void {
    this.style.setProperty('--ease-popover-anchor-name', this.#anchorName);
  }
}

export default {
  Popover
};
