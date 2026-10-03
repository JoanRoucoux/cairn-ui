import { Component, booleanAttribute, computed, input } from '@angular/core';

import { holdTransitionsUntilRendered } from '../motion/settle-transitions';

const BASE_CLASSES =
  'flex items-center gap-3 h-10 px-3 rounded-control text-label leading-normal font-medium transition-[scale,background-color] [transition-duration:var(--duration-press),var(--duration-fast)] ease-out active:scale-(--press-scale) hover:bg-(--glow) hover:text-(--foreground) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)';

const ACTIVE_CLASSES = 'bg-[image:linear-gradient(var(--soft),var(--soft))] text-(--foreground)';

const IDLE_CLASSES = 'text-(--muted-foreground) active:bg-(--soft)';

/**
 * One destination of the sidebar navigation (Portfolio, Holdings, Allocation, Accounts). The active
 * fill and text colour switch at once on navigation; only the hover fill fades.
 *
 * @example
 * <a ui-nav-item [active]="url === '/'" routerLink="/">
 *   <lucide-icon navIcon name="house" />
 *   Portfolio
 * </a>
 */
@Component({
  selector: 'a[ui-nav-item]',
  template: '<ng-content select="[navIcon]" /><ng-content />',
  host: {
    '[class]': 'classes()',
    '[attr.aria-current]': "active() ? 'page' : null",
  },
})
export class UiNavItem {
  readonly active = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => `${BASE_CLASSES} ${this.active() ? ACTIVE_CLASSES : IDLE_CLASSES}`);

  constructor() {
    holdTransitionsUntilRendered();
  }
}
