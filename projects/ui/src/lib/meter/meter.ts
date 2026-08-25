import { Component, computed, input } from '@angular/core';

/** Ramp step used to paint the fill. `MeterTone` is derived from this tuple. */
export const METER_TONES = [1, 2, 3, 4, 5, 6] as const;
export type MeterTone = (typeof METER_TONES)[number];

const TONE_CLASSES: Record<MeterTone, string> = {
  1: 'bg-(--ramp-1)',
  2: 'bg-(--ramp-2)',
  3: 'bg-(--ramp-3)',
  4: 'bg-(--ramp-4)',
  5: 'bg-(--ramp-5)',
  6: 'bg-(--ramp-6)',
};

/**
 * Proportion of a whole, drawn as a single bar. One bar per category, never a stacked
 * strip: without hue to separate segments, length has to do the work alone.
 *
 * @example
 * <ui-meter [value]="0.463" label="Funds" valueText="46.3% - 128,656.00 EUR" [tone]="1" />
 */
@Component({
  selector: 'ui-meter',
  template: `
    <div
      class="h-2.5 w-full overflow-hidden rounded-sm bg-(--elevated)"
      role="meter"
      [attr.aria-label]="label()"
      [attr.aria-valuemax]="1"
      [attr.aria-valuemin]="0"
      [attr.aria-valuenow]="value()"
      [attr.aria-valuetext]="valueText()"
    >
      <div data-testid="meter-fill" [class]="fillClasses()" [style.width.%]="percent()"></div>
    </div>
  `,
})
export class UiMeter {
  readonly value = input.required<number>();
  readonly label = input.required<string>();
  readonly valueText = input.required<string>();
  readonly tone = input<MeterTone>(1);

  protected readonly percent = computed(() => Math.min(100, Math.max(0, this.value() * 100)));

  protected readonly fillClasses = computed(() => `h-full rounded-sm ${TONE_CLASSES[this.tone()]}`);
}
