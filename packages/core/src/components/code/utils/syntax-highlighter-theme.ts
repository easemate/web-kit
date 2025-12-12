import type { TokenType } from './syntax-highlighter-types';

export const DEFAULT_THEME: Record<TokenType, string> = {
  keyword: 'var(--ease-syntax-keyword, #B777FF)',
  string: 'var(--ease-syntax-string, #FF8074)',
  comment: 'var(--ease-syntax-comment, var(--color-gray-700))',
  number: 'var(--ease-syntax-number, #33FFD0)',
  operator: 'var(--ease-syntax-operator, var(--color-gray-500))',
  tag: 'var(--ease-syntax-tag, #38A7E8)',
  attribute: 'var(--ease-syntax-attribute, #ff6600)',
  property: 'var(--ease-syntax-property, #FF91B7)',
  type: 'var(--ease-syntax-type, #FFAB77)',
  variable: 'var(--ease-syntax-variable, #B394FF)',
  selector: 'var(--ease-syntax-selector, #A2E7EC)',
  function: 'var(--ease-syntax-function, #8B9FFF)'
};

export const generateHighlightStyles = (
  instanceId: string,
  theme: Record<TokenType, string> = DEFAULT_THEME
): string => {
  let styles = '';

  for (const [type, color] of Object.entries(theme)) {
    const highlightName = `syntax-${type}-${instanceId}`;
    const italic = type === 'comment' ? 'font-style: italic;' : '';
    styles += `::highlight(${highlightName}) { color: ${color}; ${italic} }`;
  }

  return styles;
};
