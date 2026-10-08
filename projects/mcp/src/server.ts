import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import type { ManifestSource } from './load.ts';
import { categories, categoryOf, findEntry, search, suggestEntries } from './lookup.ts';
import type { Manifest } from './manifest.ts';
import { renderEntry, renderFoundation, renderList, renderSearch, renderSetup, renderTokens } from './render.ts';

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

const FORMAT = z
  .enum(['markdown', 'json'])
  .default('markdown')
  .describe('`markdown` to read, `json` for the raw manifest data.');

const text = (body: string): CallToolResult => ({ content: [{ type: 'text', text: body }] });

const json = (data: unknown): CallToolResult => text(JSON.stringify(data, null, 2));

const failure = (message: string): CallToolResult => ({ ...text(message), isError: true });

const markdown = (uri: string, body: string): { contents: { uri: string; mimeType: string; text: string }[] } => ({
  contents: [{ uri, mimeType: 'text/markdown', text: body }],
});

/** The MCP server over one manifest: read-only tools and resources, no network, no file access. */
export function createServer({ manifest, origin }: ManifestSource, version: string): McpServer {
  const { name, version: uiVersion } = manifest.package;
  const server = new McpServer(
    { name: 'cairn-ui', title: 'Cairn UI', version },
    {
      instructions: [
        `${name} ${uiVersion} is an Angular design system: standalone, signal-based components and a monochrome token sheet.`,
        'Before writing a template with it, call cairn_get_setup once, then cairn_get_component for every component you use:',
        'it gives the import path, the selector, the inputs and outputs, and when to use the component or not.',
        'Never hardcode a color: cairn_get_tokens lists the tokens and the utilities derived from them.',
        `Answers come from ${origin}.`,
      ].join(' '),
    },
  );

  registerTools(server, manifest, origin);
  registerResources(server, manifest, origin);

  return server;
}

function registerTools(server: McpServer, manifest: Manifest, origin: string): void {
  const groups = [...new Set(manifest.tokens.map((token) => token.group))];

  server.registerTool(
    'cairn_list_components',
    {
      title: 'List Cairn UI components',
      description:
        'Lists the entry points of the library, grouped by Storybook section, with their selectors and a one-line summary.',
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe(`Only this section, one of: ${categories(manifest).join(', ')}.`),
        format: FORMAT,
      },
      annotations: READ_ONLY,
    },
    ({ category, format }) => {
      const entries = manifest.entries.filter(
        (entry) => !category || categoryOf(entry).toLowerCase() === category.toLowerCase(),
      );

      if (!entries.length) {
        return failure(`No section "${category}". The sections are: ${categories(manifest).join(', ')}.`);
      }

      return format === 'json'
        ? json(
            entries.map(({ name, importPath, declarations }) => ({
              name,
              importPath,
              declarations: declarations.map((d) => d.selector),
            })),
          )
        : text(renderList(entries));
    },
  );

  server.registerTool(
    'cairn_get_component',
    {
      title: 'Get a Cairn UI component',
      description:
        'Returns everything about one entry point: when to use it and when not to, accessibility, the import, and for each component, directive or service its selector, inputs, outputs, content slots and examples.',
      inputSchema: {
        name: z
          .string()
          .min(1)
          .describe(
            'An entry, class, selector or Docs title: "button", "UiField", "ui-field", "uiFieldLeading" or "Line chart".',
          ),
        format: FORMAT,
      },
      annotations: READ_ONLY,
    },
    ({ name, format }) => {
      const entry = findEntry(manifest, name);

      if (!entry) {
        const suggestions = suggestEntries(manifest, name);

        return failure(
          `No entry matches "${name}".${suggestions.length ? ` Did you mean ${suggestions.join(', ')}?` : ''} cairn_list_components lists them all, cairn_search searches their descriptions.`,
        );
      }

      return format === 'json' ? json(entry) : text(renderEntry(entry));
    },
  );

  server.registerTool(
    'cairn_search',
    {
      title: 'Search Cairn UI',
      description:
        'Searches the components, tokens and Foundations pages by keyword ("date", "destructive", "focus ring", "loading") and returns the best matches.',
      inputSchema: {
        query: z.string().min(2).describe('Words to look for.'),
        limit: z.number().int().min(1).max(50).default(10).describe('Maximum number of matches.'),
      },
      annotations: READ_ONLY,
    },
    ({ query, limit }) => {
      const hits = search(manifest, query, limit);

      return hits.length
        ? text(renderSearch(hits))
        : failure(`Nothing matches "${query}". Try fewer or broader words, or cairn_list_components.`);
    },
  );

  server.registerTool(
    'cairn_get_tokens',
    {
      title: 'Get Cairn UI design tokens',
      description:
        'Lists the CSS custom properties of tokens.css: light and dark values, media overrides, the Tailwind utility derived from each, and the role of each color.',
      inputSchema: {
        group: z
          .enum(groups as [string, ...string[]])
          .optional()
          .describe('Only this group.'),
        format: FORMAT,
      },
      annotations: READ_ONLY,
    },
    ({ group, format }) => {
      const tokens = manifest.tokens.filter((token) => !group || token.group === group);

      return format === 'json' ? json(tokens) : text(renderTokens(tokens));
    },
  );

  server.registerTool(
    'cairn_get_setup',
    {
      title: 'Set up Cairn UI',
      description:
        'How to install the library in an Angular application: stylesheets in order, the Tailwind source, the fonts, and the import conventions.',
      annotations: READ_ONLY,
    },
    () => text(renderSetup(manifest, origin)),
  );

  server.registerTool(
    'cairn_get_foundation',
    {
      title: 'Get a Cairn UI Foundations page',
      description: `Returns a Foundations page as Markdown: the principles behind colors, motion and typography. One of: ${manifest.foundations.map((page) => page.slug).join(', ')}.`,
      inputSchema: { slug: z.string().describe('The page, e.g. "colors".') },
      annotations: READ_ONLY,
    },
    ({ slug }) => {
      const page = manifest.foundations.find((candidate) => candidate.slug === slug.toLowerCase());

      return page
        ? text(renderFoundation(page))
        : failure(
            `No page "${slug}". The pages are: ${manifest.foundations.map((candidate) => candidate.slug).join(', ')}.`,
          );
    },
  );
}

