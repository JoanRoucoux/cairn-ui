import { Component, DestroyRef, ElementRef, effect, inject, signal, untracked } from '@angular/core';

import { UiToasts } from './toasts';

const DEFAULT_DURATION = 5000;

const TOAST_CLASSES =
  'pointer-events-auto max-w-[min(28rem,calc(100vw-2rem))] rounded-container bg-(--elevated) px-4 py-3 text-label text-(--foreground) shadow-[0_8px_24px_rgb(0_0_0/0.16),inset_0_0_0_1px_var(--border)] transition-[opacity,translate] duration-(--duration-base) ease-out starting:opacity-0 starting:translate-y-2 motion-reduce:starting:translate-y-0';

const readDuration = (host: HTMLElement): number => {
  const raw = getComputedStyle(host).getPropertyValue('--toast-duration').trim();
  const value = parseFloat(raw);

  if (Number.isNaN(value)) {
    return DEFAULT_DURATION;
  }

  return raw.endsWith('ms') ? value : value * 1000;
};

/**
 * Confirmation message shown by `UiToasts.show`: one at a time, no action, gone after `--toast-duration`.
 * Place it once in the app shell.
 *
 * @example
 * <ui-toaster />
 */
@Component({
  selector: 'ui-toaster',
  template: `
    @if (toasts.toast(); as toast) {
      <div
        animate.leave="ui-leave-fade"
        [class]="toastClasses"
        (focusin)="setFocused(true)"
        (focusout)="setFocused(false)"
        (mouseenter)="setHovered(true)"
        (mouseleave)="setHovered(false)"
      >
        {{ toast.text }}
      </div>
    }
  `,
  host: {
    role: 'status',
    class:
      'pointer-events-none fixed inset-x-0 z-50 flex justify-center bottom-[calc(52px+env(safe-area-inset-bottom)+8px)] lg:inset-x-auto lg:right-6 lg:bottom-6',
  },
})
export class UiToaster {
  protected readonly toasts = inject(UiToasts);
  protected readonly toastClasses = TOAST_CLASSES;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly hovered = signal(false);
  private readonly focused = signal(false);
  private lastId = 0;
  private remaining = DEFAULT_DURATION;
  private startedAt = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      const toast = this.toasts.toast();
      const paused = this.hovered() || this.focused();

      untracked(() => {
        if (!toast) {
          this.stop();
          return;
        }

        if (paused) {
          this.pause();
        } else {
          this.resume(toast.id);
        }
      });
    });

    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected setHovered(value: boolean): void {
    this.hovered.set(value);
  }

  protected setFocused(value: boolean): void {
    this.focused.set(value);
  }

  private resume(id: number): void {
    if (id !== this.lastId) {
      this.lastId = id;
      this.remaining = readDuration(this.host);
    }

    clearTimeout(this.timer);
    this.startedAt = Date.now();
    this.timer = setTimeout(() => this.toasts.dismiss(), this.remaining);
  }

  private pause(): void {
    if (this.timer !== undefined) {
      this.remaining -= Date.now() - this.startedAt;
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private stop(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.lastId = 0;
  }
}
