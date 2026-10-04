import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { afterExit } from './internal/dialog-exit';
import { DIALOG_STYLES } from './internal/dialog-styles';
import { SheetDrag } from './internal/sheet-drag';

/** Named dialog widths; any other CSS length is accepted as is. */
export const DIALOG_WIDTHS = ['md', 'lg'] as const;
export type DialogWidth = (typeof DIALOG_WIDTHS)[number];

const WIDTH_VALUES: Record<DialogWidth, string> = {
  md: '28rem',
  lg: '560px',
};

/** `confirm` is a short alertdialog: no cross, no hairlines, one 24px padding, 440px wide unless told otherwise. */
export const DIALOG_VARIANTS = ['default', 'confirm'] as const;
export type DialogVariant = (typeof DIALOG_VARIANTS)[number];

/** `full` makes the sheet under `64rem` fill the screen below the status area; `fit` sizes it to its content. */
export const DIALOG_SHEETS = ['fit', 'full'] as const;
export type DialogSheet = (typeof DIALOG_SHEETS)[number];

type VariantClasses = {
  handle: string;
  header: string;
  body: string;
  footer: string;
};

const VARIANTS: Record<DialogVariant, VariantClasses> = {
  default: {
    handle: 'pt-[7.5px]',
    header: 'pb-3 lg:py-4 lg:pl-6',
    body: 'py-4 lg:py-5',
    footer: 'pt-3 empty:hidden lg:py-4',
  },
  confirm: {
    handle: 'pt-[11.5px]',
    header: 'pt-3 lg:pt-6 lg:pl-6',
    body: 'pt-3',
    footer: 'pt-5 lg:pt-6 lg:pb-6 empty:pt-0',
  },
};

const DEFAULT_WIDTHS: Record<DialogVariant, string> = {
  default: 'lg',
  confirm: '440px',
};

/** What started a close, as `closed` reports it. */
export const DIALOG_CLOSE_REASONS = ['escape', 'backdrop', 'cross', 'drag', 'programmatic'] as const;
export type DialogCloseReason = (typeof DIALOG_CLOSE_REASONS)[number];

const nextId = (() => {
  let count = 0;

  return () => `ui-dialog-${++count}`;
})();

/**
 * Modal dialog on the native <dialog>: a bottom sheet under `64rem`, centered above it.
 *
 * `busy` keeps it open while its action runs: Escape, a backdrop click and a sheet drag do nothing
 * and the cross is disabled. The owner disables its own buttons and still closes it through `open`.
 *
 * @example
 * <ui-dialog heading="Buy" description="Ferrari" closeLabel="Close" width="528px" [open]="buying()" (dismissed)="buying.set(false)">
 *   <p>Body</p>
 *   <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="buying.set(false)">Cancel</button>
 *   <button dialogActions ui-button>Buy 40 shares</button>
 * </ui-dialog>
 */
