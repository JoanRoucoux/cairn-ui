import { signal } from '@angular/core';

import { render, screen } from '@testing-library/angular';

import { UI_AMOUNT_MASKED, UiAmount } from './amount';

describe('UiAmount', () => {
  it('renders the formatted value in tabular figures by default', async () => {
    await render('<ui-amount [value]="1204.37" currency="EUR" locale="fr-FR" />', { imports: [UiAmount] });

    const amount = screen.getByText(/1.204,37/);
    expect(amount.closest('ui-amount')).toHaveClass('tabular-nums');
  });

  it('keeps proportional figures for the dominant number', async () => {
    const { fixture } = await render('<ui-amount [value]="1" numeric="proportional" locale="fr-FR" />', {
      imports: [UiAmount],
    });

    expect(fixture.nativeElement.querySelector('ui-amount')).not.toHaveClass('tabular-nums');
  });

  it('accepts signed as a bare attribute', async () => {
    await render('<ui-amount signed [value]="3" locale="fr-FR" />', { imports: [UiAmount] });

    expect(screen.getByText('+3,00')).toBeInTheDocument();
  });

  it('shows a missing value as a subtle em dash', async () => {
    await render('<ui-amount [value]="null" currency="EUR" locale="fr-FR" />', { imports: [UiAmount] });

    expect(screen.getByText('—').closest('ui-amount')).toHaveClass('text-(--subtle-foreground)');
  });

  it('masks when the token says so, and hides on request', async () => {
    const { fixture } = await render(
      `<ui-amount data-testid="dots" [value]="10" currency="EUR" locale="fr-FR" />
       <ui-amount data-testid="gone" whenMasked="hide" [value]="10" currency="EUR" locale="fr-FR" />`,
      { imports: [UiAmount], providers: [{ provide: UI_AMOUNT_MASKED, useValue: signal(true) }] },
    );

    expect(screen.getByTestId('dots')).toHaveTextContent('••••');
    expect(screen.getByTestId('gone')).toHaveAttribute('hidden');
    expect(fixture.nativeElement.textContent).not.toContain('10,00');
  });
});
