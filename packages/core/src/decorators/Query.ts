type QueryRoot = 'shadow' | 'light' | 'document';

type QueryHost = HTMLElement & {
  renderRoot?: ShadowRoot | DocumentFragment | HTMLElement;
};

type QueryFallback<TResult, THost extends QueryHost> = TResult | ((host: THost) => TResult);

interface BaseQueryOptions<TResult, THost extends QueryHost> {
  from?: QueryRoot;
  fallback?: QueryFallback<TResult, THost>;
}

interface QueryAllOptions<TElement extends Element, THost extends QueryHost>
  extends BaseQueryOptions<TElement[], THost> {
  all: true;
  closest?: false;
}

interface QueryClosestOptions<THost extends QueryHost> extends BaseQueryOptions<Element | null, THost> {
  closest: true;
  all?: false;
}

interface QuerySingleOptions<TElement extends Element, THost extends QueryHost>
  extends BaseQueryOptions<TElement | null, THost> {
  all?: false;
  closest?: false;
}

type QueryOptions<TElement extends Element, THost extends QueryHost> =
  | QueryAllOptions<TElement, THost>
  | QueryClosestOptions<THost>
  | QuerySingleOptions<TElement, THost>;

type QueryReturnType<
  TElement extends Element,
  THost extends QueryHost,
  TOptions extends QueryOptions<TElement, THost>
> = TOptions extends QueryAllOptions<TElement, THost>
  ? TElement[]
  : TOptions extends QueryClosestOptions<THost>
    ? Element | null
    : TElement | null;

type QueryDecorator<
  TElement extends Element,
  THost extends QueryHost,
  TOptions extends QueryOptions<TElement, THost>
> = (
  target: ClassAccessorDecoratorTarget<THost, QueryReturnType<TElement, THost, TOptions>> | undefined,
  context:
    | ClassFieldDecoratorContext<THost, QueryReturnType<TElement, THost, TOptions>>
    | ClassAccessorDecoratorContext<THost, QueryReturnType<TElement, THost, TOptions>>
) => ClassAccessorDecoratorResult<THost, QueryReturnType<TElement, THost, TOptions>> | undefined;

const defaultOptions = {
  all: false,
  closest: false,
  from: 'shadow' as QueryRoot | undefined,
  fallback: null
} as const satisfies QuerySingleOptions<Element, QueryHost>;

const resolveFallback = <TResult, THost extends QueryHost>(
  fallback: QueryFallback<TResult, THost> | undefined,
  host: THost
): TResult | undefined => {
  if (typeof fallback === 'function') {
    return (fallback as (instance: THost) => TResult)(host);
  }

  return fallback;
};

const resolveRoot = (host: QueryHost, option: QueryRoot | undefined): ParentNode | null => {
  switch (option) {
    case 'document':
      return document;
    case 'light':
      return host;
    default:
      return host.renderRoot ?? host.shadowRoot ?? host;
  }
};

const resolveQuery = <
  TElement extends Element,
  THost extends QueryHost,
  TOptions extends QueryOptions<TElement, THost>
>(
  host: THost,
  selector: string,
  options: TOptions
) => {
  if (options.closest) {
    const result = host.closest(selector);
    return result ?? resolveFallback(options.fallback as QueryFallback<Element | null, THost>, host) ?? null;
  }

  const root = resolveRoot(host, options.from);

  if (!root) {
    return options.all
      ? (resolveFallback(options.fallback as QueryFallback<TElement[], THost>, host) ?? [])
      : (resolveFallback(options.fallback as QueryFallback<TElement | null, THost>, host) ?? null);
  }

  if (options.all) {
    const elements = Array.from(root.querySelectorAll<TElement>(selector));
    return elements.length > 0
      ? elements
      : (resolveFallback(options.fallback as QueryFallback<TElement[], THost>, host) ?? []);
  }

  const match = root.querySelector<TElement>(selector);
  return match ?? resolveFallback(options.fallback as QueryFallback<TElement | null, THost>, host) ?? null;
};

const createQueryDecorator = <
  TElement extends Element,
  THost extends QueryHost,
  TOptions extends QueryOptions<TElement, THost>
>(
  selector: string,
  options: TOptions
): QueryDecorator<TElement, THost, TOptions> => {
  type Result = QueryReturnType<TElement, THost, TOptions>;

  return (
    _target: ClassAccessorDecoratorTarget<THost, Result> | undefined,
    context: ClassFieldDecoratorContext<THost, Result> | ClassAccessorDecoratorContext<THost, Result>
  ): ClassAccessorDecoratorResult<THost, Result> | undefined => {
    if (context.kind === 'accessor') {
      const descriptor: ClassAccessorDecoratorResult<THost, Result> = {
        get(this: THost) {
          return resolveQuery<TElement, THost, TOptions>(this, selector, options) as Result;
        },
        set(_value: Result) {
          // Readonly accessor
        }
      };
      return descriptor;
    }

    context.addInitializer(function (this: THost) {
      Object.defineProperty(this, context.name, {
        configurable: true,
        enumerable: true,
        get: () => resolveQuery<TElement, THost, TOptions>(this, selector, options) as Result
      });
    });

    return;
  };
};

export function Query<
  TElement extends Element,
  THost extends QueryHost,
  TOptions extends QueryOptions<TElement, THost>
>(selector: string, userOptions: TOptions): QueryDecorator<TElement, THost, TOptions>;

export function Query<TElement extends Element = Element, THost extends QueryHost = QueryHost>(
  selector: string
): QueryDecorator<TElement, THost, QuerySingleOptions<TElement, THost>>;

export function Query<TElement extends Element = Element, THost extends QueryHost = QueryHost>(
  selector: string,
  userOptions?: QueryOptions<TElement, THost>
) {
  if (!selector) {
    throw new Error('@Query requires a selector.');
  }

  if (userOptions) {
    const merged = { ...defaultOptions, ...userOptions } as QueryOptions<TElement, THost>;
    return createQueryDecorator<TElement, THost, typeof merged>(selector, merged);
  }

  const merged = defaultOptions as QuerySingleOptions<TElement, THost>;
  return createQueryDecorator<TElement, THost, typeof merged>(selector, merged);
}
