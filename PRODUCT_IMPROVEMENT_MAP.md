# Family Weekly Budget Product Improvement Map

## Product Positioning

Family Weekly Budget should be treated as a focused household credit-card budget control tool, not a general bookkeeping app.

The strongest product promise is:

> Spend three minutes each week updating the card balance, then know whether the household is still financially on track for the month.

This direction should guide future design choices. The app should prioritize clarity, speed, trust, and repeated weekly use over broad accounting features.

## Primary Users

### Household budget owner

This user checks the family credit card balance, enters weekly numbers, and wants to know whether spending is under control.

Key needs:

- Quickly understand the current month position.
- Enter the latest weekly figures with low mental effort.
- See which spending categories explain changes.
- Avoid mistakes when editing previous weeks.
- Trust that private budget data is hidden after logout.

### Family reviewer

This user may not enter data but wants to understand the household spending situation.

Key needs:

- See simple summaries, not raw accounting logic.
- Understand whether spending is improving or worsening.
- Read the app comfortably in Chinese or English.
- Review historical patterns without learning the data model.

### Advanced maintainer

This user handles data backup, import, category rules, and model-generated data.

Key needs:

- Export and restore data safely.
- Inspect category keys and classification rules.
- Import generated JSON without corrupting existing records.
- Keep deployment and data storage predictable.

## Current Strengths

- The core financial KPIs are visible immediately after login.
- Weekly records are already structured enough to support trend analysis.
- The app has practical import/export and category-rule foundations.
- The visual style feels like a focused internal finance tool rather than a generic template.
- The bilingual foundation is already present.

## Main Friction Points

### 1. Mobile readability

On a phone-sized viewport, the monthly trend chart and weekly records table can overflow horizontally. This makes the app feel less reliable in the exact context where quick budget checks are likely to happen.

### 2. Weekly entry complexity

The weekly entry screen exposes the full calculation model at once. This is efficient for an expert user, but a casual user has to understand too much before knowing what to fill in.

### 3. Overview lacks interpretation

The overview shows important numbers, but it does not yet answer the user's natural question: "Are we okay this month?"

### 4. Language and tone inconsistencies

Chinese mode still contains some English system text and some settings language is more technical than household-friendly.

### 5. Advanced data features are mixed with everyday settings

Backup, import, category keys, and classification hints are valuable, but they make the settings page feel like a developer console. These should be separated from common household settings.

## Improvement Themes

## Theme A: Make The App Usable Anywhere

Goal: The app should be comfortable on mobile, tablet, and desktop.

High-impact changes:

- Fix horizontal overflow from charts and tables.
- Convert dense tables into mobile-friendly record cards at small widths.
- Make charts responsive to container width instead of fixed canvas width.
- Keep primary actions visible without cutting off the header or sidebar.

Success signals:

- No horizontal page scrolling on 390px width.
- Overview KPIs are readable above the fold on mobile.
- A user can review the latest month and open weekly entry without zooming.

Priority: P0

## Theme B: Turn Overview Into A Decision Dashboard

Goal: The overview should explain the household's financial position, not only display records.

High-impact changes:

- Add a clear monthly status summary: on track, watch, or over pace.
- Show remaining budget/credit capacity in plain language.
- Compare the latest period with the previous period.
- Surface the largest category driver for the latest period.
- Add a short "next action" prompt, such as "Update this week" or "Review high grocery spend".

Success signals:

- A user can answer "Are we okay this month?" within 10 seconds.
- The latest period change is obvious without reading the full table.
- Charts support the story instead of being the only interpretation layer.

Priority: P1

## Theme C: Simplify Weekly Entry

Goal: Weekly entry should feel like a short guided routine.

High-impact changes:

- Reframe the form around the user's task: balance, unpaid previous balance, special expenses.
- Put advanced category fields behind a section such as "Detailed categories".
- Add inline calculated explanations near read-only totals.
- Add a save confirmation that says what changed.
- Warn before overwriting an existing period.

