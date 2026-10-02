# Changelog

## 0.7.0

Motion release: every animation of the Cairn V3 handoff (MOUVEMENT.md), on shared tokens, with a reduced-motion path.

### Upgrade note

Import the new motion stylesheet after `theme.css`:

```css
@import '@joanroucoux/cairn-ui/styles/tokens.css';
@import '@joanroucoux/cairn-ui/styles/theme.css';
@import '@joanroucoux/cairn-ui/styles/motion.css';
```

The skeleton pulse keyframes moved there: without `motion.css`, `ui-skeleton` no longer pulses and the spinners no
longer turn.

### Added

- Motion tokens in `tokens.css`: `--duration-spin`, `--duration-highlight`, `--toast-duration`, with slower or shorter
  values under `prefers-reduced-motion`. `theme.css` sets the default transition curve and duration and adds the
  `animate-cairn-spin` and `animate-cairn-pulse` utilities.
- `styles/motion.css`: the `cairn-spin`, `cairn-pulse`, `cairn-fade-in` and `cairn-fade-out` keyframes, the
  `ui-enter-fade`, `ui-enter-fade-up`, `ui-enter-panel` and `ui-leave-fade` classes for Angular's `animate.enter` and
  `animate.leave`, the root view transition and the theme-switch rule.
- `injectReducedMotion()`: a signal that follows `prefers-reduced-motion` live.
- `delayedState()`: a skeleton appears only after 150 ms and then stays at least 400 ms; `ui-async` uses it.
- `ui-toaster` and the `UiToasts` service: one confirmation message at a time, paused on hover and focus.
- `uiHighlight`: scrolls a changed element into view, holds the `--soft` fill, then fades it back.
- `uiFlipList`: slides the remaining children of a list into place when one is inserted or removed.
- `uiStaleLink`: a caption link in the stale tone, with an optional chevron.
- `ui-empty`: a centred empty state with a title, a hint and an action slot.
- `ui-row`: `busy` (spinner, `aria-busy`, clicks swallowed) and `unavailable` (half opacity, no hover or press,
  `aria-disabled`, clicks swallowed).
- `ui-alert`: `fadeIn` (default on). Turn it off for an alert that is part of the page as it opens, such as an
  error state after a load: it then shows without motion.
- `ui-action-bar` publishes its height as `--action-bar-height` on the root element while it is on the page.
- `ui-dialog`: a `closed` output that fires after the exit with its reason (`DialogCloseReason`), drag down to dismiss
  the sheet, and a plain fade under reduced motion.

### Changed

- Press, hover and focus sweep: rows, tabs, nav items, segmented options, buttons, avatars, back links, the async
  retry, the dialog cross, chips, table rows and legend rows scale on press over `--duration-press` (their transition
  lists name `scale`, the property Tailwind's `scale-*` utilities write) and fill on hover over `--duration-fast`. The
  focus ring never transitions: menu items, the field reveal button and the switch only fade their colours.
- `ui-button` loading spinner is centred over the label, which keeps its width and its accessible name. The projected
  content is now wrapped in a `<span class="contents">`: a consumer selector such as `[ui-button] > svg` or a
  `:first-child` on the button content no longer matches; target `[ui-button] > span > svg` instead.
- `ui-menu` scales in from `--enter-scale` and back on desktop; the sheet fades without sliding under reduced motion.
- `ui-field` errors and `ui-alert` fade in, `ui-alert` fades out.
- `ui-toaster` sits 8px above `ui-action-bar` when one is on the page below 64rem, instead of covering its actions.
- `uiHighlight` honours `scroll-margin-bottom` as well as `scroll-margin-top`: a row under the tab bar or the action
  bar counts as off screen and is scrolled out.
- Under reduced motion the root view transition is off (no cross-fade on a page change, in the app or across
  documents).
- `ui-line-chart` morphs from the drawn shape to the new range over `--duration-base`, never on mount, and fades the
  start label and dashed line around it. A new array with the same values, reduced motion or a `0ms` token shows the
  new series at once.
- `ui-donut` scales the hovered slice and dims the others instead of thickening the stroke; under reduced motion
  it only dims.
