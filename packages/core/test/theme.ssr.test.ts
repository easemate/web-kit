// @vitest-environment node

import { describe, expect, it } from 'vitest';

import { applyTheme, setThemeName } from '../src/theme';

describe('theme API (ssr)', () => {
  it('does not throw when document is not available', () => {
    expect(() => applyTheme({ vars: { '--x': '1' } })).not.toThrow();
    expect(() => setThemeName('dark')).not.toThrow();
  });
});
