import { html, render, type TemplateResult } from 'lit-html';

type Constructor<T extends HTMLElement> = new (...args: unknown[]) => T;

interface LifecycleElement {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  attributeChangedCallback?(name: string, oldValue: string | null, newValue: string | null): void;
}

type RenderableElement = HTMLElement & {
  render?(): TemplateResult | null | undefined;
  afterRender?(): void;
  wrapRender?(commit: () => void, context: RenderContext): void;
  onAttributeChange?(name: string, oldValue: string | null, newValue: string | null): void;
  requestRender?(): void;
  renderRoot?: ShadowRoot | HTMLElement;
};

type TemplateValue<TElement extends RenderableElement> =
  | TemplateResult
  | null
  | undefined
  | ((this: TElement, host: TElement) => TemplateResult | null | undefined);

interface ComponentOptions<TElement extends RenderableElement = RenderableElement> {
  tag: string;
  template?: TemplateValue<TElement>;
  styles?: string;
  styleUrls?: string[];
  observedAttributes?: string[];
  shadowMode?: ShadowRootMode;
  autoSlot?: boolean;
}

// Exporting RenderContext
export interface RenderContext {
  fragment: DocumentFragment;
  root: ShadowRoot | HTMLElement;
}

const styleCache = new Map<string, Promise<string>>();

const normalizeTemplate = <TElement extends RenderableElement>(
  template?: TemplateValue<TElement>
): ((this: TElement, host: TElement) => TemplateResult | null | undefined) => {
  if (typeof template === 'function') {
    return template as (this: TElement, host: TElement) => TemplateResult | null | undefined;
  }

  if (template && typeof template === 'object' && '_$litTemplate$' in template) {
    return function (this: TElement): TemplateResult | null | undefined {
      return template as TemplateResult;
    };
  }

  return function (this: TElement): TemplateResult | null | undefined {
    return null;
  };
};

const fetchStyles = async (urls: readonly string[]): Promise<string[]> =>
  Promise.all(
    urls.map((url) => {
      const cached = styleCache.get(url);
      if (cached) {
        return cached;
      }

      const request = fetch(url)
        .then((response) => (response.ok ? response.text() : ''))
        .catch(() => '');

      styleCache.set(url, request);
      return request;
    })
  );

export const Component =
  <TElement extends RenderableElement = RenderableElement>(options: ComponentOptions<TElement>) =>
  <TBase extends Constructor<TElement> & { observedAttributes?: string[] }>(
    Base: TBase,
    _context: ClassDecoratorContext
  ): TBase => {
    const {
      tag,
      template,
      styles = '',
      styleUrls = [],
      observedAttributes = [],
      shadowMode = 'open',
      autoSlot = true
    } = options;

    if (!tag) {
      throw new Error('@Component requires a "tag" option.');
    }

    const templateFn = normalizeTemplate<TElement>(template);

    class Decorated extends (Base as unknown as Constructor<RenderableElement>) {
      static get observedAttributes(): string[] {
        const parent =
          'observedAttributes' in Base && Array.isArray(Base.observedAttributes)
            ? (Base.observedAttributes as string[])
            : [];
        const own = Array.isArray(observedAttributes) ? observedAttributes : [];
        return Array.from(new Set([...parent, ...own]));
      }

      #shadow: ShadowRoot;
      #styles = styles;
      #styleUrls = [...styleUrls];
      #renderScheduled = false;

      constructor(...args: unknown[]) {
        super(...args);
        this.#shadow = this.attachShadow({ mode: shadowMode });
        this.renderRoot = this.#shadow;
      }

      get shadow(): HTMLElement | ShadowRoot | undefined {
        return this.renderRoot;
      }

      connectedCallback(): void {
        (Base.prototype as LifecycleElement).connectedCallback?.call(this);

        void this.#loadStyles().finally(() => {
          this.requestRender();
        });
      }

      disconnectedCallback(): void {
        (Base.prototype as LifecycleElement).disconnectedCallback?.call(this);
        this.#renderScheduled = false;
      }

      attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
        (Base.prototype as LifecycleElement).attributeChangedCallback?.call(this, name, oldValue, newValue);

        if (oldValue !== newValue) {
          this.onAttributeChange?.(name, oldValue, newValue);
        }
      }

      requestRender(): void {
        if (this.#renderScheduled) {
          return;
        }

        this.#renderScheduled = true;

        requestAnimationFrame(() => {
          this.#renderScheduled = false;
          this.#render();
        });
      }

      async #loadStyles(): Promise<void> {
        if (!this.#styleUrls.length) {
          return;
        }

        const fetched = await fetchStyles(this.#styleUrls);
        const inlineStyles = this.#styles ? [this.#styles] : [];
        this.#styles = [...inlineStyles, ...fetched.filter(Boolean)].join('\n');
      }

      #render(): void {
        const root = this.#shadow;

        let templateResult: TemplateResult | null | undefined;

        if (typeof this.render === 'function') {
          templateResult = this.render();
        } else {
          templateResult = templateFn.call(this as unknown as TElement, this as unknown as TElement);
        }

        const styleTemplate = this.#styles ? html`<style>${this.#styles}</style>` : null;
        const slotTemplate = autoSlot ? html`<slot></slot>` : null;

        const completeTemplate = html`
          ${styleTemplate}
          ${templateResult ?? null}
          ${slotTemplate}
        `;

        const commit = (): void => {
          render(completeTemplate, root);
          this.afterRender?.();
        };

        if (typeof this.wrapRender === 'function') {
          const fragment = document.createDocumentFragment();
          const tempDiv = document.createElement('div');

          render(completeTemplate, tempDiv);

          fragment.append(...tempDiv.childNodes);

          this.wrapRender(commit, { fragment, root });
          return;
        }

        commit();
      }
    }

    if (!customElements.get(tag)) {
      customElements.define(tag, Decorated as unknown as CustomElementConstructor);
    }

    return Decorated as unknown as TBase;
  };
