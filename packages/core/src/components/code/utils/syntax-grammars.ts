import type { Grammar } from './syntax-highlighter-types';

export const JS_BASE: Grammar = [
  ['comment', /(\/\/.*$)|(\/\*[\s\S]*?\*\/)/m],
  ['string', /('[^'\\]*(?:\\.[^'\\]*)*')|("[^"\\]*(?:\\.[^"\\]*)*")|(`[^`\\]*(?:\\.[^`\\]*)*`)/],
  ['number', /\b\d+(\.\d+)?\b|0x[a-fA-F0-9]+\b/],
  [
    'keyword',
    /\b(if|else|while|for|do|return|const|let|var|function|class|new|try|catch|finally|throw|import|export|default|async|await|extends|super|break|continue|switch|case|in|of|instanceof|typeof|delete|this|true|false|null|from|as)\b/
  ],
  ['function', /\b\w+(?=\()/],
  ['operator', /[+\-*/%=<>!&|?.:]{1,3}/]
];

export const TS_ADDITIONS: Grammar = [
  [
    'keyword',
    /\b(type|interface|enum|public|private|protected|readonly|namespace|module|declare|abstract|implements|static|any|unknown|never|string|number|boolean|void|symbol|bigint)\b/
  ],
  ['type', /\b([A-Z]\w*)\b/]
];

export const HTML_BASE: Grammar = [
  ['comment', /<!--[\s\S]*?-->/m],
  ['attribute', /(\s[a-zA-Z0-9_-]+)(?=\s*=)/],
  ['string', /('[^']*')|("[^"]*")/],
  ['tag', /(<\/?)([a-zA-Z0-9-]+)/],
  ['keyword', /<!DOCTYPE[^>]*>/i]
];

export const CSS_BASE: Grammar = [
  ['comment', /\/\*[\s\S]*?\*\//m],
  ['string', /('[^']*')|("[^"]*")/],
  ['number', /(#[0-9a-fA-F]{3,8})|\b-?\d+(\.\d+)?(px|em|rem|%|deg|s|ms|vh|vw|vmin|vmax)?\b/],
  ['keyword', /(!important|@media|@import|@keyframes|@font-face|inherit|initial|unset|auto|none)\b/],
  ['variable', /(--[a-zA-Z0-9_-]+)/],
  ['property', /([a-zA-Z-]+)\s*(?=:)/],
  ['selector', /(\.|#)([a-zA-Z0-9_-]+)|\[[^\]]+\]/],
  ['tag', /\b([a-zA-Z]+)(?=\s*\{)/]
];

export const JSON_BASE: Grammar = [
  ['property', /"([^"\\]*(?:\\.[^"\\]*)*)"(?=\s*:)/],
  ['string', /"([^"\\]*(?:\\.[^"\\]*)*)"/],
  ['number', /\b-?\d+(\.\d+)?([eE][+-]?\d+)?\b/],
  ['keyword', /\b(true|false|null)\b/]
];

const baseGrammars: Record<string, Grammar> = {
  javascript: JS_BASE,
  js: JS_BASE,
  typescript: [...JS_BASE, ...TS_ADDITIONS],
  ts: [...JS_BASE, ...TS_ADDITIONS],
  html: HTML_BASE,
  css: CSS_BASE,
  json: JSON_BASE
};

const TSX_GRAMMAR: Grammar = [
  ...HTML_BASE,
  ...(baseGrammars.typescript?.filter(([type]) => type !== 'operator') || [])
];

export const GRAMMARS: Record<string, Grammar> = {
  ...baseGrammars,
  tsx: TSX_GRAMMAR,
  jsx: TSX_GRAMMAR
};
