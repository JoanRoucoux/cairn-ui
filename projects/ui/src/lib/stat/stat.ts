import { Component, computed, input } from '@angular/core';

/** Available stat sizes. `StatSize` is derived from this tuple. */
export const STAT_SIZES = ['hero', 'tile'] as const;
export type StatSize = (typeof STAT_SIZES)[number];

const VALUE_CLASSES: Record<StatSize, string> = {
  hero: 'text-display font-semibold tracking-(--tracking-display) text-(--foreground)',
  tile: 'text-title font-semibold tabular-nums text-(--foreground)',
};

const LABEL_CLASSES: Record<StatSize, string> = {
  hero: 'text-label font-medium text-(--muted-foreground)',
  tile: 'text-label font-normal text-(--muted-foreground)',
};

const STACK_CLASSES: Record<StatSize, string> = {
  hero: 'flex flex-col gap-1',
  tile: 'flex flex-col gap-0.5',
};

/**
 * Label, figure and a named period of change, at two sizes: a `hero` for a screen's single
 * headline number, or a smaller `tile` repeated in a grid. The figure itself, its delta and its
 * caption are all projected, so the component carries no formatting and no currency of its own.
 *
 * The `hero` size never sets `tabular-nums` on the figure: a lone headline number reads better
 * with its digits at their natural width, unlike a column of aligned figures.
 *
 * @example
 * <ui-stat label="Net worth" size="hero">
 *   <span uiStatValue>128,656 EUR</span>
 *   <ui-delta uiStatDelta [value]="dayChange()" unknownLabel="Not available">+316.54 EUR</ui-delta>
 *   <span uiStatCaption>today</span>
 * </ui-stat>
 */
@Component({
  selector: 'ui-stat',
  template: `
    <div class="flex items-start justify-between gap-4">
      <div [class]="stackClasses()">
        <dl [class]="stackClasses()">
          <dt [class]="labelClasses()">{{ label() }}</dt>
          <dd [class]="valueClasses()">
            <ng-content select="[uiStatValue]" />
          </dd>
        </dl>

        <div class="text-label flex flex-wrap items-center gap-x-1.5 gap-y-1 text-(--muted-foreground)">
          <ng-content select="[uiStatDelta]" />
          <ng-content select="[uiStatCaption]" />
        </div>
      </div>

      <ng-content select="[uiStatAside]" />
    </div>
  `,
})
export class UiStat {
  readonly label = input.required<string>();
  readonly size = input<StatSize>('tile');

  protected readonly labelClasses = computed(() => LABEL_CLASSES[this.size()]);

  protected readonly stackClasses = computed(() => STACK_CLASSES[this.size()]);

  protected readonly valueClasses = computed(() => VALUE_CLASSES[this.size()]);
}
