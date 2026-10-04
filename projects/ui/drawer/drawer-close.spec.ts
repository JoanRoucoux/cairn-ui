import { UiDialog } from '@joanroucoux/cairn-ui/dialog';
import { type RenderResult, render, screen } from '@testing-library/angular';

import { type DrawerCloseReason, UiDrawer } from './drawer';

type Host = { open: boolean; busy: boolean };

type Rendered = RenderResult<unknown> & {
  drawer: HTMLDialogElement;
  onDismissed: ReturnType<typeof vi.fn<() => void>>;
  onClosed: ReturnType<typeof vi.fn<(reason: DrawerCloseReason) => void>>;
  set: (state: Partial<Host>) => void;
};

const renderDrawer = async (busy = false): Promise<Rendered> => {
  const onDismissed = vi.fn<() => void>();
  const onClosed = vi.fn<(reason: DrawerCloseReason) => void>();
  const result = await render(
    `<ui-drawer heading="Northwind Monde" closeLabel="Fermer le détail" [open]="open" [busy]="busy"
                (dismissed)="onDismissed()" (closed)="onClosed($event)">
       <p>Corps</p>
     </ui-drawer>`,
    { imports: [UiDrawer], componentProperties: { open: true, busy, onDismissed, onClosed } },
  );
  const drawer = result.container.querySelector('dialog') as HTMLDialogElement;

  drawer.style.transitionDuration = '180ms';

  const set = (state: Partial<Host>): void => {
    Object.assign(result.fixture.componentInstance as Host, state);
    result.fixture.detectChanges();
  };

  return { ...result, drawer, onDismissed, onClosed, set };
};

const transitionEnd = (target: Element): void => {
  const event = new Event('transitionend', { bubbles: true });
  Object.defineProperty(event, 'pseudoElement', { value: '' });
  target.dispatchEvent(event);
};

const click = (target: Element, x: number, y: number): void => {
  for (const type of ['pointerdown', 'click']) {
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }));
  }
};

const cancel = (target: Element, bubbles = false): Event => {
  const event = new Event('cancel', { bubbles, cancelable: true });
  target.dispatchEvent(event);
  return event;
};

const escapeKey = (target: Element, key = 'Escape'): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
};

