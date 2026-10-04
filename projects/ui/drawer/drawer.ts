import {
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { afterExit } from '@joanroucoux/cairn-ui/dialog';

import { DRAWER_STYLES } from './internal/drawer-styles';

/** What started a close, as `closed` reports it. */
export const DRAWER_CLOSE_REASONS = ['escape', 'backdrop', 'cross', 'programmatic'] as const;
export type DrawerCloseReason = (typeof DRAWER_CLOSE_REASONS)[number];

const nextId = (() => {
  let count = 0;

  return () => `ui-drawer-${++count}`;
})();

/**
 * Modal side panel on the native <dialog>, against the right edge at full height, for a detail opened from a list.
 *
 * Without `heading` it draws no header: the content brings its own title and close button, and `label` names it.
 *
 * @example
 * <ui-drawer heading="Northwind Monde" closeLabel="Fermer le détail" [open]="open()" (dismissed)="open.set(false)">
 *   <p>Body</p>
 * </ui-drawer>
 */
@Component({
  selector: 'ui-drawer',
  host: {
    '(pointerdown)': 'onPointerDown($event)',
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    <dialog
      class="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-(--drawer-width) max-w-full [scrollbar-width:none] flex-col gap-6 overflow-y-auto overscroll-contain bg-(--card) p-6 text-(--foreground) shadow-[-1px_0_0_var(--border),-24px_0_48px_rgb(0_0_0/0.12)] backdrop:bg-black/[0.36] open:flex"
      [attr.aria-busy]="busy() || null"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-label]="heading() ? null : label() || null"
      [attr.aria-labelledby]="heading() ? headingId : null"
      [style.--drawer-width]="width()"
      (cancel)="onCancel($event)"
      (close)="onNativeClose()"
    >
      @if (heading()) {
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 flex-col gap-0.5">
            <h2 class="text-title font-semibold text-pretty" [id]="headingId">{{ heading() }}</h2>

            @if (description()) {
              <p class="text-label text-(--muted-foreground)" [id]="descriptionId">{{ description() }}</p>
            }
          </div>

          @if (closeLabel()) {
            <button
              class="rounded-control -mt-1 -mr-2 grid size-9 flex-none cursor-pointer place-items-center text-(--muted-foreground) transition-[scale] duration-(--duration-press) ease-out outline-none hover:bg-(--glow) hover:text-(--foreground) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring) active:scale-(--press-scale) disabled:pointer-events-none disabled:opacity-40"
              type="button"
              [attr.aria-label]="closeLabel()"
              [disabled]="busy()"
              (click)="close('cross')"
            >
              <svg
                aria-hidden="true"
                class="block size-5 fill-none stroke-current stroke-[1.75]"
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

      <ng-content />
    </dialog>
  `,
  styles: DRAWER_STYLES,
})
export class UiDrawer {
  readonly heading = input<string>();
  readonly description = input<string>();
  readonly closeLabel = input<string>();
  readonly label = input<string>();
  readonly width = input('440px');
  readonly open = input(false, { transform: booleanAttribute });
  readonly busy = input(false, { transform: booleanAttribute });
  readonly dismissed = output<void>();
  readonly closed = output<DrawerCloseReason>();

  protected readonly headingId = nextId();
  protected readonly descriptionId = `${this.headingId}-description`;

  protected readonly describedBy = computed(() => (this.heading() && this.description() ? this.descriptionId : null));

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);

  #pressedOnBackdrop = false;
  #reason: DrawerCloseReason | null = null;
  #cancelExit: () => void = () => undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.#cancelExit());

    afterRenderEffect(() => {
      const drawer = this.#drawer;

      if (this.open() && !drawer.open) {
        this.#cancelExit();
        drawer.showModal();
      } else if (!this.open() && drawer.open) {
        this.close('programmatic');
      }
    });
  }

  protected close(reason: DrawerCloseReason): void {
    if (this.#drawer.open) {
      this.#reason = reason;
      this.#drawer.close();
    }
  }

  protected onCancel(event: Event): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    if (!this.busy()) {
      this.close('escape');
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.busy()) {
      event.preventDefault();
    }
  }

  protected onPointerDown(event: MouseEvent): void {
    this.#pressedOnBackdrop = event.target === this.#drawer && this.#outside(event);
  }

  protected onClick(event: MouseEvent): void {
    if (this.#pressedOnBackdrop && !this.busy() && event.target === this.#drawer && this.#outside(event)) {
      this.close('backdrop');
    }
    this.#pressedOnBackdrop = false;
  }

  protected onNativeClose(): void {
    const asked = this.#reason;

    this.#reason = null;
    if (this.#drawer.open) {
      return;
    }
    if (asked === null && this.busy()) {
      this.#drawer.showModal();
      return;
    }
    const reason = asked ?? 'escape';
    if (reason !== 'programmatic') {
      this.dismissed.emit();
    }
    this.#cancelExit();
    this.#cancelExit = afterExit(this.#drawer, () => {
      this.#cancelExit = () => undefined;
      this.closed.emit(reason);
    });
  }

  get #drawer(): HTMLDialogElement {
    return this.#host.nativeElement.querySelector('dialog') as HTMLDialogElement;
  }

  #outside(event: MouseEvent): boolean {
    const rect = this.#drawer.getBoundingClientRect();

    return (
      event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
    );
  }
}
