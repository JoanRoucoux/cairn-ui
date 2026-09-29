import { Component, booleanAttribute, computed, input } from '@angular/core';

const TAB_CLASSES =
  'flex h-[52px] flex-col items-center justify-center gap-0.5 touch-manipulation select-none text-(--muted-foreground) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)';

const ACTIVE_TAB_CLASSES = 'font-semibold text-(--foreground)';

/**
 * Bottom navigation bar for iPhone: 52px of tabs plus the home indicator's safe area.
 *
 * @example
 * <nav ui-tab-bar>
 *   <a ui-tab [active]="url === '/'" routerLink="/"><lucide-icon tabIcon name="house" />Portfolio</a>
 * </nav>
 */
@Component({
  selector: 'nav[ui-tab-bar]',
  template: '<ng-content />',
  host: {
    class:
      'grid grid-flow-col auto-cols-fr items-stretch bg-(--background)/90 backdrop-blur [@media(prefers-reduced-transparency:reduce)]:bg-(--background) shadow-[inset_0_1px_0_var(--hairline)] pb-[env(safe-area-inset-bottom)]',
  },
})
export class UiTabBar {}

/**
 * One destination of `ui-tab-bar`.
 *
 * @example
 * <a ui-tab active routerLink="/"><lucide-icon tabIcon name="house" />Portfolio</a>
 */
@Component({
  selector: 'a[ui-tab]',
  template: `
    <span class="size-6" data-tab-icon><ng-content select="[tabIcon]" /></span>
    <span class="text-caption" data-tab-label><ng-content /></span>
  `,
  host: {
    '[class]': 'classes()',
    '[attr.aria-current]': "active() ? 'page' : null",
  },
})
export class UiTab {
  readonly active = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => `${TAB_CLASSES}${this.active() ? ` ${ACTIVE_TAB_CLASSES}` : ''}`);
}
