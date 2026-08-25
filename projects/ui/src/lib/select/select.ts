import { Directive, computed, input } from '@angular/core';

import { CONTROL_BASE_CLASSES, CONTROL_SIZE_CLASSES, type ControlSize } from '../input/input';

const SELECT_CLASSES = 'bg-(--elevated) pr-8';

/**
 * Styled native select. Deliberately keeps the platform's own chevron and picker:
 * they are what makes the control usable on a phone.
 *
 * @example
 * <select uiSelect><option value="pea">PEA</option></select>
 */
@Directive({
  selector: 'select[uiSelect]',
  host: {
    '[class]': 'classes()',
  },
})
export class UiSelect {
  readonly size = input<ControlSize>('md');

  protected readonly classes = computed(
    () => `${CONTROL_BASE_CLASSES} ${SELECT_CLASSES} ${CONTROL_SIZE_CLASSES[this.size()]}`,
  );
}
