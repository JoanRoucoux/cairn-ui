const MINUS = '−';
const EM_DASH = '—';
const BULLETS = '••••';

export type AmountFormatOptions = {
  locale: string;
  currency?: string;
  signed?: boolean;
  fractionDigits?: number;
};

/** Formats a number or an amount for the locale, with a missing value as an em dash and masking behind four bullets. */
export function formatAmount(value: number | null | undefined, options: AmountFormatOptions, masked = false): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return EM_DASH;
  }
  const digits = options.fractionDigits ?? 2;
  const format = new Intl.NumberFormat(options.locale, {
    ...(options.currency ? { style: 'currency', currency: options.currency } : {}),
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  const magnitude = Math.abs(value);
  const parts = format.formatToParts(magnitude);

  if (masked) {
    let replaced = false;
    return parts
      .map((part) => {
        if (['integer', 'group', 'decimal', 'fraction'].includes(part.type)) {
          if (replaced) {
            return '';
          }
          replaced = true;
          return BULLETS;
        }
        return part.value;
      })
      .join('');
  }

  const text = parts.map((part) => part.value).join('');
  const isZero = Number(format.format(magnitude).replace(/[^\d]/g, '')) === 0;
  if (!options.signed || isZero) {
    return value < 0 && !isZero ? `${MINUS}${text}` : text;
  }
  return `${value > 0 ? '+' : MINUS}${text}`;
}
