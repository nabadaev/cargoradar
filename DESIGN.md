# CargoRadar — Design System

> The single source of truth for every visual decision. Reference before touching any UI code.

---

## Direction

**Industrial precision.** White canvas. Monospace data. The map does the talking — the UI steps back.

Not: dark mode, neon, AI-template aesthetics, purple gradients, rounded cards with shadows.
Yes: ruled lines, tabular data, tight mono type, surgical spacing, a single controlled red.

---

## Colors

```css
:root {
  --white:   #ffffff;              /* page background */
  --off:     #f7f6f4;              /* panel bg, hover states */
  --ink:     #0d0d0d;              /* primary text, borders, buttons */
  --ink-2:   #1a1a1a;              /* button hover */
  --muted:   #6e6e6e;              /* labels, secondary text */
  --rule:    #d8d8d4;              /* all dividers and borders */
  --red:     #c0392b;              /* CRITICAL risk + logo pip only */
  --amber:   #b8680a;              /* HIGH / MEDIUM risk */
  --green:   #1a6b3a;              /* LOW risk */
}
```

**Hard rule:** `--red` is reserved exclusively for risk data and the logo pip. Never decorative.

---

## Fonts

| Role | Font | Weight |
|---|---|---|
| Headings, UI, data, labels, buttons, nav | **Geist Mono** | 300–700 |
| Body copy, descriptions only | **Instrument Sans** | 400–500 |

```html
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&family=Instrument+Sans:wght@400;500&display=swap" rel="stylesheet"/>
```

**Never use:** Inter, Roboto, Arial, Space Grotesk, system-ui, or any sans-serif for headings.

---

## Spacing & Layout

- Base unit: **4px**
- Section padding: **100px** top/bottom, **48px** left/right (→ **20px** on mobile)
- Nav: **56px** tall, fixed, white with blur
- Ticker: **32px** tall, fixed below nav, `--ink` background
- Max content width: **1100px**, centered

---

## Borders & Shape

- All borders: `1px solid var(--rule)` or `1px solid var(--ink)` for interactive elements
- Border-radius: **2px** on badges only — nothing else rounded
- No box shadows anywhere
- No card elevation

---

## Components

### Buttons
```css
background: var(--ink);
color: var(--white);
font-family: var(--mono);
font-size: 11px;
font-weight: 600;
letter-spacing: 0.12em;
text-transform: uppercase;
border: none;
border-radius: 0;
padding: 12px 22px;
```

### Input + Button (joined)
Border wraps both as one unit: `border: 1px solid var(--ink)` on a flex container. Input has no individual border.

### Risk Badges
```css
/* CRITICAL */  background: rgba(192,57,43,0.08);  color: #c0392b;
/* HIGH */      background: rgba(184,104,10,0.08); color: #b8680a;
/* LOW */       background: rgba(26,107,58,0.08);  color: #1a6b3a;
border-radius: 2px;
font-family: var(--mono);
font-size: 10px;
font-weight: 600;
letter-spacing: 0.08em;
padding: 3px 8px;
```

### Section Header
Always: `[LABEL ——————————————————]`
```html
<div style="display:flex;align-items:center;gap:20px;margin-bottom:56px">
  <span style="font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);white-space:nowrap">Section Label</span>
  <div style="flex:1;height:1px;background:var(--rule)"></div>
</div>
```

### Feature / Data Grids
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
border-top: 1px solid var(--rule);
border-left: 1px solid var(--rule);
/* each cell: */
border-right: 1px solid var(--rule);
border-bottom: 1px solid var(--rule);
padding: 36px 32px;
```

### Tables
```css
border-collapse: collapse;
border: 1px solid var(--rule);
font-family: var(--mono);
font-size: 12px;
/* th: */ background: var(--off); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted);
/* td: */ border-bottom: 1px solid var(--rule); padding: 13px 16px;
/* tr:hover td: */ background: var(--off);
```

---

## Animation

Only two animations in the entire product:

1. **Page load fade-up:** `opacity: 0 → 1`, `translateY(16px → 0)`, `0.7s ease`, staggered with `animation-delay`
2. **Ticker scroll:** `translateX(0 → -50%)`, `linear infinite`

No other motion. No hover transforms. No scroll animations.

---

## Ticker (Global Alert Bar)

- Position: fixed, `top: 56px` (below nav), full width
- Background: `var(--ink)` — the only persistent dark element
- Font: Geist Mono, 10px, 0.08em letter-spacing, UPPERCASE
- Zone name: `rgba(255,255,255,0.9)`, weight 600
- Score: colored per risk level (`#e05c4b` / `#d4913a` / `#4caa72`)
- Description: `rgba(255,255,255,0.5)`

---

## Map (Mapbox)

- Style: `mapbox://styles/mapbox/light-v11`
- Hot zone circles: stroke 1.5px, fill at 8% opacity, colored by risk
- Trade lanes: 1.5px lines, colored by risk level
- Labels: Geist Mono 11px, uppercase, ink color
- No satellite view, no terrain, no 3D

---

## What Never Appears in CargoRadar UI

| ❌ Never | ✅ Instead |
|---|---|
| Dark backgrounds (except ticker + CTA) | White canvas |
| Purple / blue / teal accents | Red for risk only |
| Rounded cards with shadows | Ruled borders, flat |
| Inter, Space Grotesk | Geist Mono + Instrument Sans |
| Decorative gradients | Flat color or var(--off) |
| Emojis in UI | Text badges |
| Border-radius > 2px | Sharp corners everywhere |
| Animated hover transforms | Background color shift only |

