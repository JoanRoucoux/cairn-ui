import { type RenderResult, render, screen } from '@testing-library/angular';

import { type DialogCloseReason, UiDialog } from './dialog';

type Host = { open: boolean };

type Rendered = RenderResult<unknown> & {
  dialog: HTMLDialogElement;
  onDismissed: ReturnType<typeof vi.fn<() => void>>;
  onClosed: ReturnType<typeof vi.fn<(reason: DialogCloseReason) => void>>;
  reopen: (open: boolean) => void;
};

const renderDialog = async (exit = '180ms'): Promise<Rendered> => {
  const onDismissed = vi.fn<() => void>();
  const onClosed = vi.fn<(reason: DialogCloseReason) => void>();
  const result = await render(
    `<ui-dialog heading="Vendre" closeLabel="Fermer" [open]="open" (dismissed)="onDismissed()" (closed)="onClosed($event)">
       <p>Corps</p>
     </ui-dialog>`,
    { imports: [UiDialog], componentProperties: { open: true, onDismissed, onClosed } },
  );
  const dialog = result.container.querySelector('dialog') as HTMLDialogElement;

  dialog.style.transitionDuration = exit;

  const reopen = (open: boolean): void => {
    (result.fixture.componentInstance as Host).open = open;
    result.fixture.detectChanges();
  };

  return { ...result, dialog, onDismissed, onClosed, reopen };
};

const transitionEnd = (target: Element, pseudoElement = ''): void => {
  const event = new Event('transitionend', { bubbles: true });
  Object.defineProperty(event, 'pseudoElement', { value: pseudoElement });
  target.dispatchEvent(event);
};

const pointer = (target: Element, type: string, y: number, at: number, x = 50): void => {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  Object.defineProperty(event, 'timeStamp', { value: at });
  target.dispatchEvent(event);
};

