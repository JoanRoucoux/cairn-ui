import { Directive, booleanAttribute, computed, input } from '@angular/core';

/** Breakpoints a secondary column can be held back until. */
export const CELL_BREAKPOINTS = ['md', 'lg'] as const;
export type CellBreakpoint = (typeof CELL_BREAKPOINTS)[number];

const FROM_CLASSES: Record<CellBreakpoint, string> = {
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

const TH_CLASSES =
  'h-9 px-2 align-bottom text-caption font-medium text-(--subtle-foreground) shadow-[inset_0_-1px_0_var(--hairline)]';
const TD_CLASSES = 'h-12 px-2 align-middle text-body';
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

/**
 * Body or group row. `group` draws the muted banner that opens each account inside a list of
 * holdings: it carries no hover state of its own, unlike an ordinary row.
 *
 * @example
 * <tr uiTr>...
 * <tr uiTr group>...
 */
@Directive({
  selector: 'tr[uiTr]',
  host: {
    '[class]': 'classes()',
  },
})
export class UiTr {
  readonly group = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    this.group() ? 'min-h-(--row-min) rounded-control bg-(--muted) font-semibold' : 'rounded-control hover:bg-(--glow)',
  );
}

const cellClasses = (base: string, numeric: boolean, from: CellBreakpoint | null): string =>
  [base, numeric ? NUMERIC_CLASSES : TEXTUAL_CLASSES, from ? FROM_CLASSES[from] : ''].filter(Boolean).join(' ');

/**
 * Column header. `numeric` right-aligns and lines the digits up; `from` holds a
 * secondary column back until the viewport is wide enough for it.
 *
 * @example
 * <th uiTh numeric from="md">Average cost</th>
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
