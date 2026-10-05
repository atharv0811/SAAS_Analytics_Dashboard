# MetricFlow

A SaaS analytics dashboard for tracking revenue, subscriptions, customers and payments in one place.

MetricFlow is a **personal portfolio project**. The product, the workspace ("Kitewing"), every customer and every transaction are fictional. All data comes from deterministic mock generators. There is no backend.

## Features

- **Dashboard**: KPI cards with period-over-period comparison, a revenue chart with a previous-period overlay, range (7D / 30D / 90D / 12M) and granularity (daily / weekly / monthly) controls, customer analytics with a metric switcher, revenue by plan, and recent customers and transactions.
- **Analytics**: eight KPIs with sparklines, segmenting by plan, CSV export, MRR movements (new / expansion / contraction / churn), MRR, churn, ARPU and conversion trends, an acquisition funnel, and a per-plan performance table.
- **Customers**: search, plan and status filters, sortable columns, pagination, row selection with bulk export and delete, add/edit dialogs (React Hook Form + Zod), a delete confirmation, and a details drawer with profile, subscription, revenue and recent activity.
- **Transactions**: search plus status, payment method, date and amount filters. Also sorting, pagination, a summary that updates with the filters, CSV export, and a details drawer with payment breakdown, timeline, copy-ID and a working refund flow.
- **Settings**: profile (with local avatar preview), workspace, notification, appearance and security panels. Forms are validated and show loading, saved and toast feedback. Also includes password change, 2FA and session sign-out.
- **App shell**: collapsible desktop sidebar (state persisted, applied before first paint), mobile navigation drawer, breadcrumbs, a ⌘K / Ctrl K command palette that searches pages, customers and transactions, notifications, a theme switcher and a user menu.
- **Themes**: separately designed light and dark palettes plus a System option. The preference persists with no flash on load.
- **UX states**: route-level skeleton loaders, empty states for filtered and empty tables, an error boundary with retry, success states and a 404 page.
- **Accessibility**: semantic landmarks and a skip link. Full keyboard support through Radix primitives. Statuses always pair colour with an icon and label, sortable headers expose `aria-sort`, form errors are linked with `aria-describedby`, and every chart includes a screen-reader data table.

## Tech Stack

| Area         | Choice                                                            |
| ------------ | ----------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict) |
| Styling      | Tailwind CSS v4, shadcn/ui (Radix primitives), Lucide icons       |
| Charts       | Recharts 3                                                        |
| Forms        | React Hook Form + Zod 4                                           |
| Client state | Zustand                                                           |
| Tooling      | ESLint (next/core-web-vitals), Prettier + Tailwind class sorting  |

## Architecture

- **Server Components by default.** Pages and the app layout are async Server Components that load data through the service layer. Client Components are used only where interaction needs them: tables, charts, forms and menus. Static sections such as Recent transactions stay on the server.
- **One data boundary.** UI code never imports mock records directly. `src/services` exposes async functions (`getCustomers`, `getTransactions`, …) and simulated mutations with realistic latency. Swapping them for `fetch()` calls to a REST API leaves the components unchanged.
- **Deterministic mock data.** Data is generated from a seeded PRNG relative to a fixed reference date (Oct 5, 2026), so server and client renders match exactly. History is generated backwards from today's totals, and the trailing 90 days are calibrated to the headline numbers ($128,430 revenue, $42,680 MRR, 2,845 customers, 4.86% conversion). The metrics dataset is generated in the browser, which is far smaller as code than as serialised JSON.
- **Pure selectors.** `src/lib/metrics.ts` turns daily metrics into bucketed chart series, KPIs with previous-period comparisons, funnels and plan breakdowns. These are pure functions that are easy to test or move server-side.
- **State where it belongs.** Zustand holds only genuinely shared state:
  - persisted preferences (theme, sidebar)
  - the report period, shared across Dashboard and Analytics
  - the record open in a drawer, which lets the command palette open a customer on another page

  Everything else, including table filters, form state and dialogs, is local React state.

- **Reusable building blocks.** `useDataTable` handles filter, sort and pagination, and is shared by both tables along with `SortableHead`, `FilterSelect` and `TablePagination`. Shared chart primitives (tooltip, legend, axes, accessible data table) sit alongside `KpiCard`, `TrendBadge`, `StatusBadge`, `FormField`, `EmptyState` / `ErrorState` / `SuccessState` and skeletons.

## Getting Started

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # TypeScript, no emit
npm run format     # Prettier
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout, metadata, pre-paint theme script
│   ├── not-found.tsx
│   └── (app)/                # Shared dashboard shell (sidebar + top bar)
│       ├── layout.tsx
│       ├── error.tsx         # Error boundary with retry
│       ├── dashboard/        # page.tsx + loading.tsx per route
│       ├── analytics/
│       ├── customers/
│       ├── transactions/
│       └── settings/
├── components/
│   ├── layout/               # Sidebar, mobile nav, top bar, command palette, menus
│   ├── dashboard/            # KPIs, revenue/customer charts, recent activity
│   ├── analytics/            # Toolbar, MRR movements, funnel, trends, plan table
│   ├── customers/            # Table view, form dialog, details drawer
│   ├── transactions/         # Table view, summary, details drawer
│   ├── settings/             # Settings panels
│   ├── charts/               # Shared chart primitives and controls
│   ├── shared/               # Cross-feature components (states, badges, data table…)
│   └── ui/                   # shadcn/ui primitives
├── data/                     # Deterministic mock data generators
├── hooks/                    # useDataTable, useMetricsDataset, …
├── lib/                      # Formatting, dates, metric selectors, schemas, CSV
├── services/                 # Data access boundary (swap for a real API)
├── store/                    # Zustand stores
└── types/                    # Domain types
```

<!-- ## Screenshots

_Add screenshots here:_

- Dashboard (light)
- Dashboard (dark)
- Analytics
- Customers with details drawer
- Transactions with refund flow
- Settings
- Mobile navigation

## Future Improvements

- Replace `src/services` with a REST or GraphQL client, using route handlers or server actions for writes.
- Add authentication and a multi-workspace switcher.
- Move list filtering, sorting and pagination server-side and mirror table state in URL search params.
- Add a custom date-range calendar alongside the presets.
- Add unit tests for `lib/metrics` and Playwright end-to-end and visual regression tests.
- Add real-time updates for new transactions (Server-Sent Events or WebSockets). -->
