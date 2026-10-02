import { Component, Directive, booleanAttribute, computed, input } from '@angular/core';

/** Breakpoints a secondary column can be held back until. */
export const CELL_BREAKPOINTS = ['md', 'lg'] as const;
export type CellBreakpoint = (typeof CELL_BREAKPOINTS)[number];

/** Body row heights. */
export const TABLE_ROWS = ['48', '52', '60'] as const;
export type TableRow = (typeof TABLE_ROWS)[number];

const ROW_CLASSES: Record<TableRow, string> = {
  '48': '[--table-row:3rem]',
  '52': '[--table-row:3.25rem]',
  '60': '[--table-row:3.75rem]',
};

const FROM_CLASSES: Record<CellBreakpoint, string> = {
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

const TH_CLASSES =
  'h-[calc(var(--table-head)+var(--table-head-gap))] border-b-(length:--table-head-gap) border-transparent px-2 align-middle text-caption font-medium text-(--subtle-foreground) shadow-(--table-rule)';
const TD_CLASSES = 'h-(--table-row) px-2 align-middle text-body';
const NUMERIC_CLASSES = 'text-right tabular-nums whitespace-nowrap';
const TEXTUAL_CLASSES = 'text-left';
const PRIMARY_CLASSES = 'w-full max-w-0';

/**
 * Styled native table. The rows and cells stay plain <tr> and <td>. `row` sets the height of every
 * body row, `rule` draws or drops the hairline under the header, `spaced` leaves 4px between the
 * header and the first row.
 *
 * @example
 * <table uiTable row="60" [rule]="false">
 */
@Directive({
  selector: 'table[uiTable]',
  host: {
    '[class]': 'classes()',
  },
})
export class UiTable {
  readonly row = input<TableRow>('48');
  readonly rule = input(true, { transform: booleanAttribute });
  readonly spaced = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    [
      'w-full border-separate border-spacing-0',
      ROW_CLASSES[this.row()],
      this.rule() ? '[--table-rule:inset_0_-1px_0_var(--hairline)]' : '[--table-rule:none]',
      this.spaced() ? '[--table-head-gap:0.25rem]' : '[--table-head-gap:0px]',
    ].join(' '),
  );
}

/** Body of one group of rows: leaves a 4px tail after its last row. */
@Directive({
  selector: 'tbody[uiGroup]',
  host: { class: 'after:table-row after:h-1 after:content-[""]' },
})
export class UiGroup {}

/**
 * Body or group row. An ordinary row glows on hover and takes the soft fill when `selected`; an
 * `interactive` row (one that opens something) also presses to the soft fill. A row with no action keeps a
 * plain name: `<td uiTd primary class="truncate font-medium">`.
 * `group` marks the row that holds a group band: it carries no hover state.
 *
 * @example
 * <tr uiTr [selected]="open">...
 * <tr uiTr group><td ui-group-cell name="Brokerage">...
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
  readonly interactive = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    if (this.group()) {
      return '';
    }
    return [
      'relative [&>td:first-child]:rounded-l-control [&>td:last-child]:rounded-r-control',
      this.selected() ? '[&>td]:bg-(--soft)' : '',
      'hover:[&>td]:bg-(--glow) [&>td]:transition-colors [&>td]:duration-(--duration-fast) [&>td]:ease-out',
      this.interactive()
        ? 'active:[&>td]:bg-(--soft) transition-transform duration-(--duration-press) ease-out active:scale-(--press-scale)'
        : '',
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
 * Column header, centred in its 36px. `numeric` right-aligns and lines the digits up; `secondary`
 * (or `from`) holds a column back until the viewport is wide enough for it; `primary` makes it
 * the column that absorbs the free width and truncates; `tall` is a 40px header; `width` fixes the column width and keeps it from shrinking.
 *
 * @example
 * <th uiTh numeric secondary width="108px">Quantity</th>
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
      `${this.tall() ? '[--table-head:2.5rem]' : '[--table-head:2.25rem]'} ${TH_CLASSES}`,
      this.numeric(),
      this.primary(),
      this.from(),
      this.secondary(),
    ),
  );
}

/** Body cell. Same inputs as `UiTh` (bar `tall` and `width`), and they must be set on both to match. */
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

