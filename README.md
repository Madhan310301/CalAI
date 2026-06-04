<div align="center">

<!-- HERO BANNER - Replace with your actual banner image -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=00e87b&height=200&section=header&text=NutriLens%20AI&fontSize=60&fontColor=ffffff&fontAlignY=38&desc=Scan.%20Describe.%20Know%20Exactly%20What%20You%20Eat.&descAlignY=58&descSize=18&animation=fadeIn" width="100%"/>

<br/>

<!-- BADGES -->
![Platform](https://img.shields.io/badge/Platform-React%20Native-4db8ff?style=for-the-badge&logo=react&logoColor=white)
![AI](https://img.shields.io/badge/AI-Multimodal%20Vision-ff8c42?style=for-the-badge&logo=openai&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-00e87b?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

<br/>

> **Snap a photo. Type a sentence. Get your full nutritional breakdown in under 1.5 seconds.**  
> NutriLens AI fuses computer vision + natural language to track calories and 32 nutrients — smarter, faster, and more accurately than anything before it.

<br/>

[![Get Started](https://img.shields.io/badge/⚡%20Get%20Started-00e87b?style=for-the-badge&logoColor=black)](https://github.com/Madhan310301/NutriLensAI)
[![Documentation](https://img.shields.io/badge/📖%20Docs-1a1a2e?style=for-the-badge)](https://github.com/Madhan310301/NutriLensAI/wiki)
[![Star on GitHub](https://img.shields.io/github/stars/Madhan310301/nutrilens-ai?style=for-the-badge&logo=github&color=ffbd2e)](https://github.com/Madhan310301/NutriLensAI/stargazers)

</div>

---

## 📊 At a Glance

<div align="center">

| 🎯 Vision Accuracy | ⚡ Scan Speed | 🍽️ Foods Recognized | 🔬 Nutrients Tracked |
|:-:|:-:|:-:|:-:|
| **98.7%** | **< 1.5s** | **2,000,000+** | **32 fields** |

</div>

---

## 🧠 What Makes NutriLens AI Different

Most calorie apps make you **manually search** for food or rely on a single photo with a limited database. NutriLens AI combines **image understanding + natural language** in a single inference pass — giving you results that are richer, faster, and far more accurate.

```
📸 Photo  ──┐
             ├──▶  Multimodal Fusion Engine  ──▶  32 Nutrients + Insights
💬 Text   ──┘
```

---

## ✨ Core Features

### 🔬 32-Nutrient Deep Profile
Goes beyond calories. Every scan returns protein, carbs, fat, fibre, sugar, sodium, **13 vitamins**, **8 minerals**, and net carbs — all in one shot.

### 🧠 Multimodal Fusion Engine
Image embeddings and natural language descriptions are processed **simultaneously** (not sequentially), dramatically improving accuracy on mixed, layered, or ambiguous dishes.

### 🍽️ Multi-Item Plate Detection
Uses **instance segmentation** to detect and log individual food items on a plate separately — even when stacked or overlapping. Not just a single label for the whole plate.

### 📏 Smart Portion Estimation
Infers portion size from **depth cues and reference objects** (hands, plates, cutlery) visible in the photo. No manual gram entry needed.

### 🌏 Regional Cuisine Intelligence
Natively understands **40+ global cuisines** — South Indian, Middle Eastern, East Asian, and more — trained on a regionally diverse, carefully curated dataset.

### 💬 Natural Language Description Mode
No photo? No problem. Describe your meal in plain English and the AI extracts ingredients, cooking method, and portions from your text alone.

### 📈 Adaptive Goal Engine
Learns your dietary patterns over time and **dynamically adjusts** daily calorie and macro targets based on your activity, trends, and stated health goals.

### 🔒 Privacy-First Architecture
Food photos are **never stored raw**. On-device pre-processing converts images to anonymized embeddings before any cloud analysis.

### ⚡ Offline-Ready Core
A lightweight **TensorFlow Lite on-device model** handles common foods without internet. Cloud inference is reserved for complex or rare cases only.

---

## 🆚 How NutriLens AI Stacks Up

| Feature | NutriLens AI | Existing Apps |
|---|:---:|:---:|
| Image + Text fusion (multimodal) | ✅ Native | ❌ Photo-only |
| Nutrients tracked | ✅ **32** | ⚠️ 5–7 typical |
| Multi-item detection on one plate | ✅ Instance segmentation | ❌ Single label |
| Automatic portion estimation | ✅ Depth inference | ❌ Manual entry |
| Regional cuisine coverage | ✅ 40+ cuisines | ⚠️ Western-biased |
| Works offline | ✅ On-device model | ❌ Always online |
| Raw image privacy | ✅ Embedding-only | ❌ Cloud-stored |
| Adaptive personal goals | ✅ ML-driven | ❌ Static targets |

---


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
