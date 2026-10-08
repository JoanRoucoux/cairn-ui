import ts from 'typescript';

/**
 * Turns a Foundations MDX page into plain Markdown: the prose and code samples stay, the ESM
 * statements and the JSX blocks (swatches, tables built from data) go. Storybook-relative links
 * (`?path=/docs/...`) become absolute.
 */
export function mdxToMarkdown(source: string, storybookUrl: string): { title?: string; content: string } {
  const title = /<Meta\s+title="([^"]+)"/.exec(source)?.[1];
  const kept: string[] = [];
  let fenced = false;
  let closer: RegExp | undefined;

  for (const line of source.split('\n')) {
    if (closer) {
      closer = closer.test(line) ? undefined : closer;
    } else if (line.startsWith('```') || fenced) {
      fenced = line.startsWith('```') ? !fenced : fenced;
      kept.push(line);
    } else if (/^(import|export) /.test(line)) {
      closer = /[([{]\s*$/.test(line) ? /^[)\]}]/ : undefined;
    } else if (/^<[a-zA-Z]/.test(line)) {
      closer = closingTag(line);
    } else {
      kept.push(line);
    }
  }

  const content = kept
    .join('\n')
    .replace(/\]\(\?path=/g, `](${storybookUrl}?path=`)
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { ...(title ? { title } : {}), content };
}

/** For a JSX block opened on this line and closed further down, the pattern of its closing line. */
function closingTag(line: string): RegExp | undefined {
  const tag = /^<([a-zA-Z]+)/.exec(line)?.[1] as string;

  return /\/>\s*$/.test(line) || line.includes(`</${tag}>`) ? undefined : new RegExp(`^</${tag}>`);
}

/**
 * Evaluates a column-0 `export const name = [...]` of string tuples, the shape the Colors page
 * keeps its token roles in.
 */
export function readExportedTuples(source: string, name: string): string[][] | undefined {
  const start = source.indexOf(`export const ${name} = [`);
  const end = source.indexOf('\n];', start);

  if (start === -1 || end === -1) {
    return undefined;
  }

  const sourceFile = ts.createSourceFile('page.ts', source.slice(start, end + 3), ts.ScriptTarget.Latest, true);
  const statement = sourceFile.statements[0] as ts.VariableStatement;
  const array = statement.declarationList.declarations[0]?.initializer as ts.ArrayLiteralExpression;

  return array.elements.map((element) =>
    ts.isArrayLiteralExpression(element)
      ? element.elements.map((item) => (ts.isStringLiteralLike(item) ? item.text : ''))
      : [],
  );
}
