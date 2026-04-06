'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { useSession } from '@/lib/auth'
import RiskScore from '@/components/RiskScore'
import { ZONES } from '@/lib/mapdata'
import type { RiskLevel } from '@/lib/mapdata'

const mono: React.CSSProperties = { fontFamily: 'var(--mono)' }
const body: React.CSSProperties = { fontFamily: 'var(--body)' }

type AlertFreq = 'instant' | 'daily' | 'weekly'

interface SubEntry { freq: AlertFreq }
type SubMap = Record<string, SubEntry>

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
  const session   = useSession()
  const router    = useRouter()
  // Use user ID string as dep — stable across renders, prevents fetch loop
  const userId    = session?.user?.id
  const userEmail = session?.user?.email ?? ''

  const [subs, setSubs]         = useState<SubMap>({})
  const [loading, setLoading]   = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [toggling, setToggling] = useState<Record<string, boolean>>({})
  const [confirms, setConfirms] = useState<Record<string, Confirm>>({})

  // Track fade timers so we can clear on unmount — never leak
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Auth guard — only redirect once we know session is definitely null
  useEffect(() => {
    if (session === null) router.replace('/login')
  }, [session, router])

  // Fetch subscriptions ONCE when userId is known
  // userId is a string — stable reference, won't cause loops
  useEffect(() => {
    if (!userId) return
    let cancelled = false

    getSupabaseClient()
      .from('user_subscriptions')
      .select('zone_name, alert_frequency')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setFetchError('Failed to load subscriptions. Refresh to retry.')
          setLoading(false)
          return
        }
        const map: SubMap = {}
        for (const row of data ?? []) {
          map[row.zone_name] = { freq: row.alert_frequency as AlertFreq }
        }
        setSubs(map)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [userId]) // ← string dep, not object — no infinite loop

  // Cleanup all fade timers on unmount
  useEffect(() => {
    const t = timers.current
    return () => { for (const id of Object.values(t)) clearTimeout(id) }
  }, [])

  function showConfirm(zoneName: string, msg: string, color: string) {
    if (timers.current[zoneName]) clearTimeout(timers.current[zoneName])
    setConfirms(prev => ({ ...prev, [zoneName]: { msg, color } }))
    timers.current[zoneName] = setTimeout(() => {
      setConfirms(prev => {
        const next = { ...prev }
        delete next[zoneName]
        return next
      })
    }, 3000)
  }

  async function toggle(zoneName: string, riskLevel: RiskLevel, riskScore: number) {
    if (!userId) return
    const wasSubscribed = !!subs[zoneName]

    // Optimistic update — update UI immediately, revert if API fails
    setSubs(prev => {
      const next = { ...prev }
      if (wasSubscribed) { delete next[zoneName] }
      else { next[zoneName] = { freq: 'instant' } }
      return next
    })
    setToggling(t => ({ ...t, [zoneName]: true }))

    try {
      const supabase = getSupabaseClient()

      if (wasSubscribed) {
        const { error } = await supabase
          .from('user_subscriptions')
          .delete()
          .eq('zone_name', zoneName)
          .eq('user_id', userId)
        if (error) throw error

        // Remove from zone_alerts too (cron compatibility)
        await supabase
          .from('zone_alerts')
          .delete()
          .eq('zone_name', zoneName)
          .eq('email', userEmail)

        showConfirm(zoneName, `✗ Unsubscribed from ${zoneName}`, 'var(--muted)')
      } else {
        const { error } = await supabase
          .from('user_subscriptions')
          .insert({ user_id: userId, zone_name: zoneName, alert_frequency: 'instant' })
        if (error) throw error

        // Upsert into zone_alerts for cron alert delivery
        if (userEmail) {
          await supabase
            .from('zone_alerts')
            .upsert({ email: userEmail, zone_name: zoneName }, { onConflict: 'email,zone_name' })
        }

        // Fire-and-forget confirmation email — never block UI on this
        if (userEmail) {
          fetch('/api/alerts/confirm-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, zone_name: zoneName, risk_level: riskLevel, risk_score: riskScore }),
          }).catch(() => {})
        }

        showConfirm(zoneName, `✓ Subscribed to ${zoneName} alerts`, '#1a6b3a')
      }
    } catch {
      // Revert optimistic update on failure
      setSubs(prev => {
        const next = { ...prev }
        if (wasSubscribed) { next[zoneName] = { freq: 'instant' } }
        else { delete next[zoneName] }
        return next
      })
      showConfirm(zoneName, 'Error — please try again', 'var(--red)')
    } finally {
      setToggling(t => ({ ...t, [zoneName]: false }))
    }
  }

  async function changeFreq(zoneName: string, freq: AlertFreq) {
    if (!userId) return
    // Optimistic
    setSubs(prev => ({ ...prev, [zoneName]: { ...prev[zoneName], freq } }))
    await getSupabaseClient()
      .from('user_subscriptions')
      .update({ alert_frequency: freq })
      .eq('zone_name', zoneName)
      .eq('user_id', userId)
  }

  async function handleSignOut() {
    await getSupabaseClient().auth.signOut()
    router.replace('/')
  }

  // ── Loading & guard states ──────────────────────────────────────────────────

  if (session === undefined || (session !== null && loading)) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ ...mono, fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.1em' }}>LOADING...</span>
      </div>
    )
  }

  if (session === null) return null // redirecting

  const activeCount = Object.keys(subs).length

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>

      {/* ── Nav ── */}
      <nav style={{
        height: '56px',
        borderBottom: '1px solid var(--rule)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 48px',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: '#fff',
        zIndex: 10,
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
            {userEmail}
          </span>
          <button
            onClick={handleSignOut}
            style={{
              ...mono, fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
              background: 'transparent', border: '1px solid var(--rule)', color: 'var(--ink)',
              padding: '6px 14px', cursor: 'pointer', borderRadius: 0,
            }}
          >
            SIGN OUT
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '56px 48px' }}>

        {/* Page header */}
        <div style={{ marginBottom: '48px' }}>
          <SectionLabel label="ALERT SETTINGS" />
          <p style={{ ...body, fontSize: '14px', color: 'var(--muted)', lineHeight: 1.65 }}>
            Manage your zone subscriptions for the Far East → Europe trade lane.
          </p>
        </div>

        {/* Active count strip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0',
          borderBottom: '1px solid var(--rule)',
          marginBottom: '8px',
        }}>
          <span style={{ ...mono, fontSize: '10px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase' }}>
            {activeCount > 0 ? `${activeCount} ACTIVE SUBSCRIPTION${activeCount !== 1 ? 'S' : ''}` : 'NO ACTIVE SUBSCRIPTIONS'}
          </span>
          <span style={{ ...mono, fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.08em' }}>
            ZONE · RISK · STATUS
          </span>
        </div>

        {/* Error state */}
        {fetchError && (
          <div style={{ ...mono, fontSize: '12px', color: 'var(--red)', padding: '16px 0' }}>
            {fetchError}
          </div>
        )}

        {/* Zone rows */}
        {!fetchError && ZONES.map((zone) => {
          const subscribed  = !!subs[zone.name]
          const isToggling  = toggling[zone.name] ?? false
          const confirm     = confirms[zone.name]
          const freq        = subs[zone.name]?.freq ?? 'instant'

          return (
            <div
              key={zone.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 0',
                borderBottom: '1px solid var(--rule)',
              }}
            >
              {/* Zone name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...mono, fontSize: '12px', fontWeight: 500, color: 'var(--ink)', marginBottom: '2px' }}>
                  {zone.name}
                </div>
                {/* Inline confirmation message */}
                {confirm && (
                  <div style={{ ...mono, fontSize: '10px', color: confirm.color, letterSpacing: '0.04em', marginTop: '2px' }}>
                    {confirm.msg}
                  </div>
                )}
              </div>

              {/* Risk badge */}
              <div style={{ flexShrink: 0 }}>
                <RiskScore level={zone.riskLevel} score={zone.riskScore} />
              </div>

              {/* Frequency selector — only when subscribed */}
              {subscribed && (
                <select
                  value={freq}
                  onChange={e => changeFreq(zone.name, e.target.value as AlertFreq)}
                  style={{
                    ...mono, fontSize: '10px', color: 'var(--ink)',
                    background: 'var(--white)', border: '1px solid var(--rule)',
                    padding: '5px 8px', cursor: 'pointer', outline: 'none',
                    appearance: 'auto', flexShrink: 0,
                  }}
                >
                  <option value="instant">Instant</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              )}

              {/* Subscribe / Unsubscribe toggle */}
              <button
                onClick={() => toggle(zone.name, zone.riskLevel, zone.riskScore)}
                disabled={isToggling}
                style={{
                  ...mono,
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                  padding: '7px 16px',
                  borderRadius: 0,
                  cursor: isToggling ? 'default' : 'pointer',
                  opacity: isToggling ? 0.5 : 1,
                  // Subscribed: black fill. Not subscribed: outlined.
                  background: subscribed ? 'var(--ink)' : 'transparent',
                  color: subscribed ? '#fff' : 'var(--ink)',
                  border: subscribed ? '1px solid var(--ink)' : '1px solid var(--rule)',
                }}
              >
                {isToggling ? '...' : subscribed ? 'SUBSCRIBED' : 'SUBSCRIBE'}
              </button>
            </div>
          )
        })}

        {/* Account section */}
        <div style={{ marginTop: '56px' }}>
          <SectionLabel label="ACCOUNT" />
          <div style={{ border: '1px solid var(--rule)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                SIGNED IN AS
              </div>
              <div style={{ ...mono, fontSize: '13px', fontWeight: 500, color: 'var(--ink)' }}>
                {userEmail}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              style={{
                ...mono, fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'transparent', border: '1px solid var(--rule)', color: 'var(--ink)',
                padding: '8px 18px', cursor: 'pointer', borderRadius: 0,
              }}
            >
              SIGN OUT
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
