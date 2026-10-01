# CodeAssess — Developer Assessment Platform (Frontend)

Next.js 15 (App Router) frontend for the **Developer Assessment & Coding Platform** (B7A7, assignment #4). Companies build coding / MCQ / written assessments, invite candidates to timed attempts and grade them; candidates take the tests and see their results; admins govern users, plans and the audit trail.

It consumes the B7A6 REST API: [`developer-assessment-backend`](https://github.com/GeorgeBlaize/developer-assessment-backend).

| | |
|---|---|
| **Live frontend** | _add your Vercel URL_ |
| **Live API** | https://developer-assessment-backend.vercel.app |
| **API docs** | https://documenter.getpostman.com/view/55118777/2sBYAxP9DY |

## Demo accounts (one-click buttons on `/login`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@codeassess.dev` | `Admin@12345` |
| Company | `company@demo.dev` | `Company@12345` |
| Candidate | `candidate@demo.dev` | `Candidate@12345` |

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 App Router, React 19, TypeScript (strict, no `any`) |
| UI | Tailwind CSS v4, shadcn/ui (Radix primitives), lucide-react, next-themes (dark mode) |
| Server state | TanStack Query v5 (server prefetch + `HydrationBoundary`, optimistic updates) |
| Client state | Zustand (auth user, persisted sidebar, assessment-wizard draft, exam answer drafts) |
| Forms | React Hook Form + Zod (schemas mirror the backend's Zod rules) |
| Charts | Recharts (lazy-loaded) |
| Code editor | CodeMirror 6 (lazy-loaded) |
| Payments | SSLCommerz sandbox (via the API) |
| Toasts | Sonner |

## Architecture

```
Browser ──► Next.js (Vercel)
             ├─ middleware.ts            route guard: session + role per URL prefix, silent token refresh
             ├─ Server Components        fetch the API directly with the httpOnly cookie token
             ├─ /api/auth/*              login / register / google / refresh / logout → set or clear httpOnly cookies
             ├─ /api/proxy/[...path]     BFF proxy for client-side TanStack Query calls (adds Bearer token)
             └─ /api/payments/[outcome]  SSLCommerz browser callbacks → API validation → result page
                        │
                        ▼
             Express API (B7A6) ── PostgreSQL
```

### Authentication & authorization
- Access and refresh tokens never reach browser JavaScript: route handlers store them in **httpOnly, SameSite=Lax cookies**.
- `src/middleware.ts` protects `/admin`, `/company`, `/candidate`, `/attempt` and `/payment`. It sends anonymous users to `/login?next=…` and redirects a user in another role to their own dashboard with a toast. It also rotates an expired access token using the refresh token, and forwards the new pair to the Server Components rendering the same request.
- If `JWT_ACCESS_SECRET` is set, middleware verifies the token signature with `jose`; otherwise it only decodes the claims for routing. The API still verifies every request.
- Client calls go through `/api/proxy`. When the session has expired, the proxy returns `SESSION_EXPIRED` and the client runs a single-flight refresh, then retries. It refreshes once even if many queries fail at the same time, because the backend rotates refresh tokens.
- Role-based UI: each role has its own navigation (`src/lib/navigation.ts`), dashboard and actions.

### Server vs Client Components
- **Server by default**: layouts, every page shell, marketing pages, the admin overview (aggregates audit logs into chart data on the server), the candidate results list (zero client JS) and the payment result pages.
- **Client only where needed**: forms, tables with URL-synced filters, optimistic toggles, the exam workspace, charts and the code editor.
- List pages **prefetch on the server** and hydrate the TanStack cache (`src/lib/api/prefetch.ts`), so they render populated without a second request; pagination and filters then fetch on the client.
- `React.cache()` dedupes per-request fetches between a layout, `generateMetadata` and its pages (e.g. the assessment workspace).
- Public pages are statically generated; plans use **ISR** (`revalidate: 600`, tag `plans`). An admin plan edit calls a **Server Action** that runs `revalidateTag("plans")`.

### App Router features used
Route groups `(public)`, `(auth)`, `(dashboard)`, `(list)`; nested layouts (assessment workspace tabs); `loading.tsx` skeletons for every data page; `error.tsx` at root, dashboard and exam level; `global-error.tsx`; custom `not-found.tsx`; `generateMetadata`; route handlers; Server Actions; middleware.

### Performance
`next/image` with AVIF/WebP for all imagery; `next/dynamic` code-splitting for Recharts, CodeMirror, the Google SDK and React Query Devtools; `optimizePackageImports` for icon, chart and date libraries; URL state uses the History API, so filtering doesn't re-render the server tree.

### Hydration-safe dates
Dates are formatted in one fixed time zone (`NEXT_PUBLIC_TIME_ZONE`, default `Asia/Dhaka`), using only numeric `Intl` parts, so the server (UTC on Vercel) and every browser render identical text. Relative times ("5 minutes ago") switch on after mount via `<RelativeTime>`.

## Pages (30+)

| Area | Routes |
|---|---|
| Public | `/`, `/features`, `/pricing` (+ FAQ), `/about`, `/contact` |
| Auth | `/login` (one-click demo for 3 roles), `/register` |
| Admin | `/admin` (charts), `/admin/users`, `/admin/users/[id]`, `/admin/plans`, `/admin/audit-logs`, `/admin/profile` |
| Company | `/company`, `/company/assessments`, `/company/assessments/new` (3-step wizard), `/company/assessments/[id]` (+ `/candidates`, `/results`, `/grading`), `/company/billing`, `/company/profile` |
| Candidate | `/candidate`, `/candidate/invitations`, `/attempt/[id]` (timed exam), `/candidate/results`, `/candidate/results/[id]`, `/candidate/profile` |
| Payment | `/payment/success`, `/payment/fail`, `/payment/cancel` |
| Utility | custom 404, error boundaries |

## Getting started

```bash
cp .env.example .env.local   # defaults point at the live API
npm install
npm run dev                  # http://localhost:3000
```

| Variable | Required | Purpose |
|---|---|---|
| `API_URL` | yes | Backend base URL incl. `/api/v1` (server-side only) |
| `NEXT_PUBLIC_SITE_URL` | recommended | Public URL of this app (metadata / Open Graph) |
| `JWT_ACCESS_SECRET` | optional | Same as the backend's; enables signature verification in middleware |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | optional | Shows "Sign in with Google" (same client ID as the backend) |
| `NEXT_PUBLIC_TIME_ZONE` | optional | Display time zone, default `Asia/Dhaka` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | optional | Address used by the contact form |

Scripts: `npm run dev`, `npm run build`, `npm start`, `npm run lint`.

## Deployment (Vercel)

1. Push this folder to its own GitHub repository and import it in Vercel (framework: Next.js).
2. Add the environment variables above (at least `API_URL` and `NEXT_PUBLIC_SITE_URL`).
3. **Point SSLCommerz back at the frontend.** In the backend's Vercel environment, set the following, then redeploy the backend:
   ```
   SSLCZ_SUCCESS_URL=https://<frontend-domain>/api/payments/success
   SSLCZ_FAIL_URL=https://<frontend-domain>/api/payments/fail
   SSLCZ_CANCEL_URL=https://<frontend-domain>/api/payments/cancel
   ```
   Keep `SSLCZ_IPN_URL` on the backend. The frontend handlers forward each callback to the API, which validates the transaction with SSLCommerz before the user lands on `/payment/success`.
4. If you enable Google sign-in, add the frontend domain to **Authorized JavaScript origins** for the OAuth client in Google Cloud Console.

### Testing a payment
Log in as **Company**, open **Billing & plans**, and choose Basic or Pro. On the SSLCommerz sandbox page, pay with a test card or the mobile-banking option (OTP shown on the sandbox page). You return to `/payment/success`, and the plan and payment history update.
