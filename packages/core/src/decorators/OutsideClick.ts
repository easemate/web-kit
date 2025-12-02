import type { OutsideClickResolution } from '~/utils/outside-click';

import {
  createOutsideClickHandle,
  disconnectOutsideClickHandles,
  registerOutsideClickHandle,
  requestOutsideClickUpdate,
  updateOutsideClickHandles
} from '~/utils/outside-click';

type OutsideClickHost = HTMLElement & {
  connectedCallback?: (...args: unknown[]) => unknown;
  disconnectedCallback?: (...args: unknown[]) => unknown;
  afterRender?: (...args: unknown[]) => unknown;
};

type HookName = 'connectedCallback' | 'disconnectedCallback' | 'afterRender';

interface OutsideClickOptions<THost extends OutsideClickHost> {
  resolve?: (host: THost) => OutsideClickResolution | null | undefined;
  owner?: (host: THost) => HTMLElement | null | undefined;
  content?: (host: THost) => HTMLElement | null | undefined;
  triggers?: (host: THost) => Array<HTMLElement | null | undefined>;
  disabled?: (host: THost) => boolean;
}

const lifecycleApplied = new WeakSet<OutsideClickHost>();

const wrapMethod = (
  host: OutsideClickHost,
  name: HookName,
  hook: (this: OutsideClickHost) => void,
  callHookFirst = false
): void => {
  const original = host[name];

  (host as Required<OutsideClickHost>)[name] = function (...args: unknown[]) {
    if (callHookFirst) {
      hook.call(this);
    }

    let result: unknown;

    if (typeof original === 'function') {
      result = (original as (...params: unknown[]) => unknown).apply(this, args);
    }

    if (!callHookFirst) {
      hook.call(this);
    }

    return result;
  };
};

const ensureLifecycle = (host: OutsideClickHost): void => {
  if (lifecycleApplied.has(host)) {
    return;
  }

  lifecycleApplied.add(host);

  wrapMethod(host, 'connectedCallback', function (this: OutsideClickHost) {
    updateOutsideClickHandles(this);
  });

  wrapMethod(host, 'afterRender', function (this: OutsideClickHost) {
    updateOutsideClickHandles(this);
  });

  wrapMethod(
    host,
    'disconnectedCallback',
    function (this: OutsideClickHost) {
      disconnectOutsideClickHandles(this);
    },
    true
  );
};

export function OutsideClick<THost extends OutsideClickHost, TEvent extends Event = Event>(
  options: OutsideClickOptions<THost> = {}
) {
  return (
    originalMethod: (this: THost, event: TEvent) => unknown,
    context: ClassMethodDecoratorContext<THost, typeof originalMethod>
  ): void => {
    context.addInitializer(function (this: THost) {
      ensureLifecycle(this);

      const resolve =
        options.resolve ??
        ((host: THost): OutsideClickResolution => {
          return {
            owner: options.owner?.(host),
            content: options.content?.(host),
            triggers: options.triggers?.(host)
          };
        });

      const handle = createOutsideClickHandle(
        this,
        (event) => {
          originalMethod.call(this, event as TEvent);
        },
        {
          resolve,
          disabled: options.disabled
        }
      );

      registerOutsideClickHandle(this, handle);

      if (this.isConnected) {
        updateOutsideClickHandles(this);
      }
    });
  };
}

export { requestOutsideClickUpdate } from '~/utils/outside-click';
export type { OutsideClickOptions };
