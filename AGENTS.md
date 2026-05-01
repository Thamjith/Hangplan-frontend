# HangPlan Frontend - AI Agent Guide

## Purpose
- React + Vite client for HangPlan.
- Handles auth UX, event creation/details, participation, expenses, and summaries.

## Tech Stack
- React 19
- TypeScript
- Vite
- Redux Toolkit + RTK Query
- React Router
- React Hook Form + Zod
- Sass

## Key Paths
- `src/pages` - route-level screens
- `src/components` - shared UI components
- `src/store/hangplanApi.ts` - API endpoints and RTK Query hooks
- `src/store/authSlice.ts` - auth state
- `src/subscription.ts` - **`isPaidUser`** helper for realtime gating
- `src/styles` - global/feature SCSS

## Local Run
- Install: `npm install`
- Dev server: `npm run dev`
- Build check: `npm run build`
- Lint: `npm run lint`

## Configuration Notes
- Frontend default URL: `http://localhost:5173`
- Backend base URL defaults to `http://localhost:8080`
- OAuth base defaults to backend base unless explicitly set.
- Override API/OAuth base with `.env`:
  - `VITE_API_BASE=http://localhost:8080`
  - `VITE_OAUTH_BASE=http://localhost:8080`

## Subscription Architecture
- Backend **`subscription_plans`** drives **`auth.user.subscriptionPlan`** (plan **name**) and **`auth.user.subscriptionEnd`**.
- Treat missing **`subscriptionPlan`** like **`FREE`** when evaluating **`isPaidUser`**.
- **Do not** reintroduce **`isPremium`** or other legacy booleans—parity with **`User.isActivePaidUser()`** on the server requires **`subscriptionEnd`** for expiry-aware checks.

## Real-time Architecture
- Backend WebSocket endpoint: **`/ws`**
- Topic pattern: **`/topic/events/{eventId}`**
- Paid eligible users (**`isPaidUser(auth.user)`**) subscribe and refetch RTK Query data on messages.
- Others rely on manual refresh only.

## Developer Notes
- **WebSocket is a paid-tier feature** in product terms; gate connection logic with **`isPaidUser`** from **`src/subscription.ts`**.
- Align any new premium checks with backend **`isActivePaidUser()`** semantics (**non-**`**FREE`** **and** **`subscriptionEnd` > now**).
- Do not reintroduce polling (`pollingInterval`) for event detail screens.
- Keep WebSocket connection logic scoped to event UI (or a dedicated hook later).

### Future plans (backend/product)
- Monthly billing, trials, external payment integration—the UI should continue to consume **`subscriptionPlan`** / **`subscriptionEnd`** rather than hard-coded booleans.

## Coding Guidelines for Agents
- Keep data-fetching in RTK Query (`hangplanApi.ts`), not ad-hoc fetch calls.
- Keep components focused and presentational where possible.
- Match existing styling patterns and class names in `src/styles/global.scss`.
- Keep forms typed and validated with Zod + react-hook-form.
- Maintain current endpoint contract names unless user asks to change them.
- Avoid adding new state libraries or architectural patterns without request.

## Verification Before Finishing
- For frontend changes, run:
  - `npm run build`
- Run lint when touching TS/TSX code:
  - `npm run lint`
- If API calls changed, verify matching backend endpoint paths.
