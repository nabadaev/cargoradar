export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Zone {
  id: string
  name: string
  type: 'hotzone' | 'tradelane'
  coordinates: GeoJSON
  risk_score: number
  risk_level: RiskLevel
  description: string | null
  updated_at: string
}

export interface NewsItem {
  id: string
  zone_id: string
  headline: string
  source_url: string | null
  source_name: string | null
  published_at: string
  raw_content: string | null
  ai_summary: string | null
  ai_impact: string | null
  ai_severity: number | null
  created_at: string
}

export interface User {
  id: string
  email: string
  company_name: string | null
  role: 'forwarder' | 'importer' | 'supply_chain' | 'other' | null
  alert_frequency: 'instant' | 'daily' | 'weekly' | null
  created_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  zone_id: string
  created_at: string
}

export interface WaitlistEntry {
  id: string
  email: string
  company_name: string | null
  role: string | null
  created_at: string
}

// GeoJSON stub — use proper types from @types/geojson when adding map
type GeoJSON = Record<string, unknown>
