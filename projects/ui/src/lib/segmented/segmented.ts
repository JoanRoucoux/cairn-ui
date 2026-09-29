import { Component, ElementRef, computed, input, model, viewChildren } from '@angular/core';

export type SegmentedOption = {
  value: string;
  label: string;
};

const OPTION_CLASSES =
  // The visible track stays the handoff's 36px; the hit area still reaches --row-min (44px touch,
  // 40px pointer: fine) through an ::after enlarged only vertically, centered on the option, and
  // constrained to its own horizontal bounds so it never reaches into a neighboring option.
  "relative z-10 min-h-9 flex-1 cursor-pointer text-label font-medium transition-colors after:absolute after:inset-x-0 after:top-1/2 after:h-(--row-min) after:-translate-y-1/2 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)";

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
    <div
      class="rounded-control relative grid bg-(--muted) p-0.5"
      role="radiogroup"
      [attr.aria-label]="label()"
      [style.grid-template-columns]="'repeat(' + options().length + ', 1fr)'"
    >
      @if (thumbIndex(); as index) {
        <span
          aria-hidden="true"
          class="absolute top-0.5 bottom-0.5 left-0.5 rounded-[calc(var(--radius-control)-2px)] bg-(--card) shadow-[0_1px_2px_rgb(0_0_0/0.08)] transition-transform duration-(--duration-fast) ease-out"
          data-thumb
          [style.transform]="'translateX(' + (index - 1) * 100 + '%)'"
          [style.width]="'calc(100% / ' + options().length + ')'"
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
  `,
})
export class UiSegmented {
  readonly options = input.required<SegmentedOption[]>();
  readonly label = input.required<string>();
  readonly value = model.required<string>();

  protected readonly radios = viewChildren<ElementRef<HTMLButtonElement>>('radio');

  // 1-based so 0 (falsy) reliably means "no match", letting @if skip the thumb entirely.
  protected readonly thumbIndex = computed(() => {
    const index = this.options().findIndex((option) => option.value === this.value());

    return index === -1 ? 0 : index + 1;
  });

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
