export interface DismissContext {
  owner: HTMLElement;
  content?: HTMLElement | null;
  triggers?: Array<HTMLElement | null | undefined>;
}

export interface DismissControllerOptions {
  onDismiss: (event: Event) => void;
}

export class DismissController {
  #onDismiss: (event: Event) => void;
  #context: {
    owner: HTMLElement;
    content: HTMLElement | null;
    triggers: HTMLElement[];
  } | null = null;
  #active = false;

  constructor(options: DismissControllerOptions) {
    this.#onDismiss = options.onDismiss;
  }

  connect(context: DismissContext): void {
    this.#context = {
      owner: context.owner,
      content: context.content ?? null,
      triggers: (context.triggers ?? []).filter((el): el is HTMLElement => el instanceof HTMLElement)
    };

    if (!this.#active) {
      document.addEventListener('pointerdown', this.#handlePointerDown, true);
      document.addEventListener('keydown', this.#handleKeyDown, true);
      this.#active = true;
    }
  }

  disconnect(): void {
    if (!this.#active) {
      return;
    }

    document.removeEventListener('pointerdown', this.#handlePointerDown, true);
    document.removeEventListener('keydown', this.#handleKeyDown, true);
    this.#active = false;
    this.#context = null;
  }

  #handlePointerDown = (event: PointerEvent): void => {
    if (!this.#context) {
      return;
    }

    const { owner, content, triggers } = this.#context;
    const path = event.composedPath();

    if (path.some((node) => node instanceof Element && node.hasAttribute('data-select-ignore'))) {
      return;
    }

    if (path.includes(owner)) {
      return;
    }

    if (content && path.includes(content)) {
      return;
    }

    if (triggers.some((trigger) => path.includes(trigger))) {
      return;
    }

    this.#onDismiss(event);
  };

  #handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || !this.#context) {
      return;
    }

    event.preventDefault();

    const active = document.activeElement as HTMLElement | null;

    if (!active) {
      this.#onDismiss(event);
      return;
    }

    const { owner, content, triggers } = this.#context;
    const path = event.composedPath();

    if (path.includes(owner) || owner.contains(active)) {
      this.#onDismiss(event);
      return;
    }

    if (content && (path.includes(content) || content.contains(active))) {
      this.#onDismiss(event);
      return;
    }

    if (triggers.some((trigger) => path.includes(trigger) || trigger.contains(active))) {
      this.#onDismiss(event);
    }
  };
}
