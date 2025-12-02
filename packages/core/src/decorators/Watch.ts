type RenderHost = HTMLElement & {
  requestRender?(): void;
  render?(): void;
};

const renderQueue = new WeakMap<RenderHost, boolean>();

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
    renderQueue.set(instance, false);

    instance.render?.();
  });
};

const defaultCompare = <TValue>(previous: TValue, next: TValue): boolean => previous === next;

interface WatchOptions<TValue, THost extends RenderHost> {
  compare?: (previous: TValue, next: TValue) => boolean;
  onChange?: (this: THost, next: TValue, previous: TValue) => void;
  transform?: (this: THost, initial: TValue) => TValue;
}

export function Watch<TValue, THost extends RenderHost = RenderHost>(options: WatchOptions<TValue, THost> = {}) {
  const { compare = defaultCompare, onChange, transform } = options;

  return (
    accessor: ClassAccessorDecoratorTarget<THost, TValue>,
    context: ClassAccessorDecoratorContext<THost, TValue>
  ): ClassAccessorDecoratorResult<THost, TValue> => {
    if (context.kind !== 'accessor') {
      throw new Error('@Watch requires the "accessor" keyword on the property.');
    }

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

        if (onChange) {
          onChange.call(this, value, previous);
        }

        scheduleRender(this);
      },
      init(this: THost, initialValue: TValue): TValue {
        if (transform) {
          return transform.call(this, initialValue);
        }

        return initialValue;
      }
    };
  };
}
