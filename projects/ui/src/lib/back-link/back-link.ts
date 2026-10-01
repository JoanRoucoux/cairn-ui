import { Component, computed, input } from '@angular/core';

/** Available back link sizes. `BackLinkSize` is derived from this tuple. */
export const BACK_LINK_SIZES = ['md', 'sm'] as const;
export type BackLinkSize = (typeof BACK_LINK_SIZES)[number];

const BASE_CLASSES =
  'inline-flex items-center gap-0.5 rounded-control text-body font-medium whitespace-nowrap cursor-pointer select-none touch-manipulation transition-[transform,background-color,color] duration-(--duration-press) ease-out active:scale-(--press-scale) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)';

const SIZE_CLASSES: Record<BackLinkSize, string> = {
  md: 'h-11 pr-3 pl-1 text-(--foreground)',
  sm: 'h-9 pr-2 pl-0.5 text-(--muted-foreground) hover:bg-(--glow) hover:text-(--foreground)',
};

/**
 * Link back to the parent screen: a chevron and the name of the destination.
 *
 * @example
 * <a ui-back-link routerLink="/accounts">Accounts</a>
 */
@Component({
  selector: 'a[ui-back-link]',
  template: `
    <svg
      aria-hidden="true"
      fill="none"
      height="22"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.75"
      viewBox="0 0 24 24"
      width="22"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
    <ng-content />
  `,
  host: {
    '[class]': 'classes()',
  },
})
export class UiBackLink {
  readonly size = input<BackLinkSize>('md');

  protected readonly classes = computed(() => `${BASE_CLASSES} ${SIZE_CLASSES[this.size()]}`);
}
