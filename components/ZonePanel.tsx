'use client'

import { useEffect, useState } from 'react'
import RiskScore from '@/components/RiskScore'
import { getSupabaseClient, fromTable } from '@/lib/supabase'
import { useSession } from '@/lib/auth'
import { getUserPlan } from '@/lib/plan'
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

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length === 0) return null
  const w = 332, h = 32, pad = 2

  // Single point — render a flat horizontal line at that value's midpoint
  if (data.length === 1) {
    const y = h / 2
    return (
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
          30-DAY TREND
        </div>
        <svg width={w} height={h} style={{ display: 'block', width: '100%' }} viewBox={`0 0 ${w} ${h}`}>
          <line x1={pad} y1={y} x2={w - pad} y2={y} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />
          <circle cx={w / 2} cy={y} r={2.5} fill={color} />
        </svg>
      </div>
    )
  }

  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = pad + ((max - v) / range) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
        30-DAY TREND
      </div>
      <svg width={w} height={h} style={{ display: 'block', width: '100%' }} viewBox={`0 0 ${w} ${h}`}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function ZonePanel({ zone, onClose }: Props) {
  const session = useSession()
  const userEmail = session?.user?.email ?? null

  const [zoneData, setZoneData]           = useState<ZoneData | null>(null)
  const [newsItems, setNewsItems]         = useState<NewsItem[]>([])
  const [totalCount, setTotalCount]       = useState(0)
  const [loading, setLoading]             = useState(false)
  const [openIndex, setOpenIndex]         = useState<number | null>(null)
  const [situation, setSituation]         = useState<string | null>(null)
  const [situationLoading, setSituationLoading] = useState(false)
  const [scoreHistory, setScoreHistory]   = useState<{ risk_score: number; recorded_at: string }[]>([])
  const [plan, setPlan]                   = useState<'free' | 'pro' | 'team'>('free')

  // Alert signup state
  const [alertEmail, setAlertEmail]       = useState('')
  const [alertStatus, setAlertStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [alertError, setAlertError]       = useState('')
  const [isSubscribed, setIsSubscribed]   = useState(false)

  // Fetch user plan once on mount
  useEffect(() => {
    getUserPlan().then(setPlan).catch(() => {})
  }, [])

  // Check if logged-in user is already subscribed to this zone
  useEffect(() => {
    if (!zone || !userEmail) { setIsSubscribed(false); return }
    const supabase = getSupabaseClient()
    fromTable(supabase, 'zone_alerts')
      .select('id')
      .eq('email', userEmail)
      .eq('zone_name', zone.name)
      .maybeSingle()
      .then(({ data }: { data: { id: string } | null }) => {
        setIsSubscribed(!!data)
      })
  }, [zone, userEmail])

  useEffect(() => {
    if (!zone) return
    setZoneData(null)
    setNewsItems([])
    setTotalCount(0)
    setLoading(true)
    setOpenIndex(null)
    setSituation(null)
    setScoreHistory([])
    setAlertStatus('idle')
    setAlertError('')

    const supabase = getSupabaseClient()

    async function load() {
      const { data: zRow } = await fromTable(supabase, 'zones')
        .select('id, risk_score, risk_level, description, updated_at')
        .eq('name', zone!.name)
        .single()

      if (zRow) {
        setZoneData(zRow)

        // Fetch score history
        const { data: history } = await fromTable(supabase, 'zone_score_history')
          .select('risk_score, recorded_at')
          .eq('zone_id', zRow.id)
          .order('recorded_at', { ascending: true })
          .limit(30)
        setScoreHistory(history ?? [])

        // Fetch top 5 + count
        const { data: news, count } = await fromTable(supabase, 'news_items')
          .select('headline, ai_summary, impact_zone, impact_region, impact_lane, cmrs_score, event_category, event_type, source_name, created_at', { count: 'exact' })
          .eq('zone_id', zRow.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setNewsItems(news ?? [])
        setTotalCount(count ?? 0)

        // Fetch live situation summary if we have news
        if (news && news.length > 0) {
          setSituationLoading(true)
          fetch('/api/zones/situation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              zone_name: zone!.name,
              news_items: news.slice(0, 3).map(n => ({
                ai_summary: n.ai_summary,
                impact_lane: n.impact_lane,
                created_at: n.created_at,
              })),
            }),
          })
            .then(r => r.json())
            .then(d => { if (d.situation) setSituation(d.situation) })
            .catch(() => {})
            .finally(() => setSituationLoading(false))
        }
      }

      setLoading(false)
    }

    load()
  }, [zone])

  const riskScore   = zoneData?.risk_score ?? zone?.riskScore ?? 0
  const riskLevel   = (zoneData?.risk_level ?? zone?.riskLevel ?? 'low') as 'low' | 'medium' | 'high' | 'critical'
  const description = zoneData?.description ?? zone?.description ?? ''
  const updatedAt   = zoneData?.updated_at ? formatDate(zoneData.updated_at) : '—'

  const sparklineColor =
    riskLevel === 'critical' ? '#c0392b' :
    riskLevel === 'high'     ? '#b8680a' :
    riskLevel === 'medium'   ? '#b8680a' :
    '#1a6b3a'

  function toggleItem(i: number) {
    setOpenIndex(prev => (prev === i ? null : i))
  }

  async function handleAlertSubscribe(emailOverride?: string) {
    if (!zone) return
    const email = emailOverride ?? alertEmail
    if (!email) return
    setAlertStatus('loading')
    setAlertError('')
    try {
      const res = await fetch('/api/alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, zone_name: zone.name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAlertError(data.error ?? 'Subscription failed')
        setAlertStatus('error')
      } else {
        setAlertStatus('success')
        setIsSubscribed(true)
      }
    } catch {
      setAlertError('Network error — please try again')
      setAlertStatus('error')
    }
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
            {scoreHistory.length >= 1 && (
              <Sparkline
                data={scoreHistory.map(h => h.risk_score)}
                color={sparklineColor}
              />
            )}
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
            ) : situationLoading ? (
              <p style={{ ...body, fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
                Generating situation summary...
              </p>
            ) : situation ? (
              plan === 'free' ? (
                <div>
                  <p style={{ ...body, fontSize: '13px', color: 'var(--ink)', lineHeight: 1.65, margin: 0 }}>
                    {situation.split('.')[0] + '.'}
                  </p>
                  <p style={{ ...mono, fontSize: '10px', color: 'var(--muted)', marginTop: '8px', letterSpacing: '0.04em' }}>
                    <a href="/account" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>
                      Upgrade to Pro for full intelligence brief →
                    </a>
                  </p>
                </div>
              ) : (
                <p style={{ ...body, fontSize: '13px', color: 'var(--ink)', lineHeight: 1.65, margin: 0 }}>
                  {situation}
                </p>
              )
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

          {/* ── Alert Signup CTA ── */}
          <div style={{ padding: '20px 24px', marginTop: 'auto', borderTop: '1px solid var(--rule)', flexShrink: 0 }}>
            {/* Section header with rule */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                GET ALERTS FOR THIS ZONE
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--rule)' }} />
            </div>

            {/* Already subscribed (optimistic or confirmed) */}
            {(alertStatus === 'success' || isSubscribed) ? (
              <p style={{ ...mono, fontSize: '11px', color: '#1a6b3a', margin: 0 }}>
                ✓ Alerts active for {zone.name}
              </p>
            ) : userEmail ? (
              /* Logged in, not yet subscribed */
              plan === 'free' ? (
                /* Free users: redirect to account to upgrade */
                <button
                  onClick={() => { window.location.href = '/account' }}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'var(--ink)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    ...mono,
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '11px',
                    borderRadius: 0,
                  }}
                >
                  UPGRADE TO GET ALERTS →
                </button>
              ) : (
                /* Paid users: subscribe directly */
                <>
                  <button
                    onClick={() => handleAlertSubscribe(userEmail)}
                    disabled={alertStatus === 'loading'}
                    style={{
                      display: 'block',
                      width: '100%',
                      background: 'var(--ink)',
                      color: '#fff',
                      border: 'none',
                      cursor: alertStatus === 'loading' ? 'default' : 'pointer',
                      ...mono,
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '11px',
                      borderRadius: 0,
                      opacity: alertStatus === 'loading' ? 0.7 : 1,
                    }}
                  >
                    {alertStatus === 'loading' ? 'SUBSCRIBING...' : 'SUBSCRIBE TO ALERTS'}
                  </button>
                  {alertStatus === 'error' && alertError && (
                    <p style={{ ...mono, fontSize: '11px', color: '#c0392b', margin: '8px 0 0' }}>
                      {alertError}
                    </p>
                  )}
                </>
              )
            ) : (
              /* Not logged in — show email input */
              <>
                <input
                  type="email"
                  value={alertEmail}
                  onChange={e => { setAlertEmail(e.target.value); if (alertStatus === 'error') setAlertStatus('idle') }}
                  placeholder="your@company.com"
                  style={{
                    display: 'block',
                    width: '100%',
                    boxSizing: 'border-box',
                    border: '1px solid var(--rule)',
                    background: 'transparent',
                    ...mono,
                    fontSize: '12px',
                    color: 'var(--ink)',
                    padding: '8px 10px',
                    marginBottom: '8px',
                    outline: 'none',
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') handleAlertSubscribe() }}
                />
                <button
                  onClick={() => handleAlertSubscribe()}
                  disabled={alertStatus === 'loading'}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'var(--ink)',
                    color: '#fff',
                    border: 'none',
                    cursor: alertStatus === 'loading' ? 'default' : 'pointer',
                    ...mono,
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    padding: '11px',
                    borderRadius: 0,
                    opacity: alertStatus === 'loading' ? 0.7 : 1,
                  }}
                >
                  {alertStatus === 'loading' ? 'SUBSCRIBING...' : 'SUBSCRIBE TO ALERTS'}
                </button>
                {alertStatus === 'error' && alertError && (
                  <p style={{ ...mono, fontSize: '11px', color: '#c0392b', margin: '8px 0 0' }}>
                    {alertError}
                  </p>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
