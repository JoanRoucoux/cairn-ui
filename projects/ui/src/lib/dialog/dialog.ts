import { Component, ElementRef, booleanAttribute, computed, effect, inject, input, output } from '@angular/core';

/** Available dialog widths. `DialogWidth` is derived from this tuple. */
export const DIALOG_WIDTHS = ['md', 'lg'] as const;
export type DialogWidth = (typeof DIALOG_WIDTHS)[number];

const WIDTH_CLASSES: Record<DialogWidth, string> = {
  md: 'max-w-md',
  lg: 'max-w-[560px]',
};

const nextId = (() => {
  let count = 0;

  return () => `ui-dialog-${++count}`;
})();

/**
 * Modal dialog on the native <dialog>: a sheet rising from the bottom under `64rem`, centered
 * above it. Two projection slots - the body, and [dialogActions] for the footer.
 *
 * @example
 * <ui-dialog heading="Delete this holding?" [open]="confirming()" (dismissed)="confirming.set(false)">
 *   <p>This cannot be undone.</p>
 *   <button dialogActions ui-button variant="outline" (click)="confirming.set(false)">Cancel</button>
 * </ui-dialog>
 */
@Component({
  selector: 'ui-dialog',
  template: `
    <dialog
      [attr.aria-describedby]="description() ? descriptionId : null"
      [attr.aria-labelledby]="headingId"
      [class]="classes()"
      (close)="onNativeClose()"
    >
      <div aria-hidden="true" class="flex h-7 items-center justify-center lg:hidden" data-dialog-handle>
        <span class="rounded-pill h-1.5 w-9 bg-(--border)"></span>
      </div>

      <div class="px-6 pt-1 lg:pt-6">
        <h2 class="text-title font-semibold" [id]="headingId">{{ heading() }}</h2>

        @if (description()) {
          <p class="text-label mt-2 text-(--muted-foreground)" [id]="descriptionId">{{ description() }}</p>
        }
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto px-6" data-dialog-body tabindex="0">
        <!-- empty:hidden keeps a body-less dialog from carrying the body's top margin. -->
        <div class="mt-4 flex flex-col gap-4 empty:hidden">
          <ng-content />
        </div>
      </div>

      <div
        class="flex justify-end gap-3 px-6 pt-6 pb-6 max-lg:pb-[calc(1rem+env(safe-area-inset-bottom))]"
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
  readonly width = input<DialogWidth>('lg');
  readonly open = input(false, { transform: booleanAttribute });
  readonly dismissed = output<void>();

  protected readonly headingId = nextId();
  protected readonly descriptionId = `${this.headingId}-description`;

  protected readonly classes = computed(
    () =>
      `flex w-full flex-col m-auto mt-auto max-h-[calc(100dvh-2rem)] max-lg:mb-0 max-lg:max-w-none max-lg:rounded-b-none rounded-container ${WIDTH_CLASSES[this.width()]} border border-(--border) bg-(--card) text-(--foreground) backdrop:bg-black/60`,
  );

  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    effect(() => {
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
