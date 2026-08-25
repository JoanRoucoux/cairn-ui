import { Component, computed, input } from '@angular/core';

/** Available delta emphases. `DeltaEmphasis` is derived from this tuple. */
export const DELTA_EMPHASES = ['text', 'pill'] as const;
export type DeltaEmphasis = (typeof DELTA_EMPHASES)[number];

const BASE_CLASSES = 'inline-flex items-center gap-1 font-semibold tabular-nums';

const PILL_CLASSES = 'rounded-md px-2.5 py-1';

type Sign = 'positive' | 'negative' | 'neutral' | 'unknown';

const TEXT_CLASSES: Record<Sign, string> = {
  positive: 'text-(--positive)',
  negative: 'text-(--negative)',
  neutral: 'text-(--muted-foreground)',
  unknown: 'text-(--subtle-foreground)',
};

const PILL_BACKGROUND_CLASS = 'bg-(--muted)';

/**
 * Signed amount whose sign carries meaning: a gain, a loss, or an unknown.
 *
 * A null value is not a zero: a holding with no cost basis exists, and showing 0 would falsely
 * claim a known gain of zero. Color never carries the sign on its own: the projected text must
 * already contain a + or a minus sign.
 *
 * @example
 * <ui-delta [value]="holding.dayChangeEur" unknownLabel="Not available">
 *   {{ holding.dayChangeEur | signedMoney }}
 * </ui-delta>
 */
@Component({
  selector: 'ui-delta',
  template: `
    @if (sign() === 'unknown') {
      <span aria-hidden="true">&mdash;</span>
      <span class="sr-only">{{ unknownLabel() }}</span>
    } @else {
      <ng-content />
    }
  `,
  host: {
    '[class]': 'classes()',
  },
})
export class UiDelta {
  readonly value = input.required<number | null | undefined>();
  readonly unknownLabel = input.required<string>();
  readonly emphasis = input<DeltaEmphasis>('text');

  protected readonly sign = computed<Sign>(() => {
    const value = this.value();

    if (value === null || value === undefined) {
      return 'unknown';
    }
    if (value > 0) {
      return 'positive';
    }
    if (value < 0) {
      return 'negative';
    }
    return 'neutral';
  });

  protected readonly classes = computed(() => {
    const sign = this.sign();
    const background = this.emphasis() === 'pill' ? `${PILL_CLASSES} ${PILL_BACKGROUND_CLASS}` : 'bg-transparent';

    return `${BASE_CLASSES} ${TEXT_CLASSES[sign]} ${background}`;
  });
}
