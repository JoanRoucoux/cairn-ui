import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, booleanAttribute, computed, inject, input } from '@angular/core';

const HEIGHT_PROPERTY = '--tab-bar-height';

const HEIGHT = 'calc(52px + env(safe-area-inset-bottom))';

const TAB_CLASSES =
  'flex h-[52px] flex-col items-center justify-center gap-[3px] touch-manipulation select-none transition-transform duration-(--duration-press) ease-out active:scale-(--press-scale) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)';

const INACTIVE_TAB_CLASSES = 'font-medium text-(--muted-foreground)';

const ACTIVE_TAB_CLASSES = 'font-semibold text-(--foreground)';

/**
 * Bottom navigation bar for iPhone. While it is on the page it publishes its height as
 * `--tab-bar-height` on the root element, which `ui-action-bar` and `ui-toaster` sit above: use it
 * for anything else that must clear the bar.
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
export class UiTabBar {
  constructor() {
    const root = inject(DOCUMENT).documentElement;

    root.style.setProperty(HEIGHT_PROPERTY, HEIGHT);
    inject(DestroyRef).onDestroy(() => root.style.removeProperty(HEIGHT_PROPERTY));
  }
}

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
    <span class="text-caption leading-none" data-tab-label><ng-content /></span>
  `,
  host: {
    '[class]': 'classes()',
    '[attr.aria-current]': "active() ? 'page' : null",
  },
})
export class UiTab {
  readonly active = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(
    () => `${TAB_CLASSES} ${this.active() ? ACTIVE_TAB_CLASSES : INACTIVE_TAB_CLASSES}`,
  );
}
