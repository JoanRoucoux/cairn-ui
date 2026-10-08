import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

import { generateManifest } from '../generator/generate.ts';
import { fixtureManifest } from './fixture.ts';
import type { Manifest } from './manifest.ts';
import { createServer } from './server.ts';

let client: Client | undefined;

async function connect(manifest: Manifest = fixtureManifest()): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createServer({ manifest, origin: 'the fixture', warnings: [] }, '9.9.9');

  client = new Client({ name: 'spec', version: '0.0.0' });
  await server.connect(serverTransport);
  await client.connect(clientTransport);

  return client;
}

async function call(name: string, args: Record<string, unknown> = {}): Promise<{ text: string; isError: boolean }> {
  const result = await (client as Client).callTool({ name, arguments: args });
  const [content] = result.content as { type: 'text'; text: string }[];

  return { text: content?.text ?? '', isError: result.isError === true };
}

afterEach(async () => {
  await client?.close();
  client = undefined;
});

describe('createServer', () => {
  it('introduces itself and tells the agent where to start', async () => {
    const connected = await connect();

    expect(connected.getServerVersion()).toMatchObject({ name: 'cairn-ui', version: '9.9.9' });
    expect(connected.getInstructions()).toContain('@scope/ui 1.2.3 is an Angular design system');
    expect(connected.getInstructions()).toContain('Answers come from the fixture.');
  });

  it('exposes six read-only tools', async () => {
    const { tools } = await (await connect()).listTools();

    expect(tools.map((tool) => tool.name)).toEqual([
      'cairn_list_components',
      'cairn_get_component',
      'cairn_search',
      'cairn_get_tokens',
      'cairn_get_setup',
      'cairn_get_foundation',
    ]);

    for (const tool of tools) {
      expect(tool.annotations).toEqual({
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      });
    }
  });
});

describe('cairn_list_components', () => {
  it('lists every entry, or one section, in Markdown or JSON', async () => {
    await connect();

    expect((await call('cairn_list_components')).text).toContain('## Building blocks');
    expect((await call('cairn_list_components', { category: 'inputs' })).text).not.toContain('Building blocks');
    expect(JSON.parse((await call('cairn_list_components', { category: 'Inputs', format: 'json' })).text)).toEqual([
      { name: 'button', importPath: '@scope/ui/button', declarations: ['button[ui-button], a[ui-button]'] },
      { name: 'field', importPath: '@scope/ui/field', declarations: ['ui-field', '[uiFieldLeading]'] },
    ]);
  });

  it('names the sections when asked for one that does not exist', async () => {
    await connect();

    expect(await call('cairn_list_components', { category: 'Charts' })).toEqual({
      text: 'No section "Charts". The sections are: Building blocks, Inputs.',
      isError: true,
    });
  });
});

