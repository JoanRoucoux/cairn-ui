# Changelog

## 0.9.1

### Fixed

- `ui-drawer`, `ui-dialog`: the `<dialog>` element no longer draws the browser's default focus outline when it
  takes focus itself, as it does on a drawer that opens on page load with nothing focused before it. Keyboard focus
  on the controls inside keeps the library ring.

### Added

- `uiRowGroup` (`@joanroucoux/cairn-ui/row`): groups link rows (`ui-row` with `trailing="chevron"`) under a
  hairline, with a 4px lead, as the "Produit structuré" and "Saisir à la main" links under a search list.
- `ui-select-pill`: a `disabled` input. The trigger is `disabled` and `aria-disabled`, nothing opens, the clear cross
  is not drawn (the chevron stays, even when `active`), and the pill is dimmed to 40 % like a disabled button.

## 0.9.0

### Breaking

- `ui-dialog`: the `layout` input (`trade`, `form`, `list`, `confirm`) is replaced by `variant` (`default` |
  `confirm`) and `sheet` (`fit` | `full`). `DIALOG_LAYOUTS` and `DialogLayout` become `DIALOG_VARIANTS`,
  `DIALOG_SHEETS`, `DialogVariant` and `DialogSheet`.
- Migration: `layout="trade"` and `layout="form"` become the default (remove the attribute); `layout="list"` becomes
  `sheet="full"`; `layout="confirm"` becomes `variant="confirm"`. A list dialog was anchored 96px from the top on a
  desktop: it is now centred like every dialog.
- `ui-filter-chips`: `role="group"` and `aria-label` move from the host to an inner wrapper around the chips, so a
  leading element sits outside the group.
- Migration: a selector or a test query on `ui-filter-chips[role=group]` targets the inner `div[role=group]` instead;
  `getByRole('group', { name })` keeps working.
- `styles/motion.css` no longer ships `ui-enter-panel` nor its `cairn-panel-in` keyframes (an 8px slide for a detail
  panel beside a list). The detail now opens in `ui-drawer`, which plays its own motion.
- Migration: replace the side panel animated with `animate.enter="ui-enter-panel"` by a `ui-drawer`; for any other
  element, use `ui-enter-fade-up` or `ui-enter-fade`.
- `ui-toaster`: the message text sits in its own `<span>`, beside the icon, inside the surface.
- Migration: `getByText(message)` now returns that `<span>`, not the surface; a test that checked the surface through
  it (its classes, its position) reads `getByText(message).parentElement` instead.

### Added

- `UiToasts.showError(message, closeLabel = 'Fermer')`: an error toast with the same surface, an alert icon, no timer
  and a 28px cross (a 44px hit area on touch, 36px with a fine pointer); it closes only with the cross. One message
  at a time: an error replaces a confirmation and the other way round. `Toast` becomes a union on `kind`: `'success'`, or `'error'` with its `closeLabel`.
- `ui-drawer` (`@joanroucoux/cairn-ui/drawer`): a modal side panel on the native `<dialog>`, against the right edge at
  full height, 440px wide by default, on `--card` with a shadow on its left edge, 24px of padding and a
  `rgb(0 0 0 / 0.36)` veil. It scrolls on its own with `overscroll-behavior: contain`, without locking the page.
  Escape, the veil and the optional 36px cross close it; `dismissed` and `closed` (`escape`, `backdrop`, `cross`,
  `programmatic`) follow the protocol of `ui-dialog`, and `busy` keeps it open. Without `heading` it draws no header
  and `label` names it; with neither it throws. It enters with opacity and a 24px slide over `--duration-base` on
  `--ease-out` and leaves the reverse way over `--duration-exit`; under reduced motion it only fades. A `ui-dialog`
  opened from it opens over it and the drawer stays underneath: Escape closes the dialog, then the drawer.
- `ModalClose` (`@joanroucoux/cairn-ui/dialog`): the close protocol `ui-dialog` and `ui-drawer` share (Escape,
  press-and-release on the veil, `busy`, `dismissed`, then `closed` once the exit transition has played). An
  optional `opening` callback runs just before `showModal()`.
