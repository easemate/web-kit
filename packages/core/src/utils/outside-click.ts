import type { DismissContext } from './dismiss-controller';

import { DismissController } from './dismiss-controller';

export interface OutsideClickResolution {
  owner?: HTMLElement | null | undefined;
  content?: HTMLElement | null | undefined;
  triggers?: Array<HTMLElement | null | undefined>;
}

export interface OutsideClickHandle {
  update(): void;
  disconnect(): void;
}

export interface OutsideClickHandleOptions<THost extends HTMLElement> {
  resolve: (host: THost) => OutsideClickResolution | null | undefined;
  disabled?: (host: THost) => boolean;
}

const registry = new WeakMap<HTMLElement, Set<OutsideClickHandle>>();

const toDismissContext = <THost extends HTMLElement>(
  host: THost,
  options: OutsideClickHandleOptions<THost>
): DismissContext | null => {
  if (options.disabled?.(host)) {
    return null;
  }

  const resolved = options.resolve(host);

  if (!resolved) {
    return null;
  }

  const owner = resolved.owner ?? host ?? null;

  if (!(owner instanceof HTMLElement)) {
    return null;
  }

  const content = resolved.content && resolved.content instanceof HTMLElement ? resolved.content : null;

  const triggers = resolved.triggers?.filter((element): element is HTMLElement => element instanceof HTMLElement) ?? [];

  return {
    owner,
    content,
    triggers
  };
};

export const createOutsideClickHandle = <THost extends HTMLElement>(
  host: THost,
  onDismiss: (this: THost, event: Event) => void,
  options: OutsideClickHandleOptions<THost>
): OutsideClickHandle => {
  const controller = new DismissController({
    onDismiss(event) {
      if (options.disabled?.(host)) {
        return;
      }

      onDismiss.call(host, event);
    }
  });

  return {
    update(): void {
      const context = toDismissContext(host, options);
      if (!context) {
        controller.disconnect();
        return;
      }

      controller.connect(context);
    },
    disconnect(): void {
      controller.disconnect();
    }
  };
};

export const registerOutsideClickHandle = (host: HTMLElement, handle: OutsideClickHandle): void => {
  let handles = registry.get(host);

  if (!handles) {
    handles = new Set();
    registry.set(host, handles);
  }

  handles.add(handle);
};

export const updateOutsideClickHandles = (host: HTMLElement): void => {
  const handles = registry.get(host);

  if (!handles) {
    return;
  }

  handles.forEach((handle) => {
    handle.update();
  });
};

export const disconnectOutsideClickHandles = (host: HTMLElement): void => {
  const handles = registry.get(host);

  if (!handles) {
    return;
  }

  handles.forEach((handle) => {
    handle.disconnect();
  });
};

export const requestOutsideClickUpdate = (host: HTMLElement): void => {
  updateOutsideClickHandles(host);
};
