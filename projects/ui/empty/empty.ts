import { Component, input } from '@angular/core';

/**
 * Centered empty state: a title, a hint and an action slot, such as a search that matches nothing.
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
}
