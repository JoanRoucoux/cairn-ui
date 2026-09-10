import { Directive, computed, forwardRef, input } from '@angular/core';

import { UI_CONTROL, type UiControl, type UiControlError } from '../control/control';
import { CONTROL_BASE_CLASSES, CONTROL_SIZE_CLASSES, type ControlSize } from '../input/input';

const SELECT_CLASSES = 'pr-8';

/**
 * Styled native select. Deliberately keeps the platform's own chevron and picker:
 * they are what makes the control usable on a phone.
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
    () => `${CONTROL_BASE_CLASSES} ${SELECT_CLASSES} ${CONTROL_SIZE_CLASSES[this.size()]}`,
  );
}
