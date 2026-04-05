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
const body: React.CSSProperties = { fontFamily: 'var(--body)' }

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: '9px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: 'var(--muted)',
  marginBottom: '8px',
}

function formatDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()
}

function impactBadge(score: number | null): { label: string; bg: string; color: string } {
  if (score == null) return { label: 'N/A',      bg: 'rgba(110,110,110,0.08)', color: '#6e6e6e' }
  if (score >= 8.0)  return { label: 'CRITICAL', bg: 'rgba(192,57,43,0.08)',   color: '#c0392b' }
  if (score >= 6.0)  return { label: 'HIGH',     bg: 'rgba(184,104,10,0.08)',  color: '#b8680a' }
  if (score >= 4.0)  return { label: 'MEDIUM',   bg: 'rgba(184,104,10,0.06)',  color: '#b8680a' }
  return               { label: 'LOW',      bg: 'rgba(26,107,58,0.08)',   color: '#1a6b3a' }
}

function SubHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', marginTop: '12px' }}>
      <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
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
      <p style={{ ...body, fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
        {text}
      </p>
    </div>
  )
}

export default function ZonePanel({ zone, onClose }: Props) {
  const [zoneData, setZoneData]     = useState<ZoneData | null>(null)
  const [newsItems, setNewsItems]   = useState<NewsItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading]       = useState(false)
  const [openIndex, setOpenIndex]   = useState<number | null>(null)

  useEffect(() => {
    if (!zone) return
    setZoneData(null)
    setNewsItems([])
    setTotalCount(0)
    setLoading(true)
    setOpenIndex(null)

    const supabase = getSupabaseClient()

    async function load() {
      const { data: zRow } = await supabase
        .from('zones')
        .select('id, risk_score, risk_level, description, updated_at')
        .eq('name', zone!.name)
        .single()

      if (zRow) {
        setZoneData(zRow)

        // Fetch top 5 + count
        const { data: news, count } = await supabase
          .from('news_items')
          .select('headline, ai_summary, impact_zone, impact_region, impact_lane, cmrs_score, event_category, event_type, source_name, created_at', { count: 'exact' })
          .eq('zone_id', zRow.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setNewsItems(news ?? [])
        setTotalCount(count ?? 0)
      }

      setLoading(false)
    }

    load()
  }, [zone])

  const riskScore   = zoneData?.risk_score ?? zone?.riskScore ?? 0
  const riskLevel   = (zoneData?.risk_level ?? zone?.riskLevel ?? 'low') as 'low' | 'medium' | 'high' | 'critical'
  const description = zoneData?.description ?? zone?.description ?? ''
  const updatedAt   = zoneData?.updated_at ? formatDate(zoneData.updated_at) : '—'

  function toggleItem(i: number) {
    setOpenIndex(prev => (prev === i ? null : i))
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0, right: 0, bottom: 0,
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
          {/* ── Header ── */}
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--rule)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.16em', color: 'var(--muted)', textTransform: 'uppercase' }}>
                HOT ZONE
              </span>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', ...mono, fontSize: '16px', color: 'var(--muted)', lineHeight: 1, padding: 0 }}
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
              <span style={{ ...mono, fontSize: '10px', color: 'var(--muted)' }}>
                Updated {updatedAt}
              </span>
            </div>
          </div>

          {/* ── Situation ── */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--rule)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase' }}>
                SITUATION
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--rule)' }} />
            </div>
            {loading ? (
              <div style={{ ...mono, fontSize: '11px', color: 'var(--muted)' }}>Loading...</div>
            ) : (
              <p style={{ ...body, fontSize: '13px', color: 'var(--ink)', lineHeight: 1.65, margin: 0 }}>
                {description}
              </p>
            )}
          </div>

          {/* ── Latest Intelligence ── */}
          <div style={{ padding: '16px 24px 0', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase' }}>
                LATEST INTELLIGENCE
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--rule)' }} />
            </div>

            {loading && (
              <div style={{ ...mono, fontSize: '11px', color: 'var(--muted)' }}>Loading...</div>
            )}

            {!loading && newsItems.length === 0 && (
              <p style={{ ...body, fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                No intelligence items for this zone yet.
              </p>
            )}

            {!loading && newsItems.map((item, i) => {
              const badge   = impactBadge(item.cmrs_score)
              const isOpen  = openIndex === i

              return (
                <div key={i}>
                  {/* Collapsed row */}
                  <div
                    onClick={() => toggleItem(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: isOpen ? 'none' : '1px solid var(--rule)',
                      cursor: 'pointer',
                      background: 'transparent',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--off)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Impact badge */}
                    <span style={{
                      ...mono,
                      fontSize: '9px',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      background: badge.bg,
                      color: badge.color,
                      padding: '3px 6px',
                      borderRadius: '2px',
                    }}>
                      {badge.label}
                    </span>

                    {/* Headline */}
                    <span style={{
                      ...mono,
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'var(--ink)',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.headline}
                    </span>

                    {/* Arrow */}
                    <span style={{ ...mono, fontSize: '9px', color: 'var(--muted)', flexShrink: 0 }}>
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* Expanded detail panel */}
                  {isOpen && (
                    <div style={{
                      background: 'var(--off)',
                      padding: '16px',
                      borderBottom: '1px solid var(--rule)',
                    }}>
                      {/* News Summary */}
                      <div style={sectionLabel}>NEWS SUMMARY</div>
                      <p style={{ ...body, fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
                        {item.ai_summary}
                      </p>

                      {/* Divider */}
                      <div style={{ height: '1px', background: 'var(--rule)', margin: '12px 0' }} />

                      {/* Impact Analysis */}
                      <div style={sectionLabel}>IMPACT ANALYSIS</div>
                      <ImpactBlock label="ZONE IMPACT"                     text={item.impact_zone} />
                      <ImpactBlock label="REGIONAL"                        text={item.impact_region} />
                      <ImpactBlock label="LANE IMPACT  FAR EAST → EUROPE" text={item.impact_lane} />

                      {/* Source + date */}
                      <div style={{ ...mono, fontSize: '10px', color: 'var(--muted)', marginTop: '14px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.source_name ?? '—'}</span>
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* View all link */}
            {!loading && totalCount > 5 && (
              <div style={{ ...mono, fontSize: '10px', color: 'var(--muted)', padding: '12px 0', borderTop: '1px solid var(--rule)' }}>
                View all {totalCount} items
              </div>
            )}
          </div>

          {/* ── CTA ── */}
          <div style={{ padding: '20px 24px', marginTop: 'auto', borderTop: '1px solid var(--rule)', flexShrink: 0 }}>
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
