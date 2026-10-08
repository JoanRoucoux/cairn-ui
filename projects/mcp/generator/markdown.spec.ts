import { describe, expect, it } from 'vitest';

import { docsUrl, extractSection, splitDescription } from './markdown.ts';
import { collector } from './testing.ts';

const DESCRIPTION = `Clickable element that triggers an action.

#### When to use

* For an action.

#### When not to use

* For navigation.

#### Accessibility

* Native button.`;

describe('splitDescription', () => {
  it('splits the summary from the three sections', () => {
    const { report, problems } = collector();

    expect(splitDescription(DESCRIPTION, 'a.stories.ts', report)).toEqual({
      summary: 'Clickable element that triggers an action.',
      whenToUse: '* For an action.',
      whenNotToUse: '* For navigation.',
      accessibility: '* Native button.',
    });
    expect(problems).toEqual([]);
  });

  it('reports a missing summary, a missing section and an unexpected one', () => {
    const { report, problems } = collector();

    splitDescription('#### When to use\n\nAlways.\n\n#### Examples\n\nNone.', 'a.stories.ts', report);

    expect(problems).toEqual([
      'a.stories.ts: has an unexpected section "#### Examples"',
      'a.stories.ts: has no summary sentence',
      'a.stories.ts: has no "#### When not to use" section',
      'a.stories.ts: has no "#### Accessibility" section',
    ]);
  });
});

describe('extractSection', () => {
  const README = `# Package

## Setup

Import the styles:

\`\`\`css
## not a heading inside a fence
@import 'tokens.css';
\`\`\`

### Fonts

Self-hosted.

## Usage

Import a component.`;

  it('returns the body of a section, sub-headings and fenced code included', () => {
    expect(extractSection(README, 'Setup')).toBe(
      "Import the styles:\n\n```css\n## not a heading inside a fence\n@import 'tokens.css';\n```\n\n### Fonts\n\nSelf-hosted.",
    );
  });

  it('returns the last section up to the end', () => {
    expect(extractSection(README, 'Usage')).toBe('Import a component.');
  });

  it('returns undefined for a missing section', () => {
    expect(extractSection(README, 'Install')).toBeUndefined();
  });
});

describe('docsUrl', () => {
  it('derives the Docs page id the way Storybook does', () => {
    expect(docsUrl('https://example.test/', 'Data display/Line chart')).toBe(
      'https://example.test/?path=/docs/data-display-line-chart--docs',
    );
  });
});
