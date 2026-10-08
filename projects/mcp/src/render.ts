import { categoryOf, summaryOf } from './lookup.ts';
import type { SearchHit } from './lookup.ts';
import type { Declaration, Entry, Foundation, Manifest, Token } from './manifest.ts';

/** Escapes a value for a Markdown table cell. */
const cell = (text: string | undefined): string => (text ? text.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ') : '');

const code = (text: string | undefined): string => (text ? `\`${text}\`` : '');

function table(head: string[], rows: string[][]): string {
  return [
    `| ${head.join(' | ')} |`,
    `| ${head.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');
}

export function renderList(entries: Entry[]): string {
  const groups = new Map<string, Entry[]>();

  for (const entry of entries) {
    groups.set(categoryOf(entry), [...(groups.get(categoryOf(entry)) ?? []), entry]);
  }

  return [...groups]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([category, members]) =>
        `## ${category}\n\n${table(
          ['Entry', 'Selectors', 'Summary'],
          members.map((entry) => [
            code(entry.name),
            cell(entry.declarations.map((declaration) => code(declaration.selector)).join(', ')),
            cell(summaryOf(entry)),
          ]),
        )}`,
    )
    .join('\n\n');
}

/** Everything an agent needs to use an entry: when to, how to import it, and its full API. */
export function renderEntry(entry: Entry): string {
  const symbols = [...entry.declarations, ...entry.services].map((symbol) => symbol.className);
  const sections = [`# ${code(entry.importPath)}`];
  const [page] = entry.docs;

  for (const docs of entry.docs) {
    sections.push(
      [
        `${entry.docs.length > 1 ? `## ${docs.title}\n\n` : ''}${docs.summary}`,
        `Docs: ${docs.url}`,
        `### When to use\n\n${docs.whenToUse}`,
        `### When not to use\n\n${docs.whenNotToUse}`,
        `### Accessibility\n\n${docs.accessibility}`,
      ].join('\n\n'),
    );
  }

  if (!page && summaryOf(entry)) {
    sections.push(summaryOf(entry));
  }

  if (symbols.length) {
    sections.push(`## Import\n\n\`\`\`ts\nimport { ${symbols.join(', ')} } from '${entry.importPath}';\n\`\`\``);
  }

  // A story control describes the input of the same name, when a single declaration has one.
  const controls = entry.docs.flatMap((docs) => docs.args);
  const ownerOf = (name: string): Declaration | undefined => {
    const owners = entry.declarations.filter((declaration) => declaration.inputs.some((input) => input.name === name));

    return owners.length === 1 ? owners[0] : undefined;
  };

  for (const declaration of entry.declarations) {
    const described = new Map(
      controls.filter((arg) => ownerOf(arg.name) === declaration).map((arg) => [arg.name, arg.description]),
    );

    sections.push(renderDeclaration(declaration, described));
  }

  for (const service of entry.services) {
    sections.push(
      [
        `## ${service.className} (service${service.providedIn ? `, provided in \`${service.providedIn}\`` : ''})`,
        service.description,
        table(
          ['Member', 'Description'],
          service.members.map((member) => [code(cell(member.signature)), cell(member.description)]),
        ),
        ...examples(service.examples, 'ts'),
      ].join('\n\n'),
    );
  }

  for (const fn of entry.functions) {
    sections.push(
      [`## ${fn.name}()`, `\`\`\`ts\n${fn.signature}\n\`\`\``, fn.description, ...examples(fn.examples, 'ts')].join(
        '\n\n',
      ),
    );
  }

  if (entry.constants.length || entry.types.length) {
    sections.push(
      `## Constants and types\n\n${table(
        ['Name', 'Value or type', 'Description'],
        [
          ...entry.constants.map((constant) => [
            code(constant.name),
            cell(
              constant.values ? constant.values.map((value) => JSON.stringify(value)).join(', ') : code(constant.type),
            ),
            cell(constant.description),
          ]),
          ...entry.types.map((type) => [code(type.name), code(cell(type.type)), cell(type.description)]),
        ],
      )}`,
    );
  }

  const unmatched = controls.filter((arg) => !ownerOf(arg.name));

  if (unmatched.length) {
    sections.push(
      `## Story controls\n\nControls of the Docs page; some are story-only, such as projected text.\n\n${table(
        ['Control', 'Description'],
        unmatched.map((arg) => [code(arg.name), cell(arg.description)]),
      )}`,
    );
  }

  return sections.join('\n\n');
}

