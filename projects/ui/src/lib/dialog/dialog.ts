import {
  Component,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

/** Named dialog widths; any other CSS length is accepted as is. `DialogWidth` is derived from this tuple. */
export const DIALOG_WIDTHS = ['md', 'lg'] as const;
export type DialogWidth = (typeof DIALOG_WIDTHS)[number];

const WIDTH_VALUES: Record<DialogWidth, string> = {
  md: '28rem',
  lg: '560px',
};

const nextId = (() => {
  let count = 0;

  return () => `ui-dialog-${++count}`;
})();

/**
 * Modal dialog on the native <dialog>: a sheet rising from the bottom under `64rem`, centered
 * above it. Header (title, optional subtitle, optional close cross), a scrolling body, and a fixed
 * footer fed by [dialogActions]: right-aligned on a desktop, stacked full width (50px) on a sheet,
 * where the primary comes first and a secondary such as Annuler sits under it.
 *
 * @example
 * <ui-dialog heading="Acheter" description="Ferrari · PEA" closeLabel="Fermer" width="530px" [open]="buying()" (dismissed)="buying.set(false)">
 *   <p>Corps</p>
 *   <button dialogActions ui-button variant="outline" class="max-lg:hidden" (click)="buying.set(false)">Annuler</button>
 *   <button dialogActions ui-button>Acheter 40 parts</button>
 * </ui-dialog>
 */
@Component({
  selector: 'ui-dialog',
  template: `
    <dialog
      #dlg
      [attr.aria-describedby]="description() ? descriptionId : null"
      [attr.aria-labelledby]="headingId"
      [class]="classes()"
      [style.--dialog-width]="widthValue()"
      (close)="onNativeClose()"
    >
      <div aria-hidden="true" class="grid h-5 place-items-center lg:hidden" data-dialog-handle>
        <span class="rounded-pill h-[5px] w-9 bg-(--border)"></span>
      </div>

      <div
        class="flex items-start gap-2 pl-4 lg:gap-3 lg:pt-5 lg:pb-1 lg:pl-6"
        data-dialog-header
        [class]="headerEnd()"
      >
        <div class="flex min-w-0 flex-1 flex-col pt-1 lg:pt-0">
          <h2 class="text-title font-semibold" [id]="headingId">{{ heading() }}</h2>

          @if (description()) {
            <p class="text-label truncate text-(--muted-foreground)" [id]="descriptionId">{{ description() }}</p>
          }
        </div>

        @if (closeLabel()) {
          <button
            class="rounded-pill lg:rounded-control grid size-11 flex-none cursor-pointer place-items-center text-(--muted-foreground) transition-[transform,background-color,color] duration-(--duration-press) ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--ring) active:scale-(--press-scale) active:bg-(--soft) lg:-mt-1 lg:size-9 lg:hover:bg-(--glow) lg:hover:text-(--foreground)"
            type="button"
            [attr.aria-label]="closeLabel()"
            (click)="dlg.close()"
          >
            <svg
              aria-hidden="true"
              class="block size-[22px] fill-none stroke-current stroke-[1.75] lg:size-5"
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

      <div class="min-h-0 flex-1 overflow-y-auto px-4 lg:px-6" data-dialog-body>
        <!-- empty:hidden keeps a body-less dialog from carrying the body's vertical padding. -->
        <div class="flex flex-col gap-4 pt-2 pb-3 empty:hidden lg:pt-3 lg:pb-5">
          <ng-content />
        </div>
      </div>

      <div
        class="max-lg:*:text-body flex justify-end gap-2 px-4 pt-3 shadow-[0_-1px_0_var(--hairline)] empty:hidden max-lg:flex-col-reverse max-lg:pb-[calc(1.25rem+env(safe-area-inset-bottom))] max-lg:*:h-[50px] max-lg:*:w-full lg:px-6 lg:py-4"
        data-dialog-footer
      >
        <ng-content select="[dialogActions]" />
      </div>
    </dialog>
  `,
  styles: `
    dialog {
      transition:
        opacity var(--duration-base) var(--ease-sheet),
        transform var(--duration-base) var(--ease-sheet),
        overlay var(--duration-base) allow-discrete,
        display var(--duration-base) allow-discrete;
      opacity: 1;
      transform: translateY(0);
    }

    dialog:not([open]) {
      opacity: 0;
      transform: translateY(100%);
      transition-duration: var(--duration-exit);
    }

    @starting-style {
      dialog[open] {
        opacity: 0;
        transform: translateY(100%);
      }
    }

    @media (min-width: 64rem) {
      dialog {
        transform: scale(1);
      }

      dialog:not([open]) {
        transform: scale(var(--enter-scale));
      }

      @starting-style {
        dialog[open] {
          transform: scale(var(--enter-scale));
        }
      }
    }

    dialog::backdrop {
      transition: opacity var(--duration-base) var(--ease-out);
      opacity: 1;
    }

    dialog:not([open])::backdrop {
      opacity: 0;
      transition-duration: var(--duration-exit);
    }

    @starting-style {
      dialog[open]::backdrop {
        opacity: 0;
      }
    }
  `,
})
export class UiDialog {
  readonly heading = input.required<string>();
  readonly description = input<string>();
  readonly closeLabel = input<string>();
  readonly width = input<DialogWidth | (string & {})>('lg');
  readonly open = input(false, { transform: booleanAttribute });
  readonly dismissed = output<void>();

  protected readonly headingId = nextId();
  protected readonly descriptionId = `${this.headingId}-description`;

  protected readonly widthValue = computed(() => {
    const width = this.width();

    return Object.hasOwn(WIDTH_VALUES, width) ? WIDTH_VALUES[width as DialogWidth] : width;
  });

  protected readonly headerEnd = computed(() => (this.closeLabel() ? 'pr-2 lg:pr-4' : 'pr-4 lg:pr-6'));

  protected readonly classes = computed(
    () =>
      'open:flex w-full flex-col overflow-hidden m-auto mt-auto max-h-[calc(100dvh-2rem)] max-lg:mb-0 max-lg:max-w-none max-lg:rounded-b-none lg:max-w-(--dialog-width) rounded-container bg-(--card) text-(--foreground) shadow-[0_0_0_1px_var(--border),0_24px_64px_rgb(0_0_0/0.24)] max-lg:shadow-[0_-1px_0_var(--border),0_-12px_32px_rgb(0_0_0/0.16)] backdrop:bg-black/[0.36]',
  );

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // After render, not effect(): the first showModal must see the cross, or initial focus skips it.
    afterRenderEffect(() => {
      // viewChild.required can't target a #private field (NG1053); safe because the template has exactly one <dialog>.
      const dialog = this.#host.nativeElement.querySelector('dialog') as HTMLDialogElement;

      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected onNativeClose(): void {
    // The owner already knows about a close it asked for; only a close it did not ask for is news.
    if (this.open()) {
      this.dismissed.emit();
    }
  }
}
