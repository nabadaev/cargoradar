'use client'

import { useEffect, useState } from 'react'
import RiskScore from '@/components/RiskScore'
import { getSupabaseClient } from '@/lib/supabase'
import type { Zone } from '@/lib/mapdata'

interface NewsItem {
  headline: string
  ai_summary: string
  impact_zone: string
  impact_region: string
  impact_lane: string
  cmrs_score: number | null
  event_category: string | null
  event_type: string | null
  source_name: string | null
  created_at: string
}

interface ZoneData {
  id: string
  risk_score: number
  risk_level: string
  description: string
  updated_at: string
}

interface Props {
  zone: Zone | null
  onClose: () => void
}

const mono: React.CSSProperties = { fontFamily: 'var(--mono)' }

function riskColor(score: number | null): string {
  if (!score) return '#6e6e6e'
  if (score >= 8) return '#c0392b'
  if (score >= 6) return '#b8680a'
  if (score >= 3.5) return '#b8680a'
  return '#1a6b3a'
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
}

// Section label: 9px mono uppercase, wide tracking
const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: '9px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
  marginBottom: '8px',
}

// Sub-header with extending rule line: [LABEL ————————]
function SubHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', marginTop: '12px' }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--rule)' }} />
    </div>
  )
}

function ImpactBlock({ label, text }: { label: string; text: string | null }) {
  if (!text) return null
  return (
    <div>
      <SubHeader label={label} />
      <p style={{ fontFamily: 'var(--body)', fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
        {text}
      </p>
    </div>
  )
}

export default function ZonePanel({ zone, onClose }: Props) {
  const [zoneData, setZoneData]   = useState<ZoneData | null>(null)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    if (!zone) return
    setZoneData(null)
    setNewsItems([])
    setLoading(true)

    const supabase = getSupabaseClient()

    async function fetch() {
      // Fetch zone row by name
      const { data: zRow } = await supabase
        .from('zones')
        .select('id, risk_score, risk_level, description, updated_at')
        .eq('name', zone!.name)
        .single()

      if (zRow) {
        setZoneData(zRow)

        // Fetch latest 3 news items for this zone
        const { data: news } = await supabase
          .from('news_items')
          .select('headline, ai_summary, impact_zone, impact_region, impact_lane, cmrs_score, event_category, event_type, source_name, created_at')
          .eq('zone_id', zRow.id)
          .order('created_at', { ascending: false })
          .limit(3)

        setNewsItems(news ?? [])
      }

      setLoading(false)
    }

    fetch()
  }, [zone])

  // Use live data if available, fall back to static mapdata values
  const riskScore = zoneData?.risk_score ?? zone?.riskScore ?? 0
  const riskLevel = (zoneData?.risk_level ?? zone?.riskLevel ?? 'low') as 'low' | 'medium' | 'high' | 'critical'
  const description = zoneData?.description ?? zone?.description ?? ''
  const updatedAt = zoneData?.updated_at ? formatDate(zoneData.updated_at) : '—'

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: '380px',
      background: '#fff',
      borderLeft: '1px solid var(--rule)',
      display: 'flex',
      flexDirection: 'column',
      transform: zone ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.22s ease',
      zIndex: 20,
      overflowY: 'auto',
    }}>
      {zone && (
        <>
          {/* Header */}
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--rule)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.16em', color: 'var(--muted)', textTransform: 'uppercase' }}>
                HOT ZONE
              </span>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '16px', color: 'var(--muted)', lineHeight: 1, padding: 0 }}
                aria-label="Close panel"
              >
                ×
              </button>
            </div>

            <h2 style={{ ...mono, fontSize: '18px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '12px', lineHeight: 1.2 }}>
              {zone.name}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <RiskScore level={riskLevel} score={riskScore} />
              <span style={{ ...mono, fontSize: '11px', color: 'var(--muted)' }}>
                Updated {updatedAt}
              </span>
            </div>
          </div>

          {/* Situation */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--rule)' }}>
            <div style={{ ...mono, fontSize: '10px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              SITUATION
            </div>
            {loading ? (
              <div style={{ ...mono, fontSize: '11px', color: 'var(--muted)' }}>Loading...</div>
            ) : (
              <p style={{ fontFamily: 'var(--body)', fontSize: '13px', color: 'var(--ink)', lineHeight: 1.65, margin: 0 }}>
                {description}
              </p>
            )}
          </div>

          {/* Intelligence feed */}
          <div style={{ padding: '16px 24px 0', flex: 1 }}>
            <div style={{ ...mono, fontSize: '10px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
              LATEST INTELLIGENCE
            </div>

            {loading && (
              <div style={{ ...mono, fontSize: '11px', color: 'var(--muted)' }}>Loading...</div>
            )}

            {!loading && newsItems.length === 0 && (
              <div style={{ ...mono, fontSize: '11px', color: 'var(--muted)' }}>
                No intelligence items for this zone yet.
              </div>
            )}

            {!loading && newsItems.map((item, i) => {
              const color = riskColor(item.cmrs_score)
              return (
                <div key={i} style={{ borderTop: '1px solid var(--rule)', paddingTop: '24px', paddingBottom: '24px', marginBottom: i < newsItems.length - 1 ? '24px' : 0 }}>

                  {/* Meta row: date + CMRS badge + event type + category */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.1em', color: 'var(--muted)' }}>
                      {formatDate(item.created_at)}
                    </span>
                    {item.cmrs_score != null && (
                      <span style={{
                        ...mono, fontSize: '9px', fontWeight: 600,
                        color, background: `${color}18`,
                        padding: '2px 7px', borderRadius: '2px',
                      }}>
                        CMRS {item.cmrs_score.toFixed(1)}
                      </span>
                    )}
                    {item.event_type && (
                      <span style={{
                        ...mono, fontSize: '9px', fontWeight: 600,
                        color: 'var(--muted)', border: '1px solid var(--rule)',
                        padding: '2px 7px', borderRadius: '2px',
                      }}>
                        {item.event_type}
                      </span>
                    )}
                    {item.event_category && (
                      <span style={{ ...mono, fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.06em' }}>
                        {item.event_category.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* NEWS SUMMARY block */}
                  <div style={sectionLabel}>NEWS SUMMARY</div>
                  <p style={{ fontFamily: 'var(--body)', fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
                    {item.ai_summary}
                  </p>

                  {/* IMPACT ANALYSIS block */}
                  {(item.impact_zone || item.impact_region || item.impact_lane) && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--rule)' }}>
                      <div style={sectionLabel}>IMPACT ANALYSIS</div>
                      <ImpactBlock label="ZONE IMPACT"                  text={item.impact_zone} />
                      <ImpactBlock label="REGIONAL"                     text={item.impact_region} />
                      <ImpactBlock label="LANE IMPACT  FAR EAST → EUROPE" text={item.impact_lane} />
                    </div>
                  )}

                  {/* Source */}
                  {item.source_name && (
                    <div style={{ ...mono, fontSize: '10px', color: 'var(--muted)', marginTop: '14px' }}>
                      {item.source_name}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* CTA */}
          <div style={{ padding: '20px 24px', marginTop: 'auto', borderTop: '1px solid var(--rule)' }}>
            <p style={{ ...mono, fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: '10px' }}>
              GET ALERTS FOR THIS ZONE
            </p>
            <a href="/" style={{
              display: 'block', textAlign: 'center',
              ...mono, fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
              color: '#fff', background: 'var(--ink)', padding: '11px',
              textDecoration: 'none', textTransform: 'uppercase',
            }}>
              JOIN WAITLIST
            </a>
          </div>
        </>
      )}
    </div>
  )
}
