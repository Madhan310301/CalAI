# CalAI — Food Calorie Tracker

A CalAI clone that uses Gemini Vision AI to analyze food from photos and calculate calories and macros.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/calai run dev` — run the frontend (port 20976)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `GEMINI_API_KEY` — Google Gemini API key for food analysis

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + wouter + TanStack Query + Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- AI: Google Gemini 1.5 Flash Vision (food analysis)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/food_logs.ts` — food_logs table schema
- `artifacts/api-server/src/lib/gemini.ts` — Gemini Vision AI integration
- `artifacts/api-server/src/routes/analyze.ts` — POST /api/analyze
- `artifacts/api-server/src/routes/logs.ts` — GET/POST/DELETE /api/logs
- `artifacts/api-server/src/routes/summary.ts` — GET /api/summary/today, /weekly
- `artifacts/calai/src/pages/home.tsx` — Dashboard page
- `artifacts/calai/src/pages/scan.tsx` — Food scanning/analysis page
- `artifacts/calai/src/pages/history.tsx` — Food history page

## Architecture decisions

- Gemini 1.5 Flash used for cost efficiency while still getting high-quality food recognition
- Base64 images are sent directly from browser → API → Gemini (no object storage needed for MVP)
- Image thumbnail stored as base64 in the DB for display in food log cards
- Daily calorie goal hardcoded to 2000 kcal (can be made configurable)
- Date filtering uses UTC boundaries for consistency

## Product

- **Home**: Daily calorie ring showing progress toward 2000 kcal goal, macro rings (protein/carbs/fat/fiber), weekly bar chart, today's food log grouped by meal type
- **Scan**: Upload photo or take camera shot, add optional description/quantity, Gemini AI analyzes and returns calories + full macro breakdown, choose meal type, log the meal
- **History**: Browse any past date, view all entries grouped by meal type with daily totals

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run codegen after changing `lib/api-spec/openapi.yaml`
- Gemini analysis prompt is in `artifacts/api-server/src/lib/gemini.ts` — tweak there for accuracy improvements
- imageBase64 stored in DB is the raw base64 string (not data URL) — prepend `data:image/jpeg;base64,` when displaying

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
