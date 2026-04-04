# CargoRadar — CLAUDE.md

> Read this file at the start of EVERY session. It is the source of truth for this project.

---

## Product Overview

**CargoRadar** is an AI-powered ocean freight intelligence platform. It delivers real-time news, risk scores, and disruption alerts by trade lane and geographic hot zone, via an interactive world map and personalized email alerts.

**Tagline:** Know before it hits your shipment.

**Users:** Freight forwarders, brokers, import/export businesses, supply chain managers.

**MVP Scope:**
- Ocean freight only
- English language only
- Web platform + email alerts

---

## Core Features (MVP)

1. **Interactive Map** — Mapbox-powered world map with clickable trade lanes and hot zones
2. **Hot Zones** — 10 geographic risk areas with live risk scores (1–10)
3. **Trade Lanes** — Major ocean routes users can subscribe to
4. **AI News Feed** — Per zone/lane: summarized news + impact assessment
5. **Risk Scores** — Daily updated severity number per zone
6. **User Preferences** — Select zones/lanes to follow
7. **Email Alerts** — Instant alerts + weekly digest via Resend
8. **Search** — Find any port, lane, or zone quickly
9. **Waitlist Page** — Pre-launch email capture with value proposition

---

## Hot Zones (MVP — 10 zones)

| Zone | Coordinates (approx) |
|---|---|
| Red Sea / Bab-el-Mandeb | 12.5°N, 43.3°E |
| Strait of Hormuz | 26.6°N, 56.3°E |
| Panama Canal | 9.1°N, 79.7°W |
| Suez Canal | 30.5°N, 32.3°E |
| Strait of Malacca | 2.5°N, 101.2°E |
| Taiwan Strait | 24.5°N, 119.5°E |
| Black Sea | 43.0°N, 34.0°E |
| Port of Rotterdam | 51.9°N, 4.1°E |
| Port of Shanghai | 31.2°N, 121.5°E |
| Port of LA / Long Beach | 33.7°N, 118.2°W |

---

## Trade Lanes (MVP)

- Far East → North Europe (Westbound)
- Far East → North America West Coast (Transpacific Eastbound)
- North America East Coast → Europe (Transatlantic)
- Middle East → Europe
- Middle East → Asia
- Intra-Asia
- South America → North America / Europe

---

## Design System

**Read DESIGN.md before any UI work.** Summary:
- White background (`#FFFFFF`), black text (`#0A0A0A`) — always
- Fonts: `Space Grotesk` (headings/display), `IBM Plex Sans` (body), `IBM Plex Mono` (data/labels)
- Risk colors only for semantic meaning: Critical `#D4291A`, High `#C97A1A`, Medium `#B5901A`, Low `#2E7D45`
- No gradients, no shadows, no glassmorphism, no neon, no rounded pills
- Borders: `1px solid #E2E2DC` — thin and precise
- Buttons: black fill / white text, zero border-radius
- Cards: `#F7F7F5` surface, `1px solid #E2E2DC` border, `4px` radius max
- Reference aesthetic: Bloomberg Terminal meets Swiss newspaper

---

## Design System — Follow This Exactly

### Philosophy
Minimal, industrial precision. The map is the hero — everything else gets out of its way.
No dark themes, no neon, no purple gradients. White is the canvas. Data is the decoration.

### Colors
```css
:root {
  --white:   #ffffff;   /* page background */
  --off:     #f7f6f4;   /* panel backgrounds, hover states */
  --ink:     #0d0d0d;   /* primary text, borders, buttons */
  --ink-2:   #1a1a1a;   /* button hover */
  --muted:   #6e6e6e;   /* secondary text, labels */
  --rule:    #d8d8d4;   /* all dividers and borders */
  --red:     #c0392b;   /* CRITICAL risk, alerts, logo pip only */
  --amber:   #b8680a;   /* HIGH / MEDIUM risk */
  --green:   #1a6b3a;   /* LOW risk */
}
```
Rule: red is used ONLY for risk data and the logo pip. Never for decoration.

### Typography
- **Display / headings / data / UI labels:** `Geist Mono` (Google Fonts) — techy, robotic, precise
- **Body / descriptions:** `Instrument Sans` (Google Fonts) — refined, readable, uncommon
- Never use: Inter, Roboto, Arial, Space Grotesk, or any system font

