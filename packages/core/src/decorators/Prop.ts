type RenderHost = HTMLElement & {
  requestRender?(): void;
  render?(): void;
  connectedCallback?(): void;
  disconnectedCallback?(...args: unknown[]): void;
};

type PropTypeDescriptor =
  | BooleanConstructor
  | NumberConstructor
  | StringConstructor
  | ObjectConstructor
  | ArrayConstructor
  | 'boolean'
  | 'number'
  | 'string'
  | 'json';

type Formatter<TValue, THost extends RenderHost> = (this: THost, value: TValue) => string | null | undefined;
type Parser<TValue, THost extends RenderHost> = (this: THost, value: string | null) => TValue;

interface PropOptions<TValue, THost extends RenderHost> {
  attribute?: string;
  reflect?: boolean;
  type?: PropTypeDescriptor;
  parse?: Parser<TValue, THost>;
  format?: Formatter<TValue, THost>;
  defaultValue?: TValue | ((this: THost) => TValue);
  compare?: (previous: TValue, next: TValue) => boolean;
  onChange?: (this: THost, next: TValue, previous: TValue) => void;
  onAttributeChange?: (this: THost, next: TValue, previous: TValue) => void;
}

interface AttributeObserverEntry {
  observer: MutationObserver;
  callbacks: Map<string, Set<(value: string | null) => void>>;
}

const renderQueue = new WeakMap<RenderHost, boolean>();
const cleanupRegistry = new WeakMap<RenderHost, Set<() => void>>();
const observerRegistry = new WeakMap<RenderHost, AttributeObserverEntry>();
const internalMutations = new WeakMap<RenderHost, Set<string>>();

const scheduleRender = (instance: RenderHost): void => {
  if (typeof instance.requestRender === 'function') {
    instance.requestRender();
    return;
  }

  if (typeof instance.render !== 'function') {
    return;
  }

  if (renderQueue.get(instance)) {
    return;
  }

  renderQueue.set(instance, true);

  requestAnimationFrame(() => {
    renderQueue.delete(instance);
    instance.render?.();
  });
};

const toKebabCase = (value: PropertyKey): string =>
  String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();

const registerCleanup = (instance: RenderHost, cleanup: () => void): void => {
  let callbacks = cleanupRegistry.get(instance);

  if (!callbacks) {
    callbacks = new Set();
    cleanupRegistry.set(instance, callbacks);

    const original = instance.disconnectedCallback;

    instance.disconnectedCallback = function (this: RenderHost, ...args: unknown[]) {
      const registered = cleanupRegistry.get(this);
      registered?.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error('[Prop] cleanup failed', error);
        }
      });
      cleanupRegistry.delete(this);

      if (typeof original === 'function') {
        return original.apply(this, args as []);
      }

      return undefined;
    } as typeof instance.disconnectedCallback;
  }

  callbacks.add(cleanup);
};

const markInternalMutation = (host: RenderHost, attribute: string): void => {
  let attributes = internalMutations.get(host);

  if (!attributes) {
    attributes = new Set();
    internalMutations.set(host, attributes);
  }

  attributes.add(attribute);
};

const isInternalMutation = (host: RenderHost, attribute: string): boolean => {
  const attributes = internalMutations.get(host);

  if (!attributes) {
    return false;
  }

  const hasAttribute = attributes.has(attribute);

  if (hasAttribute) {
    attributes.delete(attribute);
    if (attributes.size === 0) {
      internalMutations.delete(host);
    }
  }

  return hasAttribute;
};

const observeAttribute = (host: RenderHost, attribute: string, handler: (value: string | null) => void): void => {
  let entry = observerRegistry.get(host);

  if (!entry) {
    const callbacks = new Map<string, Set<(value: string | null) => void>>();
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        const attributeName = record.attributeName;

        if (!attributeName) {
          return;
        }

        if (isInternalMutation(host, attributeName)) {
          return;
        }

        const listeners = callbacks.get(attributeName);
        if (!listeners) {
          return;
        }

        const currentValue = (record.target as Element).getAttribute(attributeName);

        for (const listener of listeners) {
          listener(currentValue);
        }
      });
    });

    observer.observe(host, { attributes: true });

    entry = { observer, callbacks };
    observerRegistry.set(host, entry);

    registerCleanup(host, () => {
      observer.disconnect();
      observerRegistry.delete(host);
    });
  }

  let listeners = entry.callbacks.get(attribute);

  if (!listeners) {
    listeners = new Set();
    entry.callbacks.set(attribute, listeners);
  }

  listeners.add(handler);
};

