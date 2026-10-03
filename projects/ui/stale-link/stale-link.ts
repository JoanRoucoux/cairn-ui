import { Directive, booleanAttribute, computed, input } from '@angular/core';

/** Available stale link sizes. */
export const STALE_LINK_SIZES = ['caption', 'label'] as const;
export type StaleLinkSize = (typeof STALE_LINK_SIZES)[number];

const BASE_CLASSES =
  "relative inline-flex items-center gap-0.5 rounded-[4px] font-medium text-(--stale) hover:underline underline-offset-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) before:absolute before:inset-x-0 before:top-1/2 before:h-11 pointer-fine:before:h-10 before:-translate-y-1/2 before:content-['']";

const SIZE_CLASSES: Record<StaleLinkSize, string> = {
  caption: 'text-caption',
  label: 'text-label',
};

const CHEVRON_CLASSES =
  "after:size-4 after:flex-none after:bg-current after:content-[''] after:mask-center after:mask-no-repeat after:mask-[url(data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27black%27%20stroke-width%3D%271.75%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpath%20d%3D%27m9%2018%206-6-6-6%27%2F%3E%3C%2Fsvg%3E)]";

/**
 * Link in the stale tone, for a caption about data that is late or left out of a total, such as
 * "1 ligne sans cours, non comptée". `chevron` adds a trailing chevron, `size` is `caption` (the
 * default) or `label`.
 *
 * @example
 * <a uiStaleLink chevron size="label" routerLink="/holdings">1 cours en retard</a>
 */
@Directive({
  selector: 'a[uiStaleLink]',
  host: { '[class]': 'classes()' },
})
export class UiStaleLink {
  readonly chevron = input(false, { transform: booleanAttribute });
  readonly size = input<StaleLinkSize>('caption');

  protected readonly classes = computed(
    () => `${BASE_CLASSES} ${SIZE_CLASSES[this.size()]}${this.chevron() ? ` ${CHEVRON_CLASSES}` : ''}`,
  );
}
