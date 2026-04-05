import type { RiskLevel } from '@/lib/mapdata'

export type EventCategory =
  | 'active_vessel_attack'
  | 'port_closure'
  | 'conflict_escalation'
  | 'carrier_rerouting'
  | 'military_buildup'
  | 'piracy'
  | 'sanctions'
  | 'insurance_spike'
  | 'diplomatic_tension'
  | 'weather_ops'

export type EventType = 'ACT' | 'THREAT' | 'SIGNAL' | 'OPS'

export interface CMRSInput {
  eventCategory: EventCategory
  eventType: EventType
  proximityToLane: number      // 0–1
  sourceCredibility: number    // 0–1
  priorScore: number           // 1–10
  daysSinceLastUpdate: number
}

export interface CMRSResult {
  score: number
  riskLevel: RiskLevel
  delta: number
}

const BASE_WEIGHTS: Record<EventCategory, number> = {
  active_vessel_attack: 10,
  port_closure:          9,
  conflict_escalation:   8,
  carrier_rerouting:     8,
  military_buildup:      7,
  piracy:                7,
  sanctions:             6,
  insurance_spike:       6,
  diplomatic_tension:    4,
  weather_ops:           5,
}

// ACT events are full weight; THREAT discounted 15%; SIGNAL 30%; OPS 20%
const EVENT_TYPE_MULTIPLIER: Record<EventType, number> = {
  ACT:    1.00,
  THREAT: 0.85,
  SIGNAL: 0.70,
  OPS:    0.80,
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 8.0) return 'critical'
  if (score >= 6.0) return 'high'
  if (score >= 3.5) return 'medium'
  return 'low'
}

export function computeCMRS(input: CMRSInput): CMRSResult {
  const {
    eventCategory,
    eventType,
    proximityToLane,
    sourceCredibility,
    priorScore,
    daysSinceLastUpdate,
  } = input

  const base = BASE_WEIGHTS[eventCategory]

  // Temporal decay: half-life ~7 days
  const decayed = base * Math.exp(-0.1 * daysSinceLastUpdate)

  // Event type discount
  const typed = decayed * EVENT_TYPE_MULTIPLIER[eventType]

  // Proximity: events directly on the lane get full weight; distant events discounted
  // proximityToLane=1 → ×1.0, proximityToLane=0 → ×0.4
  const proxMultiplier = 0.4 + 0.6 * proximityToLane
  const proxAdjusted = typed * proxMultiplier

  // Credibility: sourceCredibility=1 → ×1.0, =0 → ×0.5
  const credMultiplier = 0.5 + 0.5 * sourceCredibility
  const credAdjusted = proxAdjusted * credMultiplier

  // Normalise raw weight (max possible = 10) to 1–10 scale
  const normalised = Math.max(1, Math.min(10, credAdjusted))

  // Blend with prior score — new signal is 30% weight to prevent volatility
  const blended = normalised * 0.3 + priorScore * 0.7

  const score = Math.round(blended * 10) / 10
  const delta = Math.round((score - priorScore) * 10) / 10

  return {
    score,
    riskLevel: riskLevelFromScore(score),
    delta,
  }
}
