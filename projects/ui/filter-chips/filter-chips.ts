import { Component, input, model } from '@angular/core';

export type FilterChipOption = {
  value: string;
  label: string;
  count?: number | string | null;
};

const CHIP_CLASSES =
  'flex-none flex h-11 items-center rounded-pill border-0 bg-transparent p-0 font-[inherit] cursor-pointer transition-transform duration-(--duration-press) ease-out active:scale-(--press-scale) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring) pointer-fine:h-8 pointer-fine:focus-visible:outline-offset-2';

const PILL_CLASSES =
  'flex h-[34px] items-center gap-1.5 rounded-pill px-3.5 text-label font-medium whitespace-nowrap pointer-fine:h-8 pointer-fine:px-3 pointer-fine:group-hover/chip:shadow-[inset_0_0_0_1px_var(--muted-foreground)]';

const SELECTED_PILL_CLASSES = 'bg-(--primary) text-(--primary-foreground)';

const UNSELECTED_PILL_CLASSES = 'bg-(--card) text-(--foreground) shadow-[inset_0_0_0_1px_var(--border)]';

/**
 * A row of single-choice filter pills, each with an optional count, that narrows a list in place.
 * On touch it scrolls on one line; with a fine pointer it wraps. An element marked `uiChipsLeading` is
 * projected first, outside the chips' group, followed by a vertical rule.
 *
 * @example
 * <ui-filter-chips ariaLabel="Filter by class" [options]="classes()" [(value)]="selectedClass" />
 */
@Component({
  selector: 'ui-filter-chips',
  template: `
    <ng-content select="[uiChipsLeading]" />
    <span
      aria-hidden="true"
      class="hidden h-5 w-px flex-none self-center bg-(--border) [[uiChipsLeading]+&]:block"
      data-chips-rule
    ></span>
    <div class="contents" role="group" [attr.aria-label]="ariaLabel()">
      @for (option of options(); track option.value) {
        <button
          class="group/chip"
          type="button"
          [attr.aria-pressed]="option.value === value()"
          [class]="chipClasses"
          (click)="value.set(option.value)"
        >
          <span data-chip [class]="pillClasses(option.value)"
            >{{ option.label }}
            @if (option.count !== undefined && option.count !== null) {
              &ngsp;<span
                class="[font-variant-numeric:var(--numeric)]"
                data-count
                [class]="countClasses(option.value)"
                >{{ option.count }}</span
              >
            }
          </span>
        </button>
      }
    </div>
  `,
  host: {
    class:
      'flex gap-2 overflow-x-auto [scrollbar-width:none] -mt-1 -mx-(--gutter) px-(--gutter) pointer-fine:m-0 pointer-fine:flex-wrap pointer-fine:overflow-visible pointer-fine:p-0',
  },
})
export class UiFilterChips {
  readonly options = input.required<FilterChipOption[]>();
  readonly value = model.required<string>();
  readonly ariaLabel = input.required<string>();

  protected readonly chipClasses = CHIP_CLASSES;

  protected pillClasses(optionValue: string): string {
    return `${PILL_CLASSES} ${optionValue === this.value() ? SELECTED_PILL_CLASSES : UNSELECTED_PILL_CLASSES}`;
  }

  protected countClasses(optionValue: string): string {
    return optionValue === this.value() ? 'text-(--primary-foreground)' : 'text-(--subtle-foreground)';
  }
}
