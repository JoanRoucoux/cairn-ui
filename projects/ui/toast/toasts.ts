import { Injectable, signal } from '@angular/core';

export type Toast = {
  readonly id: number;
  readonly text: string;
};

/**
 * One-slot confirmation message queue read by `ui-toaster`.
 *
 * @example
 * inject(UiToasts).show('Achat enregistré');
 */
@Injectable({ providedIn: 'root' })
export class UiToasts {
  private readonly current = signal<Toast | null>(null);
  private sequence = 0;

  readonly toast = this.current.asReadonly();

  show(message: string): void {
    this.current.set({ id: ++this.sequence, text: message });
  }

  dismiss(): void {
    this.current.set(null);
  }
}
