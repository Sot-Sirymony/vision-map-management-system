# UI Theme & Component Cleanup Plan

Status snapshot as of 2026-07-05. This tracks the frontend's migration from the
original hand-rolled CSS UI to a consistent shadcn/ui (Base UI + Tailwind v4)
design system.

## Already done

- **Foundation**: Tailwind v4 (`@tailwindcss/vite`), `@/*` path alias, shadcn
  CLI initialized on Base UI primitives (not Radix — the CLI's current
  default), `components.json`, `cn()` helper.
- **Primitives installed**: button, input, textarea, select, dialog, badge,
  progress, alert, skeleton, checkbox, label, sidebar, breadcrumb, avatar,
  dropdown-menu, card, chart, table, separator, tooltip, sheet.
- **Component swaps (low/medium risk)**: `Button`, `Input`, `Textarea`,
  `Modal` (→ `Dialog`), `ErrorMessage` (→ `Alert`), `StatusBadge`/
  `PriorityBadge` (→ `Badge`, color-mapping preserved), `ProgressBar` (→
  `Progress`). Checkbox usages on Goals/Steps pages split out from `Input`.
- **App shell rebuilt**: `Sidebar` (icon-collapsible, nav + user menu),
  `Header` (breadcrumb + trigger), `AppLayout` (`SidebarProvider`/
  `SidebarInset`) — affects every page.
- **Dashboard rebuilt**: KPI `Card`s with icons, two `CategoryBreakdownChart`
  bar charts on real backend aggregates, priority tasks as a `Table`.
- **Select migration complete** — all 10 pages (Dreams, VisionAreas,
  DreamDetail, Steps, Reviews, Partners, CommunicationBuilder, TasksBoard,
  Obstacles, Goals) now use composed `Select`/`SelectTrigger`/
  `SelectContent`/`SelectItem`, including a fix for a real Base UI bug
  (`SelectValue` doesn't resolve a label from `SelectItem` children by
  default; fixed via function-as-children `SelectValue`). The legacy native
  `components/common/Select.tsx` wrapper has no remaining consumers.
- **Table migration complete** — all pages that had a raw
  `<table className="data-table">` (Goals, VisionAreas, Partners, Reviews,
  Steps, Obstacles, Communication) now use the shadcn `Table` component,
  bundled in alongside their Select migration since both touched the same
  JSX. TasksBoard uses a kanban layout, not a table, so it was left as-is.
- **Shared enum labels** in `src/utils/enumLabels.ts`: `priorityLabels`,
  `workStatusLabels`, `dreamStatusLabels`, `dreamTypeLabels`,
  `lifecycleStatusLabels`, `partnerStatusLabels`, `partnerSupportTypeLabels`,
  `communicationStatusLabels`, `reviewTypeLabels`, `obstacleTypeLabels`,
  `obstacleStatusLabels` — covers every enum in the app end to end.
- **CSS retirement (incremental)**: removed dead classes as their consuming
  components were swapped (`.button-primary`, `.button-danger`,
  `.icon-button`, `.modal-backdrop`, `.modal-header`, `.textarea`,
  `.app-shell`, `.sidebar`, `.brand`/`.brand-mark`, `.nav-list`, `.app-main`,
  `.topbar`, `.eyebrow`, and their media-query overrides).
- **Typography scale** applied: page titles (`text-2xl font-semibold`),
  section headings (`text-lg font-semibold`), form labels (bold → medium
  500), table headers (dropped uppercase small-caps, `font-weight: 500`),
  metric numbers aligned to `1.5rem`/600.
- **`.panel` divs Card-ified** — every filter bar, bulk-actions bar,
  `CrudModalForm`'s create-panel, and per-page custom panel now renders as a
  shadcn `Card` (or `Card`/`CardContent`/`CardHeader`/`CardTitle` for
  ImportExportPage's titled panels). Caught and fixed a real bug along the
  way: `Card`'s own base classes include `flex flex-col`, and CSS classes
  like `.filter-bar`/`.bulk-actions-bar`/`.filter-banner` set `display:flex`
  without an explicit `flex-direction`, so `flex-col` silently survived and
  broke the layout (items stacked vertically instead of in a row). Fixed by
  adding an explicit `flex-row` Tailwind class alongside each one. The
  now-dead `.panel`/`.table-wrap` CSS rules were removed.
- **Dark mode removed** — deleted the unused `.dark` CSS variable block
  scaffolded by the shadcn CLI (66 hardcoded hex colors in `global.css`
  wouldn't have responded to it anyway, and nothing ever toggled the `.dark`
  class). `@custom-variant dark` was left in place since shadcn primitives
  reference `dark:` utility classes internally; they're just inert now.
- **Loading state** — `Loading.tsx` now renders `Skeleton` placeholder bars
  instead of plain "Loading..." text (the `Skeleton` primitive had been
  installed since Phase 1 but never used). Dead `.muted` CSS rule removed.
- **Small polish pass**: `StepNode`'s "Complex" tag was a raw
  `<span className="badge status-complex">` — `.status-complex` didn't
  even exist as a CSS rule, so it silently fell back to unstyled `.badge`.
  Now uses the `Badge` component (`variant="outline"`). All 12
  `.empty-state` divs replaced with a new shared `EmptyState` component
  (icon + message). Reviewed `Button` variant usage on "Archive" actions —
  kept as `secondary` intentionally: Archive is a reversible soft-delete
  (per the app's soft-delete policy), not a destructive action, so a red
  `destructive` button would misrepresent its severity.

## Remaining work

Nothing planned. All phases (A–F) from this document are complete. Future
polish (e.g. code-splitting the ~900KB JS bundle now that `recharts` is
in it, or reconsidering dark mode as a deliberate feature) can start a new
plan when there's a concrete reason to.