Success signals:

- A returning user can complete weekly entry in under three minutes.
- The user understands which fields are calculated and which are editable.
- Accidental edits to older periods become less likely.

Priority: P1

## Theme D: Improve Language, Trust, And Household Tone

Goal: The app should feel understandable to the family, not just to the person who built it.

High-impact changes:

- Complete Chinese and English translation coverage.
- Replace technical labels in everyday screens with household language.
- Move build/version details away from the normal user path.
- Keep advanced category keys visible only in advanced settings.
- Add clearer empty, loading, error, and save states.

Success signals:

- Chinese mode has no unexpected English UI copy in normal flows.
- Settings can be understood without knowing the implementation.
- Errors explain what the user can do next.

Priority: P2

## Theme E: Make Data Import And AI Assistance Safer

Goal: Model-assisted budget updates should be useful without risking data corruption.

High-impact changes:

- Add an import preview before applying JSON.
- Show added, changed, and removed months/weeks before import.
- Validate generated category keys and totals.
- Provide a paste-in transaction classification workflow.
- Keep a local backup snapshot before destructive changes.

Success signals:

- Imported data can be reviewed before it changes the live budget.
- Invalid category keys or suspicious totals are caught early.
- The app supports AI-assisted workflows without making blind writes.

Priority: P2

## Theme F: Strengthen Security And Operational Confidence

Goal: The app should protect private household data and be easy to recover.

High-impact changes:

- Preserve strong logout behavior that clears visible financial data.
- Add optional session timeout.
- Add data backup timestamps.
- Add a simple change history for week edits.
- Separate production secrets, app password handling, and backup data more clearly.

Success signals:

- Private numbers are not visible after logout or session expiry.
- Users can recover from accidental edits or imports.
- Deployment and backup expectations are documented.

Priority: P3

## Suggested Execution Roadmap

## Phase 1: Reliability And Mobile Comfort

Target: Make the current app feel solid in daily use.

Tasks:

- Fix mobile horizontal overflow.
- Make overview tables responsive.
- Make chart canvas sizing container-aware.
- Audit mobile layout for clipped headers and action buttons.
- Add a small regression test for mobile page width.

Expected outcome:

The app becomes comfortable for quick phone checks.

## Phase 2: Weekly Routine Upgrade

Target: Make weekly data entry easier and safer.

Tasks:

- Reorder weekly entry around the user's real workflow.
- Separate essential and detailed category fields.
- Add clearer calculated-field explanations.
- Add save confirmation and edit warnings.
- Improve the "Edit period" interaction.

Expected outcome:

The weekly update becomes a guided habit instead of a dense form.

## Phase 3: Smarter Overview

Target: Turn raw numbers into a clear monthly status.

Tasks:

- Add monthly status indicator.
- Add remaining capacity and spending pace summary.
- Add latest period comparison.
- Highlight largest spending driver.
- Add contextual next action.

Expected outcome:

The first screen answers the user's most important question.

## Phase 4: Language And Settings Cleanup

Target: Make the app feel polished and family-readable.

Tasks:

- Complete i18n coverage.
- Split normal settings from advanced data/category settings.
- Hide or de-emphasize build metadata.
- Rewrite labels and helper text in household-friendly language.
- Add better empty/error states.

Expected outcome:

The app becomes easier to share with family members.

## Phase 5: Data And AI Workflow

Target: Support safer model-assisted updates.

Tasks:

- Add JSON import preview.
- Add validation for imported data.
- Add backup snapshot before import/reset.
- Add transaction paste/classification flow.
- Add category mapping review.

Expected outcome:

The app becomes a practical companion for AI-assisted budget processing.

## Recommended Next Build Step

Start with Phase 1.

The first implementation should be:

1. Fix mobile overflow for charts and tables.
2. Add responsive mobile record cards or a safer table scroll pattern.
3. Add a viewport regression check around 390px width.

This gives immediate user-visible improvement while keeping business logic unchanged.
