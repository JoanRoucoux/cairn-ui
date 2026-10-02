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

/** Named dialog widths; any other CSS length is accepted as is. `DialogWidth` is derived from this tuple. */
export const DIALOG_WIDTHS = ['md', 'lg'] as const;
export type DialogWidth = (typeof DIALOG_WIDTHS)[number];

const WIDTH_VALUES: Record<DialogWidth, string> = {
  md: '28rem',
  lg: '560px',
};

/** Spacing presets. `DialogLayout` is derived from this tuple. */
export const DIALOG_LAYOUTS = ['trade', 'form', 'list', 'confirm'] as const;
export type DialogLayout = (typeof DIALOG_LAYOUTS)[number];

type LayoutClasses = {
  dialog: string;
  header: string;
  title: string;
  cross: string;
  icon: string;
  handle: string;
  body: string;
  footer: string;
};

const LAYOUTS: Record<DialogLayout, LayoutClasses> = {
  trade: {
    dialog: '',
    header: 'items-start lg:pt-6',
    title: 'pt-1 lg:pt-0',
    cross: 'lg:-mt-1.5',
    icon: 'lg:size-5',
    handle: 'pt-[7.5px]',
    body: 'pt-3 pb-4 lg:pt-5 lg:pb-5',
    footer: 'max-lg:pb-[calc(8px+env(safe-area-inset-bottom))] lg:pb-6',
  },
  form: {
    dialog: '',
    header: 'items-center lg:pt-6',
    title: '',
    cross: '',
    icon: 'lg:size-[22px]',
    handle: 'pt-[7.5px]',
    body: 'pt-2 pb-5 lg:pt-4 lg:pb-5',
    footer: 'max-lg:pb-[calc(12px+env(safe-area-inset-bottom))] lg:pb-5',
  },
  list: {
    dialog: 'max-lg:h-[calc(100dvh-58px)] lg:mt-24 lg:mb-auto lg:max-h-[min(760px,calc(100dvh-96px-32px))]',
    header: 'items-center lg:pt-5',
    title: '',
    cross: '',
    icon: 'lg:size-[22px]',
    handle: 'pt-[7.5px]',
    body: 'pt-2 pb-4 lg:pt-4 lg:pb-5',
    footer: 'pt-3 shadow-[0_-1px_0_var(--hairline)] max-lg:pb-[calc(8px+env(safe-area-inset-bottom))] lg:pt-4 lg:pb-4',
  },
  confirm: {
    dialog: '',
    header: 'items-center pt-3 lg:pt-6',
    title: '',
    cross: '',
    icon: 'lg:size-[22px]',
    handle: 'pt-[11.5px]',
    body: 'pt-3 pb-5 lg:pt-3 lg:pb-6',
    footer: 'max-lg:pb-[calc(8px+env(safe-area-inset-bottom))] lg:pb-6',
  },
};

/** What started a close, as `closed` reports it. `DialogCloseReason` is derived from this tuple. */
export const DIALOG_CLOSE_REASONS = ['escape', 'backdrop', 'cross', 'drag', 'programmatic'] as const;
export type DialogCloseReason = (typeof DIALOG_CLOSE_REASONS)[number];

const nextId = (() => {
  let count = 0;

  return () => `ui-dialog-${++count}`;
})();

/**
 * Modal dialog on the native <dialog>: a bottom sheet under `64rem`, centered above it.
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
  host: { '(pointerdown)': 'onPointerDown($event)', '(click)': 'onClick($event)' },
  template: `
    <dialog
      #dlg
      [attr.aria-describedby]="describedBy()"
      [attr.aria-labelledby]="headingId"
      [attr.role]="layout() === 'confirm' ? 'alertdialog' : 'dialog'"
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
        <div class="flex min-w-0 flex-1 flex-col" [class]="titleClasses()">
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
          <button type="button" [attr.aria-label]="closeLabel()" [class]="crossClasses()" (click)="close('cross')">
            <svg
              aria-hidden="true"
              class="block size-[22px] fill-none stroke-current stroke-[1.75]"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
              [class]="iconClasses()"
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
        <!-- empty:hidden keeps a body-less dialog from carrying the body's vertical padding. -->
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
  readonly layout = input<DialogLayout>('trade');
  readonly truncateDescription = input(false, { transform: booleanAttribute });
  readonly width = input<DialogWidth | (string & {})>('lg');
  readonly open = input(false, { transform: booleanAttribute });
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

    return this.layout() === 'confirm' ? this.bodyId : null;
  });

  protected readonly widthValue = computed(() => {
    const width = this.width();

    return Object.hasOwn(WIDTH_VALUES, width) ? WIDTH_VALUES[width as DialogWidth] : width;
  });

  protected readonly spec = computed(() => LAYOUTS[this.layout()]);

  protected readonly headerClasses = computed(
    () =>
      `flex gap-2 pl-4 max-lg:touch-none lg:gap-3 lg:pl-6 ${this.spec().header} ${this.closeLabel() ? 'pr-2 lg:pr-4' : 'pr-4 lg:pr-6'}`,
  );

  protected readonly titleClasses = computed(() => this.spec().title);

  protected readonly crossClasses = computed(
    () =>
      `rounded-pill lg:rounded-control grid size-11 flex-none cursor-pointer place-items-center text-(--muted-foreground) transition-[scale,background-color,color] [transition-duration:var(--duration-press),var(--duration-fast),var(--duration-fast)] ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--ring) active:scale-(--press-scale) active:bg-(--soft) lg:size-9 lg:hover:bg-(--glow) lg:hover:text-(--foreground) ${this.spec().cross}`,
  );

  protected readonly iconClasses = computed(() => this.spec().icon);

  protected readonly footerClasses = computed(
    () =>
      `max-lg:[&>[ui-button]]:text-body flex justify-end gap-2 px-4 empty:hidden max-lg:flex-col-reverse max-lg:[&>[ui-button]]:h-[50px] max-lg:[&>[ui-button]]:w-full lg:px-6 ${this.spec().footer}`,
  );

  protected readonly classes = computed(
    () =>
      `open:flex w-full flex-col overflow-hidden m-auto mt-auto max-h-[calc(100dvh-2rem)] max-lg:mb-0 max-lg:max-w-none max-lg:rounded-b-none lg:max-w-(--dialog-width) rounded-container bg-(--card) text-(--foreground) shadow-[0_0_0_1px_var(--border),0_24px_64px_rgb(0_0_0/0.24)] max-lg:shadow-[0_-1px_0_var(--border),0_-12px_32px_rgb(0_0_0/0.16)] backdrop:bg-black/[0.36] ${this.spec().dialog}`,
  );

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const host = this.#host.nativeElement;
      const grips = ['[data-dialog-handle]', '[data-dialog-header]'].map(
        (grip) => host.querySelector(grip) as HTMLElement,
      );

      this.#drag = new SheetDrag(this.#dialog, grips, () => this.close('drag'));
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
      // viewChild.required can't target a #private field (NG1053); safe because the template has exactly one <dialog>.
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
    this.close('escape');
  }

  protected onPointerDown(event: MouseEvent): void {
    this.#pressedOnBackdrop = event.target === this.#dialog && this.#outside(event);
  }

  protected onClick(event: MouseEvent): void {
    if (this.#pressedOnBackdrop && event.target === this.#dialog && this.#outside(event)) {
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
    const reason = this.#reason ?? 'escape';

    this.#reason = null;
    if (this.#dialog.open) {
      return;
    }
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
