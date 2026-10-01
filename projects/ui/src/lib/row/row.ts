import { Component, booleanAttribute, computed, input } from '@angular/core';

export const ROW_SIZES = ['md', 'lg'] as const;
export type RowSize = (typeof ROW_SIZES)[number];

export const ROW_PADDINGS = ['md', 'sm', 'none'] as const;
export type RowPadding = (typeof ROW_PADDINGS)[number];

const SIZE_CLASSES: Record<RowSize, string> = { md: 'min-h-14', lg: 'min-h-15' };

const PADDING_CLASSES: Record<RowPadding, string> = { md: 'px-2.5', sm: 'px-2', none: 'px-0' };

const BASE_CLASSES =
  'flex w-full items-center gap-2.5 py-1.5 rounded-control text-left select-none touch-manipulation transition-colors duration-(--duration-press) hover:bg-(--glow) active:bg-(--soft) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)';

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
  readonly size = input<RowSize>('md');
  readonly padding = input<RowPadding>('md');

  protected readonly classes = computed(
    () =>
      `${BASE_CLASSES} ${SIZE_CLASSES[this.size()]} ${PADDING_CLASSES[this.padding()]}${this.selected() ? ` ${SELECTED_CLASSES}` : ''}`,
  );
}
