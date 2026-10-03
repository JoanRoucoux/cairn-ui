import { Directive, computed, forwardRef, input } from '@angular/core';

import { UI_CONTROL, type UiControl, type UiControlError } from '@joanroucoux/cairn-ui/control';
import { CONTROL_BASE_CLASSES, CONTROL_SIZE_CLASSES, type ControlSize } from '@joanroucoux/cairn-ui/input';

const SELECT_CLASSES =
  'cursor-pointer appearance-none pr-10 bg-(image:--chevron-down) bg-no-repeat bg-[position:right_0.75rem_center] bg-[size:1.125rem]';

// Tailwind scans for literal strings: build no class by prefixing in code.
const PICKER_CLASSES = [
  'pointer-fine:supports-[appearance:base-select]:[appearance:base-select]',
  'pointer-fine:supports-[appearance:base-select]:items-center',
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
 * Styled native select, drop-down list included where the browser allows it. Declares the `errors`
 * and `touched` inputs Angular's `[formField]` fills, so a surrounding `ui-field` can show the message.
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
    () =>
      `${CONTROL_BASE_CLASSES} bg-(--background) ${SELECT_CLASSES} ${PICKER_CLASSES} ${CONTROL_SIZE_CLASSES[this.size()]}`,
  );
}
