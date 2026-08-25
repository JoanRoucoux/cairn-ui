import { Directive, booleanAttribute, computed, input } from '@angular/core';

/** Breakpoints a secondary column can be held back until. */
export const CELL_BREAKPOINTS = ['md', 'lg'] as const;
export type CellBreakpoint = (typeof CELL_BREAKPOINTS)[number];

const FROM_CLASSES: Record<CellBreakpoint, string> = {
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

const TH_CLASSES =
  'px-3 py-2 align-bottom text-[11px] font-medium uppercase tracking-[0.05em] text-(--subtle-foreground)';
const TD_CLASSES = 'border-t border-(--hairline) px-3 py-2.5 align-middle text-sm';
const NUMERIC_CLASSES = 'text-right tabular-nums';
const TEXTUAL_CLASSES = 'text-left';

/** Styled native table. The rows and cells stay plain <tr> and <td>. */
@Directive({
  selector: 'table[uiTable]',
  host: {
    class: 'w-full border-collapse',
  },
})
export class UiTable {}

const cellClasses = (base: string, numeric: boolean, from: CellBreakpoint | null): string =>
  [base, numeric ? NUMERIC_CLASSES : TEXTUAL_CLASSES, from ? FROM_CLASSES[from] : ''].filter(Boolean).join(' ');

/**
 * Column header. `numeric` right-aligns and lines the digits up; `from` holds a
 * secondary column back until the viewport is wide enough for it.
 *
 * @example
 * <th uiTh numeric from="md">Prix de revient</th>
 */
@Directive({
  selector: 'th[uiTh]',
  host: {
    '[class]': 'classes()',
  },
})
export class UiTh {
  readonly numeric = input(false, { transform: booleanAttribute });
  readonly from = input<CellBreakpoint | null>(null);

  protected readonly classes = computed(() => cellClasses(TH_CLASSES, this.numeric(), this.from()));
}

/** Body cell. Same two inputs as `UiTh`, and they must be set on both to match. */
@Directive({
  selector: 'td[uiTd]',
  host: {
    '[class]': 'classes()',
  },
})
export class UiTd {
  readonly numeric = input(false, { transform: booleanAttribute });
  readonly from = input<CellBreakpoint | null>(null);

  protected readonly classes = computed(() => cellClasses(TD_CLASSES, this.numeric(), this.from()));
}
