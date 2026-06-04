# NutriLensAI — Food Calorie Tracker

An AI-powered food calorie tracker that uses **Gemini Vision AI** to analyze food from photos and calculate calories and macros.

## Features

- **📸 Snap & Scan**: Upload a photo or take a camera shot of your meal
- **🤖 AI Analysis**: Gemini AI analyzes food and returns calories + full macro breakdown
- **📊 Dashboard**: Daily calorie ring, macro rings (protein/carbs/fat/fiber), weekly bar chart
- **📅 History**: Browse any past date, view all entries grouped by meal type with daily totals
- **🍽️ Meal Types**: Categorize entries by meal type (breakfast, lunch, dinner, snack)

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + wouter + TanStack Query + Recharts
- **API**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: Google Gemini 2.5 Flash Vision (food analysis)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API Codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle for API server)
- **Package Manager**: pnpm workspaces
- **Runtime**: Node.js 24, TypeScript 5.9

## Prerequisites

- **Node.js** >= 24
- **pnpm** >= 9
- **PostgreSQL** database
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

## Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd NutriLensAI
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set environment variables**:
   ```bash
   # Create a .env file or export these variables
   export DATABASE_URL="postgresql://user:password@localhost:5432/nutrilensai"
   export GEMINI_API_KEY="your-gemini-api-key"
   export PORT=8080          # API server port (default: 8080)
   ```

4. **Push the database schema** (first time only):
   ```bash
   pnpm --filter @workspace/db run push
   ```

5. **Run the app**:
   ```bash
   # Terminal 1 — API server (port 8080)
   pnpm --filter @workspace/api-server run dev

   # Terminal 2 — Frontend (port 5173)
   pnpm --filter @workspace/calai run dev
   ```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm --filter @workspace/api-server run dev` | Run the API server |
| `pnpm --filter @workspace/calai run dev` | Run the frontend |
| `pnpm run typecheck` | Full typecheck across all packages |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks and Zod schemas from OpenAPI spec |
| `pnpm --filter @workspace/db run push` | Push DB schema changes (dev only) |

## Project Structure

```
├── artifacts/
│   ├── api-server/          # Express API server
│   │   └── src/
│   │       ├── lib/gemini.ts        # Gemini Vision AI integration
│   │       ├── routes/analyze.ts    # POST /api/analyze
│   │       ├── routes/logs.ts       # GET/POST/DELETE /api/logs
│   │       └── routes/summary.ts    # GET /api/summary/today, /weekly
│   ├── calai/               # React frontend
│   │   └── src/
│   │       ├── pages/home.tsx       # Dashboard page
│   │       ├── pages/scan.tsx       # Food scanning page
│   │       └── pages/history.tsx    # Food history page
│   └── mockup-sandbox/      # UI prototyping sandbox
├── lib/
│   ├── api-spec/            # OpenAPI contract (source of truth)
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas
│   └── db/                  # Drizzle ORM schema & migrations
└── scripts/                 # Utility scripts
```

## Architecture Decisions

- **Gemini 2.5 Flash** used for cost efficiency while still getting high-quality food recognition
- **Base64 images** are sent directly from browser → API → Gemini (no object storage needed for MVP)
- **Image thumbnail** stored as base64 in the DB for display in food log cards
- **Daily calorie goal** hardcoded to 2000 kcal (can be made configurable)
- **Date filtering** uses UTC boundaries for consistency

## Gotchas

- Always run codegen after changing `lib/api-spec/openapi.yaml`
- Gemini analysis prompt is in `artifacts/api-server/src/lib/gemini.ts` — tweak there for accuracy improvements
- `imageBase64` stored in DB is the raw base64 string (not data URL) — prepend `data:image/jpeg;base64,` when displaying

## License

MIT