describe('UiDialog close protocol', () => {
  beforeAll(() => {
    Object.defineProperty(Element.prototype, 'setPointerCapture', { value: vi.fn(), configurable: true });
  });

  afterAll(() => {
    delete (Element.prototype as Partial<Element>).setPointerCapture;
  });

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('reports the cross at once, and closed only once the exit has played', async () => {
    const { dialog, onDismissed, onClosed } = await renderDialog();

    screen.getByRole('button', { name: 'Fermer' }).click();

    expect(dialog).not.toHaveAttribute('open');
    expect(onDismissed).toHaveBeenCalledOnce();
    expect(onClosed).not.toHaveBeenCalled();

    transitionEnd(dialog);

    expect(onClosed).toHaveBeenCalledExactlyOnceWith('cross');
  });

  it('emits closed once, whichever of the exit transitions ends first', async () => {
    const { dialog, onClosed } = await renderDialog();

    screen.getByRole('button', { name: 'Fermer' }).click();
    transitionEnd(dialog);
    transitionEnd(dialog);
    vi.advanceTimersByTime(1000);

    expect(onClosed).toHaveBeenCalledOnce();
  });

  it('routes Escape through its own close, then emits closed after the exit', async () => {
    const { dialog, onDismissed, onClosed } = await renderDialog();
    const cancel = new Event('cancel', { cancelable: true });

    dialog.dispatchEvent(cancel);

    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog).not.toHaveAttribute('open');
    expect(onDismissed).toHaveBeenCalledOnce();

    transitionEnd(dialog);

    expect(onClosed).toHaveBeenCalledExactlyOnceWith('escape');
  });

  it('ignores a second way out taken during the exit', async () => {
    const { dialog, onDismissed, onClosed } = await renderDialog();

    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    screen.getByRole('button', { name: 'Fermer', hidden: true }).click();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    transitionEnd(dialog);
    vi.advanceTimersByTime(1000);

    expect(onDismissed).toHaveBeenCalledOnce();
    expect(onClosed).toHaveBeenCalledExactlyOnceWith('escape');
  });

  it('stays open when a file picker inside it is cancelled, while Escape on it still closes', async () => {
    const { dialog, onDismissed, onClosed } = await renderDialog();
    const input = document.createElement('input');
    input.type = 'file';
    dialog.querySelector('[data-dialog-body]')?.append(input);
    const pickerCancel = new Event('cancel', { bubbles: true, cancelable: true });

    input.dispatchEvent(pickerCancel);

    expect(pickerCancel.defaultPrevented).toBe(false);
    expect(dialog).toHaveAttribute('open');
    expect(onDismissed).not.toHaveBeenCalled();

    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    transitionEnd(dialog);

    expect(dialog).not.toHaveAttribute('open');
    expect(onClosed).toHaveBeenCalledExactlyOnceWith('escape');
  });

  it('emits closed once for a close that follows a reopen during the exit', async () => {
    const { dialog, onClosed, reopen } = await renderDialog();

    reopen(false);
    reopen(true);
    reopen(false);
    transitionEnd(dialog);
    vi.advanceTimersByTime(1000);

    expect(onClosed).toHaveBeenCalledExactlyOnceWith('programmatic');
  });

  it('treats a close the platform made without asking as Escape', async () => {
    const { dialog, onDismissed, onClosed } = await renderDialog();

    HTMLDialogElement.prototype.close.call(dialog);
    transitionEnd(dialog);

    expect(onDismissed).toHaveBeenCalledOnce();
    expect(onClosed).toHaveBeenCalledExactlyOnceWith('escape');
  });

  it('emits closed after the exit of a click on the backdrop', async () => {
    const { dialog, onDismissed, onClosed } = await renderDialog();

    for (const type of ['pointerdown', 'click']) {
      dialog.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: -20, clientY: -20 }));
    }
    transitionEnd(dialog);

    expect(onDismissed).toHaveBeenCalledOnce();
    expect(onClosed).toHaveBeenCalledExactlyOnceWith('backdrop');
  });

  it('emits closed, and not dismissed, after the exit of a close its owner asked for', async () => {
    const { dialog, onDismissed, onClosed, reopen } = await renderDialog();

    reopen(false);

    expect(dialog).not.toHaveAttribute('open');
    expect(onClosed).not.toHaveBeenCalled();

    transitionEnd(dialog);

    expect(onDismissed).not.toHaveBeenCalled();
    expect(onClosed).toHaveBeenCalledExactlyOnceWith('programmatic');
  });

  it('falls back on the exit duration when no transition reports its end', async () => {
    const { onClosed } = await renderDialog('0.18s, 0.18s');

    screen.getByRole('button', { name: 'Fermer' }).click();
    vi.advanceTimersByTime(180);

    expect(onClosed).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(onClosed).toHaveBeenCalledExactlyOnceWith('cross');
  });

  it('waits for a transition delay too', async () => {
    const { dialog, onClosed } = await renderDialog('100ms');

    dialog.style.transitionDelay = '100ms';
    screen.getByRole('button', { name: 'Fermer' }).click();
    vi.advanceTimersByTime(200);

    expect(onClosed).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(onClosed).toHaveBeenCalledOnce();
  });

  it('emits closed at once when there is no exit to wait for', async () => {
    const { onClosed } = await renderDialog('0s');

    screen.getByRole('button', { name: 'Fermer' }).click();

    expect(onClosed).toHaveBeenCalledExactlyOnceWith('cross');
  });

  it('emits closed at once when no transition is declared at all', async () => {
    const { onClosed } = await renderDialog('');

    screen.getByRole('button', { name: 'Fermer' }).click();

    expect(onClosed).toHaveBeenCalledOnce();
  });

  it('does not take the end of a child transition or of the backdrop for the end of the exit', async () => {
    const { dialog, onClosed } = await renderDialog();

    screen.getByRole('button', { name: 'Fermer' }).click();
    transitionEnd(screen.getByText('Corps'));
    transitionEnd(dialog, '::backdrop');

    expect(onClosed).not.toHaveBeenCalled();
  });

  it('ignores a transition that ends while it is open', async () => {
    const { dialog, onClosed } = await renderDialog();

    transitionEnd(dialog);

    expect(onClosed).not.toHaveBeenCalled();
  });

  it('drops the pending closed when it opens again during the exit', async () => {
    const { dialog, onClosed, reopen } = await renderDialog();

    reopen(false);
    reopen(true);
    transitionEnd(dialog);
    vi.advanceTimersByTime(1000);

    expect(dialog).toHaveAttribute('open');
    expect(onClosed).not.toHaveBeenCalled();
  });

  it('ignores a close event that arrives once it is open again', async () => {
    const { dialog, onDismissed, onClosed } = await renderDialog();

    dialog.dispatchEvent(new Event('close'));
    vi.advanceTimersByTime(1000);

    expect(onDismissed).not.toHaveBeenCalled();
    expect(onClosed).not.toHaveBeenCalled();
  });

  it('emits nothing once destroyed in the middle of its exit', async () => {
    const { fixture, onClosed } = await renderDialog();

    screen.getByRole('button', { name: 'Fermer' }).click();
    fixture.destroy();
    vi.advanceTimersByTime(1000);

    expect(onClosed).not.toHaveBeenCalled();
  });

  describe('as a sheet', () => {
    const drag = async (moves: [y: number, at: number][], grip = '[data-dialog-handle]'): Promise<Rendered> => {
      vi.stubGlobal('matchMedia', (query: string) => ({ matches: false, media: query }));
      const rendered = await renderDialog();
      const element = rendered.container.querySelector(grip) as HTMLElement;

      vi.spyOn(rendered.dialog, 'getBoundingClientRect').mockReturnValue({ height: 400 } as DOMRect);
      pointer(element, 'pointerdown', 100, 0);
      for (const [y, at] of moves) {
        pointer(element, 'pointermove', y, at);
      }
      const [y, at] = moves[moves.length - 1] as [number, number];
      pointer(element, 'pointerup', y, at + 300);

      return rendered;
    };

    it('closes on a drag past 30 % of its height, then emits closed after the exit', async () => {
      const { dialog, onDismissed, onClosed } = await drag([
        [150, 200],
        [250, 400],
      ]);

      expect(dialog).not.toHaveAttribute('open');
      expect(onDismissed).toHaveBeenCalledOnce();
      expect(onClosed).not.toHaveBeenCalled();
      expect(dialog.style.getPropertyValue('--drag-y')).toBe('150px');

      transitionEnd(dialog);

      expect(onClosed).toHaveBeenCalledExactlyOnceWith('drag');
      expect(dialog.style.getPropertyValue('--drag-y')).toBe('');
    });

    it('closes on a fast flick from the header', async () => {
      vi.stubGlobal('matchMedia', (query: string) => ({ matches: false, media: query }));
      const { container, dialog, onClosed } = await renderDialog();
      const header = container.querySelector('[data-dialog-header]') as HTMLElement;

      vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ height: 400 } as DOMRect);
      pointer(header, 'pointerdown', 100, 0);
      pointer(header, 'pointermove', 130, 15);
      pointer(header, 'pointerup', 140, 20);
      transitionEnd(dialog);

      expect(onClosed).toHaveBeenCalledExactlyOnceWith('drag');
    });

    it('springs back from a short slow drag, and stays open', async () => {
      const { dialog, onDismissed, onClosed } = await drag([
        [130, 300],
        [160, 600],
      ]);
      vi.advanceTimersByTime(1000);

      expect(dialog).toHaveAttribute('open');
      expect(dialog.style.getPropertyValue('--drag-y')).toBe('');
      expect(onDismissed).not.toHaveBeenCalled();
      expect(onClosed).not.toHaveBeenCalled();
    });

    it('lets the panel be dragged only from the handle and the header, never from the body', async () => {
      const { dialog } = await drag([[300, 100]], '[data-dialog-body]');

      expect(dialog).toHaveAttribute('open');
      expect(dialog.style.getPropertyValue('--drag-y')).toBe('');
    });

    it('keeps the browser from scrolling or zooming under a drag of the grips', async () => {
      const { container } = await renderDialog();

      expect(container.querySelector('[data-dialog-handle]')).toHaveClass('touch-none');
      expect(container.querySelector('[data-dialog-header]')).toHaveClass('max-lg:touch-none');
    });

    it('drops a gesture cut short by a close, so the next opening animates again', async () => {
      vi.stubGlobal('matchMedia', (query: string) => ({ matches: false, media: query }));
      const { container, dialog, onClosed, reopen } = await renderDialog();
      const handle = container.querySelector('[data-dialog-handle]') as HTMLElement;

      vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ height: 400 } as DOMRect);
      pointer(handle, 'pointerdown', 100, 0);
      pointer(handle, 'pointermove', 140, 100);
      reopen(false);
      transitionEnd(dialog);
      reopen(true);

      expect(onClosed).toHaveBeenCalledExactlyOnceWith('programmatic');
      expect(dialog).not.toHaveAttribute('data-dragging');
      expect(dialog.style.getPropertyValue('--drag-y')).toBe('');
    });

    it('starts from its resting place when it opens again after a drag', async () => {
      const { dialog, reopen } = await drag([[300, 100]]);

      reopen(false);
      reopen(true);

      expect(dialog.style.getPropertyValue('--drag-y')).toBe('');
    });
  });
});
