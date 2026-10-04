import { TestBed } from '@angular/core/testing';

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

  it('shows a message with the inverted look, a check icon and no action', async () => {
    const { toasts } = await setup();

    toasts.show('Achat enregistré');
    await flush();

    const message = screen.getByText('Achat enregistré').parentElement!;
    expect(screen.getByRole('status')).toContainElement(message);
    expect(message).toHaveClass(
      'bg-(--primary)',
      'text-(--primary-foreground)',
      'min-h-11',
      'rounded-container',
      'text-label',
      'font-medium',
      'shadow-[0_8px_24px_rgb(0_0_0/0.16)]',
      'starting:opacity-0',
      'starting:translate-y-2',
      'motion-reduce:starting:translate-y-0',
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(message.querySelector('svg path')).toHaveAttribute('d', 'M20 6 9 17l-5-5');
  });

  it('sits above the tab bar below 64rem and centred in the content area from 64rem', async () => {
    await setup();

    expect(screen.getByRole('status')).toHaveClass(
      'fixed',
      'bottom-[calc(var(--tab-bar-height,calc(52px+env(safe-area-inset-bottom)))+var(--action-bar-height,0px)+8px)]',
      'lg:left-[var(--sidebar-width,0px)]',
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

  it('dismisses after 5 s by default', async () => {
    const { toasts } = await setup();

    toasts.show('Fait');
    await flush();
    await vi.advanceTimersByTimeAsync(4999);
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
    await vi.advanceTimersByTimeAsync(4000);

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
    await vi.advanceTimersByTimeAsync(2999);
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
    await vi.advanceTimersByTimeAsync(4999);

    expect(toasts.toast()?.text).toBe('Deux');
    await vi.advanceTimersByTimeAsync(1);
    expect(toasts.toast()).toBeNull();
  });

  it('pauses while focus is inside the message and resumes with the time left', async () => {
    const { toasts } = await setup();

    toasts.showError('Échec');
    await flush();
    toasts.show('Fait');
    await flush();
    await vi.advanceTimersByTimeAsync(2000);
    const message = screen.getByText('Fait').parentElement!;
    message.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await flush();
    await vi.advanceTimersByTimeAsync(10000);
    expect(toasts.toast()).not.toBeNull();

    message.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await flush();
    await vi.advanceTimersByTimeAsync(2999);
    expect(toasts.toast()).not.toBeNull();
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

describe('UiToaster error', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: false }));
  afterEach(() => vi.useRealTimers());

  it('shows the same surface with an alert icon, a status role and a close cross', async () => {
    const { toasts } = await setup();

    toasts.showError("Échec de l'import");
    await flush();

    const message = screen.getByText("Échec de l'import").parentElement!;
    expect(message).toHaveClass('bg-(--primary)', 'text-(--primary-foreground)');
    expect(message.querySelector('svg circle')).not.toBeNull();
    expect(screen.getByRole('status')).toContainElement(screen.getByRole('button', { name: 'Fermer' }));
  });

  it('draws a 28 px cross with a 44 px hit area on touch and 36 px with a fine pointer', async () => {
    const { toasts } = await setup();

    toasts.showError("Échec de l'import");
    await flush();

    expect(screen.getByRole('button', { name: 'Fermer' })).toHaveClass(
      'relative',
      'size-7',
      'after:absolute',
      'after:-inset-2',
      'pointer-fine:after:-inset-1',
    );
  });

  it('takes the close label given', async () => {
    const { toasts } = await setup();

    toasts.showError('Import failed', 'Close');
    await flush();

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('has no timer and stays until the cross is clicked', async () => {
    const { toasts } = await setup();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    toasts.showError("Échec de l'import");
    await flush();
    await vi.advanceTimersByTimeAsync(60000);
    expect(toasts.toast()).not.toBeNull();
    expect(vi.getTimerCount()).toBe(0);

    await user.click(screen.getByRole('button', { name: 'Fermer' }));
    await flush();

    expect(toasts.toast()).toBeNull();
    expect(screen.queryByText("Échec de l'import")).toBeNull();
  });

  it('never times out, even once a hover and a focus inside it have paused and resumed', async () => {
    const { toasts } = await setup();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    toasts.showError("Échec de l'import");
    await flush();
    await user.hover(screen.getByText("Échec de l'import"));
    await user.unhover(screen.getByText("Échec de l'import"));
    const cross = screen.getByRole('button', { name: 'Fermer' });
    cross.focus();
    await flush();
    cross.blur();
    await flush();
    await vi.advanceTimersByTimeAsync(60000);

    expect(toasts.toast()).not.toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('replaces a confirmation and is replaced by one, in the same slot', async () => {
    const { toasts } = await setup();

    toasts.show('Fait');
    await flush();
    toasts.showError('Échec');
    await flush();
    expect(screen.queryByText('Fait')).toBeNull();
    await vi.advanceTimersByTimeAsync(60000);
    expect(screen.getByText('Échec')).toBeInTheDocument();

    toasts.show('Refait');
    await flush();
    expect(screen.queryByText('Échec')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    await vi.advanceTimersByTimeAsync(5000);

    expect(toasts.toast()).toBeNull();
  });
});

describe('UiToaster replacement and reset', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: false }));
  afterEach(() => vi.useRealTimers());

  it('drops a message still leaving when a new one is shown', async () => {
    const { toasts, host } = await setup();

    toasts.show('Un');
    await flush();
    const first = screen.getByText('Un').parentElement!;
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
    await vi.advanceTimersByTimeAsync(5000);

    expect(toasts.toast()).toBeNull();
  });
});
