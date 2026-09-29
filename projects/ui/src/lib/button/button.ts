import { Component, DestroyRef, ElementRef, booleanAttribute, computed, inject, input } from '@angular/core';

/** Available button variants. `ButtonVariant` is derived from this tuple. */
export const BUTTON_VARIANTS = ['primary', 'outline', 'ghost', 'destructive'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

/** Available button sizes. `md` is the touch target Cairn asks for everywhere. */
export const BUTTON_SIZES = ['md', 'lg', 'xl', 'icon'] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

const BASE_CLASSES =
  // Tailwind's preflight gives buttons cursor: default; the hand cursor is what users expect here.
  'relative inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap cursor-pointer select-none touch-manipulation transition-[transform,background-color,opacity] duration-(--duration-press) ease-out active:scale-(--press-scale) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) disabled:pointer-events-none disabled:opacity-40 aria-disabled:not-aria-busy:opacity-40';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-(--primary) text-(--primary-foreground) hover:opacity-90',
  outline: 'bg-(--card) text-(--foreground) shadow-[inset_0_0_0_1px_var(--border)] hover:bg-(--glow)',
  ghost: 'bg-transparent text-(--foreground) hover:bg-(--glow)',
  destructive: 'bg-(--destructive) text-(--destructive-foreground) hover:opacity-90',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'min-h-(--row-min) px-4 text-label',
  lg: 'h-11 px-[18px] text-label',
  xl: 'h-[50px] px-6 text-body',
  icon: 'size-(--row-min) p-0',
};

/**
 * Styled native button. Applied as an attribute so the host keeps every native
 * button behavior (type, disabled, form submission, accessibility) for free.
 *
 * Also applies to an anchor, for the one case where the action really is a navigation:
 * a download the browser has to perform itself.
 *
 * `size="icon"` has no visible text: give it an `aria-label`.
 *
 * A `loading` button shows a spinner before its label and swallows clicks, so a slow first
 * response cannot turn into a double submission.
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
        class="rounded-pill size-4 border-2 border-current border-r-transparent motion-safe:animate-spin"
      ></span>
    }
    <ng-content />
  `,
  host: {
    '[class]': 'classes()',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.aria-disabled]': 'loading() || null',
  },
})
export class UiButton {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly loading = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(
    () =>
      `${BASE_CLASSES} ${VARIANT_CLASSES[this.variant()]} ${SIZE_CLASSES[this.size()]}${this.loading() ? ' pointer-events-none opacity-70' : ''}`,
  );

  constructor() {
    // A host `(click)` binding runs after the template's own listener, so a loading button would
    // still fire the consumer's handler once before this guard got a say. Capturing from the
    // constructor puts this listener first regardless of binding order.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const guard = (event: Event): void => {
      if (this.loading()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    host.addEventListener('click', guard, { capture: true });
    inject(DestroyRef).onDestroy(() => host.removeEventListener('click', guard, { capture: true }));
  }
}
