import { render, screen } from '@testing-library/angular';

import { UiActionBar } from './action-bar';

describe('UiActionBar', () => {
  const template = `<ui-action-bar><button type="button">Sell</button><button type="button">Buy</button></ui-action-bar>`;

  it('renders its actions', async () => {
    await render(template, { imports: [UiActionBar] });

    expect(screen.getByRole('button', { name: 'Sell' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy' })).toBeInTheDocument();
  });

  it('is fixed above the tab bar and its safe area', async () => {
    const { container } = await render(template, { imports: [UiActionBar] });

    expect(container.querySelector('ui-action-bar')).toHaveClass(
      'fixed',
      'bottom-[var(--tab-bar-height,calc(52px+env(safe-area-inset-bottom)))]',
      'inset-x-0',
    );
  });

  it('shares the width equally between its actions', async () => {
    const { container } = await render(template, { imports: [UiActionBar] });

    expect(container.querySelector('ui-action-bar')).toHaveClass('grid', 'grid-flow-col', 'auto-cols-fr', 'gap-2');
  });

  it('draws a hairline above, on the page background, with the gutter and 12px of padding', async () => {
    const { container } = await render(template, { imports: [UiActionBar] });

    expect(container.querySelector('ui-action-bar')).toHaveClass(
      'bg-(--background)',
      'px-(--gutter)',
      'py-3',
      'shadow-[0_-1px_0_var(--hairline)]',
    );
  });

  it('publishes its height on the root for the toaster, and removes it when it leaves', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(73);
    const { fixture } = await render(template, { imports: [UiActionBar] });

    expect(document.documentElement.style.getPropertyValue('--action-bar-height')).toBe('73px');

    fixture.destroy();

    expect(document.documentElement.style.getPropertyValue('--action-bar-height')).toBe('');
    vi.restoreAllMocks();
  });

  it('follows its height as it changes', async () => {
    const original = globalThis.ResizeObserver;
    let resized: () => void = () => undefined;
    const disconnect = vi.fn();
    globalThis.ResizeObserver = class {
      constructor(callback: () => void) {
        resized = callback;
      }

      observe = vi.fn();
      disconnect = disconnect;
      unobserve = vi.fn();
    } as unknown as typeof ResizeObserver;
    const height = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(73);
    const { fixture } = await render(template, { imports: [UiActionBar] });

    height.mockReturnValue(0);
    resized();

    expect(document.documentElement.style.getPropertyValue('--action-bar-height')).toBe('0px');

    fixture.destroy();

    expect(disconnect).toHaveBeenCalled();
    globalThis.ResizeObserver = original;
    vi.restoreAllMocks();
  });

  it('is hidden from 64rem', async () => {
    const { container } = await render(template, { imports: [UiActionBar] });

    expect(container.querySelector('ui-action-bar')).toHaveClass('lg:hidden');
  });
});