```css
font-family: 'Geist Mono', monospace;    /* headings, labels, badges, nav, buttons */
font-family: 'Instrument Sans', sans-serif;  /* body copy, descriptions only */
```

### Sizing & Spacing
- Base unit: 4px
- Section padding: 100px vertical / 48px horizontal (20px mobile)
- Nav height: 56px fixed
- Ticker height: 32px fixed (black bar, white mono text)
- All borders: 1px solid var(--rule) — no border-radius except badges (2px)
- Badges: 2px border-radius only

### Layout Principles
- Grid-based, structured, no diagonal flows
- Generous negative space — don't fill every pixel
- Rules (1px lines) to separate sections, never cards with shadows
- Tables and grids preferred over card arrays

### Component Patterns
**Buttons:** Black fill, white text, Geist Mono, UPPERCASE, 0.12em letter-spacing. No border-radius.
**Inputs:** Transparent bg, black border (1px), Geist Mono 13px. Joined to button as one unit.
**Badges (risk):** Colored background-dim + colored text. 2px radius. Mono 10px uppercase.
**Sections:** Always opened with a row: `[LABEL ——————————————]` (label + flex rule line)
**Hover states:** Background shifts to var(--off) only. No transforms, no shadows.
**Animations:** Fade-up on load (opacity + translateY 16px, 0.7s ease). Nothing else except ticker scroll.

### What to Never Do
- No dark mode / dark backgrounds (except the nav ticker and bottom CTA section)
- No gradients on UI elements
- No box shadows
- No border-radius above 2px
- No emojis in UI (use text badges instead)
- No purple, blue, or teal accents
- No Inter, Space Grotesk, or similar overused fonts
- No card-grid layouts with rounded corners and shadows

### Map Styling (Mapbox)
- Base style: `mapbox://styles/mapbox/light-v11` (clean, minimal, matches white UI)
- Hot zone circles: stroke only (1px var(--red/amber/green)), fill at 8% opacity
- Trade lanes: 1.5px solid lines, colored by risk level
- Zone labels: Geist Mono 11px uppercase
- No satellite, no terrain — pure vector light map

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | React-based, handles frontend + API routes |
| Map | Mapbox GL JS | Interactive map, trade lane polylines, zone circles |
| Database | Supabase (PostgreSQL) | Auth, data storage, real-time subscriptions |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) | News summarization, impact scoring |
| Email | Resend | Transactional emails + weekly digest |
| Styling | Tailwind CSS | Utility-first, fast to build |
| Hosting | Vercel | Auto-deploy from GitHub |
| News ingestion | Manual (MVP) → RSS/scraping later | Start with curated manual input |

---

## Database Schema

### `zones`
```sql
id uuid PRIMARY KEY
name text NOT NULL              -- "Red Sea"
type text                       -- 'hotzone' | 'tradelane'
coordinates jsonb               -- GeoJSON for Mapbox
risk_score numeric(3,1)         -- 1.0 to 10.0
risk_level text                 -- 'low' | 'medium' | 'high' | 'critical'
description text
updated_at timestamptz
```

### `news_items`
```sql
id uuid PRIMARY KEY
zone_id uuid REFERENCES zones(id)
headline text NOT NULL
source_url text
source_name text
published_at timestamptz
raw_content text
ai_summary text                 -- Claude-generated summary
ai_impact text                  -- Claude-generated impact assessment
ai_severity integer             -- 1-10 score from Claude
created_at timestamptz
```

### `users`
```sql
id uuid PRIMARY KEY             -- Supabase Auth user id
email text NOT NULL
company_name text
role text                       -- 'forwarder' | 'importer' | 'supply_chain' | 'other'
alert_frequency text            -- 'instant' | 'daily' | 'weekly'
created_at timestamptz
```

### `user_subscriptions`
```sql
id uuid PRIMARY KEY
user_id uuid REFERENCES users(id)
zone_id uuid REFERENCES zones(id)
created_at timestamptz
```

### `waitlist`
```sql
id uuid PRIMARY KEY
email text NOT NULL UNIQUE
company_name text
role text
created_at timestamptz
```

---

