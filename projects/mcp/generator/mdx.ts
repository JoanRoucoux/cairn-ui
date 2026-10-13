import ts from 'typescript';

export type MdxPage = {
  title?: string;
  content: string;
  /** What the page holds that Markdown cannot carry, so the build fails rather than drop it. */
  problems: string[];
};

/**
 * Turns a Foundations MDX page into plain Markdown: the prose and code samples stay, JSX tables
 * become Markdown tables (a table mapped over an exported array reads its rows from the array), and
 * the ESM statements and the capitalized components that only paint swatches and samples go.
 * Storybook-relative links (`?path=/docs/...`) become absolute. Anything else it would drop is
 * listed in `problems`.
 */
export function mdxToMarkdown(source: string, storybookUrl: string): MdxPage {
  const title = /<Meta\s+title="([^"]+)"/.exec(source)?.[1];
  const kept: string[] = [];
  const problems: string[] = [];
  const arrays: string[] = [];
  const used = new Set<string>();
  let fenced = false;
  let block: { lines: string[]; closer: RegExp } | undefined;

  const complete = (lines: string[]): void => {
    const text = lines.join('\n');

    if (/^(import|export) /.test(text)) {
      readStatement(text, arrays, problems);
    } else {
      readBlock(text, source, used, kept, problems);
    }
  };

  for (const line of source.split('\n')) {
    if (block) {
      block.lines.push(line);

      if (block.closer.test(line)) {
        complete(block.lines);
        block = undefined;
      }
    } else if (line.startsWith('```') || fenced) {
      fenced = line.startsWith('```') ? !fenced : fenced;
      kept.push(line);
    } else if (/^(import|export) /.test(line) || /^<[a-zA-Z]/.test(line)) {
      const closer = /^(import|export) /.test(line) ? statementCloser(line) : closingTag(line);

      if (closer) {
        block = { lines: [line], closer };
      } else {
        complete([line]);
      }
    } else {
      kept.push(line);
    }
  }

  for (const name of arrays.filter((candidate) => !used.has(candidate))) {
    problems.push(`exports ${name}, which no table renders`);
  }

  const content = kept
    .join('\n')
    .replace(/\]\(\?path=/g, `](${storybookUrl}?path=`)
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { ...(title ? { title } : {}), content, problems };
}

/** For a statement opened on this line and closed further down, the pattern of its closing line. */
function statementCloser(line: string): RegExp | undefined {
  return /[([{]\s*$/.test(line) ? /^[)\]}]/ : undefined;
}

/** For a JSX block opened on this line and closed further down, the pattern of its closing line. */
function closingTag(line: string): RegExp | undefined {
  const tag = /^<([a-zA-Z]+)/.exec(line)?.[1] as string;

  return /\/>\s*$/.test(line) || line.includes(`</${tag}>`) ? undefined : new RegExp(`^</${tag}>`);
}

/** An `export const` is a component (capitalized, it only paints) or an array a table renders. */
function readStatement(text: string, arrays: string[], problems: string[]): void {
  const [, name = '', value = ''] = /^export const (\w+) = (\S)/.exec(text) ?? [];

  if (text.startsWith('import ') || /^[A-Z]/.test(name)) {
    return;
  }

  if (value === '[') {
    arrays.push(name);
  } else {
    problems.push(`has an export it cannot convert: ${text.split('\n')[0]}`);
  }
}

function readBlock(text: string, source: string, used: Set<string>, kept: string[], problems: string[]): void {
  const tag = /^<(\w+)/.exec(text)?.[1] as string;

  if (tag === 'table') {
    try {
      kept.push('', renderTable(text, source, used), '');
    } catch (error) {
      problems.push((error as Error).message);
    }
  } else if (!/^[A-Z]/.test(tag)) {
    problems.push(`has a <${tag}> block it cannot convert`);
  }
}

/** A JSX `<table>` as Markdown: a static one cell by cell, a mapped one row by row from its array. */
function renderTable(html: string, source: string, used: Set<string>): string {
  const headers = [...html.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(([, cell]) => cell as string);
  const mapped = /\{(\w+)\.map\(\(\[([\w\s,]+)\]\)\s*=>/.exec(html);
  let rows: (string | undefined)[][];

  if (mapped) {
    const [, name = '', parameters = ''] = mapped;
    const tuples = readExportedTuples(source, name);
    const template = /<tr[^>]*>([\s\S]*?)<\/tr>/.exec(html.slice(mapped.index))?.[1];

    if (!tuples || template === undefined) {
      throw new Error(`has a table mapped over ${name}, which is not an exported array of string tuples with a row`);
    }

    used.add(name);
    const keys = parameters.split(',').map((parameter) => parameter.trim());
    const cells = cellsOf(template);

    rows = tuples.map((tuple) =>
      cells.map((cell) => cellText(cell, Object.fromEntries(keys.map((key, index) => [key, tuple[index]])))),
    );
  } else {
    const body = html.slice(Math.max(html.indexOf('</thead>'), 0));

    rows = [...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(([, row]) =>
      cellsOf(row as string).map((cell) => cellText(cell, {})),
    );
  }

  if (!rows.length || rows.some((row) => row.length !== headers.length)) {
    throw new Error('has a table whose header row does not match its rows');
  }

  const columns = headers.map((_, index) => index).filter((index) => rows.some((row) => row[index] !== undefined));
  const line = (cells: string[]): string => `| ${cells.join(' | ')} |`;

  return [
    line(columns.map((index) => cellText(headers[index] as string, {}) as string)),
    line(columns.map(() => '---')),
    ...rows.map((row) => line(columns.map((index) => row[index] ?? ''))),
  ].join('\n');
}

function cellsOf(row: string): string[] {
  return [...row.matchAll(/<(td|th)[^>]*>([\s\S]*?)<\/\1>/g)].map(([, , cell]) => cell as string);
}

/**
 * The Markdown of a table cell, with `{name}` taken from `values`. A swatch component has no text
 * but its `ratio={name}` prop, so a column of swatches without one is `undefined` and goes.
 */
function cellText(cell: string, values: Record<string, string | undefined>): string | undefined {
  if (/<[A-Z]/.test(cell)) {
    const ratio = /\bratio=\{(\w+)\}/.exec(cell)?.[1];

    return ratio === undefined ? undefined : values[ratio];
  }

  const text = cell
    .replace(/\{(\w+)\}/g, (expression, key: string) => values[key] ?? expression)
    .replace(/<code>([\s\S]*?)<\/code>/g, (_, code: string) => `\`${code.trim()}\``)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (/[{}]/.test(text)) {
    throw new Error(`has a table cell it cannot convert: ${text}`);
  }

  return text.replaceAll('|', String.raw`\|`);
}

/**
 * Evaluates a column-0 `export const name = [...]` of string tuples, the shape the Colors and
 * Typography pages keep their token roles and table rows in.
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
