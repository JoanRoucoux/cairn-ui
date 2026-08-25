import { Component, ElementRef, input, model, viewChildren } from '@angular/core';

export type SegmentedOption = {
  value: string;
  label: string;
};

const OPTION_CLASSES =
  'min-h-11 flex-1 cursor-pointer rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)';

const SELECTED_CLASSES = 'bg-(--primary) bg-linear-135 from-(--primary) to-(--primary-to) text-(--primary-foreground)';

const UNSELECTED_CLASSES = 'bg-(--elevated) text-(--muted-foreground) hover:text-(--foreground)';

/**
 * Exclusive choice within a small, known set: a time range, a unit, a mode.
 *
 * @example
 * <ui-segmented [options]="ranges" label="Time range" [(value)]="range" />
 */
@Component({
  selector: 'ui-segmented',
  template: `
    <div class="flex gap-1" role="radiogroup" [attr.aria-label]="label()">
      @for (option of options(); track option.value) {
        <button
          #radio
          role="radio"
          type="button"
          [attr.aria-checked]="option.value === value()"
          [attr.tabindex]="tabIndexFor(option.value)"
          [class]="optionClasses(option.value)"
          (click)="select(option.value)"
          (keydown)="onKeydown($event)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class UiSegmented {
  readonly options = input.required<SegmentedOption[]>();
  readonly label = input.required<string>();
  readonly value = model.required<string>();

  protected readonly radios = viewChildren<ElementRef<HTMLButtonElement>>('radio');

  protected optionClasses(optionValue: string): string {
    return `${OPTION_CLASSES} ${optionValue === this.value() ? SELECTED_CLASSES : UNSELECTED_CLASSES}`;
  }

  protected tabIndexFor(optionValue: string): number {
    const opts = this.options();
    const tabStopValue = opts.some((option) => option.value === this.value()) ? this.value() : opts[0]?.value;

    return optionValue === tabStopValue ? 0 : -1;
  }

  protected select(optionValue: string): void {
    this.value.set(optionValue);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (delta === undefined) {
      return;
    }
    event.preventDefault();

    const opts = this.options();
    const currentIndex = opts.findIndex((option) => option.value === this.value());
    const nextIndex = (currentIndex + delta + opts.length) % opts.length;
    const next = opts[nextIndex]!;

    this.value.set(next.value);
    this.radios()[nextIndex]?.nativeElement.focus();
  }
}
