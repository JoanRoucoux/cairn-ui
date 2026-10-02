import { render, screen } from '@testing-library/angular';

import { UiEmpty } from './empty';

describe('UiEmpty', () => {
  const template = `
    <ui-empty heading="Aucun instrument" hint="La recherche porte sur le nom et l'ISIN.">
      <button type="button">Ajouter une ligne</button>
    </ui-empty>`;

  it('shows the title and the hint', async () => {
    await render(template, { imports: [UiEmpty] });

    expect(screen.getByText('Aucun instrument')).toHaveClass('text-body', 'font-medium', 'text-pretty');
    expect(screen.getByText("La recherche porte sur le nom et l'ISIN.")).toHaveClass(
      'text-label',
      'text-(--muted-foreground)',
    );
  });

  it('projects the action below the text', async () => {
    await render(template, { imports: [UiEmpty] });

    expect(screen.getByRole('button', { name: 'Ajouter une ligne' })).toBeInTheDocument();
  });

  it('is centred with 24 px of padding, 48 px from 64rem', async () => {
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

  it('omits the hint and the action when absent', async () => {
    const { container } = await render('<ui-empty heading="Rien" />', { imports: [UiEmpty] });

    expect(screen.getByText('Rien')).toBeInTheDocument();
    expect(container.querySelectorAll('span')).toHaveLength(1);
    expect(container.querySelector('.mt-2')).toBeEmptyDOMElement();
  });
});
