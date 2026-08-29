import { type ThemeVars, create } from 'storybook/theming';

/*
 * Storybook's own chrome (sidebar, toolbar, docs pages) is styled by Storybook, not by the token
 * sheet: it never sees `light-dark()`. Restating the tokens here as a ThemeVars is what keeps the
 * chrome and the components it frames from looking like two different products.
 *
 * Values are copied from projects/ui/styles/tokens.css. Change one there, change it here.
 */
const PALETTE = {
  light: {
    background: '#f7f8f8',
    foreground: '#111414',
    card: '#ffffff',
    elevated: '#f1f3f2',
    border: '#e2e5e4',
    mutedForeground: '#5c6462',
    primary: '#161918',
  },
  dark: {
    background: '#0a0b0b',
    foreground: '#edefee',
    card: '#151717',
    elevated: '#101111',
    border: '#242726',
    mutedForeground: '#8e9391',
    primary: '#f2f4f3',
  },
} as const;

const FONT_BASE = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const FONT_CODE = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export const cairnStorybookTheme = (scheme: 'light' | 'dark'): ThemeVars => {
  const palette = PALETTE[scheme];

  return create({
    base: scheme,

    // Monochrome: there is no accent hue to spend on chrome either.
    colorPrimary: palette.primary,
    // Selected sidebar item, drawn as a filled pill: it takes the foreground as its ground, so
    // its label resolves to the opposite end of the ramp.
    colorSecondary: palette.foreground,

    appBg: palette.background,
    appContentBg: palette.card,
    appPreviewBg: palette.background,
    appBorderColor: palette.border,
    appBorderRadius: 8,

    fontBase: FONT_BASE,
    fontCode: FONT_CODE,

    textColor: palette.foreground,
    textInverseColor: palette.background,
    textMutedColor: palette.mutedForeground,

    barBg: palette.card,
    barTextColor: palette.mutedForeground,
    barHoverColor: palette.foreground,
    barSelectedColor: palette.foreground,

    buttonBg: palette.elevated,
    buttonBorder: palette.border,
    booleanBg: palette.elevated,
    booleanSelectedBg: palette.card,

    inputBg: palette.card,
    inputBorder: palette.border,
    inputTextColor: palette.foreground,
    inputBorderRadius: 6,

    brandTitle: 'Cairn UI',
    brandUrl: './',
  });
};
