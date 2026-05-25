# Task 0 — Repository Orientation

## Stack
- Frontend: React 19 + TypeScript + Vite 6 + Tailwind CSS 4
- State: Zustand slices in `src/store/slices`
- Backend: Express server in `server.ts`
- Data/Auth: Firebase client + Firebase Admin fallback logic
- Integrations: Gemini (`@google/genai`), Stripe, Plaid
- Tests: Vitest

## Key Entry Points
- `server.ts`: API endpoints, autonomy engine heartbeat, dev/prod serving
- `src/main.tsx`: React bootstrap and top-level ErrorBoundary
- `src/App.tsx`: Router shell, onboarding, plaid token fetch, branding update flow
- `vite.config.ts`: build chunk strategy and alias configuration

## Build & Run
- Dev: `npm run dev`
- Lint/typecheck: `npm run lint`
- Tests: `npm test`
- Build: `npm run build`
- Prod server: `npm run start`
