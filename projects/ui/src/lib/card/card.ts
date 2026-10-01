import { Component, computed, input } from '@angular/core';

/** Available card variants. `CardVariant` is derived from this tuple. */
export const CARD_VARIANTS = ['default', 'elevated', 'inset'] as const;
export type CardVariant = (typeof CARD_VARIANTS)[number];

/** Available card paddings. `CardPadding` is derived from this tuple. */
export const CARD_PADDINGS = ['none', 'xs', 'sm', 'md', 'list', 'rows', 'recap', 'panel'] as const;
export type CardPadding = (typeof CARD_PADDINGS)[number];

/** Where the card surface (fill, border, radius) and its padding apply. `CardSurface` is derived from this tuple. */
export const CARD_SURFACES = ['always', 'lg', 'max-lg'] as const;
export type CardSurface = (typeof CARD_SURFACES)[number];

/** Border of the card surface; `auto` follows the variant. `CardBorder` is derived from this tuple. */
export const CARD_BORDERS = ['auto', 'none', 'border', 'hairline'] as const;
export type CardBorder = (typeof CARD_BORDERS)[number];

const BASE_CLASSES = 'block';

const VARIANT_CLASSES: Record<CardVariant, Record<CardSurface, string>> = {
  default: {
    always: 'rounded-container bg-(--card) text-(--card-foreground)',
    lg: 'lg:rounded-container lg:bg-(--card) lg:text-(--card-foreground)',
    'max-lg': 'max-lg:rounded-container max-lg:bg-(--card) max-lg:text-(--card-foreground)',
  },
  elevated: {
    always: 'rounded-container bg-(--elevated) text-(--foreground)',
    lg: 'lg:rounded-container lg:bg-(--elevated) lg:text-(--foreground)',
    'max-lg': 'max-lg:rounded-container max-lg:bg-(--elevated) max-lg:text-(--foreground)',
  },
  inset: {
    always: 'rounded-control bg-(--background) text-(--foreground)',
    lg: 'lg:rounded-control lg:bg-(--background) lg:text-(--foreground)',
    'max-lg': 'max-lg:rounded-control max-lg:bg-(--background) max-lg:text-(--foreground)',
  },
};

const AUTO_BORDERS: Record<CardVariant, Exclude<CardBorder, 'auto'>> = {
  default: 'border',
  elevated: 'hairline',
  inset: 'none',
};

const BORDER_CLASSES: Record<Exclude<CardBorder, 'auto'>, Record<CardSurface, string>> = {
  none: { always: '', lg: '', 'max-lg': '' },
  border: {
    always: 'shadow-[inset_0_0_0_1px_var(--border)]',
    lg: 'lg:shadow-[inset_0_0_0_1px_var(--border)]',
    'max-lg': 'max-lg:shadow-[inset_0_0_0_1px_var(--border)]',
  },
  hairline: {
    always: 'shadow-[inset_0_0_0_1px_var(--hairline)]',
    lg: 'lg:shadow-[inset_0_0_0_1px_var(--hairline)]',
    'max-lg': 'max-lg:shadow-[inset_0_0_0_1px_var(--hairline)]',
  },
};

const PADDING_CLASSES: Record<CardPadding, Record<CardSurface, string>> = {
  none: {
    always: 'p-0',
    lg: 'lg:p-0',
    'max-lg': 'max-lg:p-0',
  },
  xs: {
    always: 'p-1',
    lg: 'lg:p-1',
    'max-lg': 'max-lg:p-1',
  },
  sm: {
    always: 'p-3',
    lg: 'lg:p-3',
    'max-lg': 'max-lg:p-3',
  },
  md: {
    always: 'p-(--inset-card)',
    lg: 'lg:p-(--inset-card)',
    'max-lg': 'max-lg:p-(--inset-card)',
  },
  list: {
    always: 'px-2 py-3',
    lg: 'lg:px-2 lg:py-3',
    'max-lg': 'max-lg:px-2 max-lg:py-3',
  },
  rows: {
    always: 'px-(--inset-card) py-1',
    lg: 'lg:px-(--inset-card) lg:py-1',
    'max-lg': 'max-lg:px-(--inset-card) max-lg:py-1',
  },
  recap: {
    always: 'px-3 py-1',
    lg: 'lg:px-3 lg:py-1',
    'max-lg': 'max-lg:px-3 max-lg:py-1',
  },
  panel: {
    always: 'px-3 py-2.5 lg:px-4 lg:py-3',
    lg: 'lg:px-4 lg:py-3',
    'max-lg': 'max-lg:px-3 max-lg:py-2.5',
  },
};

/**
 * Surface that groups related content: a summary block, a table, a side panel. `surface` limits the
 * fill, border, radius and padding to one side of `64rem`, for a block that is a card on a desktop and
 * plain on an iPhone, or the reverse. `variant="inset"` is the `--background` box that sits inside a
 * card or a dialog: a picked title, a results list, a recap, an empty-state panel.
 *
 * @example
 * <ui-card variant="elevated" padding="sm">Total</ui-card>
 * <ui-card variant="inset" border="hairline" padding="xs">Results</ui-card>
 * <ui-card surface="max-lg">Card on an iPhone, plain on a desktop</ui-card>
 */
@Component({
  selector: 'ui-card',
  template: '<ng-content />',
  host: {
    '[class]': 'classes()',
  },
})
export class UiCard {
  readonly variant = input<CardVariant>('default');
  readonly padding = input<CardPadding>('md');
  readonly surface = input<CardSurface>('always');
  readonly border = input<CardBorder>('auto');

  protected readonly classes = computed(() => {
    const variant = this.variant();
    const surface = this.surface();
    const border = this.border();

    return [
      BASE_CLASSES,
      VARIANT_CLASSES[variant][surface],
      BORDER_CLASSES[border === 'auto' ? AUTO_BORDERS[variant] : border][surface],
      PADDING_CLASSES[this.padding()][surface],
    ]
      .filter(Boolean)
      .join(' ');
  });
}
