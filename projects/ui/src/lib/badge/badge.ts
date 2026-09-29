import { Component, computed, input } from '@angular/core';

/** Available badge variants. `BadgeVariant` is derived from this tuple. */
export const BADGE_VARIANTS = ['neutral', 'outline'] as const;
export type BadgeVariant = (typeof BADGE_VARIANTS)[number];

const BASE_CLASSES = 'inline-flex h-6 items-center rounded-pill px-2.5 text-caption font-medium';

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

  protected readonly classes = computed(() => `${BASE_CLASSES} ${VARIANT_CLASSES[this.variant()]}`);
}
