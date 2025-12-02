import type { TemplateResult } from 'lit-html';

import { nothing } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { styleMap } from 'lit-html/directives/style-map.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { when } from 'lit-html/directives/when.js';

export { classMap, styleMap, when, repeat, unsafeHTML, ifDefined };

export function renderIf<T>(
  condition: T | undefined | null,
  template: TemplateResult | (() => TemplateResult)
): TemplateResult | typeof nothing {
  if (!condition) {
    return nothing;
  }

  return typeof template === 'function' ? template() : template;
}

export function renderList<T>(
  items: readonly T[],
  template: (item: T, index: number) => TemplateResult,
  key: (item: T, index: number) => unknown = (item) => item
): ReturnType<typeof repeat> {
  return repeat(items, key, template);
}

export function styleObject(input: Record<string, string | number | null | undefined>): ReturnType<typeof styleMap> {
  const definedEntries = Object.entries(input).reduce<Record<string, string>>((acc, [property, value]) => {
    if (value === null || value === undefined || value === '') {
      return acc;
    }

    acc[property] = typeof value === 'number' ? `${value}` : value;
    return acc;
  }, {});

  return styleMap(definedEntries);
}

export const optionalAttribute = ifDefined;
