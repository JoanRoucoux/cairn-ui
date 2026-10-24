import { Component, booleanAttribute, effect, inject, input } from '@angular/core';

import { UiAnnouncer } from '@joanroucoux/cairn-ui/announcer';

/**
 * Centered empty state: a title, a hint and an action slot, such as a search that matches nothing.
 * Set `announce` on an empty state that appears after a search or a filter, so a screen reader hears
 * it: content inserted with its text is not read on its own.
 *
 * @example
 * <ui-empty heading="No holding matches “zzz”" hint="Search covers the name and the ISIN.">
 *   <button ui-button variant="outline" size="md" type="button">Add a holding</button>
 * </ui-empty>
 */
@Component({
  selector: 'ui-empty',
  template: `
    <span class="text-body font-medium text-pretty">{{ heading() }}</span>
    @if (hint()) {
      <span class="text-label text-(--muted-foreground)">{{ hint() }}</span>
    }
    <div class="mt-2 empty:hidden"><ng-content /></div>
  `,
  host: { class: 'flex flex-col items-center gap-1.5 px-2 py-6 text-center lg:py-12' },
})
export class UiEmpty {
  readonly heading = input.required<string>();
  readonly hint = input('');
  readonly announce = input(false, { transform: booleanAttribute });

  constructor() {
    const announcer = inject(UiAnnouncer);

    effect(() => {
      if (this.announce()) {
        announcer.announce(this.hint() ? `${this.heading()}. ${this.hint()}` : this.heading());
      }
    });
  }
}
