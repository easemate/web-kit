/**
 * Lazy loading utilities using MutationObserver.
 */

import { COMPONENT_LOADERS, WEB_KIT_ALL_TAGS, type WebKitTag } from './component-loaders';
import { isBrowser } from './style-inject';

/**
 * Lazy load configuration.
 */
export interface LazyLoadConfig {
  /** MutationObserver strategy */
  strategy?: 'mutation';
  /** Root element to observe (default: document) */
  root?: Document | Element;
  /** Tags to include in lazy loading */
  include?: readonly string[];
  /** Tags to exclude from lazy loading */
  exclude?: readonly string[];
  /** Tags to preload immediately */
  preload?: readonly string[];
}

/**
 * Lazy loader instance.
 */
export interface LazyLoader {
  /** Stop observing and cleanup */
  dispose: () => void;
  /** Manually load a component */
  load: (tag: WebKitTag) => Promise<void>;
}

/**
 * Create a lazy loader that auto-registers components when they appear in DOM.
 */
export function createLazyLoader(config: LazyLoadConfig = {}): LazyLoader {
  if (!isBrowser()) {
    return {
      dispose: () => {},
      load: async () => {}
    };
  }

  const { root = document, include, exclude, preload } = config;

  // Determine which tags to watch
  let watchTags = new Set<WebKitTag>([...WEB_KIT_ALL_TAGS]);

  if (include && include.length > 0) {
    watchTags = new Set(include.filter((tag): tag is WebKitTag => WEB_KIT_ALL_TAGS.includes(tag as WebKitTag)));
  }

  if (exclude && exclude.length > 0) {
    for (const tag of exclude) {
      watchTags.delete(tag as WebKitTag);
    }
  }

  // Track loaded components
  const loaded = new Set<string>();

  // Load a component
  const load = async (tag: WebKitTag): Promise<void> => {
    if (loaded.has(tag)) {
      return;
    }

    const loader = COMPONENT_LOADERS[tag];
    if (loader) {
      loaded.add(tag);
      await loader();
    }
  };

  // Check if an element or its descendants need loading
  const checkElement = (element: Element): void => {
    const tagName = element.tagName.toLowerCase();

    if (watchTags.has(tagName as WebKitTag) && !loaded.has(tagName)) {
      void load(tagName as WebKitTag);
    }

    // Check children
    for (const child of element.querySelectorAll('*')) {
      const childTag = child.tagName.toLowerCase();
      if (watchTags.has(childTag as WebKitTag) && !loaded.has(childTag)) {
        void load(childTag as WebKitTag);
      }
    }
  };

  // Create observer
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) {
          checkElement(node);
        }
      }
    }
  });

  // Start observing
  const target = root instanceof Document ? root.documentElement : root;
  observer.observe(target, {
    childList: true,
    subtree: true
  });

  // Check existing elements
  checkElement(target);

  // Preload specified tags
  if (preload && preload.length > 0) {
    for (const tag of preload) {
      if (WEB_KIT_ALL_TAGS.includes(tag as WebKitTag)) {
        void load(tag as WebKitTag);
      }
    }
  }

  return {
    dispose: () => {
      observer.disconnect();
    },
    load
  };
}
