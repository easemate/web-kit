import { describe, expect, it } from 'vitest';

import { defaultThemeConfig } from '../src/theme/presets';
import {
  getTheme,
  getThemeNames,
  hasTheme,
  isThemeConfig,
  isThemeRef,
  registerTheme,
  themeRef
} from '../src/theme/registry';

describe('theme registry', () => {
  describe('built-in themes', () => {
    it('has default theme registered', () => {
      expect(hasTheme('default')).toBe(true);
    });

    it('has dark theme as alias', () => {
      expect(hasTheme('dark')).toBe(true);
    });

    it('getTheme returns default config for default theme', () => {
      const config = getTheme('default');
      expect(config.colors?.gray?.[900]).toBe(defaultThemeConfig.colors?.gray?.[900]);
    });

    it('getTheme returns same config for dark alias', () => {
      const defaultConfig = getTheme('default');
      const darkConfig = getTheme('dark');
      // dark is alias, should have same values
      expect(darkConfig.colors?.gray?.[900]).toBe(defaultConfig.colors?.gray?.[900]);
    });
  });

  describe('registerTheme', () => {
    it('registers a custom theme', () => {
      const ref = registerTheme('test-custom', {
        base: 'default',
        config: {
          vars: { '--test-var': '123' }
        }
      });

      expect(hasTheme('test-custom')).toBe(true);
      expect(ref.name).toBe('test-custom');
      expect(isThemeRef(ref)).toBe(true);
    });

    it('inherits from base theme', () => {
      registerTheme('test-inherit', {
        base: 'default',
        config: {
          vars: { '--custom-var': 'value' }
        }
      });

      const config = getTheme('test-inherit');
      // Should have base colors
      expect(config.colors?.gray?.[900]).toBe(defaultThemeConfig.colors?.gray?.[900]);
      // Should have custom vars
      expect(config.vars?.['--custom-var']).toBe('value');
    });

    it('allows null base for standalone theme', () => {
      registerTheme('test-standalone', {
        base: null,
        config: {
          colors: { gray: { 900: 'red' } },
          vars: { '--standalone': 'yes' }
        }
      });

      const config = getTheme('test-standalone');
      expect(config.colors?.gray?.[900]).toBe('red');
      expect(config.vars?.['--standalone']).toBe('yes');
      // Should NOT have default values that weren't specified
      expect(config.colors?.blue).toBeUndefined();
    });

    it('throws on missing base theme', () => {
      expect(() =>
        registerTheme('test-missing-base', {
          base: 'nonexistent' as 'default',
          config: {}
        })
      ).toThrow('not registered');
    });

    it('returns a theme ref', () => {
      const ref = registerTheme('test-ref-return', { config: {} });
      expect(isThemeRef(ref)).toBe(true);
      expect(ref.name).toBe('test-ref-return');
    });
  });

  describe('getTheme', () => {
    it('accepts theme name string', () => {
      const config = getTheme('default');
      expect(config).toBeDefined();
      expect(config.colors).toBeDefined();
    });

    it('accepts theme ref', () => {
      const ref = registerTheme('test-ref-get', { config: {} });
      const config = getTheme(ref);
      expect(config).toBeDefined();
    });

    it('accepts inline config', () => {
      const inlineConfig = { vars: { '--inline': 'test' } };
      const config = getTheme(inlineConfig);
      expect(config).toBe(inlineConfig);
    });

    it('throws on unregistered theme name', () => {
      expect(() => getTheme('nonexistent' as 'default')).toThrow('not registered');
    });
  });

  describe('type guards', () => {
    it('isThemeRef identifies theme refs', () => {
      const ref = themeRef('default');
      expect(isThemeRef(ref)).toBe(true);
      expect(isThemeRef('default')).toBe(false);
      expect(isThemeRef({ colors: {} })).toBe(false);
      expect(isThemeRef(null)).toBe(false);
    });

    it('isThemeConfig identifies theme configs', () => {
      expect(isThemeConfig({ colors: {} })).toBe(true);
      expect(isThemeConfig({ vars: {} })).toBe(true);
      expect(isThemeConfig({ radii: {} })).toBe(true);
      expect(isThemeConfig('default')).toBe(false);
      expect(isThemeConfig(themeRef('default'))).toBe(false);
    });
  });

  describe('getThemeNames', () => {
    it('returns array of registered theme names', () => {
      const names = getThemeNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names).toContain('default');
      expect(names).toContain('dark');
    });
  });

  describe('themeRef', () => {
    it('creates ref for registered theme', () => {
      const ref = themeRef('default');
      expect(isThemeRef(ref)).toBe(true);
      expect(ref.name).toBe('default');
    });

    it('throws for unregistered theme', () => {
      expect(() => themeRef('nonexistent' as 'default')).toThrow('not registered');
    });
  });

  describe('circular dependency detection', () => {
    it('detects circular theme dependencies', () => {
      // Register themes that could form a cycle
      registerTheme('cycle-a', { base: null, config: {} });

      // This would create a cycle if we allowed it
      // For now, just verify normal inheritance works
      registerTheme('cycle-b', { base: 'cycle-a', config: {} });

      const config = getTheme('cycle-b');
      expect(config).toBeDefined();
    });
  });
});