- `ui-select-pill` (`@joanroucoux/cairn-ui/select-pill`): a compact pill that opens a `ui-menu` of exclusive
  choices, to head a row of filter chips. The projected text is its label and the projected `ui-menu` is what it
  opens, as a sheet on a phone like the `…` menus. Outlined with a chevron at rest, solid primary when `active`,
  where a separate 14px cross (44px hit area on touch, 36px with a fine pointer), named by the required `clearLabel`,
  replaces the chevron and emits `cleared`, and focus goes back to the trigger. `contextLabel` is read before the
  label while active. 34px in a 44px target on touch and 32px with a fine pointer, with a 2px focus outline outside
  the pill at every size, a cross ring in the pill's text colour, and a border of its own in forced colors.
- `button[uiMenuItem]` accepts `checked`: the item becomes a `menuitemradio` with `aria-checked` and a check mark
  after its label, and the menu focuses the checked item when it opens.
- `ui-filter-chips` projects an element marked `uiChipsLeading` first in its row, followed by a 1 x 20px `--border`
  rule that only shows when something is projected.
- `td[ui-group-cell]` is collapsible: `collapsible`, `expanded` (a model), `toggleDisabled` and `controls`. The band
  becomes an `h2 > button[aria-expanded]` with an 18px chevron that turns to -90 degrees in `--duration-fast`, a
  `--soft` hover and a focus ring. With `toggleDisabled` it keeps neither the pointer cursor nor the hover. The page
  owns the fold memory.
- `tbody[uiGroup]` takes `collapsed`: its rows (`tr[uiTr]`) get `hidden` and stay in the DOM, so a `uiFlipList`
  around the table slides nothing when a group folds. A plain `tr` is not hidden.
- `ui-group-header` (`@joanroucoux/cairn-ui/group-header`): the header of a grouped card on a phone, with name, meta
  and a projected total. Collapsible, with a 20px chevron and a press scale (neither the scale nor the pointer cursor
  with `toggleDisabled`), or static.
- `ui-result-group` (`@joanroucoux/cairn-ui/result-group`): one source of a search, a two-tone heading over its rows,
  with a two-row skeleton, a message slot (`resultGroupMessage`) and an inline error whose retry has no icon.
- `ui-alert` `variant="info"`: a `--muted` box with an 18px info icon, `role="note"`.
- `ui-row` `trailing="chevron"`: a flush link row with a 16px `--subtle-foreground` chevron and a dimming hover. Rows
  without it are unchanged.
- `ui-back-link` `size="inline"` and the `button[ui-back-link]` selector: a 14px 500 muted back step, 18px chevron,
  44px high (36px with a mouse). A button host gets `type="button"` unless it sets its own.
- `ui-async` `retryIcon` input (default true): `false` draws a text-only retry in the `inline` variant.
- `ui-line-chart` `deltaSuffix`: a text shown after the change in the tooltip (for example "depuis le début"). It
  stays when the amount is masked.

### Changed

- `ui-dialog` has one three-zone structure: header `16 16 16 24`, body `20 24` (the only scroller), footer `16 24`;
  on a sheet `0 8 12 16`, `16` and `12 16` plus the safe area, under a handle. A hairline runs under the header and
  above the footer when `closeLabel` draws the cross. The `confirm` variant has one 24px padding and no hairlines,
  and an empty confirm footer has no top padding.
- `ui-dialog` is centred on a desktop and capped at `calc(100dvh - 96px)`; the cross icon is 22px in every dialog.
- `ui-dialog` opened while another modal is open (over a `ui-drawer`) draws a lighter `rgb(0 0 0 / 0.24)` veil over
  that one's; alone it keeps `rgb(0 0 0 / 0.36)`. It decides when it opens, with no input.
- `ui-dialog` width: the default stays `lg` (560px) and `confirm` defaults to 440px; `width` still takes `md`, `lg`
  or any CSS length.
- `ui-line-chart` shows its tooltip on a tap: `pointerdown` shows it, `pointermove` follows, `pointerleave` and
  `pointercancel` hide it. The plot is `touch-none` (was `touch-pan-y`), so a vertical swipe on the plot no longer
  scrolls the page; the page still scrolls everywhere else.
- `uiStaleLink` with `chevron`: the gap before the chevron is 4px on touch and 2px with a mouse (was 2px everywhere).
- `ui-toaster` is an inverted surface (`--primary-foreground` on `--primary`, no contour, menu shadow, 44px minimum
  height, 280 to 400px wide within the viewport minus 32px) with a 16px check icon, and it is centred at the bottom of
  the content area: from `64rem`, 24px from the bottom and centred between `--sidebar-width` (0 when the app does not
  set it) and the right edge; below, centred 8px above the tab bar as before. It was `--elevated`, bottom right.
