import { Component, DestroyRef, Directive, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';

import { holdTransitionsUntilRendered } from '@joanroucoux/cairn-ui/motion';

export const ROW_SIZES = ['md', 'lg', 'xl', 'card', 'dense'] as const;
export type RowSize = (typeof ROW_SIZES)[number];

export const ROW_PADDINGS = ['md', 'sm', 'none'] as const;
export type RowPadding = (typeof ROW_PADDINGS)[number];

export const ROW_GAPS = ['default', 'sm'] as const;
export type RowGap = (typeof ROW_GAPS)[number];

export const ROW_TRAILINGS = ['none', 'chevron'] as const;
export type RowTrailing = (typeof ROW_TRAILINGS)[number];

const SIZE_CLASSES: Record<RowSize, string> = {
  md: 'min-h-14',
  lg: 'min-h-15',
  xl: 'min-h-18 pointer-fine:min-h-17',
  card: 'min-h-17',
  dense: 'min-h-14 lg:min-h-12',
};

const SIZE_GAPS: Record<RowSize, string> = { md: 'gap-2.5', lg: 'gap-2.5', xl: 'gap-3', card: 'gap-2', dense: 'gap-3' };

const PADDING_CLASSES: Record<RowPadding, string> = { md: 'px-2.5', sm: 'px-2', none: 'px-0' };

const BASE_CLASSES =
  'flex w-full items-center py-1.5 rounded-control text-left select-none touch-manipulation focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ring)';

const INTERACTIVE_CLASSES =
  'transition-[scale,background-color] [transition-duration:var(--duration-press),var(--duration-fast)] ease-out hover:bg-(--glow) active:bg-(--soft) active:scale-(--press-scale)';

const CHEVRON_CLASSES = 'min-h-(--row-min) gap-3 px-0 hover:text-(--muted-foreground)';

const CHEVRON_INTERACTIVE_CLASSES = 'transition-colors [transition-duration:var(--duration-fast)] ease-out';

const UNAVAILABLE_CLASSES = 'opacity-50 cursor-not-allowed';

const SELECTED_CLASSES = 'bg-(--soft)';

/**
 * Clickable row of a list: a holding, an account, a search result. With `trailing="chevron"` it is a
 * flush link row: no side padding, a 16 px chevron at the end, the text dimming on hover.
 *
 * @example
 * <a ui-row [selected]="holding.id === openId()" [routerLink]="['/holdings', holding.id]">
 *   {{ holding.name }}
 * </a>
 */
@Component({
  selector: 'a[ui-row], button[ui-row]',
  template: `
    <ng-content />
    @if (trailing() === 'chevron') {
      <svg
        aria-hidden="true"
        class="block flex-none fill-none stroke-(--subtle-foreground)"
        height="16"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.75"
        viewBox="0 0 24 24"
        width="16"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    }
    @if (busy()) {
      <span
        aria-hidden="true"
        class="rounded-pill animate-cairn-spin size-4 flex-none border-2 border-current border-r-transparent"
      ></span>
    }
  `,
  host: {
    '[class]': 'classes()',
    '[attr.aria-busy]': 'busy() || null',
    '[attr.aria-disabled]': "busy() || unavailable() ? 'true' : null",
    '[attr.aria-current]': "selected() ? 'true' : null",
  },
})
export class UiRow {
  readonly selected = input(false, { transform: booleanAttribute });
  readonly busy = input(false, { transform: booleanAttribute });
  readonly unavailable = input(false, { transform: booleanAttribute });
  readonly size = input<RowSize>('md');
  readonly padding = input<RowPadding>('md');
  readonly gap = input<RowGap>('default');
  readonly trailing = input<RowTrailing>('none');

  protected readonly classes = computed(() => {
    const chevron = this.trailing() === 'chevron';
    const layout = chevron
      ? CHEVRON_CLASSES
      : `${SIZE_CLASSES[this.size()]} ${this.gap() === 'sm' ? 'gap-2' : SIZE_GAPS[this.size()]} ${PADDING_CLASSES[this.padding()]}`;
    const interactive = chevron ? CHEVRON_INTERACTIVE_CLASSES : INTERACTIVE_CLASSES;

    return `${BASE_CLASSES} ${layout}${this.unavailable() ? ` ${UNAVAILABLE_CLASSES}` : ` ${interactive}`}${this.selected() ? ` ${SELECTED_CLASSES}` : ''}${this.busy() ? ' pointer-events-none' : ''}`;
  });

  constructor() {
    holdTransitionsUntilRendered();
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const guard = (event: Event): void => {
      if (this.busy() || this.unavailable()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    host.addEventListener('click', guard, { capture: true });
    inject(DestroyRef).onDestroy(() => host.removeEventListener('click', guard, { capture: true }));
  }
}

/**
 * Lays out a `ui-row` with a trailing action beside it, such as a "more" icon button.
 *
 * @example
 * <div uiRowItem>
 *   <a ui-row size="xl" padding="sm" routerLink="/accounts/1">...</a>
 *   <button ui-button variant="quiet" size="icon-sm" aria-label="Account actions">...</button>
 * </div>
 */
@Directive({
  selector: '[uiRowItem]',
  host: {
    class:
      'flex items-center gap-1 [&>[ui-row]]:w-auto [&>[ui-row]]:min-w-0 [&>[ui-row]]:flex-1 [&>:not([ui-row])]:flex-none',
  },
})
export class UiRowItem {}

/**
 * Non-interactive row of a list, separated from the next by a hairline: a passkey with its delete
 * button, a device, a setting. Put it on an `li` or a `div`. Use `ui-row` instead when the whole
 * row is a link or an action.
 *
 * @example
 * <ul>
 *   <li uiListRow>
 *     <span class="flex-1">MacBook Air</span>
 *     <button ui-button variant="quiet-destructive" size="icon-sm" aria-label="Delete MacBook Air">...</button>
 *   </li>
 * </ul>
 */
@Directive({
  selector: '[uiListRow]',
  host: { '[class]': 'classes()' },
})
export class UiListRow {
  readonly ruled = input(true, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    this.ruled()
      ? 'flex min-h-18 items-center gap-3 py-1.5 lg:min-h-17 shadow-[inset_0_-1px_0_var(--hairline)]'
      : 'flex min-h-18 items-center gap-3 py-1.5 lg:min-h-17',
  );
}

/**
 * The filled tile that leads a row, holding an icon. Put it on a `span` as the first child of a
 * `ui-row` or a `uiListRow`.
 *
 * @example
 * <a ui-row size="xl" padding="sm" href="/export">
 *   <span uiRowTile><svg lucideDownload [size]="18" /></span>
 *   Export
 * </a>
 */
@Directive({
  selector: '[uiRowTile]',
  host: { class: 'rounded-control grid size-9 flex-none place-items-center bg-(--muted)' },
})
export class UiRowTile {}
