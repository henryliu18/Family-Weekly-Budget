# Phase 1 Mobile Comfort Plan

## Goal

Make the existing Family Weekly Budget app reliable and comfortable on small screens without changing the budget calculation model.

## Scope

Phase 1 covers mobile layout stability and responsive data display:

- Prevent horizontal page overflow at 390px viewport width.
- Make both overview charts size from their visible container.
- Present weekly and history records in a mobile-readable format.
- Add a regression test so future changes do not reintroduce page overflow.

## Implementation Plan

### 1. Responsive chart sizing

Problem:

- `#monthlyTrendChart` kept its intrinsic 960px display width.
- Chart drawing logic forced a minimum 720px drawing width, which made the visual and interaction coordinate systems unsuitable for narrow screens.

Plan:

- Apply `width: 100%` and `max-width: 100%` to both chart canvases.
- Size canvas backing pixels from `getBoundingClientRect().width`.
- Use smaller chart margins and gaps below compact widths.
- Keep chart height stable so the overview does not jump during redraw.

### 2. Mobile-friendly record tables

Problem:

- The global table `min-width: 780px` is useful on desktop but too wide on phones.
- Important overview records should not require horizontal reading on mobile.

Plan:

- Keep normal table layout on desktop.
- At mobile width, convert `#weeksTable` and `#historyTable` rows into stacked record cards.
- Add `data-label` values from the same i18n strings used in table headers.
- Leave advanced settings/category tables as scrollable tables for now because they are maintainer-oriented.

### 3. Layout containment

Problem:

- Wide content inside panels can expand the page instead of staying contained.

Plan:

- Add `min-width: 0` to panels.
- Constrain chart wrappers and table scroll containers to `max-width: 100%`.
- Keep overflow local to the relevant content region.

### 4. Regression test

Problem:

- Mobile overflow can return silently when a chart, table, or fixed-width component is added.

Plan:

- Add a Playwright check at `390 x 844`.
- Login, open overview, wait for both canvases and table rows.
- Assert `document.documentElement.scrollWidth <= window.innerWidth + 1`.
- Assert both chart canvases fit inside the viewport.
- Assert the weekly records table uses mobile card layout.

## Acceptance Criteria

- No horizontal page scrolling at 390px viewport width.
- Weekly and monthly charts remain visible and nonblank.
- Overview weekly records are readable as stacked cards on mobile.
- Existing authenticated workflow checks continue to pass.
- No changes to financial calculations or persisted data format.

## Collaboration

Build session `019edfa4-a675-76d1-84f5-1eeda2408daa` is asked to review the Phase 1 scope, risks, and test points while this session implements and validates the work.
