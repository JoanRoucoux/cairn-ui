import type { Entry, Manifest } from './manifest.ts';

/** The entries without a Docs page are shared building blocks such as `control`. */
export const BUILDING_BLOCKS = 'Building blocks';

/** The Storybook section of an entry: `Inputs` for `Inputs/Button`. */
export function categoryOf(entry: Entry): string {
  return entry.docs[0]?.title.split('/')[0] ?? BUILDING_BLOCKS;
}

export function categories(manifest: Manifest): string[] {
  return [...new Set(manifest.entries.map(categoryOf))].sort();
}

const normalize = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]/g, '');

/** `ui-field`, `uiFieldLeading` and `UiButton` without their prefix, so `field` finds them too. */
const withoutPrefix = (key: string): string => key.replace(/^ui(?=[a-z0-9])/, '');

/** Element names and attribute names of a selector: `ui-button` for `button[ui-button], a[ui-button]`. */
function selectorNames(selector: string): string[] {
  return selector.split(',').flatMap((part) => {
    const attributes = [...part.matchAll(/\[([\w-]+)/g)].map((match) => match[1] as string);

    return attributes.length ? attributes : [part.trim()];
  });
}

/**
 * Finds an entry by any name a reader may have for it, from the most to the least specific: its
 * folder (`line-chart`), a class (`UiLineChart`), a selector (`ui-line-chart`, `uiFieldLeading`)
 * or its Docs title (`Line chart`). Case, dashes and the `ui` prefix do not matter.
 */
export function findEntry(manifest: Manifest, name: string): Entry | undefined {
  const wanted = withoutPrefix(normalize(name));
  const keysOf: ((entry: Entry) => string[])[] = [
    (entry) => [entry.name],
    (entry) => entry.declarations.map((declaration) => declaration.className),
    (entry) => entry.services.map((service) => service.className),
    (entry) => entry.declarations.flatMap((declaration) => selectorNames(declaration.selector)),
    (entry) => entry.docs.map((page) => page.title.split('/').pop() as string),
  ];

  for (const keys of keysOf) {
    const entry = manifest.entries.find((candidate) =>
      keys(candidate).some((key) => withoutPrefix(normalize(key)) === wanted),
    );

    if (entry) {
      return entry;
    }
  }

  return undefined;
}

/** Entry names close to a name that matched nothing, closest first. */
export function suggestEntries(manifest: Manifest, name: string): string[] {
  const wanted = withoutPrefix(normalize(name));

  return manifest.entries
    .map((entry) => ({ name: entry.name, distance: distance(wanted, normalize(entry.name)) }))
    .filter(
      (candidate) =>
        candidate.distance <= 3 ||
        normalize(candidate.name).includes(wanted) ||
        wanted.includes(normalize(candidate.name)),
    )
    .sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name))
    .map((candidate) => candidate.name)
    .slice(0, 5);
}

function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];

    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        (previous[j] as number) + 1,
        (current[j - 1] as number) + 1,
        (previous[j - 1] as number) + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }

    previous = current;
  }

  return previous[b.length] as number;
}

export type SearchHit = {
  kind: 'component' | 'token' | 'foundation';
  name: string;
  summary: string;
  score: number;
};

type Field = { weight: number; text: string };

/**
 * Ranks entries, tokens and Foundations pages against the words of a query: a word found in a
 * name weighs more than one found in a summary, which weighs more than one found in the body.
 */
export function search(manifest: Manifest, query: string, limit: number): SearchHit[] {
  const words = query
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter((word) => word.length > 1);
  const documents: (Omit<SearchHit, 'score'> & { fields: Field[] })[] = [
    ...manifest.entries.map((entry) => ({
      kind: 'component' as const,
      name: entry.name,
      summary: summaryOf(entry),
      fields: [
        {
          weight: 5,
          text: [
            entry.name,
            ...entry.declarations.flatMap((declaration) => [declaration.className, declaration.selector]),
            ...entry.services.map((service) => service.className),
          ].join(' '),
        },
        { weight: 4, text: entry.docs.map((page) => page.title).join(' ') },
        {
          weight: 2,
          text: [
            ...entry.docs.map((page) => page.summary),
            ...entry.declarations.map((declaration) => declaration.description),
            ...entry.services.map((service) => service.description),
            ...entry.functions.map((fn) => `${fn.name} ${fn.description}`),
          ].join(' '),
        },
        {
          weight: 1,
          text: [
            ...entry.docs.flatMap((page) => [page.whenToUse, page.whenNotToUse, page.accessibility]),
            ...entry.declarations.flatMap((declaration) => declaration.inputs.map((input) => input.name)),
          ].join(' '),
        },
      ],
    })),
    ...manifest.tokens.map((token) => ({
      kind: 'token' as const,
      name: token.name,
      summary: token.role ?? token.value ?? `${token.light} / ${token.dark}`,
      fields: [
        { weight: 5, text: `${token.name} ${token.utility ?? ''}` },
        { weight: 2, text: token.role ?? '' },
        { weight: 1, text: token.group },
      ],
    })),
    ...manifest.foundations.map((page) => ({
      kind: 'foundation' as const,
      name: page.slug,
      summary: firstSentence(page.content.replace(/^#.*\n+/, '')),
      fields: [
        { weight: 4, text: page.title },
        { weight: 1, text: page.content },
      ],
    })),
  ];

  return documents
    .map(({ fields, ...hit }) => ({
      ...hit,
      score: words.reduce(
        (total, word) =>
          total + fields.reduce((sum, field) => sum + (field.text.toLowerCase().includes(word) ? field.weight : 0), 0),
        0,
      ),
    }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/** The sentence that says what an entry is: its Docs summary, else its first declaration's JSDoc. */
export function summaryOf(entry: Entry): string {
  return firstSentence(
    entry.docs[0]?.summary ?? entry.declarations[0]?.description ?? entry.services[0]?.description ?? '',
  );
}

function firstSentence(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();

  return /^.*?[.!?](?=\s|$)/.exec(flat)?.[0] ?? flat;
}
