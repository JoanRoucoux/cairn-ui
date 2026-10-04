import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { UiDialog } from '@joanroucoux/cairn-ui/dialog';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiToaster } from './toast';
import { UiToasts } from './toasts';

const setup = async (): Promise<{ toasts: UiToasts; host: HTMLElement }> => {
  const { fixture } = await render('<ui-toaster />', { imports: [UiToaster] });
  const toasts = TestBed.inject(UiToasts);

  return { toasts, host: fixture.nativeElement.querySelector('ui-toaster') as HTMLElement };
};

const flush = async (): Promise<void> => {
  TestBed.tick();
  await vi.advanceTimersByTimeAsync(0);
};

describe('UiToaster', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: false }));
  afterEach(() => vi.useRealTimers());

  it('renders an empty status region while idle', async () => {
    await setup();

    const region = screen.getByRole('status');
    expect(region).toBeEmptyDOMElement();
    expect(region.querySelector('button, a')).toBeNull();
  });

  it('shows a message with the elevated look and no action', async () => {
    const { toasts } = await setup();

    toasts.show('Achat enregistré');
    await flush();

    const message = screen.getByText('Achat enregistré');
    expect(screen.getByRole('status')).toContainElement(message);
    expect(message).toHaveClass(
      'bg-(--elevated)',
      'rounded-container',
      'text-label',
      'shadow-[0_8px_24px_rgb(0_0_0/0.16),inset_0_0_0_1px_var(--border)]',
      'starting:opacity-0',
      'starting:translate-y-2',
      'motion-reduce:starting:translate-y-0',
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('sits above the tab bar below 64rem and bottom right from 64rem', async () => {
    await setup();

    expect(screen.getByRole('status')).toHaveClass(
      'fixed',
      'bottom-[calc(var(--tab-bar-height,calc(52px+env(safe-area-inset-bottom)))+var(--action-bar-height,0px)+8px)]',
      'lg:right-6',
      'lg:bottom-6',
    );
  });

  it('replaces the current message in the same element', async () => {
    const { toasts } = await setup();

    toasts.show('Premier');
    await flush();
    const first = screen.getByText('Premier');
    toasts.show('Second');
    await flush();

    expect(screen.queryByText('Premier')).toBeNull();
    expect(screen.getByText('Second')).toBe(first);
  });

  it('dismisses after 4 s by default', async () => {
    const { toasts } = await setup();

    toasts.show('Fait');
    await flush();
    await vi.advanceTimersByTimeAsync(3999);
    expect(toasts.toast()).not.toBeNull();
    await vi.advanceTimersByTimeAsync(1);

    expect(toasts.toast()).toBeNull();
  });

  it.each([
    ['2000ms', 2000],
    ['3s', 3000],
  ])('reads --toast-duration (%s)', async (value, ms) => {
    const { toasts, host } = await setup();
    host.style.setProperty('--toast-duration', value);

    toasts.show('Fait');
    await flush();
    await vi.advanceTimersByTimeAsync(ms - 1);
    expect(toasts.toast()).not.toBeNull();
    await vi.advanceTimersByTimeAsync(1);

    expect(toasts.toast()).toBeNull();
  });

  it('restarts the timer when a new message replaces the current one', async () => {
    const { toasts } = await setup();

    toasts.show('Un');
    await flush();
    await vi.advanceTimersByTimeAsync(3000);
    toasts.show('Deux');
    await flush();
    await vi.advanceTimersByTimeAsync(3000);

    expect(toasts.toast()?.text).toBe('Deux');
    await vi.advanceTimersByTimeAsync(1000);
    expect(toasts.toast()).toBeNull();
  });

  it('pauses on hover and resumes with the time left', async () => {
    const { toasts } = await setup();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    toasts.show('Fait');
    await flush();
    await vi.advanceTimersByTimeAsync(2000);
    await user.hover(screen.getByText('Fait'));
    await vi.advanceTimersByTimeAsync(10000);
    expect(toasts.toast()).not.toBeNull();

    await user.unhover(screen.getByText('Fait'));
    await vi.advanceTimersByTimeAsync(1999);
    expect(toasts.toast()).not.toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    expect(toasts.toast()).toBeNull();
  });

  it('starts a fresh timer for a message shown while paused', async () => {
    const { toasts } = await setup();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    toasts.show('Un');
    await flush();
    await vi.advanceTimersByTimeAsync(3000);
    await user.hover(screen.getByText('Un'));
    toasts.show('Deux');
    await flush();
    await user.unhover(screen.getByText('Deux'));
    await vi.advanceTimersByTimeAsync(3999);

    expect(toasts.toast()?.text).toBe('Deux');
    await vi.advanceTimersByTimeAsync(1);
    expect(toasts.toast()).toBeNull();
  });

  it('removes the message on dismiss and stops the timer on destroy', async () => {
    const { toasts } = await setup();

    toasts.show('Fait');
    await flush();
    toasts.dismiss();
    await flush();
    expect(screen.queryByText('Fait')).toBeNull();

    toasts.show('Encore');
    await flush();
    TestBed.resetTestingModule();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('UiToaster replacement and reset', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: false }));
  afterEach(() => vi.useRealTimers());

  it('drops a message still leaving when a new one is shown', async () => {
    const { toasts, host } = await setup();

    toasts.show('Un');
    await flush();
    const first = screen.getByText('Un');
    first.classList.add('ui-leave-fade');
    toasts.dismiss();
    await flush();
    toasts.show('Deux');
    await flush();

    expect(first.isConnected).toBe(false);
    expect(host.children).toHaveLength(1);
    expect(host).toHaveTextContent('Deux');
  });

  it('starts the next timer unpaused after a programmatic dismiss while hovered', async () => {
    const { toasts } = await setup();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    toasts.show('Un');
    await flush();
    await user.hover(screen.getByText('Un'));
    toasts.dismiss();
    await flush();
    toasts.show('Deux');
    await flush();
    await vi.advanceTimersByTimeAsync(4000);

    expect(toasts.toast()).toBeNull();
  });
});

@Component({
  imports: [UiToaster],
  template: '<ui-toaster />',
})
class QueuedBeforeRender {
  constructor() {
    inject(UiToasts).show('Déjà là');
  }
}

describe('UiToaster top layer', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: false }));
  afterEach(() => vi.useRealTimers());

  it('is a manual popover shown once rendered', async () => {
    const { host } = await setup();

    expect(host).toHaveAttribute('popover', 'manual');
    expect(host.style.display).toBe('block');
  });

  it('shows a message queued before the first render without hiding a popover that is not open yet', async () => {
    const hidden = vi.spyOn(HTMLElement.prototype, 'hidePopover');

    const { fixture } = await render(QueuedBeforeRender);
    await flush();
    const host = fixture.nativeElement.querySelector('ui-toaster') as HTMLElement;

    expect(hidden).not.toHaveBeenCalled();
    expect(host.style.display).toBe('block');
    expect(host).toHaveTextContent('Déjà là');
  });

  const renderWithDialog = async (): Promise<{
    fixture: Awaited<ReturnType<typeof render>>['fixture'];
    toaster: HTMLElement;
    shown: ReturnType<typeof vi.spyOn>;
  }> => {
    const { fixture } = await render(
      `<ui-toaster />
       <ui-dialog heading="Enter a price" [open]="open"><button dialogActions type="button">Cancel</button></ui-dialog>`,
      { imports: [UiToaster, UiDialog], componentProperties: { open: false } },
    );
    const toaster = fixture.nativeElement.querySelector('ui-toaster') as HTMLElement;

    return { fixture, toaster, shown: vi.spyOn(toaster, 'showPopover') };
  };

  it('is shown again when a message arrives while a modal dialog is open', async () => {
    const { fixture, toaster, shown } = await renderWithDialog();

    fixture.componentInstance.open = true;
    fixture.detectChanges();
    await flush();
    expect(fixture.nativeElement.querySelector('dialog')).toHaveAttribute('open');
    shown.mockClear();

    TestBed.inject(UiToasts).show('Achat enregistré');
    await flush();

    expect(shown).toHaveBeenCalled();
    expect(toaster.style.display).toBe('block');
  });

  it('is shown again when a modal dialog opens while a message is visible', async () => {
    const { fixture, toaster, shown } = await renderWithDialog();
    TestBed.inject(UiToasts).show('Achat enregistré');
    await flush();
    shown.mockClear();

    fixture.componentInstance.open = true;
    fixture.detectChanges();
    await flush();

    expect(fixture.nativeElement.querySelector('dialog')).toHaveAttribute('open');
    expect(shown).toHaveBeenCalledTimes(1);
    expect(toaster.style.display).toBe('block');
  });

  it('leaves the popover alone when a dialog opens with no message visible', async () => {
    const { fixture, shown } = await renderWithDialog();

    fixture.componentInstance.open = true;
    fixture.detectChanges();
    await flush();

    expect(shown).not.toHaveBeenCalled();
  });

  it('ignores the open attribute of anything but a dialog', async () => {
    const { shown } = await renderWithDialog();
    TestBed.inject(UiToasts).show('Achat enregistré');
    await flush();
    shown.mockClear();

    const details = document.createElement('details');
    document.body.append(details);
    details.open = true;
    await flush();
    details.remove();

    expect(shown).not.toHaveBeenCalled();
  });

  it('stops watching dialogs once destroyed', async () => {
    const { fixture, shown } = await renderWithDialog();
    TestBed.inject(UiToasts).show('Achat enregistré');
    await flush();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    shown.mockClear();

    fixture.destroy();
    document.body.append(dialog);
    dialog.setAttribute('open', '');
    await flush();
    dialog.remove();

    expect(shown).not.toHaveBeenCalled();
  });
});
