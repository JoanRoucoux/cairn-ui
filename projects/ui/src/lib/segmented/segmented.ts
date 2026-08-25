import { Component, computed, input, model } from '@angular/core';

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
          role="radio"
          type="button"
          [attr.aria-checked]="option.value === value()"
          [class]="optionClasses(option.value)"
          (click)="select(option.value)"
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

  protected readonly selected = computed(() => this.value());

  protected optionClasses(optionValue: string): string {
    return `${OPTION_CLASSES} ${optionValue === this.selected() ? SELECTED_CLASSES : UNSELECTED_CLASSES}`;
  }

  protected select(optionValue: string): void {
    this.value.set(optionValue);
  }
}
