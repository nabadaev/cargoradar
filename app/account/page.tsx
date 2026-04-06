'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient, fromTable } from '@/lib/supabase'
import { useSession } from '@/lib/auth'
import AvatarMenu from '@/components/AvatarMenu'
import RiskScore from '@/components/RiskScore'
import { ZONES } from '@/lib/mapdata'
import type { Zone, RiskLevel } from '@/lib/mapdata'

const mono: React.CSSProperties = { fontFamily: 'var(--mono)' }
const body: React.CSSProperties = { fontFamily: 'var(--body)' }

type SubMap = Record<string, Record<string, never>>
interface Confirm { msg: string; color: string }

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
      <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--rule)' }} />
    </div>
  )
}

function DataRow({ label: rowLabel, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', borderBottom: '1px solid var(--rule)',
    }}>
      <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase' }}>
        {rowLabel}
      </span>
      <span style={{ ...mono, fontSize: '13px', color: 'var(--ink)' }}>
        {value}
      </span>
    </div>
  )
}

function formatMemberSince(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export default function AccountPage() {
  const session = useSession()
  const router  = useRouter()
  const userId  = session?.user?.id

  const [zones, setZones]       = useState<Zone[]>(ZONES)
  const [subs, setSubs]         = useState<SubMap>({})
  const [loading, setLoading]   = useState(true)
  const [toggling, setToggling] = useState<Record<string, boolean>>({})
  const [confirms, setConfirms] = useState<Record<string, Confirm>>({})
  const [plan, setPlan]         = useState<'free' | 'pro' | 'team'>('free')
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Auth guard
  useEffect(() => {
    if (session === null) router.replace('/login?next=/account')
  }, [session, router])

  // Fetch live zone risk scores
  useEffect(() => {
    let cancelled = false
    getSupabaseClient()
      .from('zones')
      .select('name, risk_score, risk_level')
      .then(({ data, error }) => {
        if (cancelled || error || !data || data.length === 0) return
        type ZoneRow = { name: string; risk_score: number; risk_level: string }
        setZones(ZONES.map(z => {
          const live = (data as ZoneRow[]).find(d => d.name === z.name)
          return live ? { ...z, riskScore: Number(live.risk_score), riskLevel: live.risk_level as RiskLevel } : z
        }))
      })
    return () => { cancelled = true }
  }, [])

  // Fetch subscriptions + plan once userId is known
  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      const email = user?.email ?? ''

      const map: SubMap = {}
      if (email) {
        const result = await fromTable(supabase, 'zone_alerts')
          .select('zone_name')
          .eq('email', email)
        const rows = result.data as { zone_name: string }[] | null
        for (const row of rows ?? []) {
          map[row.zone_name] = {}
        }
      }

      // Attempt to fetch plan from users table (may not exist yet)
      try {
        const planResult = await fromTable(supabase, 'users')
          .select('plan')
          .eq('id', userId)
          .maybeSingle()
        const planValue = (planResult.data as { plan?: string } | null)?.plan
        if (planValue === 'pro' || planValue === 'team') {
          if (!cancelled) setPlan(planValue)
        }
      } catch {
        // users table may not exist yet — silently use 'free'
      }

      if (!cancelled) { setSubs(map); setLoading(false) }
    }

    load().catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [userId])

  useEffect(() => {
    const t = timers.current
    return () => { for (const id of Object.values(t)) clearTimeout(id) }
  }, [])

  function showConfirm(zoneName: string, msg: string, color: string) {
    if (timers.current[zoneName]) clearTimeout(timers.current[zoneName])
    setConfirms(prev => ({ ...prev, [zoneName]: { msg, color } }))
    timers.current[zoneName] = setTimeout(() => {
      setConfirms(prev => { const n = { ...prev }; delete n[zoneName]; return n })
    }, 3000)
  }

  async function toggle(zoneName: string, riskLevel: RiskLevel, riskScore: number) {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const email = user?.email ?? session?.user?.email ?? ''
    if (!email) { showConfirm(zoneName, 'Sign in required', 'var(--red)'); return }

    const wasSubscribed = !!subs[zoneName]
    setSubs(prev => {
      const next = { ...prev }
      if (wasSubscribed) { delete next[zoneName] } else { next[zoneName] = {} }
      return next
    })
    setToggling(t => ({ ...t, [zoneName]: true }))

    try {
      if (wasSubscribed) {
        const { error } = await fromTable(supabase, 'zone_alerts')
          .delete()
          .eq('zone_name', zoneName)
          .eq('email', email)
        if (error) throw error
        showConfirm(zoneName, `Unsubscribed from ${zoneName}`, 'var(--muted)')
      } else {
        const { error } = await fromTable(supabase, 'zone_alerts')
          .upsert({ email, zone_name: zoneName }, { onConflict: 'email,zone_name' })
        if (error) throw error
        fetch('/api/alerts/confirm-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, zone_name: zoneName, risk_level: riskLevel, risk_score: riskScore }),
        }).catch(() => {})
        showConfirm(zoneName, `Subscribed to ${zoneName} alerts`, '#1a6b3a')
      }
    } catch {
      setSubs(prev => {
        const next = { ...prev }
        if (wasSubscribed) { next[zoneName] = {} } else { delete next[zoneName] }
        return next
      })
      showConfirm(zoneName, 'Error — please try again', 'var(--red)')
    } finally {
      setToggling(t => ({ ...t, [zoneName]: false }))
    }
  }

  if (session === undefined || (session !== null && loading)) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ ...mono, fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.1em' }}>LOADING...</span>
      </div>
    )
  }
  if (session === null) return null

  const activeCount  = Object.keys(subs).length
  const memberSince  = session.user.created_at ? formatMemberSince(session.user.created_at) : '—'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>

      {/* Nav */}
      <nav style={{
        height: '56px', borderBottom: '1px solid var(--rule)',
        display: 'flex', alignItems: 'center', padding: '0 48px',
        justifyContent: 'space-between', position: 'sticky', top: 0,
        background: '#fff', zIndex: 10,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ ...mono, fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink)' }}>
            CARGORADAR
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/map" style={{ ...mono, fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted)', textDecoration: 'none', textTransform: 'uppercase' }}>
            MAP
          </Link>
          <AvatarMenu email={session.user.email ?? ''} />
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '56px 48px' }}>

        {/* Page heading */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ ...mono, fontSize: '10px', letterSpacing: '0.16em', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
            CARGORADAR / ACCOUNT
          </div>
          <h1 style={{ ...mono, fontSize: '24px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Account
          </h1>
        </div>

        {/* ── IDENTITY ── */}
        <div style={{ marginBottom: '48px' }}>
          <SectionLabel label="IDENTITY" />
          <DataRow label="EMAIL" value={session.user.email ?? '—'} />
          <DataRow label="MEMBER SINCE" value={memberSince} />
        </div>

        {/* ── PLAN ── */}
        <div style={{ marginBottom: '48px' }}>
          <SectionLabel label="PLAN" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--rule)' }}>
            <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              CURRENT PLAN
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Plan badge */}
              <span style={{
                ...mono,
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'var(--off)',
                border: '1px solid var(--rule)',
                borderRadius: '2px',
                padding: '3px 8px',
                color: 'var(--ink)',
              }}>
                {plan.toUpperCase()}
              </span>
              {plan === 'free' && (
                <Link href="/account?upgrade=true" style={{
                  ...mono,
                  fontSize: '11px',
                  color: 'var(--muted)',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                }}>
                  UPGRADE TO PRO →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── ALERT SUBSCRIPTIONS ── */}
        <div>
          <SectionLabel label="ALERT SUBSCRIPTIONS" />

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 0', borderBottom: '1px solid var(--rule)', marginBottom: '8px',
          }}>
            <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.14em', color: activeCount > 0 ? 'var(--ink)' : 'var(--muted)', textTransform: 'uppercase', fontWeight: activeCount > 0 ? 600 : 400 }}>
              {activeCount > 0 ? `${activeCount} ACTIVE SUBSCRIPTION${activeCount !== 1 ? 'S' : ''}` : 'NO ACTIVE SUBSCRIPTIONS'}
            </span>
            <span style={{ ...mono, fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.08em' }}>
              ZONE · RISK · STATUS
            </span>
          </div>

          {loading ? (
            <div style={{ ...mono, fontSize: '11px', color: 'var(--muted)', padding: '16px 0' }}>Loading...</div>
          ) : zones.map((zone) => {
            const subscribed = !!subs[zone.name]
            const isToggling = toggling[zone.name] ?? false
            const confirm    = confirms[zone.name]

            return (
              <div key={zone.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px 0', borderBottom: '1px solid var(--rule)',
                background: subscribed ? 'var(--off)' : 'transparent',
                marginLeft: '-12px', marginRight: '-12px', paddingLeft: '12px', paddingRight: '12px',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...mono, fontSize: '12px', fontWeight: subscribed ? 600 : 500, color: 'var(--ink)', marginBottom: '2px' }}>
                    {zone.name}
                  </div>
                  {confirm && (
                    <div style={{ ...mono, fontSize: '10px', color: confirm.color, letterSpacing: '0.04em', marginTop: '2px' }}>
                      {confirm.msg}
                    </div>
                  )}
                </div>

                <RiskScore level={zone.riskLevel} score={zone.riskScore} />

                <button
                  onClick={() => toggle(zone.name, zone.riskLevel, zone.riskScore)}
                  disabled={isToggling}
                  style={{
                    ...mono, fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
                    textTransform: 'uppercase', flexShrink: 0, padding: '7px 16px',
                    borderRadius: 0, cursor: isToggling ? 'default' : 'pointer',
                    opacity: isToggling ? 0.5 : 1,
                    background: subscribed ? 'var(--ink)' : 'transparent',
                    color: subscribed ? '#fff' : 'var(--ink)',
                    border: subscribed ? '1px solid var(--ink)' : '1px solid var(--rule)',
                    transition: 'background 0.1s, color 0.1s',
                  }}
                >
                  {isToggling ? '...' : subscribed ? 'SUBSCRIBED' : 'SUBSCRIBE'}
                </button>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
