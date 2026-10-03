import { ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Holds the transitions of the host and of everything inside it until two frames after its first
 * render, through the `data-ui-settling` attribute and the matching rule of `styles/motion.css`.
 * A route's elements are created a tick before their classes are bound; a layout read in between
 * would otherwise turn the bound fill, colour or switch track into a transition on page open. Call it
 * in an injection context. A host whose view is never refreshed (a detached change detector) keeps the
 * attribute, and with it no transition.
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