- Stories and docs no longer use the Instruments samples: the `ui-table` `Instruments` story is removed, the
  `ui-empty` sample reads "Aucune ligne ne correspond à ...", the `ui-back-link` small story reads "Comptes". The
  Storybook favicon is the Cairn tile.

### Fixed

- `ui-toaster` shows above an open `ui-dialog` or `ui-drawer`: it is a `popover="manual"` in the top layer, shown
  again each time a message arrives. A modal that opens afterwards does not raise it again: the toast never covers a
  dialog's button. Behind a modal the page is inert, so the pause and the error cross do not work over an open modal.

## 0.8.2

### Changed

- The npm README opens with the Cairn UI banner.

## 0.8.1

### Added

- The npm page now carries a README: what the package is, how to install it, the stylesheets and the `@source`
  line to add, the `fonts.css` setup and the per-folder imports.
- The Storybook is published at https://joanroucoux.github.io/cairn-ui/ on every push to `main`.
- A GitHub Release is created for every `vX.Y.Z` tag, with the matching section of this changelog as its notes.

### Changed

- Stories and specs use fictional data. No component or style changes.

## 0.8.0

### Breaking

- The package root `@joanroucoux/cairn-ui` no longer exports anything. Each component folder is now its own
  entry point, imported as `@joanroucoux/cairn-ui/<folder>`. A consumer's bundler splits chunks per module: a
  single bundle, or a root barrel re-exporting the entries, put every component in the initial chunk. Moving to
  subpaths lets each lazy route pull in only the components it uses.
- Migration: replace `import { UiButton } from '@joanroucoux/cairn-ui'` with
  `import { UiButton } from '@joanroucoux/cairn-ui/button'`. The stylesheets under `@joanroucoux/cairn-ui/styles/*`
  are unchanged.

### Added

- `@joanroucoux/cairn-ui/control` (`UI_CONTROL`, `UiControl`, `UiControlError`) and, from
  `@joanroucoux/cairn-ui/input`, `CONTROL_BASE_CLASSES`, `CONTROL_SIZE_CLASSES` and `CONTROL_SURFACE_CLASSES` are now
  exported, because `select`, `choice-chips` and `field` import them across entry points. Only `UiControlError` was
  public before.

### Subpaths

Every symbol that was exported from the root now lives under exactly one subpath:

