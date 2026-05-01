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
- `src/styles` - global/feature SCSS

## Local Run
- Install: `npm install`
- Dev server: `npm run dev`
- Build check: `npm run build`
- Lint: `npm run lint`

## Configuration Notes
- Frontend default URL: `http://localhost:5173`
- Backend base URL defaults to `http://localhost:8080`
- Override API base with `.env`:
  - `VITE_API_BASE=http://localhost:8080`

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

