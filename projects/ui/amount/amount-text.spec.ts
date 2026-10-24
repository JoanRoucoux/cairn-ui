import { signal } from '@angular/core';

import { render, screen } from '@testing-library/angular';

import { UI_AMOUNT_LABELS } from './amount-labels';
import { UiAmountText } from './amount-text';

describe('UiAmountText', () => {
  it('renders plain text as it is', async () => {
    const { fixture } = await render('<ui-amount-text text="1 204,37 €" />', { imports: [UiAmountText] });

    expect(fixture.nativeElement.querySelector('ui-amount-text')).toHaveTextContent('1 204,37 €');
    expect(fixture.nativeElement.querySelector('ui-amount-text').children).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('ui-amount-text')).not.toHaveAttribute('class');
  });

  it('adds no whitespace around the text', async () => {
    const { fixture } = await render('<p>(<ui-amount-text text="1 204,37 €" />)<ui-amount-text text="a — b" /></p>', {
      imports: [UiAmountText],
    });

    expect(fixture.nativeElement.querySelector('p').textContent).toBe('(1 204,37 €)a —Not available b');
  });

  it('hides the masked glyphs and speaks the label', async () => {
    await render('<ui-amount-text text="•••• €" />', { imports: [UiAmountText] });

    expect(screen.getByText('•••• €')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Hidden amount')).toHaveClass('sr-only');
  });

  it('hides a standalone em dash and speaks the label', async () => {
    await render('<ui-amount-text text="—" />', { imports: [UiAmountText] });

    expect(screen.getByText('—')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Not available')).toHaveClass('sr-only');
  });

  it('keeps the text around a glyph', async () => {
    const { fixture } = await render('<ui-amount-text text="PEA · — · 2 holdings" />', { imports: [UiAmountText] });

    expect(fixture.nativeElement.querySelector('ui-amount-text')).toHaveTextContent(
      'PEA · —Not available · 2 holdings',
    );
  });

  it('follows the labels token', async () => {
    const labels = signal({ masked: 'Montant masqué', missing: 'Indisponible' });
    await render('<ui-amount-text text="•••• €" />', {
      imports: [UiAmountText],
      providers: [{ provide: UI_AMOUNT_LABELS, useValue: labels }],
    });

    expect(screen.getByText('Montant masqué')).toBeInTheDocument();

    labels.set({ masked: 'Hidden', missing: 'None' });
    await screen.findByText('Hidden');
  });
});
