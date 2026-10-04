import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  contentChild,
  input,
  output,
  viewChild,
} from '@angular/core';

import { UiMenu, UiMenuTrigger } from '@joanroucoux/cairn-ui/menu';

const HOST_CLASSES = 'relative flex-none inline-flex h-11 items-center pointer-fine:h-8';

const DISABLED_HOST_CLASSES = 'opacity-40';

const TRIGGER_CLASSES =
  '-mx-[5px] flex h-11 cursor-pointer items-center rounded-pill border-x-[5px] border-y-0 border-transparent bg-transparent p-0 font-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-5 focus-visible:outline-(--ring) pointer-fine:mx-0 pointer-fine:h-8 pointer-fine:border-x-0 pointer-fine:focus-visible:outline-offset-0 disabled:pointer-events-none';

const PILL_CLASSES =
  'flex h-[34px] items-center rounded-pill pr-[30px] pl-3 text-label font-medium whitespace-nowrap forced-colors:border pointer-fine:h-8';

const REST_PILL_CLASSES = 'bg-(--card) text-(--foreground) shadow-[inset_0_0_0_1px_var(--border)]';

const ACTIVE_PILL_CLASSES = 'bg-(--primary) text-(--primary-foreground)';

const CLEAR_CLASSES =
  'absolute end-0 flex size-[34px] cursor-pointer items-center justify-center rounded-pill border-0 bg-transparent p-0 text-(--primary-foreground) focus-visible:outline-2 focus-visible:-outline-offset-7 focus-visible:outline-(--primary-foreground) pointer-fine:size-8 pointer-fine:focus-visible:-outline-offset-6 after:absolute after:-inset-[5px] pointer-fine:after:-inset-0.5';

/**
 * A pill that opens a `ui-menu` of exclusive choices, to head a row of filter chips: outlined at rest with a
 * chevron, solid primary when `active`, where a separate 14 px cross replaces the chevron and emits `cleared`.
 * It is 34 px tall inside a 44 px target on touch and 32 px with a fine pointer; its focus ring is an outline
 * 2 px outside the pill; the cross has a 44 px hit area on touch (36 px with a fine pointer). `contextLabel`, when
 * given, is read before the label while active so a screen reader hears what the account is. Clearing moves focus
 * back to the trigger. `disabled` dims it like a disabled button, opens nothing and draws the chevron even when `active`. The projected text is the pill label and the projected `ui-menu` is what it opens.
 *
 * @example
 * <ui-select-pill uiChipsLeading [active]="!!account()" clearLabel="Clear the account" (cleared)="account.set('')">
 *   {{ accountName() }}
 *   <ui-menu label="Account" sheet>
 *     <button uiMenuItem [checked]="!account()" (click)="account.set('')">All accounts</button>
 *   </ui-menu>
 * </ui-select-pill>
 */
@Component({
  selector: 'ui-select-pill',
  imports: [UiMenuTrigger],
  template: `
    <button
      #trigger
      type="button"
      [attr.aria-disabled]="disabled() || null"
      [class]="triggerClasses"
      [disabled]="disabled()"
      [uiMenuTrigger]="menu()"
    >
      <span data-pill [class]="pillClasses()">
        @if (active() && contextLabel()) {
          <span class="sr-only">{{ contextLabel() }} </span>
        }
        <ng-content
      /></span>
    </button>
    @if (active() && !disabled()) {
      <button data-clear type="button" [attr.aria-label]="clearLabel()" [class]="clearClasses" (click)="clear()">
        <svg
          aria-hidden="true"
          fill="none"
          height="14"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
          width="14"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    } @else {
      <svg
        aria-hidden="true"
        class="pointer-events-none absolute right-2.5"
        data-chevron
        fill="none"
        height="14"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        width="14"
        [class]="chevronClasses()"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    }
    <ng-content select="ui-menu" />
  `,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class UiSelectPill {
  readonly active = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly clearLabel = input.required<string>();
  readonly contextLabel = input<string>();
  readonly cleared = output();

  protected readonly menu = contentChild.required(UiMenu);
  protected readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  protected readonly hostClasses = computed(() =>
    this.disabled() ? `${HOST_CLASSES} ${DISABLED_HOST_CLASSES}` : HOST_CLASSES,
  );
  protected readonly chevronClasses = computed(() =>
    this.active() ? 'text-(--primary-foreground)' : 'text-(--foreground)',
  );
  protected readonly triggerClasses = TRIGGER_CLASSES;
  protected readonly clearClasses = CLEAR_CLASSES;
  protected clear(): void {
    this.cleared.emit();
    this.trigger().nativeElement.focus();
  }

  protected readonly pillClasses = computed(
    () => `${PILL_CLASSES} ${this.active() ? ACTIVE_PILL_CLASSES : REST_PILL_CLASSES}`,
  );
}
