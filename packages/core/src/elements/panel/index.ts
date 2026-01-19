import { html, nothing, type TemplateResult } from 'lit-html';

import { setBooleanAttribute } from '../shared';

import { Component } from '~/decorators/Component';
import { Listen } from '~/decorators/Listen';
import { Prop } from '~/decorators/Prop';
import { Query } from '~/decorators/Query';

/**
 * Event detail for tab change events
 */
export interface TabChangeEventDetail {
  /** The index of the active tab */
  index: number;
  /** The tab id */
  id: string;
  /** The original event */
  event: Event;
}

/**
 * Panel component - visual container with optional tabs and header actions.
 *
 * Use this component when you want the panel UI without state management,
 * or wrap it around `<ease-state>` for full functionality.
 *
 * @tag ease-panel
 *
 * @slot headline - Panel title text (hidden when tabs are present)
 * @slot actions - Header action buttons, links, or dropdowns
 * @slot - Default slot for main content
 * @slot tab-{id} - Tab panel content (use `data-tab-label` for display name)
 * @slot footer - Footer content below all panels
 *
 * @csspart section - Outer container
 * @csspart header - Header row containing headline/tabs and actions
 * @csspart headline - Title element
 * @csspart tabs - Tab button container
 * @csspart tab - Individual tab button
 * @csspart actions - Actions container
 * @csspart content - Content wrapper (handles height animations)
 * @csspart body - Inner body container
 * @csspart items - Grid container for slotted content
 * @csspart tab-panel - Individual tab panel
 * @csspart footer - Footer container
 *
 * @fires tab-change - Fired when the active tab changes
 */
