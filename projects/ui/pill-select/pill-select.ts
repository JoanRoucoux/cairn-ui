import { Directive, computed, input } from '@angular/core';

const BASE_CLASSES = [
  'flex-none cursor-pointer appearance-none rounded-pill border-y-[5px] border-transparent bg-clip-padding',
  'bg-no-repeat bg-[position:right_0.625rem_center] bg-[size:0.875rem]',
  'h-11 pr-[30px] pl-3 text-label font-medium font-[inherit] outline-0',
  'focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]',
  'pointer-fine:h-8 pointer-fine:border-y-0 pointer-fine:focus-visible:shadow-[0_0_0_2px_var(--ring)]',
].join(' ');

const REST_CLASSES = 'bg-(--card) text-(--foreground) bg-(image:--chevron-pill) shadow-[inset_0_0_0_1px_var(--border)]';

const ACTIVE_CLASSES = 'bg-(--primary) text-(--primary-foreground) bg-(image:--chevron-pill-active)';

/**
 * Compact pill-shaped native select that heads a row of filter chips: an outlined pill at rest, solid
 * once a value other than the "all" option is picked. It is 34 px tall inside a 44 px target on touch (transparent borders), 32 px with a fine pointer.
 *
 * @example
 * <select uiPillSelect aria-label="Account" [active]="!!account()"><option value="">All accounts</option></select>
 */
@Directive({
  selector: 'select[uiPillSelect]',
  host: {
    '[class]': 'classes()',
  },
})
export class UiPillSelect {
  readonly active = input(false);

  protected readonly classes = computed(() => `${BASE_CLASSES} ${this.active() ? ACTIVE_CLASSES : REST_CLASSES}`);
}
