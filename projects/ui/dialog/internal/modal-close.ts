import { DestroyRef, ElementRef, type OutputEmitterRef, type Signal, afterRenderEffect, inject } from '@angular/core';

import { afterExit } from './dialog-exit';

type SharedReason = 'escape' | 'backdrop' | 'cross' | 'programmatic';

export type ModalCloseConfig<R extends string> = {
  readonly open: Signal<boolean>;
  readonly busy: Signal<boolean>;
  readonly dismissed: OutputEmitterRef<void>;
  readonly closed: OutputEmitterRef<R | SharedReason>;
  readonly reset?: () => void;
  readonly opening?: () => void;
};

/**
 * The close protocol of a modal on the native <dialog> under the host: `open` drives `showModal()` and `close()`,
 * Escape and a press-and-release on the veil close it unless `busy`, `dismissed` reports a close the user asked for
 * and `closed` its reason once the exit transition has played. `opening` runs just before `showModal()`. Must be
 * created in an injection context.
 */
export class ModalClose<R extends string> {
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly #config: ModalCloseConfig<R>;

  #pressedOnBackdrop = false;
  #reason: R | SharedReason | null = null;
  #cancelExit: () => void = () => undefined;

  constructor(config: ModalCloseConfig<R>) {
    this.#config = config;
    inject(DestroyRef).onDestroy(() => this.#cancelExit());

    afterRenderEffect(() => {
      const dialog = this.#dialog;

      if (config.open() && !dialog.open) {
        this.#cancelExit();
        config.reset?.();
        config.opening?.();
        dialog.showModal();
      } else if (!config.open() && dialog.open) {
        this.close('programmatic');
      }
    });
  }

  close(reason: R | SharedReason): void {
    if (this.#dialog.open) {
      this.#reason = reason;
      this.#dialog.close();
    }
  }

  onCancel(event: Event): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    if (!this.#config.busy()) {
      this.close('escape');
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.#config.busy()) {
      event.preventDefault();
    }
  }

  onPointerDown(event: MouseEvent): void {
    this.#pressedOnBackdrop = event.target === this.#dialog && this.#outside(event);
  }

  onClick(event: MouseEvent): void {
    if (this.#pressedOnBackdrop && !this.#config.busy() && event.target === this.#dialog && this.#outside(event)) {
      this.close('backdrop');
    }
    this.#pressedOnBackdrop = false;
  }

  onNativeClose(): void {
    const asked = this.#reason;

    this.#reason = null;
    if (this.#dialog.open) {
      return;
    }
    if (asked === null && this.#config.busy()) {
      this.#dialog.showModal();
      return;
    }
    const reason = asked ?? 'escape';
    if (reason !== 'programmatic') {
      this.#config.dismissed.emit();
    }
    this.#cancelExit();
    this.#cancelExit = afterExit(this.#dialog, () => {
      this.#cancelExit = () => undefined;
      this.#config.reset?.();
      this.#config.closed.emit(reason);
    });
  }

  get #dialog(): HTMLDialogElement {
    return this.#host.nativeElement.querySelector('dialog') as HTMLDialogElement;
  }

  #outside(event: MouseEvent): boolean {
    const rect = this.#dialog.getBoundingClientRect();

    return (
      event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
    );
  }
}
