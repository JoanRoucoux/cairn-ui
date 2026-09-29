import { Component, input, output } from '@angular/core';

/** Available async block states. `AsyncState` is derived from this tuple. */
export const ASYNC_STATES = ['loading', 'error', 'empty', 'ready'] as const;
export type AsyncState = (typeof ASYNC_STATES)[number];

const RETRY_BUTTON_CLASSES =
  'mt-2 relative inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap cursor-pointer select-none touch-manipulation transition-[transform,background-color,opacity] duration-(--duration-press) ease-out active:scale-(--press-scale) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ring) min-h-(--row-min) px-4 text-label bg-(--card) text-(--foreground) shadow-[inset_0_0_0_1px_var(--border)] hover:bg-(--glow)';

/**
 * The three states of a block that depends on a service call, next to the ready content.
 *
 * @example
 * <ui-async [state]="totalState()" errorTitle="Total could not be loaded" errorMessage="The server did not answer." retryLabel="Retry" (retry)="reload()">
 *   <span asyncLoading><ui-skeleton shape="figure" /></span>
 *   <span asyncEmpty>Add a holding to see your total.</span>
 *   <span>{{ total() }}</span>
 * </ui-async>
 */
@Component({
  selector: 'ui-async',
  template: `
    @switch (state()) {
      @case ('loading') {
        <ng-content select="[asyncLoading]" />
      }
      @case ('error') {
        <div
          aria-live="polite"
          class="rounded-control flex flex-col items-start gap-1 bg-(--elevated) p-(--inset-card)"
          role="alert"
        >
          <span class="text-body font-medium">{{ errorTitle() }}</span>
          <span class="text-label text-(--muted-foreground)">{{ errorMessage() }}</span>
          <button type="button" [class]="retryButtonClasses" (click)="retry.emit()">
            {{ retryLabel() }}
          </button>
        </div>
      }
      @case ('empty') {
        <ng-content select="[asyncEmpty]" />
      }
      @default {
        <ng-content />
      }
    }
  `,
  host: {
    '[attr.aria-busy]': "state() === 'loading' || null",
  },
})
export class UiAsync {
  readonly state = input.required<AsyncState>();
  readonly errorTitle = input<string>();
  readonly errorMessage = input<string>();
  readonly retryLabel = input<string>();
  readonly retry = output<void>();

  protected readonly retryButtonClasses = RETRY_BUTTON_CLASSES;
}
