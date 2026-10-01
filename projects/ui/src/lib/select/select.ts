import { Directive, computed, forwardRef, input } from '@angular/core';

import { UI_CONTROL, type UiControl, type UiControlError } from '../control/control';
import { CONTROL_BASE_CLASSES, CONTROL_SIZE_CLASSES, type ControlSize } from '../input/input';

const SELECT_CLASSES =
  'cursor-pointer appearance-none pr-10 bg-(image:--chevron-down) bg-no-repeat bg-[position:right_0.75rem_center] bg-[size:1.125rem]';

// Spelled out prefix included: Tailwind scans for literal strings, so a prefix applied in code
// emits nothing. The padding stays under `supports` so base-select does not reset it to a smaller one.
const PICKER_CLASSES = [
  'pointer-fine:supports-[appearance:base-select]:[appearance:base-select]',
  'pointer-fine:supports-[appearance:base-select]:items-center',
  'pointer-fine:supports-[appearance:base-select]:pr-10',
  'pointer-fine:supports-[appearance:base-select]:[&_option]:cursor-pointer',
  'pointer-fine:supports-[appearance:base-select]:[&_option]:rounded-control',
  'pointer-fine:supports-[appearance:base-select]:[&_option]:px-2.5',
  'pointer-fine:supports-[appearance:base-select]:[&_option]:py-2',
  'pointer-fine:supports-[appearance:base-select]:[&_option:hover]:bg-(--soft)',
  'pointer-fine:supports-[appearance:base-select]:[&_option:focus]:bg-(--soft)',
  'pointer-fine:supports-[appearance:base-select]:[&_option:checked]:font-medium',
  '[&::picker-icon]:hidden',
  '[&::picker(select)]:[appearance:base-select]',
  '[&::picker(select)]:my-1.5',
  '[&::picker(select)]:rounded-control',
  '[&::picker(select)]:border',
  '[&::picker(select)]:border-(--border)',
  '[&::picker(select)]:bg-(--card)',
  '[&::picker(select)]:[position-try-fallbacks:none]',
  '[&::picker(select)]:overflow-y-auto',
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
