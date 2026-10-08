# @joanroucoux/cairn-ui-mcp

An [MCP](https://modelcontextprotocol.io) server for [Cairn UI](https://github.com/JoanRoucoux/cairn-ui), the
monochrome, accessible Angular design system. It lets a coding agent look up the components, their inputs and
selectors, when to use each one, the design tokens and the setup, instead of guessing them.

It runs locally over stdio, reads nothing but the library's own manifest, and needs no network access or API key.

## Installation

Claude Code, from the root of the application:

```bash
claude mcp add cairn-ui -- npx -y @joanroucoux/cairn-ui-mcp
```

Any client configured with an `mcpServers` object (Claude Desktop, Cursor...):

```json
{
  "mcpServers": {
    "cairn-ui": {
      "command": "npx",
      "args": ["-y", "@joanroucoux/cairn-ui-mcp"]
    }
  }
}
```

Requires Node 22.22.3 or later.

## Which version it describes

The server answers from `mcp-manifest.json`, a description of the library generated from its sources and published
inside `@joanroucoux/cairn-ui`. It looks for it, in order:

1. at the path given with `--manifest <path>`;
2. in the `@joanroucoux/cairn-ui` installed in the project, found from the working directory the way Node resolves
   packages, so the answers match the version the application builds against;
3. in the snapshot bundled with the server, which describes the library version current when the server was released.

A copy of the library older than the manifest falls back to the snapshot, with a warning on stderr.

## Tools

| Tool                    | Returns                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| `cairn_get_setup`       | Installation, stylesheets in order, the Tailwind source, fonts and import conventions              |
| `cairn_list_components` | Every entry point by Storybook section, with selectors and a summary                               |
| `cairn_get_component`   | When to use it and when not to, accessibility, import, selectors, inputs, outputs, slots, examples |
| `cairn_search`          | The components, tokens and Foundations pages matching keywords                                     |
| `cairn_get_tokens`      | The tokens with light and dark values, media overrides, Tailwind utility and role                  |
| `cairn_get_foundation`  | A Foundations page (overview, colors, motion, typography) as Markdown                              |

`cairn_get_component` accepts any name an agent may have: an entry (`line-chart`), a class (`UiLineChart`), a
selector (`ui-field`, `uiFieldLeading`) or a Docs title (`Line chart`). `cairn_list_components`,
`cairn_get_component` and `cairn_get_tokens` take `format: "json"` for the raw data.

Every tool is read-only.

## Resources

- `cairn://setup` and `cairn://tokens`
- `cairn://components/{name}`, one per entry point
- `cairn://foundations/{slug}`, one per Foundations page

## More

- [Storybook](https://joanroucoux.github.io/cairn-ui/): every component, live
- [Repository](https://github.com/JoanRoucoux/cairn-ui#readme)
- [Changelog](https://github.com/JoanRoucoux/cairn-ui/blob/main/projects/mcp/CHANGELOG.md)

MIT licensed.
