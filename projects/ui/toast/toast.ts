import { Component, DestroyRef, ElementRef, afterNextRender, effect, inject, signal, untracked } from '@angular/core';

import { UiToasts } from './toasts';

const DEFAULT_DURATION = 5000;

const TOAST_CLASSES =
  'pointer-events-auto flex min-h-11 min-w-[min(280px,calc(100vw-2rem))] max-w-[min(400px,calc(100vw-2rem))] items-center gap-2.5 rounded-container bg-(--primary) px-4 py-3 text-label font-medium text-(--primary-foreground) shadow-[0_8px_24px_rgb(0_0_0/0.16)] transition-[opacity,translate] duration-(--duration-base) ease-out starting:opacity-0 starting:translate-y-2 motion-reduce:starting:translate-y-0';

const CLOSE_CLASSES =
  'relative grid size-7 flex-none cursor-pointer place-items-center -my-1 -mr-2 rounded-[calc(var(--radius-control)-2px)] text-(--primary-foreground) outline-none hover:bg-[rgb(127_127_127/0.2)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--primary-foreground) after:absolute after:-inset-2 pointer-fine:after:-inset-1';

const readDuration = (host: HTMLElement): number => {
  const raw = getComputedStyle(host).getPropertyValue('--toast-duration').trim();
  const value = parseFloat(raw);

  if (Number.isNaN(value)) {
    return DEFAULT_DURATION;
  }

  return raw.endsWith('ms') ? value : value * 1000;
};

/**
 * Message shown by `UiToasts`: one at a time, no action. A confirmation (`show`) is gone after `--toast-duration`;
 * an error (`showError`) stays until its cross is clicked. Centred at the bottom of the content area: from `64rem`
 * between `--sidebar-width` (0 when unset) and the right edge.
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
        <svg
          aria-hidden="true"
          class="block size-4 flex-none fill-none stroke-current stroke-2"
          stroke-linecap="round"
          stroke-linejoin="round"
          viewBox="0 0 24 24"
        >
          @if (toast.kind === 'error') {
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          } @else {
            <path d="M20 6 9 17l-5-5" />
          }
        </svg>
        <span class="min-w-0 flex-1 text-pretty">{{ toast.text }}</span>
        @if (toast.kind === 'error') {
          <button type="button" [attr.aria-label]="toast.closeLabel" [class]="closeClasses" (click)="toasts.dismiss()">
            <svg
              aria-hidden="true"
              class="block size-4 flex-none fill-none stroke-current stroke-2"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        }
      </div>
    }
  `,
  host: {
    role: 'status',
    popover: 'manual',
    class:
      'pointer-events-none fixed inset-x-0 top-auto m-0 flex h-auto w-auto justify-center overflow-visible border-0 bg-transparent p-0 bottom-[calc(var(--tab-bar-height,calc(52px+env(safe-area-inset-bottom)))+var(--action-bar-height,0px)+8px)] lg:left-[var(--sidebar-width,0px)] lg:bottom-6',
  },
})
export class UiToaster {
  protected readonly toasts = inject(UiToasts);
  protected readonly toastClasses = TOAST_CLASSES;
  protected readonly closeClasses = CLOSE_CLASSES;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly hovered = signal(false);
  private popoverShown = false;
  private readonly focused = signal(false);
  private lastId = 0;
  private raisedId = 0;
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
          this.hovered.set(false);
          this.focused.set(false);
          return;
        }

        if (toast.id !== this.raisedId) {
          this.raisedId = toast.id;
          this.raise();
        }
        this.host.querySelectorAll('.ui-leave-fade').forEach((leaving) => leaving.remove());

        if (toast.kind === 'error') {
          this.stop();
        } else if (paused) {
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

    inject(DestroyRef).onDestroy(() => {
      this.stop();
    });
  }

  protected setHovered(value: boolean): void {
    this.hovered.set(value);
  }

  protected setFocused(value: boolean): void {
    this.focused.set(value);
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
