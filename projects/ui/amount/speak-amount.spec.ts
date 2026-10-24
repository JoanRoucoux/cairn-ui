import { type AmountLabels } from './amount-labels';
import { amountSegments, speakAmount } from './speak-amount';

const labels: AmountLabels = { masked: 'Hidden amount', missing: 'Not available' };

describe('speakAmount', () => {
  it.each([
    ['•••• €', 'Hidden amount'],
    ['••••\u00a0€', 'Hidden amount'],
    ['€ ••••', 'Hidden amount'],
    ['$••••', 'Hidden amount'],
    ['••••', 'Hidden amount'],
    ['—', 'Not available'],
    ['PEA · — · 2 holdings', 'PEA · Not available · 2 holdings'],
    ['PEA · •••• € · 2', 'PEA · Hidden amount · 2'],
    ['+•••• €', '+Hidden amount'],
    ['1 204,37 €', '1 204,37 €'],
    ['a—b', 'a—b'],
    ['', ''],
  ])('speaks %j as %j', (text, spoken) => {
    expect(speakAmount(text, labels)).toBe(spoken);
  });

  it('uses the labels it is given', () => {
    expect(speakAmount('•••• €', { masked: 'Montant masqué', missing: 'Indisponible' })).toBe('Montant masqué');
    expect(speakAmount('—', { masked: 'Montant masqué', missing: 'Indisponible' })).toBe('Indisponible');
  });
});

describe('amountSegments', () => {
  it('splits text around the glyphs', () => {
    expect(amountSegments('A •••• € B')).toEqual([
      { kind: 'text', text: 'A ' },
      { kind: 'masked', text: '•••• €' },
      { kind: 'text', text: ' B' },
    ]);
  });
});
