# Changelog

## 0.7.1

### Added

- `uiFlipItem`: marks an item of the nearest `uiFlipList` at any depth. Once one item is marked, the list follows
  its marked items instead of its direct children, so a page made of groups slides as one: put `uiFlipList` on the
  element around every group (the `table`, the page column) and `uiFlipItem` on each group heading and row. A
  removal then slides the rows below in the same group and the groups below. An item inside another item (a row
  inside a card) moves by its own share, the card carrying the rest.

### Changed

- `uiFlipList` slides only when an item is added or removed. A change inside an item (a row that grows, content
  toggled in a cell) re-measures without sliding, as MOUVEMENT.md asks of layout changes. A list without
  `uiFlipItem` keeps following its direct children, as in 0.7.0.

### Fixed

- `uiFlipList` measures every item from the top of the list itself, no longer from the nearest positioned
  ancestor: a list that moved on the page without resizing (the holdings list when the detail panel lays out)
  slides by the gap only, not from a stale place. Containers no longer need `position: relative` for it; drop
  the `relative` added as a workaround. A move interrupted by the next change restarts from where the item is
  displayed.
- `uiHighlight` and `animate.enter` on the same element both play: the highlight starts on the next frame and,
  while the element still runs an animation of its own, once that animation has finished. Angular kept the
  1400 ms highlight as the longest animation and dropped the enter class after one frame. The enter fade no
  longer needs to sit on an inner element.

- `uiStaleLink`: the link keeps its 12/17 caption size but now extends its hit area with a `::before` pseudo-element to 44 px high (40 px with `pointer: fine`), centred on the text, so it meets the touch target of the handoff. Its `::after` chevron is unchanged.

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
