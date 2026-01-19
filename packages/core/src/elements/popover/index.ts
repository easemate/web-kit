import { html, type TemplateResult } from 'lit-html';

import { Component } from '~/decorators/Component';
import { Prop } from '~/decorators/Prop';
import { Query } from '~/decorators/Query';

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

const nextAnchorName = (): string => `--ease-popover-anchor-${crypto.randomUUID().slice(0, 8)}`;

@Component({
  tag: 'ease-popover',
  autoSlot: false,
  shadowMode: 'open',
  styles: `
    :host {
      display: contents;
      --ease-popover-offset: 8px;
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
      position: fixed;
      position-anchor: var(--ease-popover-anchor-name);
      margin: 0;
      padding: 0;
      border: none;
      background: transparent;
      overflow: visible;
      width: var(--ease-popover-content-width);
      min-width: var(--ease-popover-content-min-width);
      max-width: var(--ease-popover-content-max-width);
      box-sizing: border-box;
    }

    [part="content"]:popover-open {
      display: block;
    }

    :host([placement="top-start"]) [part="content"] {
      position-area: top span-right;
      margin-bottom: var(--ease-popover-offset);
    }
    :host([placement="top-center"]) [part="content"] {
      position-area: top center;
      margin-bottom: var(--ease-popover-offset);
    }
    :host([placement="top-end"]) [part="content"] {
      position-area: top span-left;
      margin-bottom: var(--ease-popover-offset);
    }
    :host([placement="bottom-start"]) [part="content"] {
      position-area: bottom span-right;
      margin-top: var(--ease-popover-offset);
    }
    :host([placement="bottom-center"]) [part="content"] {
      position-area: bottom center;
      margin-top: var(--ease-popover-offset);
    }
    :host([placement="bottom-end"]) [part="content"] {
      position-area: bottom span-left;
      margin-top: var(--ease-popover-offset);
    }
    :host([placement="left-start"]) [part="content"] {
      position-area: left span-bottom;
      margin-right: var(--ease-popover-offset);
    }
    :host([placement="left-center"]) [part="content"] {
      position-area: left center;
      margin-right: var(--ease-popover-offset);
    }
    :host([placement="left-end"]) [part="content"] {
      position-area: left span-top;
      margin-right: var(--ease-popover-offset);
    }
    :host([placement="right-start"]) [part="content"] {
      position-area: right span-bottom;
      margin-left: var(--ease-popover-offset);
    }
    :host([placement="right-center"]) [part="content"] {
      position-area: right center;
      margin-left: var(--ease-popover-offset);
    }
    :host([placement="right-end"]) [part="content"] {
      position-area: right span-top;
      margin-left: var(--ease-popover-offset);
    }
  `
})
export class Popover extends HTMLElement {
  declare requestRender: () => void;

  #anchorName = nextAnchorName();

  @Query<HTMLElement>('[part="content"]')
  accessor contentElement!: HTMLElement | null;

  @Prop<Placement>({
    reflect: true,
    defaultValue: 'bottom-start'
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

  @Prop<boolean>({
    type: Boolean,
    reflect: true,
    onChange() {
      (this as Popover).handleOpenChange();
    }
  })
  accessor open = false;

  handleOffsetChange(): void {
    const offset = Number.isFinite(this.offset) ? this.offset : 8;
    this.style.setProperty('--ease-popover-offset', `${offset}px`);
  }

  handleOpenChange(): void {
    const content = this.contentElement;
    if (!content) {
      return;
    }

    if (this.open) {
      content.showPopover();
    } else {
      content.hidePopover();
    }
  }

  connectedCallback(): void {
    this.style.setProperty('--ease-popover-anchor-name', this.#anchorName);
    this.handleOffsetChange();
  }

  afterRender(): void {
    const content = this.contentElement;
    if (content && this.open) {
      try {
        content.showPopover();
      } catch (_e) {}
    }
  }

  render(): TemplateResult {
    return html`
      <slot name="trigger"></slot>
      <div part="content" popover="manual" role="region">
        <slot></slot>
      </div>
    `;
  }
}

export default {
  Popover
};
