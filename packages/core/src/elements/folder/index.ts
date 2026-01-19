import { html, type TemplateResult } from 'lit-html';

import { Component } from '~/decorators/Component';
import { Prop } from '~/decorators/Prop';

/**
 * Event detail for folder toggle events
 */
export interface FolderToggleEventDetail {
  /** Whether the folder is open */
  open: boolean;
  /** The original event */
  event: Event;
}

/**
 * Folder component - collapsible container for grouping controls.
 *
 * Click on the header to toggle open/closed state.
 * Supports optional max-height with scroll fade masks.
 *
 * @tag ease-folder
 *
 * @slot headline - Folder title text
 * @slot actions - Header action buttons (displayed on the right)
 * @slot - Default slot for folder content
 *
 * @csspart section - Outer container
 * @csspart header - Clickable header row
 * @csspart headline - Title element
 * @csspart icon - Folder icon
 * @csspart chevron - Chevron icon
 * @csspart actions - Actions container
 * @csspart content - Content wrapper (handles height animations)
 * @csspart body - Inner body container (scrollable when max-height is set)
 * @csspart items - Grid container for slotted content
 *
 * @fires folder-toggle - Fired when the folder is opened or closed
 */
@Component({
  tag: 'ease-folder',
  shadowMode: 'open',
  styles: `
    @property --top-fade {
      syntax: "<length>";
      inherits: false;
      initial-value: 0px;
    }

    @property --bottom-fade {
      syntax: "<length>";
      inherits: false;
      initial-value: 0px;
    }

    @keyframes scroll-fade {
      0% {
        --top-fade: 0px;
      }
      10%, 100% {
        --top-fade: 8px;
      }
      0%, 90% {
        --bottom-fade: 8px;
      }
      100% {
        --bottom-fade: 0px;
      }
    }


    :host {
      display: block;
      width: 100%;
    }

    [part="section"] {
      display: block;
      width: 100%;
      border-radius: var(--ease-folder-radius);
      border: 1px solid var(--ease-folder-border-color);
      background-color: var(--ease-folder-background);
      background-clip: padding-box;
      box-sizing: border-box;
      overflow: hidden;
    }

    [part="header"] {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: var(--ease-folder-padding);
      box-sizing: border-box;
      cursor: pointer;
      user-select: none;
    }

    [part="icon"] {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ease-folder-icon-color);
    }

    [part="headline"] {
      flex: 1 1 auto;
      font-size: var(--ease-folder-title-font-size);
      font-weight: var(--ease-folder-title-font-weight);
      line-height: 16px;
      font-family: var(--ease-font-family);
      color: var(--ease-folder-title-color);
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    [part="chevron"] {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ease-folder-chevron-color);
      transition: color 200ms cubic-bezier(.25, 0, .5, 1);
    }

    [part="header"]:hover [part="chevron"] {
      color: var(--ease-folder-chevron-color-hover);
    }

    [part="content"] {
      height: 0;
      overflow: hidden;
      transition: height 200ms cubic-bezier(.25, 0, .5, 1);
    }

    :host([open]) [part="content"] {
      height: auto;
    }

    [part="body"] {
      display: grid;
      grid-gap: var(--ease-folder-gap);
      padding: var(--ease-folder-padding);
      overflow-y: auto;
      overscroll-behavior: contain;
      mask-image: linear-gradient(to bottom, #0000, #ffff var(--top-fade) calc(100% - var(--bottom-fade)), #0000);
      animation-name: scroll-fade;
      animation-timeline: scroll(self y);
      scroll-snap-type: y mandatory;
      scrollbar-width: none;

       &::-webkit-scrollbar {
        display: none;
      }
    }

  `
})
export class Folder extends HTMLElement {
  @Prop<boolean>({
    type: Boolean,
    reflect: true,
    attribute: 'open',
    defaultValue: false
  })
  accessor open: boolean = false;

  @Prop<string | null>({
    reflect: true,
    attribute: 'headline',
    defaultValue: ''
  })
  accessor headline: string | null = null;

  @Prop<string | null>({
    reflect: true,
    attribute: 'max-height',
    defaultValue: null
  })
  accessor maxHeight: string | null = null;

  render(): TemplateResult {
    return html`
      <section part="section">
        <div part="header" @click=${this.#handleHeaderClick}>
          <span part="icon">
            <ease-icon-folder state=${this.open ? 'open' : 'close'}></ease-icon-folder>
          </span>
          <span part="headline">
            ${this.headline}
          </span>
          <span part="chevron">
            <ease-icon-chevron state=${this.open ? 'up' : 'down'}></ease-icon-chevron>
          </span>
        </div>
        <div part="content" style=${this.maxHeight ? `max-height: ${this.maxHeight}` : ''}>
          <div part="body">
            <slot></slot>
          </div>
        </div>
      </section>
    `;
  }

  toggle(): void {
    this.open = !this.open;
  }

  #handleHeaderClick = (event: MouseEvent): void => {
    this.toggle();

    this.dispatchEvent(
      new CustomEvent<FolderToggleEventDetail>('folder-toggle', {
        detail: { open: this.open, event },
        bubbles: true,
        composed: true
      })
    );
  };

  #stopPropagation = (event: MouseEvent): void => {
    event.stopPropagation();
  };
}
