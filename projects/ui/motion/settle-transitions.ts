import { ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Holds the transitions of the host and of everything inside it until two frames after its first
 * render, so bound classes do not animate on page open. Call it in an injection context. A host
 * whose view is never refreshed (a detached change detector) never gets its transitions back.
 *
 * @example
 * constructor() {
 *   holdTransitionsUntilRendered();
 * }
 */
export function holdTransitionsUntilRendered(): void {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  host.setAttribute('data-ui-settling', '');
  afterNextRender({
    read: () => {
      requestAnimationFrame(() => requestAnimationFrame(() => host.removeAttribute('data-ui-settling')));
    },
  });
}
