import { Component } from '@/Component';
import { OutsideClick, requestOutsideClickUpdate } from '@/OutsideClick';
import { Prop } from '@/Prop';
import { Query } from '@/Query';

import type { Placement } from '../popover';

import { html, type TemplateResult } from 'lit-html';

@Component({
  tag: 'ease-tooltip',
  shadowMode: 'open',
  styles: `
    :host {
      display: inline-block;
      position: relative;
    }

    ease-popover::part(content) {
      inset: auto;
    }

    [data-tooltip-content] {
      background-color: #333;
      color: #fff;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 0.875rem;
      max-width: 250px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      display: none;
    }

    :host([open]) [data-tooltip-content] {
      display: block;
    }
  `
})
export class Tooltip extends HTMLElement {
  #hoverTimer: number | null = null;

  #trigger: HTMLElement | null = null;
  #content: HTMLElement | null = null;

  declare requestRender: () => void;

  @Prop<boolean>({
    type: Boolean,
    reflect: true,
    onChange(next, previous) {
      (this as Tooltip)._handleOpenChange(next, previous);
    }
  })
  accessor open = false;

  @Prop<number>({ type: Number, reflect: true, defaultValue: 300 })
  accessor delay = 300;

  @Prop<Placement>({ reflect: true, defaultValue: 'top-center' })
  accessor placement: Placement = 'top-center';

  @Query<HTMLElement>('[slot="trigger"]')
  accessor triggerElement!: HTMLElement | null;

  @Query<HTMLElement>('[data-tooltip-content]')
  accessor contentElement!: HTMLElement | null;

  disconnectedCallback(): void {
    this.#clearTimer();
    if (this.#trigger) {
      this.#trigger.removeEventListener('mouseenter', this.#handleEnter);
      this.#trigger.removeEventListener('mouseleave', this.#handleLeave);
      this.#trigger.removeEventListener('focusin', this.#handleFocusIn);
      this.#trigger.removeEventListener('focusout', this.#handleFocusOut);
      this.#trigger = null;
    }

    if (this.#content) {
      this.#content.removeEventListener('mouseenter', this.#handleEnter);
      this.#content.removeEventListener('mouseleave', this.#handleLeave);
      this.#content = null;
    }
  }

  afterRender(): void {
    this.#updateListeners();
    const content = this.contentElement;
    const isVisible = this.open;

    if (content) {
      content.setAttribute('role', 'tooltip');
      content.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
      content.dataset.open = isVisible ? 'true' : 'false';
      content.hidden = !isVisible;
    }
  }

  render(): TemplateResult {
    return html`
      <ease-popover .placement=${this.placement}>
        <slot name="trigger" slot="trigger"></slot>
        <div
          data-tooltip-content
          role="tooltip"
          data-open=${this.open ? 'true' : 'false'}
          ?hidden=${!this.open}
        >
          <slot></slot>
        </div>
      </ease-popover>
    `;
  }

  _handleOpenChange(next: boolean, previous: boolean): void {
    if (next === previous) {
      return;
    }

    if (!next) {
      this.#clearTimer();
    }

    requestOutsideClickUpdate(this);
  }

  @OutsideClick<Tooltip>({
    content: (host) => host.contentElement,
    triggers: (host) => [host.triggerElement],
    disabled: (host) => !host.open
  })
  handleOutsideDismiss(): void {
    if (!this.open) {
      return;
    }

    this.#clearTimer();
    this.open = false;
  }

  #clearTimer(): void {
    if (this.#hoverTimer !== null) {
      window.clearTimeout(this.#hoverTimer);
      this.#hoverTimer = null;
    }
  }

  #startTimer(callback: () => void): void {
    this.#clearTimer();
    const wait = this.delay ?? 0;

    if (wait > 0) {
      this.#hoverTimer = window.setTimeout(callback, wait);
    } else {
      callback();
    }
  }

  #handleEnter = (): void => {
    this.#startTimer(() => {
      this.open = true;
    });
  };

  #handleLeave = (): void => {
    this.#clearTimer();
    this.open = false;
  };

  #handleFocusIn = (): void => {
    this.#clearTimer();
    this.open = true;
  };

  #handleFocusOut = (): void => {
    this.#clearTimer();
    this.open = false;
  };

  #updateListeners(): void {
    const trigger = this.triggerElement;
    const content = this.contentElement ?? null;

    if (trigger !== this.#trigger) {
      if (this.#trigger) {
        this.#trigger.removeEventListener('mouseenter', this.#handleEnter);
        this.#trigger.removeEventListener('mouseleave', this.#handleLeave);
        this.#trigger.removeEventListener('focusin', this.#handleFocusIn);
        this.#trigger.removeEventListener('focusout', this.#handleFocusOut);
      }
      if (trigger) {
        trigger.addEventListener('mouseenter', this.#handleEnter);
        trigger.addEventListener('mouseleave', this.#handleLeave);
        trigger.addEventListener('focusin', this.#handleFocusIn);
        trigger.addEventListener('focusout', this.#handleFocusOut);
      }
      this.#trigger = trigger;
    }

    if (content !== this.#content) {
      if (this.#content) {
        this.#content.removeEventListener('mouseenter', this.#handleEnter);
        this.#content.removeEventListener('mouseleave', this.#handleLeave);
      }
      if (content) {
        content.addEventListener('mouseenter', this.#handleEnter);
        content.addEventListener('mouseleave', this.#handleLeave);
      }
      this.#content = content ?? null;
    }
  }
}
