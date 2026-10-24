import type { AmountLabels } from './amount-labels';

export type AmountSegment = { kind: 'text' | 'masked' | 'missing'; text: string };

const GLYPHS = /(\p{Sc}[\s\u00a0]?)?••••([\s\u00a0]?\p{Sc})?|(?<!\S)—(?!\S)/gu;

/** @internal */
export function amountSegments(text: string): AmountSegment[] {
  const segments: AmountSegment[] = [];
  let last = 0;

  for (const match of text.matchAll(GLYPHS)) {
    if (match.index > last) {
      segments.push({ kind: 'text', text: text.slice(last, match.index) });
    }
    segments.push({ kind: match[0] === '—' ? 'missing' : 'masked', text: match[0] });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    segments.push({ kind: 'text', text: text.slice(last) });
  }

  return segments;
}

/**
 * Turns a formatted amount into text a screen reader can speak: a masked run (four bullets with the
 * currency symbol stuck to it) becomes `labels.masked` and a standalone em dash becomes `labels.missing`.
 *
 * @example
 * speakAmount('•••• €', { masked: 'Hidden amount', missing: 'Not available' });
 */
export function speakAmount(text: string, labels: AmountLabels): string {
  return amountSegments(text)
    .map((segment) => (segment.kind === 'text' ? segment.text : labels[segment.kind]))
    .join('');
}
