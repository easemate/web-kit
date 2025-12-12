export type TokenType =
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'operator'
  | 'function'
  | 'type'
  | 'tag'
  | 'attribute'
  | 'property'
  | 'selector'
  | 'variable';

export interface Token {
  type: TokenType;
  start: number;
  end: number;
}

export type GrammarRule = [TokenType, RegExp];
export type Grammar = GrammarRule[];

export interface SyntaxHighlighterOptions {
  language?: string;
  theme?: Record<TokenType, string>;
}
