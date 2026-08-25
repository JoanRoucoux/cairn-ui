import { Component, ElementRef, computed, effect, inject, input, output } from '@angular/core';

/** Available dialog widths. `DialogWidth` is derived from this tuple. */
export const DIALOG_WIDTHS = ['md', 'lg'] as const;
export type DialogWidth = (typeof DIALOG_WIDTHS)[number];

const WIDTH_CLASSES: Record<DialogWidth, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
};

const nextId = (() => {
  let count = 0;

  return () => `ui-dialog-${++count}`;
})();

/**
 * Modal dialog on the native <dialog>: focus trap, focus return, Escape and the top layer
 * come from the platform. Two projection slots - the body, and [dialogActions] for the footer.
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
      <h2 class="text-lg font-semibold tracking-tight" [id]="headingId">{{ heading() }}</h2>

      @if (description()) {
        <p class="mt-2 text-sm text-(--muted-foreground)" [id]="descriptionId">{{ description() }}</p>
      }

      <!-- empty:hidden keeps a body-less dialog from carrying the body's top margin. -->
      <div class="mt-4 flex flex-col gap-4 empty:hidden">
        <ng-content />
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <ng-content select="[dialogActions]" />
      </div>
    </dialog>
  `,
})
export class UiDialog {
  readonly heading = input.required<string>();
  readonly description = input<string>();
  readonly width = input<DialogWidth>('lg');
  readonly open = input(false);
  readonly dismissed = output<void>();

  protected readonly headingId = nextId();
  protected readonly descriptionId = `${this.headingId}-description`;

  protected readonly classes = computed(
    () =>
      `w-full ${WIDTH_CLASSES[this.width()]} rounded-xl border border-(--border) bg-(--card) p-6 text-(--foreground) backdrop:bg-black/60`,
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
