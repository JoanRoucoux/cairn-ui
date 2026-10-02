import { type RenderResult, render, screen } from '@testing-library/angular';

import { type DialogCloseReason, UiDialog } from './dialog';

type Host = { open: boolean; busy: boolean };

type Rendered = RenderResult<unknown> & {
  dialog: HTMLDialogElement;
  onDismissed: ReturnType<typeof vi.fn<() => void>>;
  onClosed: ReturnType<typeof vi.fn<(reason: DialogCloseReason) => void>>;
  set: (state: Partial<Host>) => void;
};

const renderDialog = async (busy = true): Promise<Rendered> => {
  const onDismissed = vi.fn<() => void>();
  const onClosed = vi.fn<(reason: DialogCloseReason) => void>();
  const result = await render(
    `<ui-dialog heading="Vendre" closeLabel="Fermer" [open]="open" [busy]="busy" (dismissed)="onDismissed()" (closed)="onClosed($event)">
       <p>Corps</p>
     </ui-dialog>`,
    { imports: [UiDialog], componentProperties: { open: true, busy, onDismissed, onClosed } },
  );
  const dialog = result.container.querySelector('dialog') as HTMLDialogElement;

  dialog.style.transitionDuration = '180ms';

  const set = (state: Partial<Host>): void => {
    Object.assign(result.fixture.componentInstance as Host, state);
    result.fixture.detectChanges();
  };

  return { ...result, dialog, onDismissed, onClosed, set };
};

const transitionEnd = (target: Element): void => {
  const event = new Event('transitionend', { bubbles: true });
  Object.defineProperty(event, 'pseudoElement', { value: '' });
  target.dispatchEvent(event);
};

const escape = (dialog: HTMLDialogElement): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  dialog.dispatchEvent(event);
  return event;
};

const pointer = (target: Element, type: string, y: number, at: number): void => {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: 50, clientY: y, button: 0 });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  Object.defineProperty(event, 'timeStamp', { value: at });
  target.dispatchEvent(event);
};

describe('UiDialog while busy', () => {
  beforeAll(() => {
    Object.defineProperty(Element.prototype, 'setPointerCapture', { value: vi.fn(), configurable: true });
  });

  afterAll(() => {
    delete (Element.prototype as Partial<Element>).setPointerCapture;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is not busy by default', async () => {
    await render(`<ui-dialog heading="Vendre" closeLabel="Fermer" [open]="true"><p>Corps</p></ui-dialog>`, {
      imports: [UiDialog],
    });

    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-busy');
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeEnabled();
  });

  it('marks itself busy and disables the cross', async () => {
    const { dialog } = await renderDialog();

    expect(dialog).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeDisabled();
  });

  it('swallows Escape before the platform turns it into a close request', async () => {
    const { dialog, set } = await renderDialog();

    expect(escape(dialog).defaultPrevented).toBe(true);

    set({ busy: false });
    expect(escape(dialog).defaultPrevented).toBe(false);
  });

  it('lets other keys through', async () => {
    const { dialog } = await renderDialog();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });

    dialog.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('stays open on cancel, then closes on the next one once the action is over', async () => {
    const { dialog, onDismissed, onClosed, set } = await renderDialog();
    const cancel = new Event('cancel', { cancelable: true });

    dialog.dispatchEvent(cancel);

    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog).toHaveAttribute('open');
    expect(onDismissed).not.toHaveBeenCalled();

    set({ busy: false });
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    transitionEnd(dialog);

    expect(onClosed).toHaveBeenCalledExactlyOnceWith('escape');
  });

  it('stays open on a click on the backdrop', async () => {
    const { dialog, onDismissed } = await renderDialog();

    for (const type of ['pointerdown', 'click']) {
      dialog.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: -20, clientY: -20 }));
    }

    expect(dialog).toHaveAttribute('open');
    expect(onDismissed).not.toHaveBeenCalled();
  });

  it('reopens at once when the platform closes it without asking', async () => {
    const { dialog, onDismissed, onClosed } = await renderDialog();

    HTMLDialogElement.prototype.close.call(dialog);

    expect(dialog).toHaveAttribute('open');
    expect(onDismissed).not.toHaveBeenCalled();
    expect(onClosed).not.toHaveBeenCalled();
  });

  it('still closes when its owner asks', async () => {
    const { dialog, onClosed, set } = await renderDialog();

    set({ open: false });
    transitionEnd(dialog);

    expect(dialog).not.toHaveAttribute('open');
    expect(onClosed).toHaveBeenCalledExactlyOnceWith('programmatic');
  });

  it('does not follow a drag of the sheet', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: false, media: query }));
    const { container, dialog, onDismissed } = await renderDialog();
    const handle = container.querySelector('[data-dialog-handle]') as HTMLElement;
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ height: 400 } as DOMRect);

    pointer(handle, 'pointerdown', 100, 0);
    pointer(handle, 'pointermove', 300, 200);
    pointer(handle, 'pointerup', 300, 500);

    expect(dialog).not.toHaveAttribute('data-dragging');
    expect(dialog).toHaveAttribute('open');
    expect(onDismissed).not.toHaveBeenCalled();
  });
});
