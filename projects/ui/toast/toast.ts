import { Component, DestroyRef, ElementRef, afterNextRender, effect, inject, signal, untracked } from '@angular/core';

import { UiToasts } from './toasts';

const DEFAULT_DURATION = 4000;

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
        (mouseenter)="setHovered(true)"
        (mouseleave)="setHovered(false)"
      >
        {{ toast.text }}
      </div>
    }
  `,
  host: {
    role: 'status',
    popover: 'manual',
    class:
      'pointer-events-none fixed inset-x-0 top-auto z-50 m-0 flex h-auto w-auto justify-center overflow-visible border-0 bg-transparent p-0 bottom-[calc(var(--tab-bar-height,calc(52px+env(safe-area-inset-bottom)))+var(--action-bar-height,0px)+8px)] lg:inset-x-auto lg:right-6 lg:bottom-6',
  },
})
export class UiToaster {
  protected readonly toasts = inject(UiToasts);
  protected readonly toastClasses = TOAST_CLASSES;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly hovered = signal(false);
  private popoverShown = false;
  private lastId = 0;
  private remaining = DEFAULT_DURATION;
  private startedAt = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      const toast = this.toasts.toast();
      const paused = this.hovered();

      untracked(() => {
        if (!toast) {
          this.stop();
          this.hovered.set(false);
          return;
        }

        this.raise();
        this.host.querySelectorAll('.ui-leave-fade').forEach((leaving) => leaving.remove());

        if (paused) {
          this.pause();
        } else {
          this.resume(toast.id);
        }
      });
    });

    afterNextRender(() => {
      this.host.showPopover();
      this.popoverShown = true;
    });

    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected setHovered(value: boolean): void {
    this.hovered.set(value);
  }

  private raise(): void {
    if (this.popoverShown) {
      this.host.hidePopover();
      this.host.showPopover();
    }
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