/** Group band sizes. */
export const GROUP_SIZES = ['md', 'lg'] as const;
export type GroupSize = (typeof GROUP_SIZES)[number];

/**
 * The band that opens a group of rows: name in 600 (a heading), meta beside it, the projected
 * total pinned to the right. Spans the whole row through `colspan`.
 *
 * @example
 * <tr uiTr group><td ui-group-cell colspan="4" name="Brokerage" meta="Savings plan">...total...</td></tr>
 */
@Component({
  selector: 'td[ui-group-cell]',
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    <div
      class="rounded-control flex items-center justify-between gap-4 bg-(--muted) px-2"
      [class]="size() === 'lg' ? 'min-h-12' : 'min-h-11'"
    >
      <div class="flex min-w-0 items-baseline gap-3">
        <h2 class="text-body m-0 font-semibold whitespace-nowrap outline-none" data-group-heading tabindex="-1">
          {{ name() }}
        </h2>
        @if (meta()) {
          <span class="text-label truncate text-(--muted-foreground)">{{ meta() }}</span>
        }
      </div>
      <span class="font-semibold whitespace-nowrap tabular-nums"><ng-content /></span>
    </div>
  `,
})
export class UiGroupCell {
  readonly name = input.required<string>();
  readonly meta = input<string>();
  readonly size = input<GroupSize>('md');

  protected readonly hostClasses = computed(
    () => `px-0 ${this.size() === 'lg' ? 'pt-3' : 'pt-2.5'} pb-1 align-middle text-body`,
  );
}

/**
 * Makes a link or button the way into its row. By default an invisible layer stretches over the
 * whole row, so the row is one target for the pointer, the keyboard and a screen reader, and its
 * focus ring wraps the row. With `[stretch]="false"` only the name is the
 * target: it underlines on hover and takes its own ring. `current` marks the open line.
 *
 * @example
 * <td uiTd primary><a uiRowLink href="/lines/42">Ferrari</a></td>
 * <td uiTd primary><a uiRowLink [stretch]="false" href="/accounts/3">Brokerage</a></td>
 */
@Directive({
  selector: 'a[uiRowLink], button[uiRowLink]',
  host: {
    '[class]': 'classes()',
    '[attr.aria-current]': 'current() ? "true" : null',
  },
})
export class UiRowLink {
  readonly stretch = input(true, { transform: booleanAttribute });
  readonly current = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    this.stretch()
      ? 'block max-w-full truncate rounded-control text-left font-medium outline-none after:absolute after:inset-0 after:rounded-control after:content-[""] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-(--ring)'
      : 'block max-w-full truncate rounded-sm text-left font-medium underline-offset-[3px] outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)',
  );
}

/** A control in another cell of a stretched-link row: lifts it above the layer that covers the row. */
@Directive({
  selector: '[uiRowAction]',
  host: { class: 'relative z-1' },
})
export class UiRowAction {}

/** Tones of a subtitle: subtle (default), `--stale` at 500, or the color of the cell. */
export const SUB_TONES = ['subtle', 'stale', 'inherit'] as const;
export type SubTone = (typeof SUB_TONES)[number];

const SUB_TONE_CLASSES: Record<SubTone, string> = {
  subtle: 'font-normal text-(--subtle-foreground)',
  stale: 'font-medium text-(--stale)',
  inherit: 'font-normal',
};

/**
 * A second line under a cell's main text. `narrow` shows it only under 1024px, where it carries
 * the quantity, average cost and quote that were held back. Its amounts go through `ui-amount`
 * so they mask.
 *
 * @example
 * <span uiCellSub narrow>10 × 421.26 € · cost 388.10 €</span>
 * <span uiCellSub tone="stale">Quote of 24/09</span>
 */
@Directive({
  selector: '[uiCellSub]',
  host: {
    '[class]': 'classes()',
  },
})
export class UiCellSub {
  readonly narrow = input(false, { transform: booleanAttribute });
  readonly tone = input<SubTone>('subtle');

  protected readonly classes = computed(
    () =>
      `${this.narrow() ? 'lg:hidden ' : ''}block truncate text-caption tabular-nums ${SUB_TONE_CLASSES[this.tone()]}`,
  );
}