## Project File Structure

```
cargoradar/
├── app/
│   ├── page.tsx                  # Landing / waitlist page
│   ├── map/
│   │   └── page.tsx              # Main map dashboard
│   ├── zone/
│   │   └── [id]/page.tsx         # Zone detail page
│   ├── settings/
│   │   └── page.tsx              # User preferences / subscriptions
│   ├── api/
│   │   ├── news/route.ts         # News CRUD + AI processing
│   │   ├── zones/route.ts        # Zone data
│   │   ├── alerts/route.ts       # Trigger email alerts
│   │   └── waitlist/route.ts     # Waitlist signup
├── components/
│   ├── Map/
│   │   ├── MapView.tsx           # Main Mapbox component
│   │   ├── HotZone.tsx           # Zone circle overlay
│   │   └── TradeLane.tsx         # Lane polyline overlay
│   ├── News/
│   │   ├── NewsFeed.tsx          # News list for a zone
│   │   └── NewsCard.tsx          # Individual news item
│   ├── RiskScore.tsx             # Risk badge component
│   ├── ZonePanel.tsx             # Slide-in panel when zone clicked
│   └── EmailAlert.tsx            # Alert preference UI
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── claude.ts                 # Anthropic API wrapper
│   ├── resend.ts                 # Email sending functions
│   └── mapdata.ts                # Static zone/lane coordinates
├── types/
│   └── index.ts                  # TypeScript types
└── .env.local                    # API keys (never commit)
```

---

## Environment Variables

```
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
```

---

## AI Processing Logic

When a news item is added, call Claude API with this prompt pattern:

```
You are a freight intelligence analyst. Analyze this news item for ocean freight professionals.

News: [raw_content]
Zone: [zone_name]

Respond in JSON:
{
  "summary": "2-3 sentence plain English summary",
  "impact": "What this means for shippers and forwarders on this lane",
  "severity": 1-10 integer,
  "keywords": ["tag1", "tag2"]
}
```

---

## Workflow Rules (follow every session)

1. **Plan first** — before any coding, write out steps as a checklist
2. **One feature at a time** — complete and verify before moving on
3. **Never mark done without testing** — run it, check it works
4. **Ask "is there a more elegant way?"** for any non-trivial implementation
5. **After any mistake** — note the pattern so it's not repeated
6. **Keep components small** — under 150 lines each, extract when larger
7. **Always handle loading + error states** in every UI component

---

## Build Order (follow this sequence)

### Phase 1 — Foundation
- [ ] Init Next.js project + Tailwind + TypeScript
- [ ] Set up Supabase project + run schema SQL
- [ ] Configure environment variables
- [ ] Deploy skeleton to Vercel

### Phase 2 — Waitlist Page
- [ ] Build landing/waitlist page with email capture
- [ ] Connect waitlist form to Supabase
- [ ] Send confirmation email via Resend
- [ ] Deploy and share link

### Phase 3 — Map Core
- [ ] Integrate Mapbox with base ocean map
- [ ] Add 10 hot zone circles with risk score colors
- [ ] Add trade lane polylines
- [ ] Click handler → open ZonePanel

### Phase 4 — News + AI
- [ ] Build news admin page (manual entry MVP)
- [ ] Claude API integration for summary/impact/severity
- [ ] NewsFeed component per zone
- [ ] Risk score auto-update from latest news severity

### Phase 5 — Auth + Preferences
- [ ] Supabase Auth (email login)
- [ ] User preferences page
- [ ] Subscribe/unsubscribe to zones

### Phase 6 — Email Alerts
- [ ] Instant alert on new high-severity news
- [ ] Weekly digest email template
- [ ] Alert frequency preferences

---

## Current Status

> Update this section each session

- Phase: NOT STARTED
- Last completed: —
- Next task: Phase 1 — init project

---

## Key Decisions Log

| Decision | Rationale |
|---|---|
| Ocean freight only (MVP) | Speed to market, cleaner UX |
| English only | Simplicity, primary market |
| Manual news entry (MVP) | Avoid scraping complexity early |
| Mapbox over Google Maps | Better for custom overlays and styling |
| Supabase over Firebase | SQL is better for relational data model |
| Resend over SendGrid | Simpler API, better DX |
