import type { TokenType } from './syntax-highlighter-types';

export const DEFAULT_THEME: Record<TokenType, string> = {
  keyword: 'var(--ease-syntax-keyword, #e47ab4)',
  string: 'var(--ease-syntax-string, #6ad09d)',
  comment: 'var(--ease-syntax-comment, var(--color-gray-700))',
  number: 'var(--ease-syntax-number, #f2c24b)',
  operator: 'var(--ease-syntax-operator, var(--color-gray-500))',
  tag: 'var(--ease-syntax-tag, #c36571)',
  attribute: 'var(--ease-syntax-attribute, #ff6600)',
  property: 'var(--ease-syntax-property, #61bf90)',
  type: 'var(--ease-syntax-type, #FFAB77)',
  variable: 'var(--ease-syntax-variable, #ea7987)',
  selector: 'var(--ease-syntax-selector, #4F9CED)',
  function: 'var(--ease-syntax-function, #71a4f4)'
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
