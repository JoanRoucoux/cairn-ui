import {
  Component,
  Directive,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
} from '@angular/core';

import { UI_CONTROL } from '../control/control';

const nextId = (() => {
  let count = 0;

  return (): string => `ui-field-${++count}`;
})();

/**
 * Marks an element, typically an 18px svg icon, as the leading content of a `ui-field`: it sits
 * inside the control's left edge and the control's text is inset to clear it. Decorative, so hidden
 * from assistive technologies.
 *
 * @example
 * <ui-field label="Search" labelHidden>
 *   <svg uiFieldLeading width="18" height="18" viewBox="0 0 24 24">...</svg>
 *   <input uiInput type="search" />
 * </ui-field>
 */
@Directive({
  selector: '[uiFieldLeading]',
  host: {
    class: 'pointer-events-none absolute left-3 flex text-(--muted-foreground)',
    'aria-hidden': 'true',
  },
})
export class UiFieldLeading {}

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
 *
 * @example
 * <ui-field label="Search holdings" labelHidden>
 *   <input uiInput type="search" placeholder="Instrument or account" />
 * </ui-field>
 */
@Component({
  selector: 'ui-field',
  template: `
    <div class="group flex flex-col gap-1.5">
      <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -- htmlFor is wired at runtime, once the projected control's id is known -->
      <label [class]="labelClasses()">{{ label() }}</label>

      <div [class]="rowClasses()">
        <ng-content select="[uiFieldLeading]" />
        <ng-content />

        @if (unit()) {
          <span class="text-label pointer-events-none absolute right-3 text-(--subtle-foreground)">{{ unit() }}</span>
        }
      </div>

      @if (hint()) {
        <span class="text-label text-(--muted-foreground)" [id]="hintId">{{ hint() }}</span>
      }

      @if (message()) {
        <p class="text-label font-medium text-(--negative)" role="alert" [id]="errorId">{{ message() }}</p>
      }
    </div>
  `,
})
export class UiField {
  readonly label = input.required<string>();
  readonly labelHidden = input(false, { transform: booleanAttribute });
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly unit = input<string>();

  readonly #id = nextId();
  protected readonly hintId = `${this.#id}-hint`;
  protected readonly errorId = `${this.#id}-error`;
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly control = contentChild(UI_CONTROL);
  protected readonly leading = contentChild(UiFieldLeading);

  protected readonly rowClasses = computed(() =>
    this.leading() ? 'relative flex items-center [&>input]:pl-[38px]' : 'relative flex items-center',
  );

  protected readonly labelClasses = computed(() =>
    this.labelHidden() ? 'sr-only' : 'text-label leading-[17px] font-medium text-(--muted-foreground)',
  );

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
