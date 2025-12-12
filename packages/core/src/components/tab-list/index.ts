import { Component } from '@/Component';
import { Prop } from '@/Prop';

import { html, type TemplateResult } from 'lit-html';

import { Tab } from './tab';

const templateCache = new WeakMap<HTMLElement, HTMLTemplateElement>();

const createTemplate = (tab: HTMLElement): HTMLTemplateElement => {
  const cached = templateCache.get(tab);

  if (cached) {
    return cached;
  }

  const template = document.createElement('template');

  template.content.append(...tab.cloneNode(true).childNodes);
  templateCache.set(tab, template);

  return template;
};

const nextId = (() => {
  let count = 0;
  return () => {
    count += 1;
    return `tabs-${count}`;
  };
})();

@Component({
  tag: 'ease-tab-list',
  autoSlot: false,
  styles: `
    :host {
      display: block;
      contain: layout inline-size;
    }

    /* Hide the internal slot container */
    [part="internal-slot"] {
      display: none;
    }

    [part="tablist"] {
      display: flex;
      align-items: center;
    }

    [part="tab"] {
      display: inline-flex;
      align-items: center;
    }

    [part="tab-control"] {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      margin: 0;
    }

    [part="tab-label"] {
      cursor: pointer;
    }

    [part="tab-control"]:focus-visible + [part="tab-label"] {
      outline: 2px solid Highlight;
    }

    [part="panel"] {
      display: block;
    }
  `
})
export class TabList extends HTMLElement {
  declare renderRoot: ShadowRoot | HTMLElement | undefined;
  #entries: Array<{
    value: string;
    label: string;
    icon: string | null;
    template: HTMLTemplateElement;
  }> = [];
  #observer: MutationObserver | null = null;
  #groupId = nextId();

  declare requestRender: () => void;

  @Prop({
    reflect: true,
    onChange(this: TabList, value: string | null, previous: string | null) {
      if (value === previous) {
        return;
      }

      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { value, previous },
          bubbles: true
        })
      );
    }
  })
  accessor value!: string | null;

  connectedCallback(): void {
    this.setAttribute('role', 'region');
    this.#collect();

    this.#observer = new MutationObserver(() => {
      this.#collect();
      this.requestRender();
    });

    this.#observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['value', 'label', 'icon']
    });
  }

  disconnectedCallback(): void {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  #collect(): void {
    const tabs = Array.from(this.querySelectorAll<HTMLElement>(':scope > tab-item'));

    this.#entries = tabs.map((tab, index) => {
      const value = tab.getAttribute('value') || `tab-${index + 1}`;
      const label = tab.getAttribute('label') || value;
      const icon = tab.getAttribute('icon');
      const template = createTemplate(tab);

      tab.hidden = true;

      return { value, label, icon, template };
    });

    const hasSelection = this.#entries.some((entry) => entry.value === this.value);

    if (!hasSelection && this.#entries.length > 0) {
      this.value = this.#entries[0]?.value ?? null;
    } else if (this.#entries.length === 0) {
      this.value = null;
    }
  }

  render(): TemplateResult {
    const activeIndex = this.#entries.findIndex((entry) => entry.value === this.value);
    const activeEntry = activeIndex > -1 ? this.#entries[activeIndex] : undefined;
    const panelId = `${this.#groupId}-panel`;

    return html`
      <div part="internal-slot">
        <slot></slot>
      </div>

      <div part="tablist" role="tablist" @keydown=${(event: KeyboardEvent) => this.#handleKeydown(event)}>
        ${this.#entries.map((entry, index) => {
          const controlId = `${this.#groupId}-control-${index}`;
          const isActive = entry.value === this.value;

          return html`
            <div part="tab" role="none">
              <input
                type="radio"
                name="${this.#groupId}"
                value="${entry.value}"
                id="${controlId}"
                .checked=${isActive}
                role="tab"
                part="tab-control"
                aria-controls="${panelId}"
                data-index="${index}"
                aria-selected="${isActive ? 'true' : 'false'}"
                tabindex="${isActive ? 0 : -1}"
                @change=${() => {
                  this.value = entry.value;
                }}
              />

              <label for="${controlId}" part="tab-label">
                ${entry.icon ? html`<span part="tab-icon">${entry.icon}</span>` : ''}
                ${entry.label}
              </label>
            </div>
          `;
        })}
      </div>

      <div
        part="panel"
        role="tabpanel"
        id="${panelId}"
        aria-labelledby="${activeIndex > -1 ? `${this.#groupId}-control-${activeIndex}` : ''}"
      >
        ${activeEntry ? document.importNode(activeEntry.template.content, true) : ''}
      </div>
    `;
  }

  #handleKeydown(event: KeyboardEvent): void {
    const keys = new Set(['ArrowRight', 'ArrowLeft', 'Home', 'End']);
    if (!keys.has(event.key)) {
      return;
    }

    event.preventDefault();

    const entries = this.#entries;
    if (entries.length === 0) {
      return;
    }

    const currentIndex = entries.findIndex((entry) => entry.value === this.value);

    let nextIndex = currentIndex === -1 ? 0 : currentIndex;

    if (event.key === 'ArrowRight') {
      nextIndex = (nextIndex + 1) % entries.length;
    }

    if (event.key === 'ArrowLeft') {
      nextIndex = (nextIndex - 1 + entries.length) % entries.length;
    }

    if (event.key === 'Home') {
      nextIndex = 0;
    }

    if (event.key === 'End') {
      nextIndex = entries.length - 1;
    }

    if (nextIndex !== currentIndex) {
      const nextEntry = entries[nextIndex];

      if (nextEntry) {
        this.value = nextEntry.value;

        queueMicrotask(() => {
          const nextControl = this.renderRoot?.querySelector(`[data-index="${nextIndex}"]`) as HTMLInputElement;

          nextControl?.focus();
        });
      }
    }
  }
}

export default {
  TabList,
  Tab
};
