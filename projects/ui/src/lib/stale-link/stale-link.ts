import { Directive, booleanAttribute, computed, input } from '@angular/core';

const BASE_CLASSES =
  'inline-flex items-center gap-0.5 rounded-[4px] text-caption font-medium text-(--stale) hover:underline underline-offset-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)';

const CHEVRON_CLASSES =
  "after:size-3.5 after:flex-none after:bg-current after:content-[''] after:mask-center after:mask-no-repeat after:mask-[url(data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27black%27%20stroke-width%3D%271.75%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpath%20d%3D%27m9%2018%206-6-6-6%27%2F%3E%3C%2Fsvg%3E)]";

/**
 * Link in the stale tone, for a caption about data that is late or left out of a total, such as
 * "1 ligne sans cours, non comptée". Caption size, weight 500, underlined on hover, with an optional
 * trailing chevron.
 *
 * @example
 * <a uiStaleLink chevron routerLink="/holdings">1 cours en retard</a>
 */
@Directive({
  selector: 'a[uiStaleLink]',
  host: { '[class]': 'classes()' },
})
export class UiStaleLink {
  readonly chevron = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => (this.chevron() ? `${BASE_CLASSES} ${CHEVRON_CLASSES}` : BASE_CLASSES));
}