describe('cairn_get_component', () => {
  it('returns an entry in Markdown or JSON', async () => {
    await connect();

    expect((await call('cairn_get_component', { name: 'ui-field' })).text).toMatch(/^# `@scope\/ui\/field`/);
    expect(JSON.parse((await call('cairn_get_component', { name: 'UiButton', format: 'json' })).text)).toEqual(
      fixtureManifest().entries[0],
    );
  });

  it('suggests close names, or the other tools, for an unknown one', async () => {
    await connect();

    expect(await call('cairn_get_component', { name: 'buton' })).toEqual({
      text: 'No entry matches "buton". Did you mean button? cairn_list_components lists them all, cairn_search searches their descriptions.',
      isError: true,
    });
    expect((await call('cairn_get_component', { name: 'datepicker' })).text).toBe(
      'No entry matches "datepicker". cairn_list_components lists them all, cairn_search searches their descriptions.',
    );
  });

  it('rejects an empty name', async () => {
    await connect();

    expect((await call('cairn_get_component', { name: '' })).isError).toBe(true);
  });
});

describe('cairn_search', () => {
  it('returns the matches, or says there are none', async () => {
    await connect();

    expect((await call('cairn_search', { query: 'gutter' })).text).toContain('| token | `--gutter` | 1rem |');
    expect(await call('cairn_search', { query: 'datepicker', limit: 3 })).toEqual({
      text: 'Nothing matches "datepicker". Try fewer or broader words, or cairn_list_components.',
      isError: true,
    });
  });
});

describe('cairn_get_tokens', () => {
  it('returns every token or one group, in Markdown or JSON', async () => {
    await connect();

    expect((await call('cairn_get_tokens')).text).toContain('## layout');
    expect((await call('cairn_get_tokens', { group: 'color' })).text).not.toContain('## layout');
    expect(JSON.parse((await call('cairn_get_tokens', { group: 'layout', format: 'json' })).text)).toEqual([
      fixtureManifest().tokens[1],
    ]);
    expect((await call('cairn_get_tokens', { group: 'shadow' })).isError).toBe(true);
  });
});

describe('cairn_get_setup and cairn_get_foundation', () => {
  it('returns the setup', async () => {
    await connect();

    expect((await call('cairn_get_setup')).text).toContain('Answering from the fixture.');
  });

  it('returns a Foundations page, or lists them for an unknown slug', async () => {
    await connect();

    expect((await call('cairn_get_foundation', { slug: 'Colors' })).text).toMatch(/^# Colors/);
    expect(await call('cairn_get_foundation', { slug: 'spacing' })).toEqual({
      text: 'No page "spacing". The pages are: colors.',
      isError: true,
    });
  });
});

describe('resources', () => {
  it('lists the fixed resources, one per entry and one per Foundations page', async () => {
    const { resources } = await (await connect()).listResources();

    expect(resources.map((resource) => resource.uri)).toEqual([
      'cairn://setup',
      'cairn://tokens',
      'cairn://components/button',
      'cairn://components/field',
      'cairn://components/toast',
      'cairn://components/control',
      'cairn://foundations/colors',
    ]);
  });

  it('reads each kind of resource as Markdown', async () => {
    const connected = await connect();
    const read = async (uri: string): Promise<string> => {
      const { contents } = await connected.readResource({ uri });

      expect(contents[0]).toMatchObject({ uri, mimeType: 'text/markdown' });

      return (contents[0] as { text: string }).text;
    };

    expect(await read('cairn://setup')).toContain('# Setting up @scope/ui');
    expect(await read('cairn://tokens')).toContain('`--primary`');
    expect(await read('cairn://components/button')).toMatch(/^# `@scope\/ui\/button`/);
    expect(await read('cairn://foundations/colors')).toMatch(/^# Colors/);
  });

  it('refuses an unknown entry or page', async () => {
    const connected = await connect();

    await expect(connected.readResource({ uri: 'cairn://components/datepicker' })).rejects.toThrow(
      'No entry matches "datepicker".',
    );
    await expect(connected.readResource({ uri: 'cairn://foundations/spacing' })).rejects.toThrow(
      'No Foundations page "spacing".',
    );
  });

  it('completes entry names and page slugs', async () => {
    const connected = await connect();
    const complete = async (uri: string, name: string, value: string): Promise<string[]> =>
      (await connected.complete({ ref: { type: 'ref/resource', uri }, argument: { name, value } })).completion.values;

    expect(await complete('cairn://components/{name}', 'name', 'f')).toEqual(['field']);
    expect(await complete('cairn://foundations/{slug}', 'slug', 'c')).toEqual(['colors']);
  });
});

describe('on the real library', () => {
  it('documents every entry point without an error', async () => {
    const uiRoot = fileURLToPath(new URL('../../ui/', import.meta.url));
    const { manifest } = generateManifest({ uiRoot, storybookUrl: 'https://example.test/' });

    await connect(manifest);

    for (const entry of manifest.entries) {
      const result = await call('cairn_get_component', { name: entry.name });

      expect(result.isError).toBe(false);
      expect(result.text).toContain(`# \`${entry.importPath}\``);
    }
  });
});