function registerResources(server: McpServer, manifest: Manifest, origin: string): void {
  server.registerResource(
    'setup',
    'cairn://setup',
    { title: 'Setup', description: 'Installation, stylesheets and conventions.', mimeType: 'text/markdown' },
    (uri) => markdown(uri.href, renderSetup(manifest, origin)),
  );

  server.registerResource(
    'tokens',
    'cairn://tokens',
    { title: 'Design tokens', description: 'Every token of tokens.css.', mimeType: 'text/markdown' },
    (uri) => markdown(uri.href, renderTokens(manifest.tokens)),
  );

  const names = manifest.entries.map((entry) => entry.name);

  server.registerResource(
    'component',
    new ResourceTemplate('cairn://components/{name}', {
      list: () => ({
        resources: manifest.entries.map((entry) => ({
          uri: `cairn://components/${entry.name}`,
          name: entry.name,
          title: entry.importPath,
          mimeType: 'text/markdown',
        })),
      }),
      complete: { name: (value) => names.filter((candidate) => candidate.startsWith(value)) },
    }),
    { title: 'Component', description: 'One entry point of the library.', mimeType: 'text/markdown' },
    (uri, { name }) => {
      const entry = findEntry(manifest, String(name));

      if (!entry) {
        throw new Error(`No entry matches "${String(name)}".`);
      }

      return markdown(uri.href, renderEntry(entry));
    },
  );

  const slugs = manifest.foundations.map((page) => page.slug);

  server.registerResource(
    'foundation',
    new ResourceTemplate('cairn://foundations/{slug}', {
      list: () => ({
        resources: manifest.foundations.map((page) => ({
          uri: `cairn://foundations/${page.slug}`,
          name: page.slug,
          title: page.title,
          mimeType: 'text/markdown',
        })),
      }),
      complete: { slug: (value) => slugs.filter((candidate) => candidate.startsWith(value)) },
    }),
    { title: 'Foundations page', description: 'Colors, motion, typography.', mimeType: 'text/markdown' },
    (uri, { slug }) => {
      const page = manifest.foundations.find((candidate) => candidate.slug === String(slug));

      if (!page) {
        throw new Error(`No Foundations page "${String(slug)}".`);
      }

      return markdown(uri.href, renderFoundation(page));
    },
  );
}
