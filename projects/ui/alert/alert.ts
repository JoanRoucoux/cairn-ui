import { Component, booleanAttribute, computed, input } from '@angular/core';

export const ALERT_VARIANTS = ['error', 'warning'] as const;
export type AlertVariant = (typeof ALERT_VARIANTS)[number];

const BASE_CLASSES = 'flex items-start gap-2.5 text-left text-label';

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  error: 'rounded-control bg-(--card) px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--border)]',
  warning: 'text-(--foreground)',
};

/**
 * Inline message explaining a failure or a consequence: an icon, an optional heading and a text.
 * It fades in when it appears; set `[fadeIn]="false"` on an alert that is part of the page as it
 * opens.
 *
 * @example
 * <ui-alert heading="Sign-in failed">Try again.</ui-alert>
 */
@Component({
  selector: 'ui-alert',
  template: `
    @if (variant() === 'warning') {
      <svg
        aria-hidden="true"
        class="mt-px block flex-none stroke-(--negative)"
        fill="none"
        height="18"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.75"
        viewBox="0 0 24 24"
        width="18"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    } @else {
      <svg
        aria-hidden="true"
        class="block flex-none stroke-(--negative)"
        fill="none"
        height="18"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.75"
        viewBox="0 0 24 24"
        width="18"
        [class.mt-px]="heading()"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
    }
    <div class="flex flex-col gap-0.5">
      @if (heading()) {
        <span class="font-medium">{{ heading() }}</span>
      }
      <span class="text-pretty" [class.text-(--muted-foreground)]="heading()"><ng-content /></span>
    </div>
  `,
  host: {
    'animate.leave': 'ui-leave-fade',
    '[class]': 'classes()',
    '[attr.role]': "variant() === 'warning' ? 'status' : 'alert'",
  },
})
export class UiAlert {
  readonly variant = input<AlertVariant>('error');
  readonly heading = input<string>();
  readonly fadeIn = input(true, { transform: booleanAttribute });

  protected readonly classes = computed(
    () => `${BASE_CLASSES} ${VARIANT_CLASSES[this.variant()]}${this.fadeIn() ? ' ui-enter-fade' : ''}`,
  );
}
