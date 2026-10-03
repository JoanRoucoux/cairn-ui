import { Component, computed, input } from '@angular/core';

/** Available badge variants. `BadgeVariant` is derived from this tuple. */
export const BADGE_VARIANTS = ['neutral', 'outline'] as const;
export type BadgeVariant = (typeof BADGE_VARIANTS)[number];

export const BADGE_SIZES = ['md', 'sm'] as const;
export type BadgeSize = (typeof BADGE_SIZES)[number];

const BASE_CLASSES = 'inline-flex items-center rounded-pill text-caption font-medium';

const SIZE_CLASSES: Record<BadgeSize, string> = {
  md: 'h-6 px-2.5',
  sm: 'h-[22px] px-2',
};

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-(--muted) text-(--foreground)',
  outline: 'shadow-[inset_0_0_0_1px_var(--border)] text-(--foreground)',
};

/**
 * Small status descriptor for counts, states or labels, such as an instrument's asset class.
 *
 * @example
 * <ui-badge>ETF</ui-badge>
 */
@Component({
  selector: 'ui-badge',
  template: '<ng-content />',
  host: {
    '[class]': 'classes()',
  },
})
export class UiBadge {
  readonly variant = input<BadgeVariant>('neutral');
  readonly size = input<BadgeSize>('md');

  protected readonly classes = computed(
    () => `${BASE_CLASSES} ${SIZE_CLASSES[this.size()]} ${VARIANT_CLASSES[this.variant()]}`,
  );
}