describe('UiDrawer close protocol', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reports the cross at once, and closed only once the exit has played', async () => {
    const { drawer, onDismissed, onClosed } = await renderDrawer();

    screen.getByRole('button', { name: 'Fermer le détail' }).click();

    expect(drawer).not.toHaveAttribute('open');
    expect(onDismissed).toHaveBeenCalledOnce();
    expect(onClosed).not.toHaveBeenCalled();

    transitionEnd(drawer);

    expect(onClosed).toHaveBeenCalledExactlyOnceWith('cross');
  });

  it('routes Escape through its own close', async () => {
    const { drawer, onDismissed, onClosed } = await renderDrawer();
    const event = cancel(drawer);

    expect(event.defaultPrevented).toBe(true);
    expect(drawer).not.toHaveAttribute('open');
    expect(onDismissed).toHaveBeenCalledOnce();

    transitionEnd(drawer);

    expect(onClosed).toHaveBeenCalledExactlyOnceWith('escape');
  });

  it('closes on a click that starts and ends on the veil', async () => {
    const { drawer, onDismissed, onClosed } = await renderDrawer();
    vi.spyOn(drawer, 'getBoundingClientRect').mockReturnValue(new DOMRect(1000, 0, 440, 900));

    click(drawer, 400, 300);
    transitionEnd(drawer);

    expect(onDismissed).toHaveBeenCalledOnce();
    expect(onClosed).toHaveBeenCalledExactlyOnceWith('backdrop');
  });

  it.each([
    ['beyond its right edge', 1500, 300],
    ['above it', 1200, -1],
    ['below it', 1200, 901],
  ])('takes a click %s for the veil', async (_, x, y) => {
    const { drawer, onClosed } = await renderDrawer();
    vi.spyOn(drawer, 'getBoundingClientRect').mockReturnValue(new DOMRect(1000, 0, 440, 900));

    click(drawer, x, y);
    transitionEnd(drawer);

    expect(onClosed).toHaveBeenCalledExactlyOnceWith('backdrop');
  });

  it('stays open on a click inside its own padding', async () => {
    const { drawer, onDismissed } = await renderDrawer();
    vi.spyOn(drawer, 'getBoundingClientRect').mockReturnValue(new DOMRect(1000, 0, 440, 900));

    click(drawer, 1010, 300);

    expect(drawer).toHaveAttribute('open');
    expect(onDismissed).not.toHaveBeenCalled();
  });

  it('stays open when a press inside ends on the veil, as a text selection does', async () => {
    const { drawer, onDismissed } = await renderDrawer();
    vi.spyOn(drawer, 'getBoundingClientRect').mockReturnValue(new DOMRect(1000, 0, 440, 900));

    screen.getByText('Corps').dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 1100 }));
    drawer.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 400, clientY: 300 }));

    expect(drawer).toHaveAttribute('open');
    expect(onDismissed).not.toHaveBeenCalled();
  });

  it('stays open on a click inside its content', async () => {
    const { drawer, onDismissed } = await renderDrawer();

    click(screen.getByText('Corps'), 1100, 300);

    expect(drawer).toHaveAttribute('open');
    expect(onDismissed).not.toHaveBeenCalled();
  });

  it('emits closed, and not dismissed, after the exit of a close its owner asked for', async () => {
    const { drawer, onDismissed, onClosed, set } = await renderDrawer();

    set({ open: false });

    expect(drawer).not.toHaveAttribute('open');
    expect(onClosed).not.toHaveBeenCalled();

    transitionEnd(drawer);

    expect(onDismissed).not.toHaveBeenCalled();
    expect(onClosed).toHaveBeenCalledExactlyOnceWith('programmatic');
  });

  it('treats a close the platform made without asking as Escape', async () => {
    const { drawer, onDismissed, onClosed } = await renderDrawer();

    HTMLDialogElement.prototype.close.call(drawer);
    transitionEnd(drawer);

    expect(onDismissed).toHaveBeenCalledOnce();
    expect(onClosed).toHaveBeenCalledExactlyOnceWith('escape');
  });

  it('ignores a second way out taken during the exit', async () => {
    const { drawer, onDismissed, onClosed } = await renderDrawer();

    cancel(drawer);
    screen.getByRole('button', { name: 'Fermer le détail', hidden: true }).click();
    cancel(drawer);
    transitionEnd(drawer);
    vi.advanceTimersByTime(1000);

    expect(onDismissed).toHaveBeenCalledOnce();
    expect(onClosed).toHaveBeenCalledExactlyOnceWith('escape');
  });

  it('stays open when a file picker inside it is cancelled', async () => {
    const { drawer, onDismissed } = await renderDrawer();
    const input = document.createElement('input');
    input.type = 'file';
    drawer.append(input);

    expect(cancel(input, true).defaultPrevented).toBe(false);
    expect(drawer).toHaveAttribute('open');
    expect(onDismissed).not.toHaveBeenCalled();
  });

  it('falls back on the exit duration when no transition reports its end', async () => {
    const { onClosed } = await renderDrawer();

    screen.getByRole('button', { name: 'Fermer le détail' }).click();
    vi.advanceTimersByTime(180);

    expect(onClosed).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(onClosed).toHaveBeenCalledExactlyOnceWith('cross');
  });

  it('drops the pending closed when it opens again during the exit', async () => {
    const { drawer, onClosed, set } = await renderDrawer();

    set({ open: false });
    set({ open: true });
    transitionEnd(drawer);
    vi.advanceTimersByTime(1000);

    expect(drawer).toHaveAttribute('open');
    expect(onClosed).not.toHaveBeenCalled();
  });

  it('ignores a close event that arrives once it is open again', async () => {
    const { drawer, onDismissed, onClosed } = await renderDrawer();

    drawer.dispatchEvent(new Event('close'));
    vi.advanceTimersByTime(1000);

    expect(onDismissed).not.toHaveBeenCalled();
    expect(onClosed).not.toHaveBeenCalled();
  });

  it('emits nothing once destroyed in the middle of its exit', async () => {
    const { fixture, onClosed } = await renderDrawer();

    screen.getByRole('button', { name: 'Fermer le détail' }).click();
    fixture.destroy();
    vi.advanceTimersByTime(1000);

    expect(onClosed).not.toHaveBeenCalled();
  });

  describe('while busy', () => {
    it('swallows Escape before the platform turns it into a close request, and lets other keys through', async () => {
      const { drawer, set } = await renderDrawer(true);

      expect(escapeKey(drawer).defaultPrevented).toBe(true);
      expect(escapeKey(drawer, 'Tab').defaultPrevented).toBe(false);

      set({ busy: false });

      expect(escapeKey(drawer).defaultPrevented).toBe(false);
    });

    it('lets Escape reach a dialog hosted inside it: the dialog closes, the drawer stays', async () => {
      const onDialogDismissed = vi.fn<() => void>();
      const { container } = await render(
        `<ui-drawer heading="Northwind Monde" [open]="true" [busy]="true">
           <ui-dialog heading="Acheter" [open]="true" (dismissed)="onDialogDismissed()">
             <input aria-label="Quantité" />
           </ui-dialog>
         </ui-drawer>`,
        { imports: [UiDrawer, UiDialog], componentProperties: { onDialogDismissed } },
      );
      const drawer = container.querySelector('ui-drawer > dialog') as HTMLDialogElement;
      const dialog = container.querySelector('ui-dialog > dialog') as HTMLDialogElement;

      expect(escapeKey(screen.getByLabelText('Quantité')).defaultPrevented).toBe(false);

      cancel(dialog);

      expect(dialog).not.toHaveAttribute('open');
      expect(onDialogDismissed).toHaveBeenCalledOnce();
      expect(drawer).toHaveAttribute('open');
      expect(escapeKey(drawer).defaultPrevented).toBe(true);
    });

    it('stays open on cancel, then closes on the next one once the action is over', async () => {
      const { drawer, onDismissed, onClosed, set } = await renderDrawer(true);

      expect(cancel(drawer).defaultPrevented).toBe(true);
      expect(drawer).toHaveAttribute('open');
      expect(onDismissed).not.toHaveBeenCalled();

      set({ busy: false });
      cancel(drawer);
      transitionEnd(drawer);

      expect(onClosed).toHaveBeenCalledExactlyOnceWith('escape');
    });

    it('stays open on a click on the veil', async () => {
      const { drawer, onDismissed } = await renderDrawer(true);
      vi.spyOn(drawer, 'getBoundingClientRect').mockReturnValue(new DOMRect(1000, 0, 440, 900));

      click(drawer, 400, 300);

      expect(drawer).toHaveAttribute('open');
      expect(onDismissed).not.toHaveBeenCalled();
    });

    it('reopens at once when the platform closes it without asking', async () => {
      const { drawer, onDismissed, onClosed } = await renderDrawer(true);

      HTMLDialogElement.prototype.close.call(drawer);

      expect(drawer).toHaveAttribute('open');
      expect(onDismissed).not.toHaveBeenCalled();
      expect(onClosed).not.toHaveBeenCalled();
    });

    it('still closes when its owner asks', async () => {
      const { drawer, onClosed, set } = await renderDrawer(true);

      set({ open: false });
      transitionEnd(drawer);

      expect(onClosed).toHaveBeenCalledExactlyOnceWith('programmatic');
    });
  });
});
