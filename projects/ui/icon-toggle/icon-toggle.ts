import { Directive } from '@angular/core';

/**
 * Round icon button that switches something on and off, such as the header eye that hides the amounts.
 * The state lives in `aria-pressed`, which also draws the soft fill. Only the press scale transitions:
 * the fill changes at once.
 *
 * @example
 * <button uiIconToggle aria-label="Hide amounts" [attr.aria-pressed]="hidden"><svg>...</svg></button>
 */
@Directive({
  selector: 'button[uiIconToggle]',
  host: {
    type: 'button',
    class:
      'rounded-pill grid size-11 lg:size-10 place-items-center text-(--foreground) cursor-pointer select-none touch-manipulation transition-[scale] duration-(--duration-press) ease-out pointer-fine:hover:bg-(--glow) aria-pressed:bg-[image:linear-gradient(var(--soft),var(--soft))] aria-pressed:shadow-[inset_0_0_0_1px_var(--control-border)] forced-colors:border forced-colors:aria-pressed:forced-color-adjust-none forced-colors:aria-pressed:focus-visible:outline-[color:CanvasText] forced-colors:aria-pressed:bg-none forced-colors:aria-pressed:bg-[color:Highlight]! forced-colors:aria-pressed:text-[color:HighlightText]! active:scale-(--press-scale) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)',
  },
})
export class UiIconToggle {}
