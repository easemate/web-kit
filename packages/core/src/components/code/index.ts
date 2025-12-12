import { Component } from '@/Component';
import { Prop } from '@/Prop';
import { Query } from '@/Query';

import type { TokenType } from './utils/syntax-highlighter-types';

import { html } from 'lit-html';

import { getHighlightAPI, SUPPORTS_HIGHLIGHT_API } from './utils/highlight-api';
import { generateHighlightStyles } from './utils/syntax-highlighter-theme';
import { normalizeIndent, tokenize } from './utils/syntax-tokenizer';

@Component({
  tag: 'ease-code',
  shadowMode: 'open',
  autoSlot: false,
  styles: `
    :host {
      display: block;
      position: relative;
      color: var(--color-blue-100);
    }

    pre {
      margin: 0;
      font-family: 'Geist Mono', monospace;
    }

    code {
      white-space: pre-wrap;
    }
  `,
  template() {
    return html`<pre><code><slot></slot></code></pre>`;
  }
})
export class Code extends HTMLElement {
  declare requestRender: () => void;

  #instanceId: string = `hl-${crypto.randomUUID()}`;
  #registeredHighlights: Set<string> = new Set();
  #observer: MutationObserver | null = null;

  @Prop<string | null>({ reflect: true })
  accessor language: string | null = null;

  @Query<HTMLElement>('code')
  accessor codeElement: HTMLElement | null = null;

  connectedCallback(): void {
    this.#observer = new MutationObserver(() => this.#processContent());

    this.#observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true
    });

    this.#processContent();
  }

  disconnectedCallback(): void {
    this.#observer?.disconnect();
    this.#cleanupHighlights();
  }

  attributeChangedCallback(name: string): void {
    if (name === 'language') {
      this.#processContent();
    }
  }

  get currentLanguage(): string {
    return this.language?.toLowerCase() ?? 'plaintext';
  }

  afterRender(): void {
    this.#processContent();
  }

  #renderStyles = (): void => {
    const style = document.createElement('style');

    style.setAttribute('data-highlight-styles', this.#instanceId);

    const highlightStyles = generateHighlightStyles(this.#instanceId);
    style.textContent = highlightStyles;

    if (this.shadowRoot) {
      this.shadowRoot.appendChild(style);
    }
  };

  #cleanupStyles() {
    const styles = this.shadowRoot?.querySelectorAll<HTMLStyleElement>(
      `style[data-highlight-styles="${this.#instanceId}"]`
    );

    if (styles) {
      for (const style of styles) {
        style.remove();
      }
    }
  }

  #getHighlightName(type: TokenType): string {
    return `syntax-${type}-${this.#instanceId}`;
  }

  #processContent() {
    let rawCode = this.textContent || '';
    rawCode = normalizeIndent(rawCode);

    if (!this.codeElement) {
      return;
    }

    this.codeElement.textContent = rawCode;

    this.#cleanupHighlights();

    if (!rawCode.trim() || !SUPPORTS_HIGHLIGHT_API) {
      return;
    }

    const textNode = this.codeElement.firstChild as Text;

    if (!textNode) {
      return;
    }

    this.#highlightCode(rawCode, this.currentLanguage, textNode);
  }

  #highlightCode(code: string, language: string, textNode: Text) {
    const api = getHighlightAPI();

    if (!api) {
      return;
    }

    const tokens = tokenize(code, language);
    const highlightMap = new Map<TokenType, Range[]>();

    for (const token of tokens) {
      if (token.start >= token.end) {
        continue;
      }

      try {
        this.#renderStyles();

        const range = document.createRange();
        range.setStart(textNode, token.start);
        range.setEnd(textNode, token.end);

        if (!highlightMap.has(token.type)) {
          highlightMap.set(token.type, []);
        }

        highlightMap.get(token.type)?.push(range);
      } catch {
        // Ignore range creation errors
      }
    }

    for (const [type, ranges] of highlightMap.entries()) {
      if (ranges.length) {
        const highlightName = this.#getHighlightName(type);
        const highlight = new api.Highlight(...ranges);
        api.highlights.set(highlightName, highlight);
        this.#registeredHighlights.add(highlightName);
      }
    }
  }

  #cleanupHighlights() {
    const api = getHighlightAPI();

    if (!api) {
      return;
    }

    for (const name of this.#registeredHighlights) {
      api.highlights.delete(name);
    }

    this.#cleanupStyles();

    this.#registeredHighlights.clear();
  }
}
