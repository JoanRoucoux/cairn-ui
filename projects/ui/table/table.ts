import { NgTemplateOutlet } from '@angular/common';
import { Component, Directive, booleanAttribute, computed, inject, input, model } from '@angular/core';

import { holdTransitionsUntilRendered } from '@joanroucoux/cairn-ui/motion';

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
 * Styled native table. `row` sets the height of every body row, `rule` draws or drops the hairline
 * under the header, `spaced` leaves a gap between the header and the first row.
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

  constructor() {
    holdTransitionsUntilRendered();
  }
}

/**
 * Body of one group of rows. `collapsed` hides every `tr[uiTr]` but the group row with `hidden`: the rows
 * stay in the DOM, so a `uiFlipList` around the table sees no item added or removed and slides
 * nothing. A plain `tr` without `uiTr` is not hidden.
 *
 * @example
 * <tbody uiGroup [collapsed]="!open()">
 */
@Directive({
  selector: 'tbody[uiGroup]',
  host: { class: 'after:table-row after:h-1 after:content-[""]' },
})
export class UiGroup {
  readonly collapsed = input(false, { transform: booleanAttribute });
}

/**
 * Body or group row. `selected` takes the soft fill, `interactive` (a row that opens something) also
 * presses to it. `group` marks the row that holds a group band: it has no hover state.
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
    '[hidden]': '!group() && body?.collapsed()',
  },
})
export class UiTr {
  protected readonly body = inject(UiGroup, { optional: true });

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
 * Column header. `numeric` right-aligns, `secondary` (or `from`) hides the column below a
 * breakpoint, `primary` makes it the column that absorbs the free width, `tall` is a 40px header,
 * `width` fixes the column width.
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

/**
 * Body cell. Same inputs as `UiTh` bar `tall` and `width`, which must be set on both to match.
 *
 * @example
 * <td uiTd numeric secondary>12</td>
 */
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
 * The band that opens a group of rows: name, meta beside it, the projected total on the right.
 * Spans the whole row through `colspan`.
 *
 * With `collapsible` the band is a button inside the heading, with a chevron that turns when the
 * group is folded. `expanded` is a model: the page keeps the fold memory and sets `collapsed` on the
 * `tbody[uiGroup]`. `toggleDisabled` keeps the button focusable and announced, but a click changes
 * nothing (a filter holds the group open). `controls` is the id of the group it folds.
 *
 * @example
 * <tr uiTr group><td ui-group-cell colspan="4" name="Brokerage" meta="Savings plan">...total...</td></tr>
 * <tr uiTr group><td ui-group-cell collapsible [(expanded)]="open" controls="brokerage" colspan="4" name="Brokerage">...</td></tr>
 */
@Component({
  selector: 'td[ui-group-cell]',
  imports: [NgTemplateOutlet],
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    <ng-template #total><ng-content /></ng-template>
    @if (collapsible()) {
      <h2 class="m-0 font-normal">
        <button
          class="rounded-control flex w-full items-center justify-between gap-4 bg-(--muted) px-2 text-left transition-[background-color] duration-(--duration-fast) ease-out not-aria-disabled:cursor-pointer not-aria-disabled:hover:bg-(--soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)"
          data-group-heading
          type="button"
          [attr.aria-controls]="controls() || null"
          [attr.aria-disabled]="toggleDisabled() ? 'true' : null"
          [attr.aria-expanded]="expanded()"
          [class]="size() === 'lg' ? 'min-h-12' : 'min-h-11'"
          (click)="toggle()"
        >
          <span class="flex min-w-0 items-center gap-2.5">
            <svg
              aria-hidden="true"
              class="flex-none stroke-(--muted-foreground) transition-transform duration-(--duration-fast) ease-out"
              fill="none"
              height="18"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.75"
              viewBox="0 0 24 24"
              width="18"
              [class.-rotate-90]="!expanded()"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
            <span class="flex min-w-0 items-baseline gap-3">
              <span class="text-body font-semibold whitespace-nowrap">{{ name() }}</span>
              @if (meta()) {
                <span class="text-label truncate text-(--muted-foreground)">{{ meta() }}</span>
              }
            </span>
          </span>
          <span class="text-body font-semibold whitespace-nowrap tabular-nums">
            <ng-container [ngTemplateOutlet]="total" />
          </span>
        </button>
      </h2>
    } @else {
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
        <span class="font-semibold whitespace-nowrap tabular-nums"><ng-container [ngTemplateOutlet]="total" /></span>
      </div>
    }
  `,
})
export class UiGroupCell {
  readonly name = input.required<string>();
  readonly meta = input<string>();
  readonly size = input<GroupSize>('md');
  readonly collapsible = input(false, { transform: booleanAttribute });
  readonly expanded = model(true);
  readonly toggleDisabled = input(false, { transform: booleanAttribute });
  readonly controls = input<string>();

  protected readonly hostClasses = computed(
    () => `px-0 ${this.size() === 'lg' ? 'pt-3' : 'pt-2.5'} pb-1 align-middle text-body`,
  );

  protected toggle(): void {
    if (!this.toggleDisabled()) {
      this.expanded.update((expanded) => !expanded);
    }
  }
}

/**
 * Makes a link or button the way into its row: by default it stretches over the whole row, so the
 * row is one target. With `[stretch]="false"` only the name is the target. `current` marks the open
 * line. Other controls in the row need `uiRowAction` to stay clickable.
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

/**
 * A control in another cell of a stretched-link row: keeps it clickable above the row-wide link.
 *
 * @example
 * <td uiTd><button uiRowAction type="button">Enter a price</button></td>
 */
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
 * A second line under a cell's main text. `narrow` shows it only under 1024px, for the data held
 * back by `secondary` columns.
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
