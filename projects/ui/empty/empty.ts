import { Component, input } from '@angular/core';

/**
 * Centred empty state: a title, a hint and an action slot, such as a search that matches nothing.
 *
 * @example
 * <ui-empty heading="Aucune ligne ne correspond à « zzz »" hint="La recherche porte sur le nom et l'ISIN.">
 *   <button ui-button variant="outline" size="md" type="button">Ajouter une ligne</button>
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
