import { Component, ElementRef, afterRenderEffect, computed, contentChild, inject, input } from '@angular/core';

import { UI_CONTROL } from '../control/control';

const nextId = (() => {
  let count = 0;

  return (): string => `ui-field-${++count}`;
})();

/**
 * Label, control, hint and error as one unit. The control stays a plain native element:
 * the field finds it in its own projected content and wires the ARIA attributes onto it.
 *
 * The message comes from the caller's `error`, or, where none is set, from the projected control's
 * own validation state once it is touched.
 *
 * @example
 * <ui-field label="Quantity" hint="Leave empty if unknown">
 *   <input uiInput type="number" [formField]="form.quantity" />
 * </ui-field>
 *
 * @example
 * <ui-field label="ISIN or name" [error]="blank() ? 'Enter an ISIN' : undefined">
 *   <input uiInput type="search" />
 * </ui-field>
 */
@Component({
  selector: 'ui-field',
  template: `
    <div class="group flex flex-col gap-1.5">
      <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -- htmlFor is wired at runtime, once the projected control's id is known -->
      <label class="text-[13px] font-medium text-(--foreground)">{{ label() }}</label>

      <ng-content />

      @if (hint()) {
        <span class="text-[11.5px] text-(--subtle-foreground)" [id]="hintId">{{ hint() }}</span>
      }

      <div class="min-h-[1lh] text-[11.5px]">
        @if (message()) {
          <p class="text-(--negative)" role="alert" [id]="errorId">{{ message() }}</p>
        }
      </div>
    </div>
  `,
})
export class UiField {
  readonly label = input.required<string>();
  readonly hint = input<string>();
  readonly error = input<string>();

  readonly #id = nextId();
  protected readonly hintId = `${this.#id}-hint`;
  protected readonly errorId = `${this.#id}-error`;
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly control = contentChild(UI_CONTROL);

  /**
   * The caller's own `error` wins: it is the only way to report something the control does not
   * know about, such as a search box refusing an empty query.
   */
  protected readonly message = computed(() => {
    const explicit = this.error();

    if (explicit) {
      return explicit;
    }

    const control = this.control();

    if (!control?.touched()) {
      return undefined;
    }

    return control.errors().find((error) => error.message)?.message;
  });

  constructor() {
    afterRenderEffect(() => {
      // querySelector, not viewChild.required, so the "no control found" guard below stays reachable and testable.
      const control = this.#host.nativeElement.querySelector<HTMLElement>('input, select, textarea');

      if (!control) {
        return;
      }

      control.id ||= this.#id;
      this.#host.nativeElement.querySelector('label')!.htmlFor = control.id;

      const describedBy = [this.hint() ? this.hintId : null, this.message() ? this.errorId : null].filter(Boolean);

      if (describedBy.length > 0) {
        control.setAttribute('aria-describedby', describedBy.join(' '));
      } else {
        control.removeAttribute('aria-describedby');
      }

      if (this.message()) {
        control.setAttribute('aria-invalid', 'true');
      } else {
        control.removeAttribute('aria-invalid');
      }
    });
  }
}
