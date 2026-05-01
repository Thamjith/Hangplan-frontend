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

Create `.env` only if your backend API URL differs from default:

```bash
VITE_API_BASE=http://localhost:8080
```

## Other scripts

```bash
npm run build
npm run lint
npm run preview
```

## Real-time Updates & Subscription Model

HangPlan frontend has two update modes:

- Free users (`isPremium = false`) use manual refresh in the event page.
- Premium users (`isPremium = true`) use WebSocket subscriptions for instant updates.

### How it works

- Event page subscribes to `/topic/events/{eventId}` through backend `/ws` when user is premium.
- On real-time messages, the page refetches event details, expenses, and summary.
- Free users do not open a WebSocket connection and use the Refresh button.

### Where logic lives

- User subscription flag in auth store: `src/store/authSlice.ts`
- API and base URL source: `src/store/hangplanApi.ts`
- Conditional real-time/manual refresh behavior: `src/pages/EventPage.tsx`

### Testing free vs premium

1. Login with a free user and open an event page.
2. Confirm updates only appear after clicking Refresh.
3. Login with a premium user and open the same event.
4. Trigger event changes in another session and confirm instant UI updates.
