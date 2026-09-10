import { Directive, computed, forwardRef, input } from '@angular/core';

import { UI_CONTROL, type UiControl, type UiControlError } from '../control/control';
import { CONTROL_BASE_CLASSES, CONTROL_SIZE_CLASSES, type ControlSize } from '../input/input';

const SELECT_CLASSES = 'pr-8';

/**
 * Opts the select into the customizable rendering, the only thing that reaches the drop-down list
 * itself: before it, the list was drawn by the platform and no rule could touch it.
 *
 * Both guards on the button are load bearing. `pointer-fine` leaves a touch screen its own native
 * picker, which beats anything drawn in the page. `supports` is what stops Firefox - a fine pointer
 * with no customizable select - from taking the padding meant for a laid out chevron while it still
 * draws its own over the text. The `::picker(select)` rules need no guard: without the switch there
 * is no picker for them to match.
 *
 * Every class is spelled out, prefix included. Tailwind scans source files for literal strings, so
 * a prefix applied in code would produce no CSS at all.
 */
const PICKER_CLASSES = [
  'pointer-fine:supports-[appearance:base-select]:[appearance:base-select]',
  'pointer-fine:supports-[appearance:base-select]:pr-3',
  // base-select turns the button into a flex container, which stops centring the text on its own.
  'pointer-fine:supports-[appearance:base-select]:items-center',
  'pointer-fine:supports-[appearance:base-select]:[&_option]:rounded-md',
  'pointer-fine:supports-[appearance:base-select]:[&_option]:px-2.5',
  'pointer-fine:supports-[appearance:base-select]:[&_option]:py-2',
  'pointer-fine:supports-[appearance:base-select]:[&_option:hover]:bg-(--soft)',
  // Arrow keys move focus rather than hover, so the keyboard needs its own highlight.
  'pointer-fine:supports-[appearance:base-select]:[&_option:focus]:bg-(--soft)',
  'pointer-fine:supports-[appearance:base-select]:[&_option:checked]:font-medium',
  '[&::picker-icon]:text-(--muted-foreground)',
  '[&::picker-icon]:text-[11px]',
  '[&::picker(select)]:[appearance:base-select]',
  '[&::picker(select)]:mt-1.5',
  '[&::picker(select)]:rounded-lg',
  '[&::picker(select)]:border',
  '[&::picker(select)]:border-(--border)',
  '[&::picker(select)]:bg-(--card)',
  '[&::picker(select)]:p-1',
  '[&::picker(select)]:text-(--card-foreground)',
].join(' ');

/**
 * Styled native select, drop-down list included where the browser allows it. It stays a native
 * `<select>`: keyboard, typeahead and semantics come from the platform, not from a rebuilt listbox.
 *
 * Declares the `errors` and `touched` inputs Angular's `[formField]` fills, so a `ui-field` around
 * it can show the message without any binding here.
 *
 * @example
 * <select uiSelect><option value="pea">PEA</option></select>
 */
@Directive({
  selector: 'select[uiSelect]',
  host: {
    '[class]': 'classes()',
  },
  providers: [{ provide: UI_CONTROL, useExisting: forwardRef(() => UiSelect) }],
})
export class UiSelect implements UiControl {
  readonly size = input<ControlSize>('md');
  readonly errors = input<readonly UiControlError[]>([]);
  readonly touched = input(false);

  protected readonly classes = computed(
    () => `${CONTROL_BASE_CLASSES} ${SELECT_CLASSES} ${PICKER_CLASSES} ${CONTROL_SIZE_CLASSES[this.size()]}`,
  );
}
