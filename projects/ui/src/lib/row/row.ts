import { Component, booleanAttribute, computed, input } from '@angular/core';

const BASE_CLASSES =
  'flex w-full items-center gap-2.5 min-h-14 px-2.5 py-1.5 rounded-control text-left select-none touch-manipulation transition-colors duration-(--duration-press) hover:bg-(--glow) active:bg-(--soft) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)';

const SELECTED_CLASSES = 'bg-(--soft)';

/**
 * Clickable row of a list: a holding, an envelope, an account.
 *
 * @example
 * <a ui-row [selected]="holding.id === openId()" [routerLink]="['/holdings', holding.id]">
 *   {{ holding.name }}
 * </a>
 */
@Component({
  selector: 'a[ui-row], button[ui-row]',
  template: '<ng-content />',
  host: {
    '[class]': 'classes()',
    '[attr.aria-current]': "selected() ? 'true' : null",
  },
})
export class UiRow {
  readonly selected = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => `${BASE_CLASSES}${this.selected() ? ` ${SELECTED_CLASSES}` : ''}`);
}
