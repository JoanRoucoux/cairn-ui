import { Directive } from '@angular/core';

const INPUT_CLASSES =
  'h-9 w-full rounded-md border border-(--border) bg-transparent px-3 text-sm text-(--foreground) transition-colors placeholder:text-(--muted-foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Styled native text input. A directive (not a wrapper component) so the host
 * stays a plain <input>: every forms flavor (ngModel, reactive, signal forms)
 * and every native attribute keep working without any plumbing.
 *
 * @example
 * <input uiInput type="email" placeholder="you@example.com" />
 */
@Directive({
  selector: 'input[uiInput]',
  host: {
    class: INPUT_CLASSES,
  },
})
export class UiInput {}
