import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UiResultGroup } from './result-group';

const template = `
  <ui-result-group label="Northwind Markets" hint="cours en continu" [state]="state" errorMessage="Northwind Markets n'a pas répondu." retryLabel="Réessayer" (retry)="retried()">
    <button type="button">Contoso Global Equity</button>
    <span resultGroupMessage>Aucun résultat chez Northwind Markets.</span>
  </ui-result-group>
`;

describe('UiResultGroup', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const draw = async (
    state: string,
    retried = vi.fn(),
  ): Promise<{ container: HTMLElement; fixture: { detectChanges: () => void } }> => {
    const view = await render(template, { imports: [UiResultGroup], componentProperties: { state, retried } });
    await vi.advanceTimersByTimeAsync(0);
    return view;
  };

  it('is a group named by its two-tone heading', async () => {
    await draw('ready');

    const group = screen.getByRole('group', { name: 'Northwind Markets' });
    expect(screen.getByText('Northwind Markets')).toHaveClass('font-semibold', 'text-(--foreground)');
    expect(screen.getByText('cours en continu')).toHaveClass('text-(--subtle-foreground)');
    expect(screen.getByText('Northwind Markets').parentElement).toHaveClass(
      'text-caption',
      'gap-1.5',
      'pt-3',
      'pr-2.5',
      'pb-1',
      'pl-2.5',
    );
    expect(group).toContainElement(screen.getByRole('button', { name: 'Contoso Global Equity' }));
  });

  it('draws the heading without a hint', async () => {
    await render('<ui-result-group label="Déjà suivi" />', { imports: [UiResultGroup] });

    expect(screen.getByRole('group', { name: 'Déjà suivi' })).toBeInTheDocument();
    expect(screen.getByText('Déjà suivi').parentElement?.children).toHaveLength(1);
  });

  it('gives each group its own heading id', async () => {
    await render('<ui-result-group label="A" /><ui-result-group label="B" />', { imports: [UiResultGroup] });

    const [a, b] = screen.getAllByRole('group') as [HTMLElement, HTMLElement];
    expect(a.getAttribute('aria-labelledby')).not.toBe(b.getAttribute('aria-labelledby'));
  });

  it('shows the rows when ready, without the message', async () => {
    await draw('ready');

    expect(screen.getByRole('button', { name: 'Contoso Global Equity' })).toBeInTheDocument();
    expect(screen.queryByText('Aucun résultat chez Northwind Markets.')).not.toBeInTheDocument();
  });

  it('shows a skeleton of two rows while loading', async () => {
    const { container, fixture } = await draw('loading');
    await vi.advanceTimersByTimeAsync(150);
    fixture.detectChanges();

    expect(container.querySelector('ui-async')).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelectorAll('ui-async > div > span.flex')).toHaveLength(2);
    expect(container.querySelectorAll('ui-async span.bg-\\(--muted\\)')).toHaveLength(4);
    expect(screen.queryByRole('button', { name: 'Contoso Global Equity' })).not.toBeInTheDocument();
  });

  it('shows the message when empty', async () => {
    await draw('empty');

    expect(screen.getByText('Aucun résultat chez Northwind Markets.').parentElement).toHaveClass(
      'text-label',
      'text-(--muted-foreground)',
      'pt-1',
      'pb-2.5',
      'px-2.5',
    );
    expect(screen.queryByRole('button', { name: 'Contoso Global Equity' })).not.toBeInTheDocument();
  });

  it('shows the error with a text-only retry that emits retry', async () => {
    const retried = vi.fn();
    await draw('error', retried);

    const retry = screen.getByRole('button', { name: 'Réessayer' });
    vi.useRealTimers();
    await userEvent.click(retry);

    expect(screen.getByRole('alert')).toHaveTextContent("Northwind Markets n'a pas répondu.");
    expect(retry.querySelector('svg')).toBeNull();
    expect(retried).toHaveBeenCalledOnce();
  });
});
