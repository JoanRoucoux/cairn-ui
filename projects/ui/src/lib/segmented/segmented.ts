import { Component, ElementRef, booleanAttribute, computed, input, model, viewChildren } from '@angular/core';

const nextId = (() => {
  let count = 0;

  return () => `ui-segmented-${++count}`;
})();

export type SegmentedOption = {
  value: string;
  label: string;
};

const OPTION_CLASSES =
  "relative z-10 flex-1 cursor-pointer px-3 text-label font-medium transition-[scale,color] duration-(--duration-press) ease-out after:absolute after:inset-x-0 after:top-1/2 after:h-(--row-min) after:-translate-y-1/2 after:content-[''] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring) active:scale-(--press-scale)";

export const SEGMENTED_SIZES = ['md', 'sm'] as const;
export type SegmentedSize = (typeof SEGMENTED_SIZES)[number];

const SIZE_CLASSES: Record<SegmentedSize, string> = {
  md: 'h-10 pointer-fine:h-8',
  sm: 'h-10 pointer-fine:h-[30px]',
};

const SELECTED_CLASSES = 'text-(--foreground)';

const UNSELECTED_CLASSES = 'text-(--muted-foreground) hover:text-(--foreground)';

/**
 * Exclusive choice within a small, known set: a time range, a unit, a mode. The selected option's
 * background is a single thumb that slides under it in `transform`, instead of being redrawn.
 *
 * @example
 * <ui-segmented [options]="ranges" label="Time range" [(value)]="range" />
 */
@Component({
  selector: 'ui-segmented',
  template: `
    <div [class]="showLabel() ? 'flex flex-col gap-1.5' : ''">
      @if (showLabel()) {
        <span class="text-label leading-[17px] font-medium text-(--muted-foreground)" [id]="labelId">{{
          label()
        }}</span>
      }
      <div
        class="rounded-control relative grid bg-(--muted) p-0.5"
        role="radiogroup"
        [attr.aria-label]="showLabel() ? null : label()"
        [attr.aria-labelledby]="showLabel() ? labelId : null"
        [style.grid-template-columns]="'repeat(' + options().length + ', 1fr)'"
      >
        @if (thumbIndex(); as index) {
          <span
            aria-hidden="true"
            class="absolute top-0.5 bottom-0.5 left-0.5 rounded-[calc(var(--radius-control)-2px)] bg-(--card) shadow-[0_1px_2px_rgb(0_0_0/0.08),inset_0_0_0_1px_var(--border)] transition-transform duration-(--duration-fast) ease-out"
            data-thumb
            [style.transform]="'translateX(' + (index - 1) * 100 + '%)'"
            [style.width]="'calc((100% - 4px) / ' + options().length + ')'"
          ></span>
        }

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
    </div>
  `,
})
export class UiSegmented {
  readonly options = input.required<SegmentedOption[]>();
  readonly label = input.required<string>();
  readonly showLabel = input(false, { transform: booleanAttribute });

  protected readonly labelId = nextId();
  readonly value = model.required<string>();
  readonly size = input<SegmentedSize>('md');

  protected readonly radios = viewChildren<ElementRef<HTMLButtonElement>>('radio');

  protected readonly thumbIndex = computed(() => {
    const index = this.options().findIndex((option) => option.value === this.value());

    return index === -1 ? 0 : index + 1;
  });

  protected optionClasses(optionValue: string): string {
    return `${OPTION_CLASSES} ${SIZE_CLASSES[this.size()]} ${optionValue === this.value() ? SELECTED_CLASSES : UNSELECTED_CLASSES}`;
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