@Component({
  tag: 'ease-panel',
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

    [part="section"] {
      display: block;
      width: 100%;
      max-width: var(--ease-panel-max-width);
      border-radius: var(--ease-panel-radius);
      border: 1px solid var(--ease-panel-border-color);
      background-clip: padding-box;
      background-color: var(--ease-panel-background);
      box-shadow: var(--ease-panel-shadow);
      box-sizing: border-box;
      padding: var(--ease-panel-padding);
      margin: auto;
    }

    [part="header"] {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      margin-bottom: var(--ease-panel-header-spacing);
    }

    [part="header"]:not(:has([part="headline"] slot[name="headline"]::slotted(*))):not(:has([part="tabs"]:not(:empty))):not(:has([part="actions"] slot[name="actions"]::slotted(*))) {
      display: none;
      margin-bottom: 0;
    }

    [part="headline"] {
      font-size: var(--ease-panel-title-font-size);
      font-weight: var(--ease-panel-title-font-weight);
      line-height: 24px;
      font-family: var(--ease-font-family);
      color: var(--ease-panel-title-color);
      margin: 0 0 0 4px;
      flex-grow: 1;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    [part="headline"]:has(+ [part="tabs"]:not(:empty)) {
      display: none;
    }

    [part="tabs"] {
      display: flex;
      align-items: center;
      gap: 2px;
      flex-grow: 1;
      margin: 0 0 0 4px;
    }

    [part="tabs"]:empty {
      display: none;
    }

    [part="tab"] {
      appearance: none;
      font-size: var(--ease-panel-tab-font-size);
      font-weight: var(--ease-panel-tab-font-weight);
      line-height: 24px;
      font-family: var(--ease-font-family);
      color: var(--ease-panel-tab-color);
      background-color: transparent;
      border: none;
      padding: 4px 8px;
      margin: 0;
      cursor: pointer;
      border-radius: var(--ease-panel-tab-radius);
      transition: color 200ms, background-color 200ms;
      transition-timing-function: cubic-bezier(.25, 0, .5, 1);
    }

    [part="tab"]:hover {
      color: var(--ease-panel-tab-color-hover);
    }

    [part="tab"][aria-selected="true"] {
      color: var(--ease-panel-tab-color-active);
      background-color: var(--ease-panel-tab-background-active);
    }

    [part="actions"] {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: auto;
    }

    slot[name="actions"]::slotted(button),
    slot[name="actions"]::slotted(a) {
      --ease-icon-size: var(--ease-panel-action-icon-size);

      appearance: none;
      flex: 0 0 24px;
      border: none;
      outline: none;
      background-color: transparent;
      padding: 4px;
      margin: 0;
      cursor: pointer;
      color: var(--color-gray-600);
      transition: color 200ms;
      transition-timing-function: cubic-bezier(.25, 0, .5, 1);
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    slot[name="actions"]::slotted(button:hover),
    slot[name="actions"]::slotted(button:focus-visible),
    slot[name="actions"]::slotted(a:hover),
    slot[name="actions"]::slotted(a:focus-visible) {
      color: var(--color-blue-100);
    }

    slot[name="actions"]::slotted(ease-dropdown) {
      flex: 0 0 auto;
      width: auto;

      --ease-icon-size: var(--ease-panel-action-icon-size, 16px);
      --ease-dropdown-trigger-padding: 4px;
      --ease-dropdown-radius: 6px;
      --ease-dropdown-background: transparent;
      --ease-dropdown-background-hover: transparent;
      --ease-dropdown-shadow: none;
      --ease-dropdown-color: var(--color-gray-600);
      --ease-popover-placement: bottom-end;
    }

    slot[name="actions"]::slotted(ease-dropdown:hover),
    slot[name="actions"]::slotted(ease-dropdown:focus-within) {
      --ease-dropdown-color: var(--color-blue-100);
    }

    [part="content"] {
      display: block;
      width: 100%;
      box-sizing: border-box;
      margin: auto;
      overflow: hidden;
    }

    [part="content"][data-animating="true"] {
      transition: height 200ms cubic-bezier(.25, 0, .5, 1);
    }

    [part="body"] {
      width: 100%;
      position: relative;
      overflow-y: auto;
      mask-image: linear-gradient(to bottom, #0000, #ffff var(--top-fade) calc(100% - var(--bottom-fade)), #0000);
      animation-name: scroll-fade;
      animation-timeline: scroll(self y);
      scroll-snap-type: y mandatory;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    @keyframes scroll-fade {
      0% {
        --top-fade: 0px;
      }
      10%, 100% {
        --top-fade: var(--ease-panel-fade-size);
      }
      0%, 90% {
        --bottom-fade: var(--ease-panel-fade-size);
      }
      100% {
        --bottom-fade: 0px;
      }
    }

    [part="tab-panel"] {
      width: 100%;
      pointer-events: none;
      display: none;
    }

    [part="tab-panel"][data-state="active"] {
      display: block;
      pointer-events: auto;
    }

    [part="tab-panel"][data-state="hidden"] {
      display: none;
      pointer-events: none;
    }

    [part="footer"] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--ease-panel-footer-padding);
      box-sizing: border-box;
      border-top: 1px solid var(--color-white-4);

      &:not(:has([data-has-content="true"])) {
        display: none;
      }
    }

    [part="items"] {
      display: grid;
      grid-gap: var(--ease-panel-gap);
      box-sizing: border-box;
      width: 100%;
    }
  `
})
export class Panel extends HTMLElement {
  declare requestRender: () => void;

  #tabs: { id: string; label: string }[] = [];
  #isAnimating = false;

  @Prop<number>({
    type: Number,
    reflect: true,
    attribute: 'active-tab',
    defaultValue: 0,
    onChange(next, previous) {
      const self = this as Panel;
      if (next !== previous && previous !== undefined) {
        self.handleActiveTabChange(previous, next);
      }
    }
  })
  accessor activeTab: number = 0;

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

  /** @internal */
  handleActiveTabChange(previous: number, next: number): void {
    this.performTabAnimation(previous, next);
  }

  @Query<HTMLElement>('[part="content"]')
  accessor contentElement!: HTMLElement | null;

  @Query<HTMLElement>('[part="body"]')
  accessor bodyElement!: HTMLElement | null;

  /**
   * Get the tab configuration
   */
  get tabs(): ReadonlyArray<{ id: string; label: string }> {
    return this.#tabs;
  }

  /**
   * Switch to a specific tab by index
   * @param index - The tab index (0-based)
   */
  setTab(index: number): void {
    if (index >= 0 && index < this.#tabs.length && index !== this.activeTab) {
      this.activeTab = index;
    }
  }

  connectedCallback(): void {
    this.#syncTabs();
  }

  afterRender(): void {
    this.#syncTabs();
  }

  render(): TemplateResult {
    const hasTabs = this.#tabs.length > 0;

    return html`
      <section part="section">
        <div part="header">
          <h3 part="headline">${this.headline}</h3>
          ${this.#renderTabs()}
          <div part="actions">
            <slot name="actions"></slot>
          </div>
        </div>
        <div part="content">
          <div part="body" style=${this.maxHeight ? `max-height: ${this.maxHeight};` : ''}>
            ${hasTabs ? this.#renderTabPanels() : html`<div part="items"><slot></slot></div>`}
          </div>
        </div>
        <div part="footer">
          <slot name="footer"></slot>
        </div>
      </section>
    `;
  }

  #renderTabs(): TemplateResult | typeof nothing {
    if (this.#tabs.length === 0) {
      return nothing;
    }

    return html`
      <div part="tabs" role="tablist">
        ${this.#tabs.map(
          (tab, index) => html`
            <button
              part="tab"
              role="tab"
              aria-selected=${index === this.activeTab ? 'true' : 'false'}
              aria-controls=${`panel-${tab.id}`}
              tabindex=${index === this.activeTab ? 0 : -1}
              @click=${(e: Event) => this.#handleTabClick(index, tab.id, e)}
              @keydown=${(e: KeyboardEvent) => this.#handleTabKeydown(e, index)}
            >
              ${tab.label}
            </button>
          `
        )}
      </div>
    `;
  }

  #renderTabPanels(): TemplateResult {
    return html`
      ${this.#tabs.map(
        (tab, index) => html`
          <div
            part="tab-panel"
            role="tabpanel"
            id=${`panel-${tab.id}`}
            aria-labelledby=${`tab-${tab.id}`}
            data-state=${index === this.activeTab ? 'active' : 'hidden'}
            data-index=${index}
          >
            <div part="items">
              <slot name=${`tab-${tab.id}`}></slot>
            </div>
          </div>
        `
      )}
    `;
  }

  #handleTabClick(index: number, id: string, event: Event): void {
    if (index === this.activeTab) {
      return;
    }

    this.activeTab = index;

    this.dispatchEvent(
      new CustomEvent<TabChangeEventDetail>('tab-change', {
        detail: { index, id, event },
        bubbles: true,
        composed: true
      })
    );
  }

  #handleTabKeydown(event: KeyboardEvent, currentIndex: number): void {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : this.#tabs.length - 1;
        break;
      case 'ArrowRight':
        event.preventDefault();
        newIndex = currentIndex < this.#tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = this.#tabs.length - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      this.activeTab = newIndex;

      // Focus the new tab button
      queueMicrotask(() => {
        const tabButtons = this.shadowRoot?.querySelectorAll('[part="tab"]');
        const newTabButton = tabButtons?.[newIndex] as HTMLButtonElement | undefined;
        newTabButton?.focus();
      });
    }
  }

  async performTabAnimation(fromIndex: number, toIndex: number): Promise<void> {
    if (this.#isAnimating) {
      return;
    }

    this.#isAnimating = true;

    const duration = 120;
    const easing = 'cubic-bezier(.25, 0, .5, 1)';

    const content = this.contentElement;

    if (!content) {
      this.#isAnimating = false;
      this.requestRender();
      return;
    }

    // Get the panels by data-index attribute for reliability
    const fromPanel = this.shadowRoot?.querySelector(
      `[part="tab-panel"][data-index="${fromIndex}"]`
    ) as HTMLElement | null;
    const toPanel = this.shadowRoot?.querySelector(`[part="tab-panel"][data-index="${toIndex}"]`) as HTMLElement | null;

    if (!fromPanel || !toPanel) {
      this.#isAnimating = false;
      this.requestRender();
      return;
    }

    // Lock the current height
    const startHeight = content.getBoundingClientRect().height;
    content.style.height = `${startHeight}px`;

    // FIX: Ensure the new panel is hidden immediately.
    toPanel.style.display = 'none';
    toPanel.style.opacity = '0';

    // Fade out old content via WAAPI
    try {
      const fadeOut = fromPanel.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing, fill: 'forwards' });
      await fadeOut.finished;
      fadeOut.cancel();
    } catch {
      // ignore
    }

    fromPanel.setAttribute('data-state', 'hidden');

    // Prepare and measure new panel while completely invisible
    const previousToState = toPanel.getAttribute('data-state');

    toPanel.style.display = 'block';
    toPanel.style.visibility = 'hidden';
    toPanel.style.opacity = '0';

    // Force layout, then measure
    void toPanel.offsetHeight;
    const endHeight = toPanel.getBoundingClientRect().height;

    // Animate height
    if (startHeight !== endHeight) {
      content.setAttribute('data-animating', 'true');
      void content.offsetHeight;
      content.style.height = `${endHeight}px`;
      await this.#wait(duration);
    }

    // Show panel but keep opacity at 0, then fade in
    toPanel.style.visibility = 'visible';
    toPanel.style.opacity = '0';

    void toPanel.offsetHeight;

    try {
      const fadeIn = toPanel.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing, fill: 'forwards' });
      await fadeIn.finished;
      fadeIn.cancel();
    } catch {
      // ignore
    }

    // Finalize new tab state and cleanup
    toPanel.style.display = '';
    toPanel.style.visibility = '';
    toPanel.style.opacity = '';

    if (previousToState !== 'active') {
      toPanel.setAttribute('data-state', 'active');
    }

    content.style.height = '';
    content.removeAttribute('data-animating');
    this.#isAnimating = false;
  }

  #wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  #syncTabs(): void {
    const tabs: { id: string; label: string }[] = [];

    for (const child of Array.from(this.children)) {
      const slot = child.getAttribute('slot');
      if (slot?.startsWith('tab-')) {
        const id = slot.replace('tab-', '');
        const label = child.getAttribute('data-tab-label') || id;
        tabs.push({ id, label });
      }
    }

    this.#tabs = tabs.slice(0, 3);

    if (this.activeTab >= this.#tabs.length && this.#tabs.length > 0) {
      this.activeTab = 0;
    }
  }

  @Listen('slotchange', { selector: 'slot[name="footer"]' })
  onFooterSlotChange(): void {
    this.updateFooterAttribute();
  }

  @Listen('slotchange', { selector: 'slot:not([name])' })
  onDefaultSlotChange(): void {
    this.#syncTabs();
    this.requestRender();
  }

  private updateFooterAttribute(): void {
    const footer = this.shadowRoot?.querySelector('[part="footer"]');

    if (!footer) {
      return;
    }

    const footerSlot = this.shadowRoot?.querySelector('slot[name="footer"]') as HTMLSlotElement;
    const hasFooter = Boolean(footerSlot?.assignedNodes({ flatten: true }).length > 0);
    setBooleanAttribute(footer, 'data-has-content', hasFooter);
  }
}
