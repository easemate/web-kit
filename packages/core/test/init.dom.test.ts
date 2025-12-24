import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { initWebKit } from '../src/init';
import { registerTheme } from '../src/theme/registry';

describe('initWebKit (dom)', () => {
  beforeEach(() => {
    // Clear any previously injected styles
    document.head.innerHTML = '';
    document.documentElement.removeAttribute('data-ease-theme');
    document.documentElement.style.cssText = '';
  });

  afterEach(() => {
    // Clean up
    document.head.innerHTML = '';
    document.documentElement.removeAttribute('data-ease-theme');
    document.documentElement.style.cssText = '';
  });

  describe('basic initialization', () => {
    it('returns a controller', () => {
      const controller = initWebKit({ theme: 'default' });
      expect(controller).toBeDefined();
      expect(typeof controller.dispose).toBe('function');
      expect(controller.ready).toBeInstanceOf(Promise);
    });

    it('ready promise resolves', async () => {
      const controller = initWebKit({ theme: 'default' });
      await expect(controller.ready).resolves.toBeUndefined();
    });
  });

  describe('theme application', () => {
    it('applies theme variables to document', async () => {
      const controller = initWebKit({ theme: 'default' });
      await controller.ready;

      // Check that CSS variables are set
      const style = document.documentElement.style;
      expect(style.getPropertyValue('--color-gray-900')).toBeTruthy();
    });

    it('sets data-ease-theme attribute', async () => {
      const controller = initWebKit({ theme: 'default' });
      await controller.ready;

      expect(document.documentElement.getAttribute('data-ease-theme')).toBe('default');
    });

    it('applies custom theme from registry', async () => {
      registerTheme('test-apply', {
        base: 'default',
        config: {
          vars: { '--test-custom-var': 'applied' }
        }
      });

      const controller = initWebKit({ theme: 'test-apply' as 'default' });
      await controller.ready;

      const style = document.documentElement.style;
      expect(style.getPropertyValue('--test-custom-var')).toBe('applied');
    });

    it('applies inline theme config', async () => {
      const controller = initWebKit({
        theme: {
          vars: { '--inline-test': 'inline-value' }
        } as 'default'
      });
      await controller.ready;

      const style = document.documentElement.style;
      expect(style.getPropertyValue('--inline-test')).toBe('inline-value');
    });

    it('theme controller set method works', async () => {
      const controller = initWebKit({ theme: 'default' });
      await controller.ready;

      registerTheme('test-switch', {
        base: 'default',
        config: { vars: { '--switched': 'yes' } }
      });

      controller.theme?.set('test-switch' as 'default');

      const style = document.documentElement.style;
      expect(style.getPropertyValue('--switched')).toBe('yes');
    });
  });

  describe('styles injection', () => {
    it('injects reset styles when styles="reset"', async () => {
      const controller = initWebKit({
        theme: 'default',
        styles: 'reset'
      });
      await controller.ready;

      const styleEl = document.getElementById('ease-webkit-reset');
      expect(styleEl).toBeTruthy();
      expect(styleEl?.textContent).toContain('box-sizing');
    });

    it('injects base styles when styles="base"', async () => {
      const controller = initWebKit({
        theme: 'default',
        styles: 'base'
      });
      await controller.ready;

      const styleEl = document.getElementById('ease-webkit-base');
      expect(styleEl).toBeTruthy();
      expect(styleEl?.textContent).toContain('background-color');
    });

    it('injects main styles when styles="main"', async () => {
      const controller = initWebKit({
        theme: 'default',
        styles: 'main'
      });
      await controller.ready;

      const styleEl = document.getElementById('ease-webkit-main');
      expect(styleEl).toBeTruthy();
    });

    it('does not inject styles when styles=false', async () => {
      const controller = initWebKit({
        theme: 'default',
        styles: false
      });
      await controller.ready;

      expect(document.getElementById('ease-webkit-reset')).toBeNull();
      expect(document.getElementById('ease-webkit-base')).toBeNull();
      expect(document.getElementById('ease-webkit-main')).toBeNull();
    });

    it('dispose removes injected styles', async () => {
      const controller = initWebKit({
        theme: 'default',
        styles: 'main'
      });
      await controller.ready;

      expect(document.getElementById('ease-webkit-main')).toBeTruthy();

      controller.dispose();

      expect(document.getElementById('ease-webkit-main')).toBeNull();
    });
  });

  describe('fonts injection', () => {
    it('injects font links when fonts="default"', async () => {
      const controller = initWebKit({
        theme: 'default',
        fonts: 'default'
      });
      await controller.ready;

      // Check for preconnect links
      const preconnect = document.getElementById('ease-webkit-preconnect-google');
      expect(preconnect).toBeTruthy();

      // Check for font links
      const fontLinks = document.querySelectorAll('[id^="ease-webkit-font-"]');
      expect(fontLinks.length).toBeGreaterThan(0);
    });

    it('does not inject fonts when fonts=false', async () => {
      const controller = initWebKit({
        theme: 'default',
        fonts: false
      });
      await controller.ready;

      const fontLinks = document.querySelectorAll('[id^="ease-webkit-font-"]');
      expect(fontLinks.length).toBe(0);
    });
  });

  describe('target option', () => {
    it('applies theme to custom target element', async () => {
      const target = document.createElement('div');
      document.body.appendChild(target);

      const controller = initWebKit({
        theme: 'default',
        target
      });
      await controller.ready;

      expect(target.style.getPropertyValue('--color-gray-900')).toBeTruthy();
      expect(target.getAttribute('data-ease-theme')).toBe('default');

      document.body.removeChild(target);
    });
  });

  describe('include/exclude', () => {
    it('resolves tags with include option', async () => {
      // Just verify it doesn't throw
      const controller = initWebKit({
        include: ['ease-button'],
        theme: 'default'
      });
      await controller.ready;
      expect(controller).toBeDefined();
    });

    it('resolves tags with exclude option', async () => {
      const controller = initWebKit({
        exclude: ['ease-curve'],
        theme: 'default'
      });
      await controller.ready;
      expect(controller).toBeDefined();
    });
  });
});