@Component({
  selector: 'ui-dialog',
  host: {
    '(pointerdown)': 'onPointerDown($event)',
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    <dialog
      #dlg
      [attr.aria-busy]="busy() || null"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-labelledby]="headingId"
      [attr.role]="variant() === 'confirm' ? 'alertdialog' : 'dialog'"
      [class]="classes()"
      [style.--dialog-width]="widthValue()"
      (cancel)="onCancel($event)"
      (close)="onNativeClose()"
    >
      <div
        aria-hidden="true"
        class="flex h-5 touch-none justify-center lg:hidden"
        data-dialog-handle
        [class]="spec().handle"
      >
        <span class="rounded-pill h-[5px] w-9 bg-(--border)"></span>
      </div>

      <div data-dialog-header [class]="headerClasses()">
        <div class="flex min-w-0 flex-1 flex-col" [class.max-lg:pt-1]="description()">
          <h2 class="text-title font-semibold" [id]="headingId">{{ heading() }}</h2>

          @if (description()) {
            <p
              class="text-label text-(--muted-foreground)"
              [class.truncate]="truncateDescription()"
              [id]="descriptionId"
            >
              {{ description() }}
            </p>
          }
        </div>

        @if (closeLabel()) {
          <button
            type="button"
            [attr.aria-label]="closeLabel()"
            [class]="crossClasses"
            [disabled]="busy()"
            (click)="close('cross')"
          >
            <svg
              aria-hidden="true"
              class="block size-[22px] fill-none stroke-current stroke-[1.75]"
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

      <div
        class="min-h-0 flex-1 overflow-y-auto px-4 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring) lg:px-6"
        data-dialog-body
        [attr.aria-labelledby]="scrollable() ? headingId : null"
        [attr.role]="scrollable() ? 'region' : null"
        [attr.tabindex]="scrollable() ? 0 : null"
        [id]="bodyId"
      >
        <div class="flex flex-col gap-4 empty:hidden" [class]="spec().body">
          <ng-content />
        </div>
      </div>

      <div data-dialog-footer [class]="footerClasses()">
        <ng-content select="[dialogActions]" />
      </div>
    </dialog>
  `,
  styles: DIALOG_STYLES,
})
export class UiDialog {
  readonly heading = input.required<string>();
  readonly description = input<string>();
  readonly closeLabel = input<string>();
  readonly variant = input<DialogVariant>('default');
  readonly sheet = input<DialogSheet>('fit');
  readonly truncateDescription = input(false, { transform: booleanAttribute });
  readonly width = input<DialogWidth | (string & {})>();
  readonly open = input(false, { transform: booleanAttribute });
  readonly busy = input(false, { transform: booleanAttribute });
  readonly dismissed = output<void>();
  readonly closed = output<DialogCloseReason>();

  protected readonly headingId = nextId();
  protected readonly descriptionId = `${this.headingId}-description`;
  protected readonly bodyId = `${this.headingId}-body`;
  protected readonly scrollable = signal(false);

  protected readonly describedBy = computed(() => {
    if (this.description()) {
      return this.descriptionId;
    }

    return this.variant() === 'confirm' ? this.bodyId : null;
  });

  protected readonly widthValue = computed(() => {
    const width = this.width() ?? DEFAULT_WIDTHS[this.variant()];

    return Object.hasOwn(WIDTH_VALUES, width) ? WIDTH_VALUES[width as DialogWidth] : width;
  });

  protected readonly spec = computed(() => VARIANTS[this.variant()]);

  protected readonly hairlines = computed(() => Boolean(this.closeLabel()) && this.variant() === 'default');

  protected readonly headerClasses = computed(
    () =>
      `flex items-start gap-2 pl-4 max-lg:touch-none lg:gap-3 ${this.spec().header} ${this.closeLabel() ? 'pr-2 lg:pr-4' : 'pr-4 lg:pr-6'} ${this.hairlines() ? 'shadow-[inset_0_-1px_0_var(--hairline)]' : ''}`,
  );

  protected readonly crossClasses =
    'rounded-pill lg:rounded-control grid size-11 flex-none cursor-pointer place-items-center text-(--muted-foreground) transition-[scale,background-color,color] [transition-duration:var(--duration-press),var(--duration-fast),var(--duration-fast)] ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--ring) active:scale-(--press-scale) active:bg-(--soft) disabled:pointer-events-none disabled:opacity-40 lg:size-9 lg:hover:bg-(--glow) lg:hover:text-(--foreground)';

  protected readonly footerClasses = computed(
    () =>
      `max-lg:[&>[ui-button]]:text-body flex justify-end gap-2 px-4 pb-[calc(8px+env(safe-area-inset-bottom))] max-lg:flex-col-reverse max-lg:[&>[ui-button]]:h-[50px] max-lg:[&>[ui-button]]:w-full lg:px-6 ${this.spec().footer} ${this.hairlines() ? 'shadow-[inset_0_1px_0_var(--hairline)]' : ''}`,
  );

  protected readonly classes = computed(
    () =>
      `open:flex w-full flex-col overflow-hidden m-auto mt-auto max-lg:max-h-[calc(100dvh-2rem)] lg:max-h-[calc(100dvh-96px)] max-lg:mb-0 max-lg:max-w-none max-lg:rounded-b-none lg:max-w-(--dialog-width) rounded-container bg-(--card) text-(--foreground) shadow-[0_0_0_1px_var(--border),0_24px_64px_rgb(0_0_0/0.24)] max-lg:shadow-[0_-1px_0_var(--border),0_-12px_32px_rgb(0_0_0/0.16)] backdrop:bg-black/[0.36] ${this.sheet() === 'full' ? 'max-lg:h-[calc(100dvh-58px)]' : ''}`,
  );

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const host = this.#host.nativeElement;
      const grips = ['[data-dialog-handle]', '[data-dialog-header]'].map(
        (grip) => host.querySelector(grip) as HTMLElement,
      );

      this.#drag = new SheetDrag(
        this.#dialog,
        grips,
        () => this.close('drag'),
        () => !this.busy(),
      );
      destroyRef.onDestroy(() => {
        this.#drag?.destroy();
        this.#cancelExit();
      });

      if (typeof ResizeObserver === 'undefined') {
        return;
      }

      const body = this.#host.nativeElement.querySelector('[data-dialog-body]') as HTMLElement;
      const observer = new ResizeObserver(() => this.scrollable.set(body.scrollHeight > body.clientHeight));

      observer.observe(body);
      observer.observe(body.firstElementChild as Element);
      destroyRef.onDestroy(() => observer.disconnect());
    });

    afterRenderEffect(() => {
      const dialog = this.#host.nativeElement.querySelector('dialog') as HTMLDialogElement;

      if (this.open() && !dialog.open) {
        this.#cancelExit();
        this.#drag?.reset();
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        this.close('programmatic');
      }
    });
  }

  #pressedOnBackdrop = false;
  #drag: SheetDrag | null = null;
  #reason: DialogCloseReason | null = null;
  #cancelExit: () => void = () => undefined;

  protected close(reason: DialogCloseReason): void {
    if (this.#dialog.open) {
      this.#reason = reason;
      this.#dialog.close();
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
    this.#pressedOnBackdrop = event.target === this.#dialog && this.#outside(event);
  }

  protected onClick(event: MouseEvent): void {
    if (this.#pressedOnBackdrop && !this.busy() && event.target === this.#dialog && this.#outside(event)) {
      this.close('backdrop');
    }
    this.#pressedOnBackdrop = false;
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

  protected onNativeClose(): void {
    const asked = this.#reason;

    this.#reason = null;
    if (this.#dialog.open) {
      return;
    }
    if (asked === null && this.busy()) {
      this.#dialog.showModal();
      return;
    }
    const reason = asked ?? 'escape';
    if (reason !== 'programmatic') {
      this.dismissed.emit();
    }
    this.#awaitExit(reason);
  }

  #awaitExit(reason: DialogCloseReason): void {
    this.#cancelExit();
    this.#cancelExit = afterExit(this.#dialog, () => {
      this.#cancelExit = () => undefined;
      this.#drag?.reset();
      this.closed.emit(reason);
    });
  }
}
