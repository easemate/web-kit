// @vitest-environment node

import { describe, expect, it } from 'vitest';

import { initWebKit } from '../src/init';

describe('initWebKit (ssr)', () => {
  it('does not throw when document is not available', () => {
    expect(() => initWebKit({ theme: 'default' })).not.toThrow();
  });

  it('returns a controller with dispose and ready', () => {
    const controller = initWebKit({ theme: 'default' });
    expect(typeof controller.dispose).toBe('function');
    expect(controller.ready).toBeInstanceOf(Promise);
  });

  it('dispose is a no-op in SSR', () => {
    const controller = initWebKit({ theme: 'default' });
    expect(() => controller.dispose()).not.toThrow();
  });

  it('ready resolves immediately in SSR', async () => {
    const controller = initWebKit({ theme: 'default' });
    await expect(controller.ready).resolves.toBeUndefined();
  });

  it('works with include option', () => {
    const controller = initWebKit({
      include: ['ease-button', 'ease-slider'],
      theme: 'default'
    });
    expect(controller).toBeDefined();
  });

  it('works with exclude option', () => {
    const controller = initWebKit({
      exclude: ['ease-curve'],
      theme: 'default'
    });
    expect(controller).toBeDefined();
  });

  it('works with theme mode config', () => {
    const controller = initWebKit({
      theme: {
        mode: 'system',
        light: 'default',
        dark: 'default'
      }
    });
    expect(controller).toBeDefined();
  });

  it('works with lazyLoad option', () => {
    const controller = initWebKit({
      lazyLoad: true,
      theme: 'default'
    });
    expect(controller).toBeDefined();
  });

  it('works with styles option', () => {
    const controller = initWebKit({
      theme: 'default',
      styles: 'main'
    });
    expect(controller).toBeDefined();
  });

  it('works with fonts option', () => {
    const controller = initWebKit({
      theme: 'default',
      fonts: 'default'
    });
    expect(controller).toBeDefined();
  });
});
