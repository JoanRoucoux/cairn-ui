import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject } from '@angular/core';

const ANNOUNCE_DELAY = 100;

/**
 * Speaks a message to screen readers through one visually hidden polite live region, created on the
 * first call. The region moves into the last open modal dialog, which makes everything outside it
 * inert, and is cleared before each message so a repeated message is read again.
 *
 * @example
 * private readonly announcer = inject(UiAnnouncer);
 *
 * save(): void {
 *   this.announcer.announce('Holding added to Northwind Brokerage');
 * }
 */
@Injectable({ providedIn: 'root' })
export class UiAnnouncer {
  readonly #document = inject(DOCUMENT);
  #region: HTMLElement | null = null;
  #timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.#timer);
      this.#region?.remove();
      this.#region = null;
    });
  }

  announce(message: string): void {
    const region = (this.#region ??= this.#createRegion());
    const host = this.#host();

    if (region.parentElement !== host) {
      host.appendChild(region);
    }

    region.textContent = '';
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => {
      region.textContent = message;
    }, ANNOUNCE_DELAY);
  }

  #createRegion(): HTMLElement {
    const region = this.#document.createElement('div');

    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.style.cssText =
      'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';

    return region;
  }

  #host(): HTMLElement {
    const modals = Array.from(this.#document.querySelectorAll('dialog[open]')).filter((dialog) =>
      dialog.matches(':modal'),
    );

    return (modals.at(-1) as HTMLElement | undefined) ?? this.#document.body;
  }
}
