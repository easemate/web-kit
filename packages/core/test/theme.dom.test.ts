import { describe, expect, it } from 'vitest';

import { applyTheme, createTheme, defineTheme, EASE_THEME_ATTRIBUTE, mergeTheme } from '../src/theme';

describe('theme API (dom)', () => {
  it('createTheme emits derived tokens and custom vars', () => {
    const css = createTheme(
      {
        colors: {
          blue: {
            200: 'oklab(10% 0 0)',
            300: 'oklab(20% 0 0)'
          },
          white: 'oklab(95% 0 0)'
        },
        vars: {
          '--ease-panel-padding': '16px',
          'ease-font-size': '14px'
        }
      },
      ':root'
    );

    expect(css).toContain('--color-blue-100-50: oklab(10% 0 0 / 0.5);');
    expect(css).toContain('--color-blue-300-40: oklab(20% 0 0 / 0.4);');
    expect(css).toContain('--color-white-0: oklab(95% 0 0 / 0);');
    expect(css).toContain('--ease-panel-padding: 16px;');
    expect(css).toContain('--ease-font-size: 14px;');
  });

  it('defineTheme applies vars to a target element', () => {
    const el = document.createElement('div');

    defineTheme(
      {
        vars: {
          'ease-panel-padding': '20px'
        }
      },
      el
    );

    expect(el.style.getPropertyValue('--ease-panel-padding').trim()).toBe('20px');
  });

  it('applyTheme can set theme name + colorScheme', () => {
    const el = document.createElement('div');

    applyTheme(mergeTheme({ vars: { '--ease-panel-padding': '12px' } }), {
      element: el,
      name: 'my-theme',
      colorScheme: 'dark'
    });

    expect(el.getAttribute(EASE_THEME_ATTRIBUTE)).toBe('my-theme');
    expect(el.style.colorScheme).toBe('dark');
    expect(el.style.getPropertyValue('--ease-panel-padding').trim()).toBe('12px');
  });
});
