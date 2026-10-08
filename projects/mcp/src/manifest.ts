/**
 * Shape of `mcp-manifest.json`, the machine-readable description of `@joanroucoux/cairn-ui` that the
 * MCP server answers from. It is generated from the library's sources at build time and shipped
 * inside the UI package, so a manifest always describes the exact version it was published with.
 *
 * Bump `MANIFEST_SCHEMA_VERSION` on any change a reader of an older version would misread.
 */
export const MANIFEST_SCHEMA_VERSION = 1;

export type Manifest = {
  schemaVersion: typeof MANIFEST_SCHEMA_VERSION;
  package: {
    name: string;
    version: string;
    peerDependencies: Record<string, string>;
  };
  storybookUrl: string;
  /** Markdown of the Setup section of the package README: stylesheets, Tailwind source, fonts. */
  setup: string;
  entries: Entry[];
  tokens: Token[];
  foundations: Foundation[];
};

/** One secondary entry point, that is one folder of `projects/ui`. */
export type Entry = {
  name: string;
  importPath: string;
  declarations: Declaration[];
  services: Service[];
  functions: FunctionExport[];
  constants: ConstantExport[];
  types: TypeExport[];
  docs: DocsPage[];
};

export type Declaration = {
  kind: 'component' | 'directive';
  className: string;
  selector: string;
  exportAs?: string;
  description: string;
  examples: string[];
  inputs: Input[];
  outputs: Output[];
  /** `select` value of each `<ng-content>`, `*` standing for the default slot. */
  slots: string[];
};

export type Input = {
  name: string;
  type: string;
  required: boolean;
  /** Source text of the default value, as written in the component. */
  default?: string;
  /** `true` for a `model()`, which also accepts `[(name)]`. */
  twoWay: boolean;
  description?: string;
};

export type Output = {
  name: string;
  type: string;
  description?: string;
};

/** An `@Injectable` class, with its public members. */
export type Service = {
  className: string;
  providedIn?: string;
  description: string;
  examples: string[];
  members: Member[];
};

export type Member = {
  name: string;
  signature: string;
  description?: string;
};

export type FunctionExport = {
  name: string;
  signature: string;
  description: string;
  examples: string[];
};

export type ConstantExport = {
  name: string;
  type: string;
  /** Members of an `as const` array of literals. */
  values?: (string | number)[];
  description?: string;
};

export type TypeExport = {
  name: string;
  type: string;
  description?: string;
};

/** One Storybook Docs page, read from the meta of a `*.stories.ts` file. */
export type DocsPage = {
  title: string;
  url: string;
  summary: string;
  whenToUse: string;
  whenNotToUse: string;
  accessibility: string;
  args: DocsArg[];
};

export type DocsArg = {
  name: string;
  description: string;
};

export type TokenGroup = 'color' | 'typography' | 'radius' | 'motion' | 'layout' | 'asset';

export type Token = {
  name: string;
  group: TokenGroup;
  /** Set for a scheme-independent value. */
  value?: string;
  /** Set, with `dark`, for a `light-dark()` value. */
  light?: string;
  dark?: string;
  /** Values that replace the default under a media query. */
  overrides: { media: string; value: string }[];
  /** Tailwind utility generated from the token by `theme.css`, if any. */
  utility?: string;
  role?: string;
};

/** One Foundations page, converted from MDX to plain Markdown. */
export type Foundation = {
  slug: string;
  title: string;
  url: string;
  content: string;
};