- `@joanroucoux/cairn-ui/action-bar`: `UiActionBar`
- `@joanroucoux/cairn-ui/alert`: `ALERT_VARIANTS`, `UiAlert`, `AlertVariant`
- `@joanroucoux/cairn-ui/amount`: `AMOUNT_MASKINGS`, `AMOUNT_NUMERICS`, `UI_AMOUNT_MASKED`, `UiAmount`, `AmountMasking`, `AmountNumeric`, `AmountFormatOptions`, `formatAmount`
- `@joanroucoux/cairn-ui/async`: `ASYNC_ALIGNS`, `ASYNC_STATES`, `ASYNC_VARIANTS`, `UiAsync`, `AsyncAlign`, `AsyncState`, `AsyncVariant`, `delayedState`
- `@joanroucoux/cairn-ui/avatar`: `AVATAR_SIZES`, `UiAvatar`, `UiAvatarLink`, `AvatarSize`
- `@joanroucoux/cairn-ui/back-link`: `BACK_LINK_SIZES`, `UiBackLink`, `BackLinkSize`
- `@joanroucoux/cairn-ui/badge`: `BADGE_SIZES`, `BADGE_VARIANTS`, `UiBadge`, `BadgeSize`, `BadgeVariant`
- `@joanroucoux/cairn-ui/button`: `BUTTON_SIZES`, `BUTTON_VARIANTS`, `UiButton`, `ButtonSize`, `ButtonVariant`
- `@joanroucoux/cairn-ui/card`: `CARD_PADDINGS`, `CARD_SURFACES`, `CARD_VARIANTS`, `UiCard`, `CardPadding`, `CardSurface`, `CardVariant`
- `@joanroucoux/cairn-ui/choice-chips`: `ChoiceChipOption`, `UiChoiceChips`
- `@joanroucoux/cairn-ui/control`: `UiControlError`, `UI_CONTROL`, `UiControl`
- `@joanroucoux/cairn-ui/delta`: `DELTA_EMPHASES`, `DELTA_SIZES`, `DELTA_WEIGHTS`, `UiDelta`, `DeltaEmphasis`, `DeltaSize`, `DeltaWeight`
- `@joanroucoux/cairn-ui/dialog`: `DIALOG_CLOSE_REASONS`, `DIALOG_LAYOUTS`, `DIALOG_WIDTHS`, `UiDialog`, `DialogCloseReason`, `DialogLayout`, `DialogWidth`
- `@joanroucoux/cairn-ui/donut`: `DonutSlice`, `UiDonut`
- `@joanroucoux/cairn-ui/empty`: `UiEmpty`
- `@joanroucoux/cairn-ui/external-link`: `UiExternalLink`
- `@joanroucoux/cairn-ui/fact`: `FACT_SIZES`, `FACT_SUB_TONES`, `UiFact`, `UiFacts`, `FactSize`, `FactSubTone`
- `@joanroucoux/cairn-ui/field`: `UiField`, `UiFieldLeading`, `UiFieldTrailing`
- `@joanroucoux/cairn-ui/filter-chips`: `FilterChipOption`, `UiFilterChips`
- `@joanroucoux/cairn-ui/input`: `CONTROL_SIZES`, `CONTROL_SURFACES`, `UiInput`, `UiTextarea`, `ControlSize`, `ControlSurface`, `CONTROL_BASE_CLASSES`, `CONTROL_SIZE_CLASSES`, `CONTROL_SURFACE_CLASSES`
- `@joanroucoux/cairn-ui/line-chart`: `AxisTicks`, `ChartPoint`, `TooltipSize`, `UiLineChart`
- `@joanroucoux/cairn-ui/menu`: `UiMenu`, `UiMenuItem`, `UiMenuTrigger`
- `@joanroucoux/cairn-ui/meter`: `METER_SIZES`, `METER_TONES`, `UiMeter`, `MeterSize`, `MeterTone`
- `@joanroucoux/cairn-ui/motion`: `UiFlipItem`, `UiFlipList`, `UiHighlight`, `injectReducedMotion`, `holdTransitionsUntilRendered`
- `@joanroucoux/cairn-ui/nav-item`: `UiNavItem`
- `@joanroucoux/cairn-ui/row`: `ROW_GAPS`, `ROW_PADDINGS`, `ROW_SIZES`, `UiListRow`, `UiRow`, `UiRowItem`, `UiRowTile`, `RowGap`, `RowPadding`, `RowSize`
- `@joanroucoux/cairn-ui/segmented`: `SEGMENTED_SIZES`, `UiSegmented`, `SegmentedOption`, `SegmentedSize`
- `@joanroucoux/cairn-ui/select`: `UiSelect`
- `@joanroucoux/cairn-ui/select-pill`: `UiSelectPill`
- `@joanroucoux/cairn-ui/skeleton`: `SKELETON_SHAPES`, `UiSkeleton`, `SkeletonShape`
- `@joanroucoux/cairn-ui/stale-link`: `STALE_LINK_SIZES`, `UiStaleLink`, `StaleLinkSize`
- `@joanroucoux/cairn-ui/stat`: `STAT_SIZES`, `UiStat`, `StatSize`
- `@joanroucoux/cairn-ui/switch`: `UiSwitch`
- `@joanroucoux/cairn-ui/tab-bar`: `UiTab`, `UiTabBar`
- `@joanroucoux/cairn-ui/table`: `CELL_BREAKPOINTS`, `GROUP_SIZES`, `SUB_TONES`, `TABLE_ROWS`, `UiCellSub`, `UiGroup`, `UiGroupCell`, `UiRowAction`, `UiRowLink`, `UiTable`, `UiTd`, `UiTh`, `UiTr`, `CellBreakpoint`, `GroupSize`, `SubTone`, `TableRow`
- `@joanroucoux/cairn-ui/toast`: `UiToaster`, `UiToasts`, `Toast`

## 0.7.2

### Added

- `uiStaleLink` `size` input: `caption` (default, 12/17) or `label` (14/20), both at weight 500, for the dashboard
  total's "1 cours en retard ›". The hit area stays 44px high, 40px with a mouse. `STALE_LINK_SIZES` and
  `StaleLinkSize` are exported.
- `ui-line-chart` `rangeKey` input (`string | null`, default `null`): when bound, a new series interpolates and
  fades "Départ" and the dashed line only if it comes with a new key. A new series under the same key (a reload
  after a buy) is drawn at once, with no fade. The key may change before its series arrives; the interpolation
  runs when the series does. Unbound, every new series interpolates, as before.
