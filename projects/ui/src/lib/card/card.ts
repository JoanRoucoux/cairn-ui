import { Component, computed, input } from '@angular/core';

/** Available card variants. `CardVariant` is derived from this tuple. */
export const CARD_VARIANTS = ['default', 'elevated'] as const;
export type CardVariant = (typeof CARD_VARIANTS)[number];

/** Available card paddings. `CardPadding` is derived from this tuple. */
export const CARD_PADDINGS = ['none', 'sm', 'md', 'list'] as const;
export type CardPadding = (typeof CARD_PADDINGS)[number];

const BASE_CLASSES = 'block rounded-container';

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'bg-(--card) shadow-[inset_0_0_0_1px_var(--border)] text-(--card-foreground)',
  elevated: 'bg-(--elevated) shadow-[inset_0_0_0_1px_var(--hairline)] text-(--foreground)',
};

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-(--inset-card)',
  list: 'px-2 py-3',
};

/**
 * Surface that groups related content: a summary block, a table, a side panel.
 *
 * @example
 * <ui-card variant="elevated" padding="sm">Total</ui-card>
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

  protected readonly classes = computed(
    () => `${BASE_CLASSES} ${VARIANT_CLASSES[this.variant()]} ${PADDING_CLASSES[this.padding()]}`,
  );
}
