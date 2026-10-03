import { render, screen } from '@testing-library/angular';

import { UiAlert } from './alert';

describe('UiAlert', () => {
  it('fades in when it appears', async () => {
    await render('<ui-alert>Text</ui-alert>', { imports: [UiAlert] });

    expect(screen.getByRole('alert')).toHaveClass('ui-enter-fade');
  });

  it('shows without motion when fadeIn is off, for an alert present as the page opens', async () => {
    await render('<ui-alert [fadeIn]="false">Text</ui-alert>', { imports: [UiAlert] });

    expect(screen.getByRole('alert')).not.toHaveClass('ui-enter-fade');
  });

  it('is an alert on the card surface by default', async () => {
    await render('<ui-alert>Identifiant ou mot de passe incorrect.</ui-alert>', { imports: [UiAlert] });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass(
      'bg-(--card)',
      'rounded-control',
      'shadow-[inset_0_0_0_1px_var(--border)]',
      'px-3.5',
      'py-3',
    );
    expect(alert).toHaveTextContent('Identifiant ou mot de passe incorrect.');
  });

  it('draws the circle-alert icon in the negative color, hidden from assistive technology', async () => {
    await render('<ui-alert>Text</ui-alert>', { imports: [UiAlert] });

    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('width', '18');
    expect(icon).toHaveAttribute('stroke-width', '1.75');
    expect(icon).toHaveClass('stroke-(--negative)');
    expect(icon?.querySelector('circle')).not.toBeNull();
  });

  it('renders the heading above muted text when one is given', async () => {
    await render('<ui-alert heading="La connexion n\'a pas abouti">Réessayez.</ui-alert>', { imports: [UiAlert] });

    expect(screen.getByText("La connexion n'a pas abouti")).toHaveClass('font-medium');
    expect(screen.getByText('Réessayez.')).toHaveClass('text-(--muted-foreground)');
  });

  it('keeps the text in the foreground colour without a heading', async () => {
    await render('<ui-alert>Text</ui-alert>', { imports: [UiAlert] });

    expect(screen.getByText('Text')).not.toHaveClass('text-(--muted-foreground)');
  });

  it('turns the warning variant into an inline status with the triangle icon', async () => {
    await render('<ui-alert variant="warning">Cette action est définitive.</ui-alert>', { imports: [UiAlert] });

    const status = screen.getByRole('status');
    expect(status).not.toHaveClass('bg-(--card)');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(status.querySelector('svg')).toHaveClass('stroke-(--negative)');
    expect(status.querySelector('circle')).toBeNull();
    expect(status.querySelector('path')).not.toBeNull();
  });
});
