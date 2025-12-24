type ListenHost = HTMLElement & {
  renderRoot?: ShadowRoot | DocumentFragment | HTMLElement;
};

type LifecycleHookName = 'connectedCallback' | 'disconnectedCallback';

type LifecycleCallback<THost extends ListenHost> = (this: THost) => void;

type ListenTargetResolver<THost extends ListenHost> =
  | 'document'
  | 'window'
  | 'shadow'
  | 'root'
  | 'light'
  | EventTarget
  | ((host: THost) => EventTarget | null | undefined);

type Predicate<TEvent extends Event, TElement extends Element> = (event: TEvent, matched: TElement | null) => boolean;

interface ListenOptions<THost extends ListenHost, TElement extends Element, TEvent extends Event> {
  selector?: string;
  target?: ListenTargetResolver<THost>;
  prevent?: boolean;
  stop?: boolean;
  stopImmediate?: boolean;
  once?: boolean;
  passive?: boolean;
  capture?: boolean;
  when?: Predicate<TEvent, TElement>;
}

type Cleanup = () => void;

const lifecycleHooks: Record<LifecycleHookName, WeakMap<ListenHost, Set<LifecycleCallback<ListenHost>>>> = {
  connectedCallback: new WeakMap(),
  disconnectedCallback: new WeakMap()
};

const cleanupRegistry = new WeakMap<ListenHost, Set<Cleanup>>();

const addLifecycleHook = <THost extends ListenHost>(
  instance: THost,
  hookName: LifecycleHookName,
  handler: LifecycleCallback<THost>
): void => {
  const store = lifecycleHooks[hookName] as WeakMap<THost, Set<LifecycleCallback<THost>>>;
  let callbacks = store.get(instance);

  if (!callbacks) {
    callbacks = new Set<LifecycleCallback<THost>>();
    store.set(instance, callbacks);

    const original = (instance as unknown as Record<LifecycleHookName, unknown>)[hookName];

    (instance as unknown as Record<LifecycleHookName, unknown>)[hookName] = function (...args: unknown[]) {
      callbacks?.forEach((callback) => {
        callback.apply(this as THost);
      });

      if (typeof original === 'function') {
        return (original as (...params: unknown[]) => unknown).apply(this, args);
      }

      return undefined;
    };
  }

  callbacks.add(handler);
};

const registerCleanup = <THost extends ListenHost>(instance: THost, cleanup: Cleanup): void => {
  let callbacks = cleanupRegistry.get(instance);

  if (!callbacks) {
    callbacks = new Set();
    cleanupRegistry.set(instance, callbacks);

    addLifecycleHook(instance, 'disconnectedCallback', function (this: THost) {
      const registered = cleanupRegistry.get(this);
      registered?.forEach((fn) => {
        try {
          fn();
        } catch (error) {
          console.error('[Listen] cleanup failed', error);
        }
      });
      cleanupRegistry.delete(this);
    });
  }

  callbacks.add(cleanup);
};

const resolveTarget = <THost extends ListenHost>(
  host: THost,
  target: ListenTargetResolver<THost> | undefined
): EventTarget | null => {
  if (typeof target === 'function') {
    return target(host) ?? null;
  }

  if (target instanceof EventTarget) {
    return target;
  }

  switch (target) {
    case 'document':
      return document;
    case 'window':
      return window;
    case 'light':
      return host;
    default:
      return host.renderRoot ?? host.shadowRoot ?? host;
  }
};

const normalizeOptions = <THost extends ListenHost, TElement extends Element, TEvent extends Event>(
  selectorOrOptions: string | ListenOptions<THost, TElement, TEvent> | undefined
): ListenOptions<THost, TElement, TEvent> => {
  if (typeof selectorOrOptions === 'string') {
    return { selector: selectorOrOptions };
  }

  return selectorOrOptions ?? {};
};

const buildOptions = <THost extends ListenHost, TElement extends Element, TEvent extends Event>(
  options: ListenOptions<THost, TElement, TEvent>
) => {
  return {
    selector: options.selector ?? null,
    target: options.target ?? 'shadow',
    prevent: options.prevent ?? false,
    stop: options.stop ?? false,
    stopImmediate: options.stopImmediate ?? false,
    once: options.once ?? false,
    passive: options.passive,
    capture: options.capture ?? false,
    when: options.when ?? null
  };
};

export function Listen<THost extends ListenHost, TEvent extends Event = Event, TElement extends Element = Element>(
  eventName: keyof HTMLElementEventMap | string,
  selectorOrOptions?: string | ListenOptions<THost, TElement, TEvent>
) {
  if (!eventName) {
    throw new Error('@Listen requires an event name.');
  }

  const listenConfig = buildOptions(normalizeOptions(selectorOrOptions));

  return (
    originalMethod: (this: THost, event: TEvent, matched?: TElement | null) => unknown,
    context: ClassMethodDecoratorContext<THost, typeof originalMethod>
  ): void => {
    context.addInitializer(function (this: THost) {
      let attached = false;

      const attach = () => {
        if (attached) {
          return;
        }

        const target = resolveTarget(this, listenConfig.target);

        if (!target || typeof (target as EventTarget).addEventListener !== 'function') {
          console.warn(`@Listen unable to resolve target for ${String(eventName)}`);
          return;
        }

        const eventOptions: AddEventListenerOptions = {
          capture: listenConfig.capture,
          once: listenConfig.once,
          passive: listenConfig.passive !== undefined ? listenConfig.passive : !listenConfig.prevent
        };

        const handler = (event: Event): void => {
          const typedEvent = event as TEvent;

          if (listenConfig.prevent) {
            typedEvent.preventDefault();
          }

          if (listenConfig.stopImmediate) {
            typedEvent.stopImmediatePropagation();
          } else if (listenConfig.stop) {
            typedEvent.stopPropagation();
          }

          let matched: TElement | null = null;

          if (listenConfig.selector) {
            const path = typedEvent.composedPath();
            matched =
              path.find(
                (node): node is TElement => node instanceof Element && node.matches(listenConfig.selector as string)
              ) ?? null;

            if (!matched) {
              return;
            }
          }

          if (listenConfig.when && !listenConfig.when(typedEvent, matched)) {
            return;
          }

          if (listenConfig.selector) {
            void originalMethod.call(this, typedEvent, matched);
          } else {
            const targetNode = (
              typedEvent.target instanceof Element ? (typedEvent.target as TElement) : null
            ) as TElement | null;
            void originalMethod.call(this, typedEvent, targetNode);
          }
        };

        target.addEventListener(eventName as string, handler, eventOptions);
        attached = true;

        registerCleanup(this, () => {
          target.removeEventListener(eventName as string, handler, eventOptions);
          attached = false;
        });
      };

      // IMPORTANT:
      // Many components are created inside templates/shadow DOM. At construction time they are often not connected yet,
      // and patching instance lifecycle callbacks is not reliably invoked by the platform.
      // Attach the listener ASAP (microtask) so it works for nested components as well.
      queueMicrotask(attach);

      // Best-effort attach on connect too (idempotent).
      addLifecycleHook(this, 'connectedCallback', attach);
    });
  };
}
