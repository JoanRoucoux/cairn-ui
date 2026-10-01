import { Component, Directive, booleanAttribute, computed, input } from '@angular/core';

/** Breakpoints a secondary column can be held back until. */
export const CELL_BREAKPOINTS = ['md', 'lg'] as const;
export type CellBreakpoint = (typeof CELL_BREAKPOINTS)[number];

const FROM_CLASSES: Record<CellBreakpoint, string> = {
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

const TH_CLASSES =
  'px-2 align-bottom text-caption font-medium text-(--subtle-foreground) shadow-[inset_0_-1px_0_var(--hairline)]';
const TD_CLASSES = 'h-12 px-2 align-middle text-body';
const NUMERIC_CLASSES = 'text-right tabular-nums whitespace-nowrap';
const TEXTUAL_CLASSES = 'text-left';
const PRIMARY_CLASSES = 'w-full max-w-0';

/** Styled native table. The rows and cells stay plain <tr> and <td>. */
@Directive({
  selector: 'table[uiTable]',
  host: {
    class: 'w-full border-collapse',
  },
})
export class UiTable {}

/**
 * Body or group row. An ordinary row is 48px tall, glows on hover and takes the soft fill when
 * `selected`. `group` marks the row that holds a group band: it carries no hover state.
 *
 * @example
 * <tr uiTr [selected]="open">...
 * <tr uiTr group><td ui-group-cell name="Saxo Investor">...
 */
@Directive({
  selector: 'tr[uiTr]',
  host: {
    '[class]': 'classes()',
    '[attr.aria-selected]': 'selected() ? "true" : null',
  },
})
export class UiTr {
  readonly group = input(false, { transform: booleanAttribute });
  readonly selected = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    if (this.group()) {
      return '';
    }
    return [
      'relative [&>td:first-child]:rounded-l-control [&>td:last-child]:rounded-r-control',
      this.selected() ? '[&>td]:bg-(--soft)' : '',
      'hover:[&>td]:bg-(--glow) active:[&>td]:bg-(--soft)',
    ]
      .filter(Boolean)
      .join(' ');
  });
}

const cellClasses = (
  base: string,
  numeric: boolean,
  primary: boolean,
  from: CellBreakpoint | null,
  secondary: boolean,
): string => {
  const breakpoint = from ?? (secondary ? 'lg' : null);
  return [
    base,
    numeric ? NUMERIC_CLASSES : TEXTUAL_CLASSES,
    primary ? PRIMARY_CLASSES : '',
    breakpoint ? FROM_CLASSES[breakpoint] : '',
  ]
    .filter(Boolean)
    .join(' ');
};

/**
 * Column header. `numeric` right-aligns and lines the digits up; `secondary` (or `from`) holds a
 * column back until the viewport is wide enough for it; `primary` makes it the column that
 * absorbs the free width and truncates; `tall` is the 40px header of the Comptes and Instruments
 * tables; `width` fixes the column width and keeps it from shrinking.
 *
 * @example
 * <th uiTh numeric secondary width="108px">Quantité</th>
 */
@Directive({
  selector: 'th[uiTh]',
  host: {
    '[class]': 'classes()',
    '[style.width]': 'width()',
    '[style.min-width]': 'width()',
  },
})
export class UiTh {
  readonly width = input<string | null>(null);
  readonly numeric = input(false, { transform: booleanAttribute });
  readonly primary = input(false, { transform: booleanAttribute });
  readonly secondary = input(false, { transform: booleanAttribute });
  readonly tall = input(false, { transform: booleanAttribute });
  readonly from = input<CellBreakpoint | null>(null);

  protected readonly classes = computed(() =>
    cellClasses(
      `${this.tall() ? 'h-10' : 'h-9'} ${TH_CLASSES}`,
      this.numeric(),
      this.primary(),
      this.from(),
      this.secondary(),
    ),
  );
}

/** Body cell. Same inputs as `UiTh` (bar `tall`), and they must be set on both to match. */
@Directive({
  selector: 'td[uiTd]',
  host: {
    '[class]': 'classes()',
  },
})
export class UiTd {
  readonly numeric = input(false, { transform: booleanAttribute });
  readonly primary = input(false, { transform: booleanAttribute });
  readonly secondary = input(false, { transform: booleanAttribute });
  readonly from = input<CellBreakpoint | null>(null);

  protected readonly classes = computed(() =>
    cellClasses(TD_CLASSES, this.numeric(), this.primary(), this.from(), this.secondary()),
  );
}

/**
 * The band that opens a group of rows: name in 600, meta beside it, the projected total pinned to
 * the right. Spans the whole row through `colspan`.
 *
 * @example
 * <tr uiTr group><td ui-group-cell colspan="4" name="Saxo Investor" meta="PEA · Saxo">...total...</td></tr>
 */
@Component({
  selector: 'td[ui-group-cell]',
  host: {
    class: 'px-0 pt-2.5 pb-1 align-middle text-body',
  },
  template: `
    <div class="rounded-control flex min-h-11 items-center justify-between gap-4 bg-(--muted) px-2">
      <span class="flex min-w-0 items-baseline gap-3">
        <span class="font-semibold whitespace-nowrap">{{ name() }}</span>
        @if (meta()) {
          <span class="text-label truncate text-(--muted-foreground)">{{ meta() }}</span>
        }
      </span>
      <span class="font-semibold whitespace-nowrap tabular-nums"><ng-content /></span>
    </div>
  `,
})
export class UiGroupCell {
  readonly name = input.required<string>();
  readonly meta = input<string>();
}

/**
 * Makes a link or button the way into its row. Put it in the first cell: an invisible layer
 * stretches over the whole row, so the row is one target for the pointer, the keyboard and a
 * screen reader, and its focus ring wraps the row.
 *
 * @example
 * <td uiTd primary><a uiRowLink href="/lines/42">Ferrari</a></td>
 */
@Directive({
  selector: 'a[uiRowLink], button[uiRowLink]',
  host: {
    class:
      'block max-w-full truncate rounded-control text-left font-medium outline-none after:absolute after:inset-0 after:rounded-control after:content-[""] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-(--ring)',
  },
})
export class UiRowLink {}

/** A control in another cell of a stretched-link row: lifts it above the layer that covers the row. */
@Directive({
  selector: '[uiRowAction]',
  host: { class: 'relative z-1' },
})
export class UiRowAction {}

/**
 * A second line under a cell's main text. `narrow` shows it only under 1024px, where it carries
 * the secondary columns that were held back.
 *
 * @example
 * <span uiCellSub narrow>10 × 421,26 €</span>
 */
@Directive({
  selector: '[uiCellSub]',
  host: {
    '[class]': 'classes()',
  },
})
export class UiCellSub {
  readonly narrow = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(
    () =>
      `${this.narrow() ? 'lg:hidden ' : ''}block truncate text-caption font-normal text-(--subtle-foreground) tabular-nums`,
  );
}
