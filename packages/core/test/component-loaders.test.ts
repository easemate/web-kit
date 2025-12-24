import { describe, expect, it } from 'vitest';

import {
  COMPONENT_LOADERS,
  resolveTags,
  WEB_KIT_ALL_TAGS,
  WEB_KIT_COMPONENT_TAGS,
  WEB_KIT_ELEMENT_TAGS
} from '../src/internal/component-loaders';

describe('component-loaders', () => {
  describe('tag arrays', () => {
    it('WEB_KIT_ELEMENT_TAGS contains element tags', () => {
      expect(WEB_KIT_ELEMENT_TAGS).toContain('ease-button');
      expect(WEB_KIT_ELEMENT_TAGS).toContain('ease-slider');
      expect(WEB_KIT_ELEMENT_TAGS).toContain('ease-dropdown');
    });

    it('WEB_KIT_COMPONENT_TAGS contains component tags', () => {
      expect(WEB_KIT_COMPONENT_TAGS).toContain('ease-curve');
      expect(WEB_KIT_COMPONENT_TAGS).toContain('ease-code');
    });

    it('WEB_KIT_ALL_TAGS is union of elements and components', () => {
      expect(WEB_KIT_ALL_TAGS).toContain('ease-button');
      expect(WEB_KIT_ALL_TAGS).toContain('ease-curve');
      expect(WEB_KIT_ALL_TAGS.length).toBe(WEB_KIT_ELEMENT_TAGS.length + WEB_KIT_COMPONENT_TAGS.length);
    });
  });

  describe('COMPONENT_LOADERS', () => {
    it('has a loader for every tag', () => {
      for (const tag of WEB_KIT_ALL_TAGS) {
        expect(COMPONENT_LOADERS[tag]).toBeDefined();
        expect(typeof COMPONENT_LOADERS[tag]).toBe('function');
      }
    });
  });

  describe('resolveTags', () => {
    it('returns all tags when no include/exclude', () => {
      const tags = resolveTags({});
      expect(tags.length).toBe(WEB_KIT_ALL_TAGS.length);
    });

    it('filters by include', () => {
      const tags = resolveTags({
        include: ['ease-button', 'ease-slider']
      });
      expect(tags).toEqual(['ease-button', 'ease-slider']);
    });

    it('filters by exclude', () => {
      const tags = resolveTags({
        exclude: ['ease-curve']
      });
      expect(tags).not.toContain('ease-curve');
      expect(tags.length).toBe(WEB_KIT_ALL_TAGS.length - 1);
    });

    it('include takes precedence over exclude', () => {
      const tags = resolveTags({
        include: ['ease-button', 'ease-curve'],
        exclude: ['ease-curve']
      });
      // When include is provided, exclude is ignored
      expect(tags).toEqual(['ease-button', 'ease-curve']);
    });

    it('filters out invalid tags from include', () => {
      const tags = resolveTags({
        include: ['ease-button', 'invalid-tag', 'ease-slider']
      });
      expect(tags).toEqual(['ease-button', 'ease-slider']);
    });

    it('handles multiple exclude', () => {
      const tags = resolveTags({
        exclude: ['ease-curve', 'ease-code', 'ease-button']
      });
      expect(tags).not.toContain('ease-curve');
      expect(tags).not.toContain('ease-code');
      expect(tags).not.toContain('ease-button');
      expect(tags.length).toBe(WEB_KIT_ALL_TAGS.length - 3);
    });

    it('returns empty array for include with all invalid tags', () => {
      const tags = resolveTags({
        include: ['invalid-1', 'invalid-2']
      });
      expect(tags).toEqual([]);
    });
  });
});