const updateAttribute = (host: RenderHost, attribute: string, value: string | null | undefined | boolean): void => {
  markInternalMutation(host, attribute);

  if (value === undefined || value === null || value === false) {
    host.removeAttribute(attribute);
    return;
  }

  if (value === true) {
    host.setAttribute(attribute, '');
    return;
  }

  host.setAttribute(attribute, String(value));
};

const resolveType = (type: PropTypeDescriptor | undefined): 'boolean' | 'number' | 'json' | 'string' | null => {
  if (!type) {
    return null;
  }

  if (type === Boolean || type === 'boolean') {
    return 'boolean';
  }

  if (type === Number || type === 'number') {
    return 'number';
  }

  if (type === Object || type === Array || type === 'json') {
    return 'json';
  }

  return 'string';
};

const typeParsers: Record<'boolean' | 'number' | 'json' | 'string', Parser<unknown, RenderHost>> = {
  boolean(value: string | null): boolean {
    return value !== null;
  },
  number(value: string | null): number | null {
    if (value === null || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  },
  json(value: string | null): unknown {
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn('[Prop] failed to parse JSON attribute', error);
      return null;
    }
  },
  string(value: string | null): string | null {
    return value;
  }
};

const typeFormatters: Record<'boolean' | 'number' | 'json' | 'string', Formatter<unknown, RenderHost>> = {
  boolean(value: unknown): string | null {
    return value ? '' : null;
  },
  number(value: unknown): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return String(value);
  },
  json(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  },
  string(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    return String(value);
  }
};

const defaultCompare = <TValue>(previous: TValue, next: TValue): boolean => previous === next;

export function Prop<TValue, THost extends RenderHost = RenderHost>(options: PropOptions<TValue, THost> = {}) {
  const {
    attribute,
    reflect = true,
    type,
    parse,
    format,
    defaultValue,
    compare = defaultCompare,
    onChange,
    onAttributeChange
  } = options;

  const resolvedType = resolveType(type);

  const parseValue: Parser<TValue, THost> = parse
    ? parse
    : function (this: THost, value) {
        if (!resolvedType) {
          return value as unknown as TValue;
        }
        return typeParsers[resolvedType].call(this, value) as TValue;
      };

  const formatValue: Formatter<TValue, THost> = format
    ? format
    : function (this: THost, value) {
        if (!resolvedType) {
          return (value as unknown as string | null | undefined) ?? null;
        }
        return typeFormatters[resolvedType].call(this, value as unknown) as string | null;
      };

  return (
    accessor: ClassAccessorDecoratorTarget<THost, TValue>,
    context: ClassAccessorDecoratorContext<THost, TValue>
  ): ClassAccessorDecoratorResult<THost, TValue> => {
    if (context.kind !== 'accessor') {
      throw new Error('@Prop requires the "accessor" keyword on the property.');
    }

    const attributeName = attribute ?? toKebabCase(context.name);

    context.addInitializer(function (this: THost) {
      if (!reflect) {
        return;
      }

      observeAttribute(this, attributeName, (rawValue) => {
        if (isInternalMutation(this, attributeName)) {
          return;
        }

        const parsed = parseValue.call(this, rawValue);
        const previous = accessor.get.call(this);

        if (compare(previous, parsed)) {
          return;
        }

        accessor.set.call(this, parsed);

        onAttributeChange?.call(this, parsed, previous);
        scheduleRender(this);
      });
    });

    return {
      get(this: THost): TValue {
        return accessor.get.call(this);
      },
      set(this: THost, value: TValue): void {
        const previous = accessor.get.call(this);

        if (compare(previous, value)) {
          return;
        }

        accessor.set.call(this, value);

        if (reflect) {
          const formatted = formatValue.call(this, value);
          updateAttribute(this, attributeName, formatted);
        }

        onChange?.call(this, value, previous);
        scheduleRender(this);
      },
      init(this: THost, initialValue: TValue): TValue {
        let value = initialValue;

        if (this.hasAttribute(attributeName)) {
          value = parseValue.call(this, this.getAttribute(attributeName));
        } else if (value === undefined && defaultValue !== undefined) {
          value =
            typeof defaultValue === 'function' ? (defaultValue as (this: THost) => TValue).call(this) : defaultValue;
        }

        if (reflect) {
          const formatted = formatValue.call(this, value);
          updateAttribute(this, attributeName, formatted);
        }

        return value;
      }
    };
  };
}
