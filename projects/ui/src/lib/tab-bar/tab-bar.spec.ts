import { render, screen } from '@testing-library/angular';

import { UiTab, UiTabBar } from './tab-bar';

describe('UiTabBar', () => {
  const template = `
    <nav ui-tab-bar>
      <a ui-tab active href="/"><svg tabIcon></svg>Portfolio</a>
      <a ui-tab href="/holdings"><svg tabIcon></svg>Holdings</a>
    </nav>`;

  it('carries the safe-area padding and a 52px row', async () => {
    await render(template, { imports: [UiTabBar, UiTab] });

    expect(screen.getByRole('navigation')).toHaveClass('pb-[env(safe-area-inset-bottom)]');
    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveClass('h-[52px]');
  });

  it('marks the active tab current, bold and on the foreground color', async () => {
    await render(template, { imports: [UiTabBar, UiTab] });

    const active = screen.getByRole('link', { name: 'Portfolio' });
    expect(active).toHaveAttribute('aria-current', 'page');
    expect(active).toHaveClass('font-semibold', 'text-(--foreground)');
    expect(active).not.toHaveClass('text-(--muted-foreground)');
  });

  it('keeps every label at weight 500, 600 once active, on a 3px gap and a 1 line height', async () => {
    const { container } = await render(template, { imports: [UiTabBar, UiTab] });

    const inactive = screen.getByRole('link', { name: 'Holdings' });
    expect(inactive).toHaveClass('gap-[3px]', 'font-medium');
    expect(container.querySelector('[data-tab-label]')).toHaveClass('leading-none');
  });

  it('is muted and carries no aria-current when inactive', async () => {
    await render(template, { imports: [UiTabBar, UiTab] });

    const inactive = screen.getByRole('link', { name: 'Holdings' });
    expect(inactive).not.toHaveAttribute('aria-current');
    expect(inactive).toHaveClass('text-(--muted-foreground)');
  });

  it('sets the caption size on the label and size-6 on the icon slot', async () => {
    const { container } = await render(template, { imports: [UiTabBar, UiTab] });

    const label = container.querySelector('[data-tab-label]');
    const iconSlot = container.querySelector('[data-tab-icon]');
    expect(label).toHaveClass('text-caption');
    expect(iconSlot).toHaveClass('size-6');
  });

  it('accepts active as a bare attribute', async () => {
    await render(template, { imports: [UiTabBar, UiTab] });

    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute('aria-current', 'page');
  });
});
