import { type ThemeVars, create } from 'storybook/theming';

// Copied from projects/ui/styles/tokens.css: no test catches a drift, edit both.
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
    mutedForeground: '#989d9b',
    primary: '#f2f4f3',
  },
} as const;

const FONT_BASE = "'Rubik', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";
const FONT_CODE = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export const cairnStorybookTheme = (scheme: 'light' | 'dark'): ThemeVars => {
  const palette = PALETTE[scheme];

  return create({
    base: scheme,

    colorPrimary: palette.primary,
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
