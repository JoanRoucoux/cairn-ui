import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  viewChildren,
} from '@angular/core';

import { UI_CONTROL, type UiControl, type UiControlError } from '../control/control';
import { CONTROL_SURFACE_CLASSES, type ControlSurface } from '../input/input';

export type ChoiceChipOption = {
  value: string;
  label: string;
};

const CHIP_CLASSES =
  'h-10 px-3.5 pointer-fine:h-8 pointer-fine:px-3 rounded-pill text-label font-medium cursor-pointer transition-transform duration-(--duration-press) ease-out active:scale-(--press-scale) disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring)';

const SELECTED_CLASSES = 'bg-(--primary) text-(--primary-foreground)';

const UNSELECTED_CLASSES = 'text-(--foreground) shadow-[inset_0_0_0_1px_var(--border)]';

const nextId = (() => {
  let count = 0;

  return (): string => `ui-choice-chips-${++count}`;
})();

/**
 * Exclusive choice among a handful of named options, shown as wrapping pills: an account envelope,
 * a category, a frequency. Binds to Signal Forms with `[formField]`.
 *
 * @example
 * <ui-choice-chips label="Envelope" [options]="envelopes" [(value)]="envelope" />
 *
 * @example
 * <ui-choice-chips label="Envelope" [options]="envelopes" [formField]="form.envelope" />
 */
@Component({
  selector: 'ui-choice-chips',
  template: `
    <div
      class="flex flex-col gap-1.5"
      role="radiogroup"
      [attr.aria-invalid]="invalid() || null"
      [attr.aria-label]="ariaLabel() ?? null"
      [attr.aria-labelledby]="labelledBy()"
      [attr.aria-required]="required() || null"
      (focusout)="onFocusOut($event)"
    >
      @if (label()) {
        <span class="text-label leading-[17px] font-medium text-(--muted-foreground)" [id]="labelId">{{
          label()
        }}</span>
      }

      <div class="flex flex-wrap gap-1.5">
        @for (option of options(); track option.value; let index = $index) {
          <button
            #radio
            role="radio"
            type="button"
            [attr.aria-checked]="option.value === value()"
            [attr.tabindex]="tabIndexFor(option.value)"
            [class]="chipClasses(option.value)"
            [disabled]="disabled()"
            (click)="select(option.value)"
            (keydown)="onKeydown($event, index)"
          >
            {{ option.label }}
          </button>
        }
      </div>
    </div>
  `,
  providers: [{ provide: UI_CONTROL, useExisting: forwardRef(() => UiChoiceChips) }],
})
export class UiChoiceChips implements UiControl {
  readonly options = input.required<ChoiceChipOption[]>();
  readonly value = model.required<string>();
  readonly label = input<string>();
  readonly ariaLabel = input<string>();
  readonly ariaLabelledby = input<string>();
  readonly surface = input<ControlSurface>('background');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly errors = input<readonly UiControlError[]>([]);
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly touched = input(false);
  readonly touch = output<void>();

  protected readonly labelId = nextId();
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly radios = viewChildren<ElementRef<HTMLButtonElement>>('radio');

  protected readonly labelledBy = computed(() => this.ariaLabelledby() ?? (this.label() ? this.labelId : null));

  protected chipClasses(optionValue: string): string {
    const state =
      optionValue === this.value()
        ? SELECTED_CLASSES
        : `${CONTROL_SURFACE_CLASSES[this.surface()]} ${UNSELECTED_CLASSES}`;

    return `${CHIP_CLASSES} ${state}`;
  }

  protected tabIndexFor(optionValue: string): number {
    const opts = this.options();
    const tabStopValue = opts.some((option) => option.value === this.value()) ? this.value() : opts[0]?.value;

    return optionValue === tabStopValue ? 0 : -1;
  }

  protected select(optionValue: string): void {
    this.value.set(optionValue);
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!this.#host.nativeElement.contains(event.relatedTarget as Node | null)) {
      this.touch.emit();
    }
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const opts = this.options();
    const target = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: opts.length - 1,
    }[event.key];

    if (target === undefined) {
      return;
    }
    event.preventDefault();

    const nextIndex = ((target % opts.length) + opts.length) % opts.length;

    this.value.set(opts[nextIndex]!.value);
    this.radios()[nextIndex]!.nativeElement.focus();
  }
}
