import { describe, expect, it } from 'vitest';

import { fixtureManifest } from './fixture.ts';
import { BUILDING_BLOCKS, categories, findEntry, search, suggestEntries, summaryOf } from './lookup.ts';

const manifest = fixtureManifest();

describe('findEntry', () => {
  it.each([
    ['button', 'button'],
    ['UiButton', 'button'],
    ['ui-button', 'button'],
    ['ui-field', 'field'],
    ['uiFieldLeading', 'field'],
    ['FieldLeading', 'field'],
    ['UiToasts', 'toast'],
    ['Field leading', 'field'],
    ['  TOAST ', 'toast'],
  ])('finds %s', (name, entry) => {
    expect(findEntry(manifest, name)?.name).toBe(entry);
  });

  it('returns undefined for an unknown name', () => {
    expect(findEntry(manifest, 'datepicker')).toBeUndefined();
  });
});

describe('suggestEntries', () => {
  it('suggests close or containing names, closest first', () => {
    expect(suggestEntries(manifest, 'buton')).toEqual(['button']);
    expect(suggestEntries(manifest, 'toasts-service')).toEqual(['toast']);
    expect(suggestEntries(manifest, 'datepicker')).toEqual([]);
  });

  it('orders suggestions by distance, then by name', () => {
    const named = (...names: string[]): typeof manifest => ({
      ...manifest,
      entries: names.map((name) => ({ ...manifest.entries[3]!, name })),
    });

    expect(suggestEntries(named('cart', 'card', 'carts'), 'car')).toEqual(['card', 'cart', 'carts']);
  });
});

describe('categories', () => {
  it('lists the Storybook sections, and groups the entries without Docs as building blocks', () => {
    expect(categories(manifest)).toEqual([BUILDING_BLOCKS, 'Inputs']);
  });
});

describe('summaryOf', () => {
  it('takes the first sentence of the Docs page, else of the first declaration or service', () => {
    expect(summaryOf(manifest.entries[0]!)).toBe('Clickable element that triggers an action.');
    expect(summaryOf({ ...manifest.entries[0]!, docs: [] })).toBe('Styled native button.');
    expect(summaryOf(manifest.entries[2]!)).toBe('Message queue.');
    expect(summaryOf(manifest.entries[3]!)).toBe('');
  });
});

describe('search', () => {
  it('ranks names above descriptions, across components, tokens and Foundations pages', () => {
    expect(search(manifest, 'button', 10).map((hit) => [hit.kind, hit.name])).toEqual([['component', 'button']]);
    expect(search(manifest, 'primary', 10).map((hit) => hit.name)).toEqual(['--primary']);
    expect(search(manifest, 'label', 10).map((hit) => hit.name)).toEqual(['--text-label', 'field', 'button']);
    expect(search(manifest, 'monochrome', 10)).toEqual([
      { kind: 'foundation', name: 'colors', summary: 'Cairn is monochrome.', score: 1 },
    ]);
  });

  it('summarizes a token by its role, else its value', () => {
    expect(search(manifest, 'gutter', 1)).toEqual([{ kind: 'token', name: '--gutter', summary: '1rem', score: 5 }]);
    expect(
      search(
        { ...manifest, tokens: [{ name: '--ring', group: 'color', light: '#000', dark: '#fff', overrides: [] }] },
        'ring',
        1,
      ),
    ).toEqual([{ kind: 'token', name: '--ring', summary: '#000 / #fff', score: 5 }]);
  });

  it('respects the limit, ignores one-letter words, and finds nothing for unknown words', () => {
    expect(search(manifest, 'ui', 2)).toHaveLength(2);
    expect(search(manifest, 'a', 10)).toEqual([]);
    expect(search(manifest, 'datepicker', 10)).toEqual([]);
  });
});