- `holdTransitionsUntilRendered()`: called in a constructor, it holds the transitions of the host and of everything
  inside it until two frames after its first render, through `data-ui-settling` and the matching rule of
  `styles/motion.css`. For a consumer element whose bound classes carry a transition.

### Changed

- `ui-button` (and the `ui-async` retry button) no longer fades its opacity when it becomes disabled, busy or
  enabled, and a `ui-segmented` option switches its label colour at once: MOUVEMENT.md animates neither. The press
  scale and the hover fill keep their transitions.
- `uiAvatarLink` draws its current-page halo as a background image, so it appears at once when the route changes;
  the hover glow keeps its 180 ms fade.
- `ui-nav-item` switches its active fill (now a background image) and its text colour at once on navigation, as
  MOUVEMENT.md §4.1 asks of the sidebar; only the hover fill keeps its 180 ms fade, and the press scale stays.
  `ui-tab` already switched at once (scale transition only); a story now checks it.

### Fixed

- Nothing transitions on page open any more. A route's elements are created a tick before their classes are bound,
  and a layout read in between (the router's scroll to the top, a view transition) turned the bound fill, colour
  or switch track into a 180 ms transition. `ui-button`, `ui-async`, `ui-back-link`, `ui-nav-item`, `ui-row`,
  `uiSwitch`, `ui-segmented` and `uiTable` now hold their transitions until rendered. Consumers already import
  `styles/motion.css`, which carries the rule.
- `ui-menu` items stay on one line, left aligned (`whitespace-nowrap`, `text-left`). The menu places itself from
  its layout size instead of its box scaled by the entry animation, and frees its right and bottom edges, so a
  menu opened beside the right edge of a phone no longer narrows and wraps a long label.

## 0.7.1

### Added

- `uiFlipItem`: marks an item of the nearest `uiFlipList` at any depth. Once one item is marked, the list follows
  its marked items instead of its direct children, so a page made of groups slides as one: put `uiFlipList` on the
  element around every group (the `table`, the page column) and `uiFlipItem` on each group heading and row. A
  removal then slides the rows below in the same group and the groups below. An item inside another item (a row
  inside a card) moves by its own share, the card carrying the rest. A destroyed item stays followed until it
  leaves the page (its `animate.leave` fade), and a live item that is briefly out of the list is followed again
  once back.
- `ui-dialog` `busy` input (boolean, default `false`): while an action runs, Escape, a click on the backdrop and
  a drag of the sheet leave the dialog open, the cross is disabled and the dialog carries `aria-busy`. The native
  `cancel` and the Escape `keydown` are prevented, and a close the platform makes without asking reopens the
  dialog. The owner disables its own buttons and still closes it through `open`.
- `ui-tab-bar` publishes its height as `--tab-bar-height` (`calc(52px + env(safe-area-inset-bottom))`) on the
  root element while it is on the page. Use it instead of restating 52px for anything that must clear the bar,
  e.g. `pb-(--tab-bar-height)`.

### Changed

- `uiFlipList` slides only when an item is added or removed. A change inside an item (a row that grows, content
  toggled in a cell) re-measures without sliding, as MOUVEMENT.md asks of layout changes. A list without
  `uiFlipItem` keeps following its direct children, as in 0.7.0.
- `ui-toaster` and `ui-action-bar` sit above `var(--tab-bar-height)`, falling back to the former
  `calc(52px + env(safe-area-inset-bottom))` when no tab bar is on the page.

### Fixed

- `uiFlipList` measures every item from the top of the list itself, no longer from the nearest positioned
  ancestor: a list that moved on the page without resizing (the holdings list when the detail panel lays out)
  slides by the gap only, not from a stale place. Containers no longer need `position: relative` for it; drop
  the `relative` added as a workaround. Positions leave out the translate of any animation running inside the
  list (a slide in progress, an enter fade-up). A move interrupted by the next change restarts from where the
  item is displayed.
- `uiHighlight` and `animate.enter` on the same element both play: the highlight starts on the next frame and,
  while the element or a painted cell still runs a finite animation of its own, once that animation has
  finished, waiting no longer than `--duration-base`. Angular kept the 1400 ms highlight as the longest
  animation and dropped the enter class after one frame. The enter fade no longer needs to sit on an inner
  element.
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
