import { render, screen } from '@testing-library/angular';

import { UiEmpty } from './empty';

describe('UiEmpty', () => {
  const template = `
    <ui-empty heading="No holding matches “zzz”" hint="Search covers the name and the ISIN.">
      <button type="button">Add a holding</button>
    </ui-empty>`;

  it('shows the title and the hint', async () => {
    await render(template, { imports: [UiEmpty] });

    expect(screen.getByText('No holding matches “zzz”')).toHaveClass('text-body', 'font-medium', 'text-pretty');
    expect(screen.getByText('Search covers the name and the ISIN.')).toHaveClass(
      'text-label',
      'text-(--muted-foreground)',
    );
  });

  it('projects the action below the text', async () => {
    await render(template, { imports: [UiEmpty] });

    expect(screen.getByRole('button', { name: 'Add a holding' })).toBeInTheDocument();
  });

  it('is centered with 24 px of padding, 48 px from 64rem', async () => {
    const { container } = await render(template, { imports: [UiEmpty] });

    expect(container.querySelector('ui-empty')).toHaveClass(
      'flex',
      'flex-col',
      'items-center',
      'text-center',
      'gap-1.5',
      'px-2',
      'py-6',
      'lg:py-12',
    );
  });

  it('omits the hint and leaves the action slot empty when absent', async () => {
    const { container } = await render('<ui-empty heading="Nothing" />', { imports: [UiEmpty] });
    const host = container.querySelector('ui-empty')!;

    expect(host).toHaveTextContent(/^Nothing$/);
    expect(screen.queryByRole('button')).toBeNull();
    expect(host.lastElementChild).not.toBe(screen.getByText('Nothing'));
    expect(host.lastElementChild).toBeEmptyDOMElement();
  });
});
