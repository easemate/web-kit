import type { Token, TokenType } from './syntax-highlighter-types';

import { GRAMMARS } from './syntax-grammars';

export const tokenize = (code: string, language: string): Token[] => {
  const grammar = GRAMMARS[language.toLowerCase()];

  if (!grammar) {
    return [];
  }

  const regexParts: string[] = [];
  const groupMap = new Map<string, TokenType>();
  let groupIndex = 0;

  grammar.forEach(([type, pattern]) => {
    const groupName = `G${groupIndex++}`;
    groupMap.set(groupName, type);
    regexParts.push(`(?<${groupName}>${pattern.source})`);
  });

  const masterRegex = new RegExp(regexParts.join('|'), 'gm');
  const tokens: Token[] = [];

  let match: RegExpExecArray | null;

  while (true) {
    match = masterRegex.exec(code);
    if (match === null) {
      break;
    }
    if (match.index === masterRegex.lastIndex) {
      masterRegex.lastIndex++;
    }

    if (match.groups) {
      for (const groupName in match.groups) {
        if (match.groups[groupName] !== undefined) {
          const type = groupMap.get(groupName);
          if (type) {
            const start = match.index;
            const end = start + match[0].length;

            if ((language === 'html' || language === 'tsx' || language === 'jsx') && type === 'tag') {
              const tagNameMatch = match[0].match(/[a-zA-Z0-9-]+/);
              if (tagNameMatch && tagNameMatch.index !== undefined) {
                const tagNameStart = start + tagNameMatch.index;
                const tagNameEnd = tagNameStart + tagNameMatch[0].length;
                tokens.push({ type, start: tagNameStart, end: tagNameEnd });
                break;
              }
            }

            tokens.push({ type, start, end });
            break;
          }
        }
      }
    }
  }

  return tokens;
};

export const normalizeIndent = (code: string): string => {
  const lines = code.split('\n').filter((line) => line.trim());

  if (!lines.length) {
    return '';
  }

  const minIndent = Math.min(...lines.map((line) => line.match(/^\s*/)?.[0].length || 0));

  return lines.map((line) => line.substring(minIndent)).join('\n');
};
