# HCI Audit — FR-19 Experience Baseline (V2.1)

**Date:** 2026-07-18
**Method:** Static analysis of the frontend codebase (every page and shared
component), per FR-19.1 (heuristic evaluation) and FR-19.2 (cognitive
walkthrough). Runtime and human instruments (FR-19.3 first-use test / SUS,
FR-19.4 Lighthouse/axe, screenshots) are **pending** — see "Pending
instruments" at the end.
**Severity scale:** 1 cosmetic · 2 minor · 3 major · 4 blocker.

---

## 1. Corrections to plan assumptions (important)

The HUCI_V1 / UX&UI_V1 plans were written before this audit. Several things
they assumed missing **already exist** — the affected FRs shrink to the gaps
listed here:

| Plan assumption | Reality found in code | Effect on scope |
|---|---|---|
| No keyboard alternative to kanban drag (HUCI P5, FR-26.2) | Every board card has a **status dropdown** next to drag ([StatusBoard.tsx](../frontend/src/components/common/StatusBoard.tsx)); WCAG 2.5.7 is largely met | FR-26.2 reduces to: ARIA live announcement of moves + focus-order check |
| No drop-target highlight / column counts (FR-27.2) | Both exist (`kanban-column--over`, header counts) | FR-27.2 reduces to card anatomy + recessed column background |
| No first-run guidance (HUCI P1, FR-21.1) | Dashboard shows a guided "Start your Vision Map" card when the account has zero areas ([DashboardPage.tsx:214](../frontend/src/pages/DashboardPage.tsx#L214)) | FR-21.1 becomes: extend the single prompt into the 3-step checklist and **chain** it (it currently dead-ends after step 1 — see H-01) |
| No quick-add anywhere but the map's goal level (HUCI B3) | Quick-add exists at **all three** tree levels: goals ([VisionMapTree.tsx](../frontend/src/components/vision-map/VisionMapTree.tsx)), steps ([GoalNode.tsx:59](../frontend/src/components/vision-map/GoalNode.tsx#L59)), tasks ([StepNode.tsx](../frontend/src/components/vision-map/StepNode.tsx)) | FR-22.1 reduces to: quick-add on **list pages** only |
| Open item O-4 (task quick-add vs required fields) | Already answered by precedent: the tree's task quick-add prompts inline for title + owner + due date and defaults priority/status ([StepNode.tsx:25-40](../frontend/src/components/vision-map/StepNode.tsx#L25-L40)) | **O-4 can be closed** — follow the existing inline-prompt pattern |
| Spinners cause layout jump (UX&UI U3) | `Loading` is already a skeleton — but a generic 3-line text skeleton for every surface | FR-20.3 reduces to shape-matched variants (table/cards/tree) |
| No bulk status change (FR-29.4) | Goals list has bulk status + bulk archive ([GoalsPage.tsx:501-528](../frontend/src/pages/GoalsPage.tsx#L501-L528)) | FR-29.4 reduces to extending the pattern to other lists |
| No cross-page create shortcuts | `?create=goal&parent=<id>` auto-opens a pre-filled create modal ([CrudModalForm.tsx](../frontend/src/components/common/CrudModalForm.tsx), [GoalsPage.tsx:102-116](../frontend/src/pages/GoalsPage.tsx#L102-L116)) | Reuse this pattern for FR-21 chaining |

Also present and working: toast live region (`aria-live="polite"`), archive
impact confirmation with cascade counts, restore-with-parent-chain, URL-based
filters throughout.

---

## 2. Heuristic evaluation findings (FR-19.1)

Ranked most severe first. "Heuristic" = Nielsen #.

| ID | Page / component | Heuristic | Finding | Sev | Fix → FR |
|---|---|---|---|---|---|
| H-01 | Dashboard → whole app | 6 Recognition over recall | First-run guidance dead-ends: the "Start your Vision Map" card links to Vision Areas, but after creating an area nothing chains to "now add a dream" — the user is back to 11 sidebar items and must deduce the Area → Dream → Goal → Step → Task order themselves. | 4 | FR-21.1 (3-step chained checklist) |
| H-02 | All list pages | 7 Flexibility & efficiency | No quick-add on list pages, and the create modal closes after each save with no "Add another" — entering 7 steps means 7 full modal cycles ([CrudModalForm.tsx:60-66](../frontend/src/components/common/CrudModalForm.tsx#L60-L66)). | 3 | FR-22.1, FR-22.3 |
| H-03 | Tasks Board create form | 8 Minimalist design | Task form shows **14 fields** on every create (step, title, owner, due date, start date, progress, est./actual hours, priority, status, gap type, blocker reason, next action, description) with no progressive disclosure; only 5 are required. | 3 | FR-22.4 |
| H-04 | Overdue rows/cards | 1 Visibility of status | Overdue is signaled **only by color** (row background tint + red left bar, `row-overdue` / `list-card--overdue` in [global.css:273-283](../frontend/src/styles/global.css#L273-L283)) — no icon or text anywhere says "overdue". Violates the app's own no-color-alone rule and BR-17. | 3 | FR-26.3, FR-27.1 |
| H-05 | Vision Map ([DreamDetailPage.tsx:39-45](../frontend/src/pages/DreamDetailPage.tsx#L39-L45)) | 7 Efficiency (system) | Loads **all** dreams, goals, steps, and tasks of the user (5 unscoped list calls) to show one dream; also auto-selects `dreams[0]` when no id is given. Fine at demo scale, degrades with real data. | 3 | FR-24 (scope the queries while rebuilding the map) |
| H-06 | Goal/Step/Task contexts | 6 Recognition over recall | No breadcrumbs/ancestry: a task row shows its step only as a name in a column; reaching the parent goal or dream requires the filter bar. | 2 | FR-23.1 |
| H-07 | Sidebar | 8 Minimalist design | 11 flat, ungrouped nav items; no Plan/Execute/Support structure to mirror the method. | 2 | FR-23.2 |
| H-08 | All list pages | 7 Flexibility & efficiency | View choices don't persist: board/list toggle, page size, and show-archived reset on every visit (`useState('list')`, [GoalsPage.tsx:95](../frontend/src/pages/GoalsPage.tsx#L95)). URL filters persist only while the URL lives. | 2 | FR-23.3 |
| H-09 | Task completion flow | 1 Visibility of status | Business rule 11 absent from UI: completing the last task of a step produces no suggestion to complete the parent step/goal. | 2 | FR-25.1 |
| H-10 | Dream form | 2 Match with real world | The method's coaching questions are not asked; the dream form is a flat 10-field modal. The fields exist (whyImportant, successDefinition) but nothing guides a vague dream toward clarity. | 2 | FR-21.3 |
| H-11 | Layout ([AppLayout.tsx](../frontend/src/components/layout/AppLayout.tsx), [Sidebar.tsx](../frontend/src/components/layout/Sidebar.tsx), [Header.tsx](../frontend/src/components/layout/Header.tsx)) | Accessibility | No landmark elements: no `<nav>`, `<main>`, or `<header>` in the app shell — screen-reader users get no page structure. | 2 | FR-26.1 |
| H-12 | All modals | Accessibility / 7 | No field autofocus: MUI Dialog focuses the dialog shell, so every create starts with a Tab or click before typing. (Esc-close and focus trap come free from MUI Dialog — verified in [Modal.tsx](../frontend/src/components/common/Modal.tsx).) | 2 | FR-22.3 |
| H-13 | Status board | Accessibility | Card moves (drag or dropdown) are not announced — no `aria-live` region on the board; a screen-reader user gets silence after a move. | 2 | FR-26.2 |
| H-14 | Board/table cards | 4 Consistency | Dates render as raw ISO (`Target 2026-07-18`); no relative phrasing ("in 3 days", "5 days overdue"). | 1 | FR-27.1 |
| H-15 | [components/forms/*](../frontend/src/components/forms/) | Maintainability | The seven form components are 5-line dead stubs; real forms live inline in each page (~100 lines each). Harmless to users, but any FR-22 form standard must be applied in the pages, and the stubs should be deleted or become the real forms. | 1 | FR-22.4 |
| H-16 | Archive actions | 3 User control | No undo-from-toast; archive uses confirm-dialog + restore via "Show archived". Acceptable (restore exists) but heavier than undo for a reversible action. | 1 | FR-29.3 |

---

## 3. Cognitive walkthrough (FR-19.2) — M-2 baseline

Scenario (CLAUDE.md ideal flow): new account → 1 Vision Area → 1 Dream →
4 Goals → 7 Steps under one goal → 5 Tasks under one step. Counted from
code paths; confirm against the runtime test when FR-19.3 runs.

**Route A — sidebar list pages** (the path the UI steers a new user toward):

| Stage | Interactions (clicks + field entries) | Notes |
|---|---|---|
| Vision Area | ~6 (nav, create, 1 required + 3 optional fields, submit) | 4-field form |
| Dream | ~13 (nav, create, 10-field form, submit) | area preselect, title, type, priority, dates, why, success, description |
| 4 Goals | ~20 (nav + 4 × [create, select dream, title, submit]) | modal closes after each save (H-02) |
| 7 Steps | ~31 (nav + 7 × [create, select goal, title, submit]) | 8-field form shown each time |
| 5 Tasks | ~41 (nav + 5 × [create, select step, title, owner, due date, submit]) | 14-field form shown each time (H-03) |
| **Total** | **≈ 111 interactions, 5 page changes** | |

**Route B — Vision Map quick-add** (exists today, but nothing routes a new
user to it):

| Stage | Interactions | Notes |
|---|---|---|
| Area + Dream | ~19 (as Route A) | map needs a dream to exist first |
| Open map | ~2 | via Dreams row action |
| 4 Goals | 8 (4 × [title, Add]) | quick-add |
| 7 Steps | 14 | quick-add per goal node |
| 5 Tasks | 20 (5 × [title, owner, date, Add]) | inline required-field prompt |
| **Total** | **≈ 63 interactions, 3 page changes** | ~45 % cheaper than Route A |

**Baseline for M-2:** 111 interactions (Route A). The −40 % target (≈ 66)
is already nearly met by Route B — so the cheapest big win is **routing users
to the map** (FR-21 chaining + FR-24 map-first), then list-page quick-add
(FR-22.1).

---

## 4. Baseline metrics status

| # | Metric | Baseline | Status |
|---|---|---|---|
| M-1 | Empty account → first Dream tree | — | ⏳ Pending FR-19.3 (needs test users) |
| M-2 | Clicks for 1 goal + 3 steps + 5 tasks | Route A ≈ 87 of the 111 above; Route B ≈ 42 | ✅ Static count (confirm at runtime) |
| M-3 | SUS score | — | ⏳ Pending FR-19.3 |
| M-4 | Accessibility, top 6 pages | 3–6 violation types / 15–51 nodes per page (axe-core, WCAG A+AA); login page clean. Details: [uxui-audit/a11y-baseline.md](uxui-audit/a11y-baseline.md) | ✅ Measured 2026-07-18 |
| M-5 | Board keyboard-operable | **Mostly yes already** (status dropdown); gap = move announcement + landmark/focus order | ✅ Static, better than assumed |
| M-6 | 3-second primary-action test | — | ⏳ Pending (with FR-19.3 participants) |
| M-7 | Distinct type combinations | ~17 → **6** after FR-20.1 (type ramp shipped 2026-07-18; target ≤ 9 met) | ✅ Baseline + remediated |
| M-8 | Pages with load layout jump | 13 of 13 used a generic 3-line skeleton → shape-matched table/cards/tree skeletons shipped with FR-20.3 (2026-07-18); confirm visually in Phase E | ✅ Baseline + remediated |

---

## 5. Pending instruments (to complete FR-19)

1. **FR-19.3 First-use test + SUS (M-1, M-3, M-6):** 3–5 participants who
   have never seen the app; task script = the Section 3 scenario; think-aloud
   + screen recording; SUS questionnaire after. *(Open item O-7: schedule
   participants.)*
2. ~~FR-19.4 Runtime accessibility audit (M-4)~~ — ✅ done 2026-07-18 with
   axe-core via Playwright: 8 violation types, dominated by color-contrast
   (102 nodes) and missing landmarks (156 nodes); full baseline in
   [uxui-audit/a11y-baseline.md](uxui-audit/a11y-baseline.md). Remaining
   manual piece: a human keyboard-only pass to confirm focus order/visibility
   (fold into FR-19.3's session).
3. ~~FR-19.5 screenshots~~ — ✅ done 2026-07-18: 58 captures in
   `docs/uxui-audit/screens/` (all pages × light/dark × comfortable/compact,
   plus the worst FR-18 combination on the top 6). Combination sweep found
   **zero layout breakages**.

Every finding above is mapped to an Addendum B FR; none deferred. Re-run all
instruments at release close per FR-19.6.
