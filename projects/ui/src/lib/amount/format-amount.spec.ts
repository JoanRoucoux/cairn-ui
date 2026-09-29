import { formatAmount } from './format-amount';

const EUR = { locale: 'fr-FR', currency: 'EUR' };
const nbsp = ' ';
const minus = '−';
const euro = '€';
const bullets = '••••';
const groupSeparator = new Intl.NumberFormat('fr-FR').format(1000).charAt(1);

describe('formatAmount', () => {
  it('formats euros the French way', () => {
    expect(formatAmount(164294.28, EUR)).toBe(`164${groupSeparator}294,28${nbsp}${euro}`);
  });

  it('signs a gain and a loss explicitly, with the typographic minus', () => {
    expect(formatAmount(412.56, { ...EUR, signed: true })).toBe(`+412,56${nbsp}${euro}`);
    expect(formatAmount(-240.72, { ...EUR, signed: true })).toBe(`${minus}240,72${nbsp}${euro}`);
  });

  it('never signs zero, not even negative zero', () => {
    expect(formatAmount(0, { ...EUR, signed: true })).toBe(`0,00${nbsp}${euro}`);
    expect(formatAmount(-0, { ...EUR, signed: true })).toBe(`0,00${nbsp}${euro}`);
  });

  it('formats a plain number without a currency', () => {
    expect(formatAmount(1354, { locale: 'fr-FR', fractionDigits: 0 })).toBe(`1${groupSeparator}354`);
  });

  it('signs a negative value even when not in signed mode', () => {
    expect(formatAmount(-1354, { locale: 'fr-FR', fractionDigits: 0 })).toBe(`${minus}1${groupSeparator}354`);
  });

  it('renders a missing value as an em dash', () => {
    expect(formatAmount(null, EUR)).toBe('—');
    expect(formatAmount(undefined, EUR)).toBe('—');
  });

  it('masks the figure and keeps the currency', () => {
    expect(formatAmount(164294.28, EUR, true)).toBe(`${bullets}${nbsp}${euro}`);
    expect(formatAmount(1354, { locale: 'fr-FR' }, true)).toBe(bullets);
  });

  it('follows the locale', () => {
    expect(formatAmount(1234.5, { locale: 'en-US', currency: 'EUR' })).toBe(`${euro}1,234.50`);
  });
});
