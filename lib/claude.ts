import Anthropic from '@anthropic-ai/sdk'
import type { EventCategory, EventType } from '@/lib/scoring'

const getClient = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface NewsAnalysis {
  summary: string
  impact_zone: string
  impact_region: string
  impact_lane: string
  eventCategory: EventCategory
  eventType: EventType
  proximityScore: number   // 0.0–1.0
  rawSeverity: number      // 1–10
}

const SYSTEM_PROMPT = `You are a maritime freight intelligence analyst scoring news items for the Far East → Europe trade lane.

Your analytical framework is adapted from Caldara & Iacoviello's Geopolitical Risk (GPR) index methodology, applied to maritime logistics. You assess events across two dimensions:
1. Threat intensity — the severity of the event in isolation
2. Operational impact — the practical consequence for cargo moving Far East → Europe via Cape of Good Hope

The current baseline context (as of 2026):
- The Red Sea / Bab-el-Mandeb is effectively closed to commercial traffic due to Houthi strikes
- The Strait of Hormuz carries critical risk from Iranian naval activity
- The active Far East → Europe route transits: Shanghai → South China Sea → Strait of Malacca → Indian Ocean → Cape of Good Hope → West Africa → Gulf of Guinea → Gibraltar → Rotterdam
- Cape rerouting adds ~14 days and $1,500–3,000/TEU vs pre-crisis Suez routing
- War-risk insurance premiums are at 10-year highs

Classify events into exactly one eventCategory from this list:
active_vessel_attack, port_closure, conflict_escalation, carrier_rerouting, military_buildup, piracy, sanctions, insurance_spike, diplomatic_tension, weather_ops

Classify eventType as one of:
- ACT: confirmed, occurring event
- THREAT: credible stated threat or warning
- SIGNAL: intelligence indicator, positioning, or precursor
- OPS: operational/logistical development (no direct threat)

proximityScore: 0.0 = geographically/operationally irrelevant to the Cape route; 1.0 = directly on the active trade lane or chokepoint

Respond with ONLY raw JSON. No markdown, no code fences, no backticks, no preamble. Your response must start with { and end with }.`

export async function analyseNewsItem(
  rawContent: string,
  zoneName: string,
): Promise<NewsAnalysis> {
  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyse this news item. The associated hot zone is: ${zoneName}

---
${rawContent}
---

Respond with this exact JSON structure:
{
  "summary": "2-3 sentence plain English summary of what happened",
  "impact_zone": "What this means specifically for the ${zoneName} hot zone",
  "impact_region": "Broader regional effect on surrounding waters and ports",
  "impact_lane": "Specific operational consequence for Far East → Europe cargo. Include delay estimates (days) and cost implications ($/TEU) where applicable.",
  "eventCategory": "<one of the valid categories>",
  "eventType": "ACT|THREAT|SIGNAL|OPS",
  "proximityScore": 0.0,
  "rawSeverity": 1
}`,
      },
    ],
  })

  const rawText = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
  return JSON.parse(cleaned) as NewsAnalysis
}

export async function generateZoneSituation(
  zoneName: string,
  recentItems: { ai_summary: string; impact_lane: string; created_at: string }[],
): Promise<string> {
  if (recentItems.length === 0) {
    throw new Error('No recent items available for zone situation generation')
  }

  const itemsText = recentItems
    .map(
      (item, i) =>
        `[${i + 1}] ${item.created_at.slice(0, 10)}: ${item.ai_summary} Operational: ${item.impact_lane}`,
    )
    .join('\n')

  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    system:
      'You are a maritime freight analyst. Write EXACTLY 3 sentences. No more than 3 sentences. Each sentence must be 20 words or fewer. Each sentence must end with a full stop. Do not combine sentences with semicolons. Do not write a 4th sentence. Stop writing after the third full stop. No preamble, no markdown, no labels.',
    messages: [
      {
        role: 'user',
        content: `Zone: ${zoneName}\n\nRecent intelligence:\n${itemsText}\n\nSummarize the current situation for ${zoneName} in EXACTLY 3 short sentences (max 20 words each). Stop after sentence 3.`,
      },
    ],
  })

  const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
  return rawText
    .trim()
    .replace(/^```[a-z]*\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
}
