# HangPlan Frontend

React + Vite app for HangPlan.

## Requirements

- Node.js (LTS)
- npm

## Setup

```bash
npm install
```

## Run in development

```bash
npm run dev
```

The app is served at `http://localhost:5173`.

## Environment

Create `.env` only if your backend API/OAuth URL differs from defaults:

```bash
VITE_API_BASE=http://localhost:8080
VITE_OAUTH_BASE=http://localhost:8080
```

## Other scripts

```bash
npm run build
npm run lint
npm run preview
```

## Real-time updates & subscription model

The event page supports two update modes:

- **Free (`FREE` plan):** WebSocket is **not** opened; use **Refresh** to reload event data, expenses, and summary.
- **Paid (active subscription):** connects to **`/ws`**, subscribes to **`/topic/events/{eventId}`**, and refetches when messages arrive—while **`subscriptionEnd`** from **`GET /auth/me`** is still in the future.

### API shape

Authenticated user payloads include **`subscriptionPlan`** (plan name string, e.g. **`FREE`**, **`PAID_1Y`**) and **`subscriptionEnd`** (ISO timestamp or **`null`** for free/no active window).

### Client helper

Use **`isPaidUser`** from **`src/subscription.ts`** so realtime eligibility matches backend rules (**non-**`**FREE`** plan **and** **`subscriptionEnd` > now**).

### Where logic lives

- Auth user fields: **`src/store/authSlice.ts`**
- API hooks and types: **`src/store/hangplanApi.ts`**
- **`isPaidUser`**: **`src/subscription.ts`**
- WebSocket vs manual refresh: **`src/pages/EventPage.tsx`**

### Testing free vs paid realtime

1. Log in as a **`FREE`** user and open an event; confirm updates appear only after **Refresh**.
2. Grant **`PAID_1Y`** with a future **`subscription_end`** in the database (see backend README), then log in again.
3. Open the same event in two browsers; trigger changes in one and confirm instant updates in the other.
