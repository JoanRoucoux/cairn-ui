import { Component, ElementRef, afterRenderEffect, inject, input } from '@angular/core';

const nextId = (() => {
  let count = 0;

  return (): string => `ui-field-${++count}`;
})();

/**
 * Label, control, hint and error as one unit. The control stays a plain native element:
 * the field finds it in its own projected content and wires the ARIA attributes onto it.
 *
 * @example
 * <ui-field label="Quantity" hint="Leave empty if unknown">
 *   <input uiInput type="number" />
 * </ui-field>
 */
@Component({
  selector: 'ui-field',
  template: `
    <div class="flex flex-col gap-1.5">
      <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -- htmlFor is wired at runtime, once the projected control's id is known -->
      <label class="text-[13px] font-medium text-(--foreground)">{{ label() }}</label>

      <ng-content />

      @if (hint()) {
        <span class="text-[11.5px] text-(--subtle-foreground)" [id]="hintId">{{ hint() }}</span>
      }

      @if (error()) {
        <p class="text-[11.5px] text-(--negative)" role="alert" [id]="errorId">{{ error() }}</p>
      }
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

  constructor() {
    afterRenderEffect(() => {
      // querySelector, not viewChild.required, so the "no control found" guard below stays reachable and testable.
      const control = this.#host.nativeElement.querySelector<HTMLElement>('input, select, textarea');

      if (!control) {
        return;
      }

      control.id ||= this.#id;
      this.#host.nativeElement.querySelector('label')!.htmlFor = control.id;

      const describedBy = [this.hint() ? this.hintId : null, this.error() ? this.errorId : null].filter(Boolean);

      if (describedBy.length > 0) {
        control.setAttribute('aria-describedby', describedBy.join(' '));
      } else {
        control.removeAttribute('aria-describedby');
      }

      if (this.error()) {
        control.setAttribute('aria-invalid', 'true');
      } else {
        control.removeAttribute('aria-invalid');
      }
    });
  }
}
