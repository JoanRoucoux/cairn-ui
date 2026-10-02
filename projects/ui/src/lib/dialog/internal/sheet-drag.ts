const DISMISS_RATIO = 0.3;
const DISMISS_SPEED = 0.5;
const SPEED_WINDOW = 100;
const SLOP = 6;
const CONTROLS = 'button, a, input, select, textarea, [role="button"]';

type Sample = { y: number; at: number };

type Gesture = {
  id: number;
  startX: number;
  startY: number;
  dragging: boolean;
  height: number;
  offset: number;
  samples: Sample[];
};

export class SheetDrag {
  readonly #panel: HTMLElement;
  readonly #grips: readonly HTMLElement[];
  readonly #dismiss: () => void;
  #gesture: Gesture | null = null;

  constructor(panel: HTMLElement, grips: readonly HTMLElement[], dismiss: () => void) {
    this.#panel = panel;
    this.#grips = grips;
    this.#dismiss = dismiss;

    for (const grip of grips) {
      grip.addEventListener('pointerdown', this.#onDown);
      grip.addEventListener('pointermove', this.#onMove);
      grip.addEventListener('pointerup', this.#onUp);
      grip.addEventListener('pointercancel', this.#onCancel);
    }
  }

  reset(): void {
    this.#panel.style.removeProperty('--drag-y');
  }

  destroy(): void {
    for (const grip of this.#grips) {
      grip.removeEventListener('pointerdown', this.#onDown);
      grip.removeEventListener('pointermove', this.#onMove);
      grip.removeEventListener('pointerup', this.#onUp);
      grip.removeEventListener('pointercancel', this.#onCancel);
    }
  }

  readonly #onDown = (event: PointerEvent): void => {
    const grip = event.currentTarget as HTMLElement;

    if (event.button !== 0 || !isSheet() || (event.target as Element).closest(CONTROLS)) {
      return;
    }

    grip.setPointerCapture(event.pointerId);
    this.#gesture = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
      height: 0,
      offset: 0,
      samples: [{ y: event.clientY, at: event.timeStamp }],
    };
  };

  readonly #onMove = (event: PointerEvent): void => {
    const gesture = this.#current(event);

    if (!gesture) {
      return;
    }

    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;

    if (!gesture.dragging) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SLOP) {
        return;
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        this.#gesture = null;
        return;
      }
      gesture.dragging = true;
      gesture.height = this.#panel.getBoundingClientRect().height;
      this.#panel.setAttribute('data-dragging', '');
    }

    gesture.offset = Math.max(0, dy);
    gesture.samples.push({ y: event.clientY, at: event.timeStamp });
    this.#panel.style.setProperty('--drag-y', `${gesture.offset}px`);
  };

  readonly #onUp = (event: PointerEvent): void => {
    const gesture = this.#current(event);

    if (!gesture) {
      return;
    }

    this.#gesture = null;

    if (!gesture.dragging) {
      return;
    }

    this.#panel.removeAttribute('data-dragging');

    const release = { y: event.clientY, at: event.timeStamp };

    if (gesture.offset > gesture.height * DISMISS_RATIO || releaseSpeed(gesture.samples, release) > DISMISS_SPEED) {
      this.#dismiss();
    } else {
      this.reset();
    }
  };

  readonly #onCancel = (event: PointerEvent): void => {
    if (this.#current(event)) {
      this.#gesture = null;
      this.#panel.removeAttribute('data-dragging');
      this.reset();
    }
  };

  #current(event: PointerEvent): Gesture | null {
    return this.#gesture?.id === event.pointerId ? this.#gesture : null;
  }
}

function isSheet(): boolean {
  return typeof matchMedia === 'function' && !matchMedia('(min-width: 64rem)').matches;
}

function releaseSpeed(samples: readonly Sample[], last: Sample): number {
  const first = samples.find((sample) => sample.at >= last.at - SPEED_WINDOW) ?? last;
  const elapsed = last.at - first.at;

  return elapsed > 0 ? (last.y - first.y) / elapsed : 0;
}
