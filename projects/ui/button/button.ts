import { Component, DestroyRef, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';

import { holdTransitionsUntilRendered } from '@joanroucoux/cairn-ui/motion';

/** Available button variants. `ButtonVariant` is derived from this tuple. */
export const BUTTON_VARIANTS = [
  'primary',
  'outline',
  'ghost',
  'destructive',
  'quiet',
  'quiet-destructive',
  'outline-destructive',
  'quiet-glow',
  'tonal',
] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

/** Available button sizes. */
export const BUTTON_SIZES = [
  'compact',
  'slim',
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  'xxl',
  'tall',
  'block',
  'icon',
  'icon-sm',
] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

const BASE_CLASSES =
  'relative inline-flex items-center justify-center rounded-control font-medium whitespace-nowrap cursor-pointer select-none touch-manipulation transition-[scale,background-color] [transition-duration:var(--duration-press),var(--duration-fast)] ease-out active:scale-(--press-scale) focus-visible:outline-2 focus-visible:outline-(--ring) disabled:pointer-events-none disabled:opacity-40 aria-disabled:not-aria-busy:opacity-40';

const RING_OUTSIDE = 'focus-visible:outline-offset-2';
const RING_INSIDE = 'focus-visible:-outline-offset-2';
const OUTLINE = 'bg-(--card) shadow-[inset_0_0_0_1px_var(--border)] hover:bg-(--glow) active:bg-(--soft)';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: `${RING_OUTSIDE} bg-(--primary) text-(--primary-foreground) hover:bg-(--primary-to)`,
  outline: `${RING_OUTSIDE} ${OUTLINE} text-(--foreground)`,
  ghost: `${RING_OUTSIDE} bg-transparent text-(--foreground) hover:bg-(--glow) active:bg-(--soft)`,
  destructive: `${RING_OUTSIDE} bg-(--destructive) text-(--destructive-foreground)`,
  tonal: `${RING_OUTSIDE} bg-(--muted) text-(--foreground) lg:bg-transparent lg:hover:bg-(--glow)`,
  'quiet-glow': `${RING_INSIDE} bg-transparent text-(--muted-foreground) hover:bg-(--glow) hover:text-(--foreground)`,
  quiet: `${RING_INSIDE} bg-transparent text-(--muted-foreground) hover:bg-(--soft) hover:text-(--foreground) active:bg-(--soft)`,
  'quiet-destructive': `${RING_INSIDE} bg-transparent text-(--muted-foreground) hover:bg-(--glow) hover:text-(--negative) active:bg-(--soft)`,
  'outline-destructive': `${RING_OUTSIDE} ${OUTLINE} text-(--negative)`,
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  compact:
    'h-8 lg:h-7 gap-1.5 px-2.5 lg:px-2 text-label before:absolute before:-inset-x-1 before:-inset-y-1.5 lg:before:hidden',
  slim: 'h-11 lg:h-8 gap-1.5 px-2.5 text-label',
  xs: 'h-8 gap-1.5 px-2.5 text-label',
  sm: 'h-9 gap-2 px-3 text-label',
  md: 'min-h-(--row-min) gap-2 px-4 text-label has-[>span>svg:first-child]:pl-3',
  lg: 'h-11 gap-2 px-[18px] text-label',
  xl: 'h-[50px] gap-2 px-6 text-body',
  xxl: 'h-[52px] lg:h-11 gap-2.5 px-6 lg:px-5 text-body lg:has-[>span>svg:first-child]:pl-4',
  tall: 'h-12 lg:h-10 gap-2 px-4 text-body',
  block: 'h-[50px] lg:h-11 gap-2 px-4 text-body',
  icon: 'size-(--row-min) gap-2 p-0',
  'icon-sm': 'size-11 pointer-fine:size-9 gap-2 p-0',
};

/**
 * Styled native button or anchor, applied as an attribute so the host keeps every native behavior.
 *
 * @example
 * <button ui-button variant="destructive">Delete</button>
 * <button ui-button size="icon" variant="ghost" aria-label="More actions">...</button>
 */
@Component({
  selector: 'button[ui-button], a[ui-button]',
  template: `
    @if (loading()) {
      <span
        aria-hidden="true"
        class="rounded-pill animate-cairn-spin absolute inset-0 m-auto size-4 border-2 border-current border-r-transparent"
      ></span>
    }
    <span class="contents" [class.text-transparent]="loading()"><ng-content /></span>
  `,
  host: {
    '[class]': 'classes()',
    '[attr.aria-busy]': 'inactive() || null',
    '[attr.aria-disabled]': 'inactive() || null',
  },
})
export class UiButton {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly busy = input(false, { transform: booleanAttribute });

  protected readonly inactive = computed(() => this.loading() || this.busy());

  protected readonly classes = computed(
    () =>
      `${BASE_CLASSES} ${VARIANT_CLASSES[this.variant()]} ${SIZE_CLASSES[this.size()]}${this.inactive() ? ' pointer-events-none opacity-70' : ''}`,
  );

  constructor() {
    holdTransitionsUntilRendered();
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const guard = (event: Event): void => {
      if (this.inactive()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    host.addEventListener('click', guard, { capture: true });
    inject(DestroyRef).onDestroy(() => host.removeEventListener('click', guard, { capture: true }));
  }
}