function renderDeclaration(declaration: Declaration, args: Map<string, string>): string {
  const parts = [
    `## ${declaration.className} (${declaration.kind}) — \`${declaration.selector}\``,
    [declaration.description, declaration.exportAs ? `Exported as \`${declaration.exportAs}\`.` : '']
      .filter(Boolean)
      .join(' '),
  ];

  if (declaration.inputs.length) {
    parts.push(
      `### Inputs\n\n${table(
        ['Input', 'Type', 'Default', 'Description'],
        declaration.inputs.map((input) => [
          `${code(input.twoWay ? `[(${input.name})]` : input.name)}${input.required ? ' (required)' : ''}`,
          code(cell(input.type)),
          code(cell(input.default)),
          cell(input.description ?? args.get(input.name)),
        ]),
      )}`,
    );
  }

  if (declaration.outputs.length) {
    parts.push(
      `### Outputs\n\n${table(
        ['Output', 'Payload', 'Description'],
        declaration.outputs.map((output) => [code(output.name), code(cell(output.type)), cell(output.description)]),
      )}`,
    );
  }

  if (declaration.slots.length) {
    parts.push(
      `### Content slots\n\n${declaration.slots.map((slot) => `- ${slot === '*' ? 'Default slot' : code(slot)}`).join('\n')}`,
    );
  }

  return [...parts, ...examples(declaration.examples, 'html')].join('\n\n');
}

function examples(list: string[], language: string): string[] {
  return list.length
    ? [`### Examples\n\n${list.map((example) => `\`\`\`${language}\n${example}\n\`\`\``).join('\n\n')}`]
    : [];
}

export function renderTokens(tokens: Token[]): string {
  const groups = [...new Set(tokens.map((token) => token.group))];

  return groups
    .map((group) => {
      const members = tokens.filter((token) => token.group === group);
      const rows = members.map((token) => [
        code(token.name),
        token.light === undefined ? code(cell(token.value)) : `${code(token.light)} / ${code(token.dark)}`,
        code(token.utility),
        cell(token.role),
        cell(token.overrides.map((override) => `${override.media}: ${override.value}`).join('; ')),
      ]);

      return `## ${group}\n\n${table(['Token', 'Value (light / dark)', 'Utility', 'Role', 'Overrides'], rows)}`;
    })
    .join('\n\n');
}

export function renderSetup(manifest: Manifest, origin: string): string {
  const { name, version, peerDependencies } = manifest.package;
  const peers = Object.entries(peerDependencies).map(([peer, range]) => `\`${peer}\` ${range}`);

  return [
    `# Setting up ${name} ${version}`,
    `Answering from ${origin}.`,
    `## Installation\n\n\`\`\`sh\nnpm install ${name}\n\`\`\`${peers.length ? `\n\nPeer dependencies: ${peers.join(', ')}.` : ''}`,
    `## Setup\n\n${manifest.setup}`,
    [
      '## Conventions',
      `- Every component is imported from its own entry point, \`${name}/<entry>\`: the package root exports nothing.`,
      '- Components are standalone: add them to the `imports` of the component that uses them.',
      '- A selector such as `button[ui-button]` is an attribute on the native element, which keeps its semantics: write `<button ui-button>`, never `<ui-button>`.',
      '- Style with the tokens (`bg-(--card)`, `text-(--muted-foreground)`) and the utilities `theme.css` derives from them; never hardcode a color.',
    ].join('\n'),
  ].join('\n\n');
}

export function renderFoundation(page: Foundation): string {
  return `${page.content}\n\nDocs: ${page.url}`;
}

export function renderSearch(hits: SearchHit[]): string {
  return table(
    ['Kind', 'Name', 'Summary'],
    hits.map((hit) => [hit.kind, code(hit.name), cell(hit.summary)]),
  );
}
