'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { useSession } from '@/lib/auth'
import RiskScore from '@/components/RiskScore'
import { ZONES } from '@/lib/mapdata'
import type { Zone, RiskLevel } from '@/lib/mapdata'

const mono: React.CSSProperties = { fontFamily: 'var(--mono)' }
const body: React.CSSProperties = { fontFamily: 'var(--body)' }

// SubMap: zone name → subscribed (value is {} — presence = subscribed)
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

export default function SettingsPage() {
  const session = useSession()
  const router  = useRouter()
  const userId  = session?.user?.id  // stable string dep

  const [zones, setZones]       = useState<Zone[]>(ZONES)
  const [subs, setSubs]         = useState<SubMap>({})
  const [loading, setLoading]   = useState(true)
  const [toggling, setToggling] = useState<Record<string, boolean>>({})
  const [confirms, setConfirms] = useState<Record<string, Confirm>>({})
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Auth guard
  useEffect(() => {
    if (session === null) router.replace('/login')
  }, [session, router])

  // Fetch live zone scores from Supabase on mount — no auth needed
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

  // Fetch subscriptions once userId is known.
  // zone_alerts is the single source of truth — no user_subscriptions query.
  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      const supabase = getSupabaseClient()

      // Get user email from the auth client — most reliable source
      const { data: { user } } = await supabase.auth.getUser()
      const email = user?.email ?? ''

      const map: SubMap = {}
      if (email) {
        const { data } = await supabase
          .from('zone_alerts')
          .select('zone_name')
          .eq('email', email)
        for (const row of data ?? []) {
          map[row.zone_name] = {}
        }
      }

      if (!cancelled) { setSubs(map); setLoading(false) }
    }

    load().catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [userId])

  // Cleanup timers on unmount
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
    console.log('[toggle] called', { zoneName, userId, sessionEmail: session?.user?.email })

    // Always get email fresh from the Supabase client — the closure value
    // from session?.user?.email can be stale if the client hasn't rehydrated yet
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const email = user?.email ?? session?.user?.email ?? ''

    console.log('[toggle] resolved email:', email, '| wasSubscribed:', !!subs[zoneName])

    if (!email) {
      console.warn('[toggle] no email available — cannot write to zone_alerts')
      showConfirm(zoneName, 'Sign in required', 'var(--red)')
      return
    }

    const wasSubscribed = !!subs[zoneName]

    // Optimistic update — immediate UI response
    setSubs(prev => {
      const next = { ...prev }
      if (wasSubscribed) { delete next[zoneName] } else { next[zoneName] = {} }
      return next
    })
    setToggling(t => ({ ...t, [zoneName]: true }))

    try {
      if (wasSubscribed) {
        // Unsubscribe — requires DELETE policy on zone_alerts (migration 006)
        const { error } = await supabase
          .from('zone_alerts')
          .delete()
          .eq('zone_name', zoneName)
          .eq('email', email)
        if (error) {
          console.error('[toggle] unsubscribe error:', error)
          throw error
        }
        console.log('[toggle] unsubscribed from', zoneName)
        showConfirm(zoneName, `✗ Unsubscribed from ${zoneName}`, 'var(--muted)')
      } else {
        // Subscribe — INSERT policy is WITH CHECK (true), works for all users
        const { error } = await supabase
          .from('zone_alerts')
          .upsert({ email, zone_name: zoneName }, { onConflict: 'email,zone_name' })
        if (error) {
          console.error('[toggle] subscribe error:', error)
          throw error
        }
        console.log('[toggle] subscribed to', zoneName)

        // Fire-and-forget confirmation email
        fetch('/api/alerts/confirm-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, zone_name: zoneName, risk_level: riskLevel, risk_score: riskScore }),
        }).catch(() => {})

        showConfirm(zoneName, `✓ Subscribed to ${zoneName} alerts`, '#1a6b3a')
      }
    } catch {
      // Revert optimistic update
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

  async function handleSignOut() {
    await getSupabaseClient().auth.signOut()
    router.replace('/')
  }

  // ── Loading / guard ─────────────────────────────────────────────────────────

  if (session === undefined || (session !== null && loading)) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ ...mono, fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.1em' }}>LOADING...</span>
      </div>
    )
  }

  if (session === null) return null

  const activeCount = Object.keys(subs).length

  // ── Render ──────────────────────────────────────────────────────────────────

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
          <span style={{ ...mono, fontSize: '11px', letterSpacing: '0.04em', color: 'var(--muted)' }}>
            {session.user.email}
          </span>
          <button onClick={handleSignOut} style={{
            ...mono, fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
            background: 'transparent', border: '1px solid var(--rule)', color: 'var(--ink)',
            padding: '6px 14px', cursor: 'pointer', borderRadius: 0,
          }}>
            SIGN OUT
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '56px 48px' }}>

        <div style={{ marginBottom: '48px' }}>
          <SectionLabel label="ALERT SETTINGS" />
          <p style={{ ...body, fontSize: '14px', color: 'var(--muted)', lineHeight: 1.65 }}>
            Manage your zone subscriptions for the Far East → Europe trade lane.
          </p>
        </div>

        {/* Active count */}
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

        {/* Zone rows */}
        {zones.map((zone) => {
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
              {/* Zone name + confirm */}
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

              {/* Live risk badge */}
              <RiskScore level={zone.riskLevel} score={zone.riskScore} />

              {/* Subscribe / Unsubscribe */}
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

        {/* Account */}
        <div style={{ marginTop: '56px' }}>
          <SectionLabel label="ACCOUNT" />
          <div style={{ border: '1px solid var(--rule)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                SIGNED IN AS
              </div>
              <div style={{ ...mono, fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>
                {session.user.email}
              </div>
            </div>
            <button onClick={handleSignOut} style={{
              ...mono, fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              background: 'transparent', border: '1px solid var(--rule)', color: 'var(--ink)',
              padding: '8px 18px', cursor: 'pointer', borderRadius: 0,
            }}>
              SIGN OUT
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
