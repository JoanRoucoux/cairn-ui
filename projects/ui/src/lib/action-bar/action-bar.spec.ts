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
      'bottom-[calc(52px+env(safe-area-inset-bottom))]',
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

  it('is hidden from 64rem', async () => {
    const { container } = await render(template, { imports: [UiActionBar] });

    expect(container.querySelector('ui-action-bar')).toHaveClass('lg:hidden');
  });
});
