# UX/UI Visual Audit — FR-19.5 Baseline (V2.1)

**Date:** 2026-07-18
**Method:** Static analysis (token grep, typography/spacing census, state and
chart review of every page/component). Screenshot inventory and the FR-18
combination sweep need a running app — listed under "Pending" below.
**Severity scale:** 1 cosmetic · 2 minor · 3 major · 4 blocker.

## Findings (ranked)

| ID | Finding | Sev | Fix → FR |
|---|---|---|---|
| V-01 | **59 hardcoded hex literals outside the token files** (BR-15 baseline; full list in [hex-census.md](hex-census.md)). Most duplicate Fluent tokens that already exist in `theme.ts` (fixable by import), but three groups are foreign colors: the review heatmap ramp uses Tailwind greens (`#86efac #4ade80 #22c55e #15803d`, [DashboardPage.tsx:47](../../frontend/src/pages/DashboardPage.tsx#L47)); the moonshot marker uses Tailwind violet (`#7c3aed`/`#6b21a8`, GoalsPage, GoalNode, DashboardSummary) instead of Fluent purple `#8764b8`; plus stray neutrals (`#e5e5e5`). | 3 | FR-20 |
| V-02 | **Chart/status color contradiction:** the dashboard's partner pipeline chart colors WAITING **orange `#d83b01`** ([DashboardPage.tsx:57-64](../../frontend/src/pages/DashboardPage.tsx#L57-L64)) while the app-wide `statusColors` deliberately moved WAITING to **purple** for colorblind safety (documented in `theme.ts`). The same hue that means "Blocked / needs attention" everywhere else means "Waiting" in this chart. Breaks the one-source-of-truth rule the palette exists for. | 3 | FR-25.3 |
| V-03 | **No typography ramp** — `theme.ts` sets only `fontFamily`. Census: 11 distinct `font-size` values in global.css + 3 in `sx` props + raw `<h1>/<h2>/<h3>` in places + 6 MUI variants in use ≈ **17 combinations** (M-7 baseline; target ≤ 9). | 3 | FR-20.1 |
| V-04 | **EmptyState is generic:** one Inbox icon + text for every context, no action button ([EmptyState.tsx](../../frontend/src/components/common/EmptyState.tsx)) — an empty Goals list looks identical to an empty kanban column. | 2 | FR-20.3, FR-21.2 |
| V-05 | **ErrorMessage is a bare alert** with no retry action ([ErrorMessage.tsx](../../frontend/src/components/common/ErrorMessage.tsx)); a failed page load leaves the user with only a reload. | 2 | FR-20.3 |
| V-06 | **Loading skeleton is one-size-fits-all:** three text lines regardless of surface ([Loading.tsx](../../frontend/src/components/common/Loading.tsx)), so tables/boards/trees re-flow when content lands (M-8: affects all 13 fetching pages). | 2 | FR-20.3 |
| V-07 | **Filter bars outweigh content:** Goals renders 9 filter controls in one card row above the table; filters, title, and rows carry equal visual weight; no summary strip ("12 active · 3 overdue"). | 2 | FR-27.1 |
| V-08 | **Hardcoded light-mode tints in dashboard components** (`#f5f5f5 #dff6dd #fdece3 #fde7e9` in [DashboardCard.tsx](../../frontend/src/components/dashboard/DashboardCard.tsx), AttentionPanel, PartnerDetailPage, first-run card) — these don't flow through the dark-mode theme; verify their dark rendering in the screenshot sweep. | 2 | FR-20 |
| V-09 | **Raw ISO dates** in cards/tables (`Target 2026-07-18`) — no relative phrasing, no locale formatting outside charts. | 1 | FR-27.1 |
| V-10 | **No motion standards:** transitions are MUI defaults; no shared durations/easing; no `prefers-reduced-motion` handling found in app CSS. | 1 | FR-20.4 |
| V-11 | **Dead form stubs** (`components/forms/*` are 5-line placeholders) while real forms are inline per page — a consistency risk for the FR-22.4 form standard. | 1 | FR-22.4 |

## What is already good (keep)

- Fluent 2 token discipline in `theme.ts`/`global.css` is genuinely strong:
  colorblind-validated status/priority palettes, accents with pre-validated
  light/dark ramps, density and text-size settings, documented rationale.
- Status and priority are shown as **text chips**, never color alone
  (the overdue signal is the exception — see hci-audit H-04).
- Board columns show counts and a drop-target highlight; cards have a
  dropdown move control.
- Dashboard has a designed first-run card (single-step; FR-21 extends it).
- The obstacle/partner chart color rationale is documented inline —
  V-02 is a drift bug, not a design failure.

## Census data

- **Hex literals outside token files:** 59 occurrences across 9 files —
  full listing with lines in [hex-census.md](hex-census.md).
- **Type sizes:** global.css `font-size` values: 0.75, 0.8(×2), 0.82(×3),
  0.85(×4), 0.875(×4), 0.88, 0.9(×6), 1.3, 1.5 rem + 14.5px + 17.5px;
  sx: 0.8rem(×2), 0.85rem, 0.875rem(×2); MUI variants in use: caption(13),
  body2(13), subtitle2, overline, h6, h5; raw h1(×2), h2(×2), h3(×1).
- **Font weights in sx:** 500(×10), 600(×9), 700(×4) — plus CSS.

## Runtime results (completed 2026-07-18)

1. **Screenshot inventory** ✅ — 58 captures in [screens/](screens/): all 13
   pages + login in light/dark × comfortable/compact, plus the worst FR-18
   combination (dark + compact + large + orange) on the top 6 pages.
   **Combination sweep: zero layout breakages** — the FR-18 system composes
   correctly.
2. **Dark-mode verification of V-08** ✅ — the hardcoded tints render
   acceptably in dark mode (no broken surfaces), but two spots are confirmed
   illegible/weak: the moonshot summary line (hardcoded `#6b21a8` on dark)
   and several chip tints. Still token drift; still FR-20.
3. **Contrast measurements** ✅ — axe-core found **102 color-contrast nodes**
   across the top-6 pages (worst: Vision Map dark, 51 total nodes). Full
   per-page baseline and ranked rule table: [a11y-baseline.md](a11y-baseline.md).

All findings map to Addendum B FRs; none deferred. Re-run at release close
per FR-19.6.

## FR-20 remediation (2026-07-18)

Shipped with the design-system foundations; verified by `tsc`, the full test
suite (35/35), a production build, and post-change screenshots:

| Finding | Status |
|---|---|
| V-01 hex literals | ✅ **0 remaining** outside `theme.ts`/`global.css` (was 59). Values moved verbatim — the foreign heatmap greens and moonshot violet keep their colors until FR-25/27 recolor them by design. |
| V-03 type ramp | ✅ 6-size ramp in `theme.ts` typography + `--font-*` variables; **M-7: 17 → 6**. Every page's `<h1>` comes from `PageSection`; stat values are no longer fake headings (axe `heading-order`, `page-has-heading-one`). |
| V-04 EmptyState | ✅ Full-size form with icon/headline/description/action added (compact row form unchanged). Contextual adoption per page is FR-21.2. |
| V-05 ErrorMessage | ✅ Retry action wired on all 10 data pages. |
| V-06 Loading | ✅ Shape-matched `table`/`cards`/`tree` skeleton variants wired per page (M-8). |
| V-10 motion | ✅ `--motion-fast/base/slow` + easing tokens (mirrored in MUI transitions) and a global `prefers-reduced-motion` kill switch (BR-19). |
| V-02 chart WAITING color | ⏳ Unchanged by design — relocated to `theme.ts` with the audit note attached; recolor lands with FR-25.3. |
| V-08 dashboard tints | ✅ Moved to `semanticTints` in `theme.ts`; dark-mode legibility fix (moonshot line) remains FR-26.4. |
| Icon sizes | ✅ Normalized to the 14/16/18/24 scale; rules + concept vocabulary in [docs/uxui-icons.md](../uxui-icons.md). |
