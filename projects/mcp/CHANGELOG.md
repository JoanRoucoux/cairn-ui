# Changelog

## 0.1.3

### Changed

- The bundled snapshot describes `@joanroucoux/cairn-ui` 0.14.0 instead of 0.13.0.

## 0.1.2

### Changed

- The bundled snapshot describes `@joanroucoux/cairn-ui` 0.13.0 instead of 0.12.2.

## 0.1.1

### Changed

- The bundled snapshot describes `@joanroucoux/cairn-ui` 0.12.2 instead of 0.10.1.
- `zod` 4.6.7.

## 0.1.0

### Added

- First release: a stdio MCP server describing `@joanroucoux/cairn-ui` from the manifest the library ships.
- Tools `cairn_get_setup`, `cairn_list_components`, `cairn_get_component`, `cairn_search`, `cairn_get_tokens` and
  `cairn_get_foundation`, and resources `cairn://setup`, `cairn://tokens`, `cairn://components/{name}` and
  `cairn://foundations/{slug}`.
- Answers from the manifest of the `@joanroucoux/cairn-ui` installed in the project, else from a bundled snapshot;
  `--manifest <path>` points at another one.
- When the installed library predates the manifest or ships a schema this server does not read, the server falls
  back to its snapshot and says so in its instructions and in `cairn_get_setup`, not only on stderr.
- Inputs declared with `booleanAttribute` are marked "(bare attribute)", as `<button ui-button loading>` sets them.
