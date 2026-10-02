import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';

const HEIGHT_PROPERTY = '--action-bar-height';

/**
 * Bar of actions fixed above the tab bar on iPhone: the primary actions of a detail screen, within
 * thumb reach. It sits 52px plus the safe area above the bottom edge, so it clears `ui-tab-bar`, and
 * it is hidden from `64rem`, where the same actions live in the page itself. Its children share the
 * width equally. While it is on the page it publishes its height as `--action-bar-height` on the
 * root element, which `ui-toaster` adds to its offset so a confirmation never covers the actions.
 *
 * @example
 * <ui-action-bar>
 *   <button ui-button variant="outline" size="tall">Sell</button>
 *   <button ui-button size="tall">Buy</button>
 * </ui-action-bar>
 */
@Component({
  selector: 'ui-action-bar',
  template: '<ng-content />',
  host: {
    class:
      'fixed inset-x-0 bottom-[calc(52px+env(safe-area-inset-bottom))] z-40 grid grid-flow-col auto-cols-fr gap-2 bg-(--background) px-(--gutter) py-3 shadow-[0_-1px_0_var(--hairline)] lg:hidden',
  },
})
export class UiActionBar {
  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const root = inject(DOCUMENT).documentElement;
    const destroyRef = inject(DestroyRef);
    const publish = (): void => root.style.setProperty(HEIGHT_PROPERTY, `${host.offsetHeight}px`);

    afterNextRender(() => {
      publish();

      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(publish);
        observer.observe(host);
        destroyRef.onDestroy(() => observer.disconnect());
      }
    });

    destroyRef.onDestroy(() => root.style.removeProperty(HEIGHT_PROPERTY));
  }
}
