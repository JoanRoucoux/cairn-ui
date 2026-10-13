import type { Report } from './report.ts';

export type Description = {
  summary: string;
  whenToUse: string;
  whenNotToUse: string;
  accessibility: string;
};

const SECTIONS: Record<string, Exclude<keyof Description, 'summary'>> = {
  'When to use': 'whenToUse',
  'When not to use': 'whenNotToUse',
  Accessibility: 'accessibility',
};

/**
 * Splits a component description into the sentence that says what it is and its three `####`
 * sections, the shape every Docs page follows.
 */
export function splitDescription(text: string, file: string, report: Report): Description {
  const parts: Record<keyof Description, string[]> = {
    summary: [],
    whenToUse: [],
    whenNotToUse: [],
    accessibility: [],
  };
  let current: keyof Description = 'summary';

  for (const line of text.split('\n')) {
    const heading = /^#### (.+)$/.exec(line)?.[1]?.trim();

    if (heading === undefined) {
      parts[current].push(line);
    } else if (heading in SECTIONS) {
      current = SECTIONS[heading] as keyof Description;
    } else {
      report(file, `has an unexpected section "#### ${heading}"`);
    }
  }

  const description = Object.fromEntries(
    Object.entries(parts).map(([key, lines]) => [key, lines.join('\n').trim()]),
  ) as Description;

  for (const [heading, key] of Object.entries({ summary: 'summary', ...SECTIONS })) {
    if (!description[key as keyof Description]) {
      report(file, `has no ${key === 'summary' ? 'summary sentence' : `"#### ${heading}" section`}`);
    }
  }

  return description;
}

/** The body of a `## heading` section, up to the next heading of the same level. */
export function extractSection(markdown: string, heading: string): string | undefined {
  const lines = markdown.split('\n');
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);

  if (start === -1) {
    return undefined;
  }

  const body: string[] = [];
  let fenced = false;

  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('```')) {
      fenced = !fenced;
    } else if (!fenced && /^#{1,2} /.test(line)) {
      break;
    }

    body.push(line);
  }

  return body.join('\n').trim();
}

/** Link to a Storybook Docs page, built the way Storybook derives an id from a title. */
export function docsUrl(storybookUrl: string, title: string): string {
  const id = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return `${storybookUrl}?path=/docs/${id}--docs`;
}
