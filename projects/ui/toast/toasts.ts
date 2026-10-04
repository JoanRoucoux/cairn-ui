import { Injectable, signal } from '@angular/core';

export type Toast = {
  readonly id: number;
  readonly text: string;
  readonly kind: 'success' | 'error';
  readonly closeLabel: string;
};

/**
 * One-slot message queue read by `ui-toaster`: a confirmation that times out, or an error that stays until closed.
 *
 * @example
 * inject(UiToasts).show('Achat enregistré');
 * inject(UiToasts).showError("Échec de l'import");
 */
@Injectable({ providedIn: 'root' })
export class UiToasts {
  private readonly current = signal<Toast | null>(null);
  private sequence = 0;

  readonly toast = this.current.asReadonly();

  show(message: string): void {
    this.current.set({ id: ++this.sequence, text: message, kind: 'success', closeLabel: '' });
  }

  showError(message: string, closeLabel = 'Fermer'): void {
    this.current.set({ id: ++this.sequence, text: message, kind: 'error', closeLabel });
  }

  dismiss(): void {
    this.current.set(null);
  }
}
