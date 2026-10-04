import { Component, input, output } from '@angular/core';

import { type AsyncState, UiAsync } from '@joanroucoux/cairn-ui/async';

let nextId = 0;

const PULSE_ANIMATION = 'cairn-pulse var(--pulse-duration) var(--ease-out) infinite alternate';

const BAR_CLASSES = 'block h-4 rounded-control bg-(--muted)';

/**
 * One source of a search: a two-tone heading, then its rows, or a skeleton while it answers, a
 * message when it has nothing, or an inline error with a retry.
 *
 * @example
 * <ui-result-group label="Yahoo Finance" hint="cours en continu" [state]="state()"
 *   errorMessage="Yahoo Finance n'a pas répondu." retryLabel="Réessayer" (retry)="search()">
 *   <button ui-row size="dense" type="button">...</button>
 *   <span resultGroupMessage>Aucun résultat chez Yahoo Finance.</span>
 * </ui-result-group>
 */
@Component({
  selector: 'ui-result-group',
  imports: [UiAsync],
  template: `
    <div class="text-caption flex items-baseline gap-1.5 pt-3 pr-2.5 pb-1 pl-2.5 tracking-(--tracking-caption)">
      <span class="font-semibold text-(--foreground)" [id]="headingId">{{ label() }}</span>
      @if (hint()) {
        <span class="text-(--subtle-foreground)">{{ hint() }}</span>
      }
    </div>
    <ui-async
      variant="inline"
      [errorMessage]="errorMessage()"
      [retryIcon]="false"
      [retryLabel]="retryLabel()"
      [state]="state()"
      (retry)="retry.emit()"
    >
      <div asyncLoading class="flex flex-col gap-3.5 px-2.5 pt-2.5 pb-3">
        <span class="flex justify-between">
          <span class="${BAR_CLASSES} w-50" [style.animation]="animation"></span>
          <span class="${BAR_CLASSES} w-16" [style.animation]="animation"></span>
        </span>
        <span class="flex justify-between">
          <span class="${BAR_CLASSES} w-40" [style.animation]="animation"></span>
          <span class="${BAR_CLASSES} w-16" [style.animation]="animation"></span>
        </span>
      </div>
      <div asyncEmpty class="text-label px-2.5 pt-1 pb-2.5 text-pretty text-(--muted-foreground)">
        <ng-content select="[resultGroupMessage]" />
      </div>
      <ng-content />
    </ui-async>
  `,
  host: {
    class: 'block',
    role: 'group',
    '[attr.aria-labelledby]': 'headingId',
  },
})
export class UiResultGroup {
  readonly label = input.required<string>();
  readonly hint = input<string>();
  readonly state = input<AsyncState>('ready');
  readonly errorMessage = input<string>();
  readonly retryLabel = input<string>();
  readonly retry = output<void>();

  protected readonly headingId = `ui-result-group-${nextId++}`;
  protected readonly animation = PULSE_ANIMATION;
}
