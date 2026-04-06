'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { useSession } from '@/lib/auth'
import { ZONES } from '@/lib/mapdata'

const mono: React.CSSProperties = { fontFamily: 'var(--mono)' }
const body: React.CSSProperties = { fontFamily: 'var(--body)' }

const RISK_COLOR: Record<string, string> = {
  critical: '#c0392b',
  high:     '#b8680a',
  medium:   '#b8680a',
  low:      '#1a6b3a',
}

const RISK_BG: Record<string, string> = {
  critical: 'rgba(192,57,43,0.07)',
  high:     'rgba(184,104,10,0.07)',
  medium:   'rgba(184,104,10,0.05)',
  low:      'rgba(26,107,58,0.07)',
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
      <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--rule)' }} />
    </div>
  )
}

type AlertFreq = 'instant' | 'daily' | 'weekly'

interface Subscription {
  zone_name: string
  alert_frequency: AlertFreq
}

export default function SettingsPage() {
  const session = useSession()
  const router  = useRouter()

  const [subscriptions, setSubscriptions]       = useState<Subscription[]>([])
  const [subLoading, setSubLoading]             = useState(true)
  const [toggling, setToggling]                 = useState<Record<string, boolean>>({})
  const [freqChanging, setFreqChanging]         = useState<Record<string, boolean>>({})

  // Auth guard
  useEffect(() => {
    if (session === null) {
      router.replace('/login')
    }
  }, [session, router])

  // Load subscriptions
  useEffect(() => {
    if (!session) return
    const supabase = getSupabaseClient()
    supabase
      .from('user_subscriptions')
      .select('zone_name, alert_frequency')
      .then(({ data }) => {
        setSubscriptions(data ?? [])
        setSubLoading(false)
      })
  }, [session])

  function isSubscribed(zoneName: string) {
    return subscriptions.some(s => s.zone_name === zoneName)
  }

  function getFrequency(zoneName: string): AlertFreq {
    return subscriptions.find(s => s.zone_name === zoneName)?.alert_frequency as AlertFreq ?? 'instant'
  }

  async function toggleSubscription(zoneName: string) {
    if (!session) return
    setToggling(t => ({ ...t, [zoneName]: true }))
    const supabase = getSupabaseClient()

    if (isSubscribed(zoneName)) {
      // Unsubscribe
      await supabase
        .from('user_subscriptions')
        .delete()
        .eq('zone_name', zoneName)
        .eq('user_id', session.user.id)

      // Also remove from zone_alerts
      await supabase
        .from('zone_alerts')
        .delete()
        .eq('zone_name', zoneName)
        .eq('email', session.user.email)

      setSubscriptions(prev => prev.filter(s => s.zone_name !== zoneName))
    } else {
      // Subscribe
      const email = session.user.email ?? ''
      await supabase.from('user_subscriptions').insert({
        user_id: session.user.id,
        zone_name: zoneName,
        alert_frequency: 'instant',
      })

      // Also ensure entry in zone_alerts for cron compatibility
      if (email) {
        await supabase.from('zone_alerts').upsert(
          { email, zone_name: zoneName },
          { onConflict: 'email,zone_name' },
        )
      }

      setSubscriptions(prev => [...prev, { zone_name: zoneName, alert_frequency: 'instant' }])
    }

    setToggling(t => ({ ...t, [zoneName]: false }))
  }

  async function changeFrequency(zoneName: string, freq: AlertFreq) {
    if (!session) return
    setFreqChanging(f => ({ ...f, [zoneName]: true }))
    const supabase = getSupabaseClient()
    await supabase
      .from('user_subscriptions')
      .update({ alert_frequency: freq })
      .eq('zone_name', zoneName)
      .eq('user_id', session.user.id)
    setSubscriptions(prev =>
      prev.map(s => s.zone_name === zoneName ? { ...s, alert_frequency: freq } : s),
    )
    setFreqChanging(f => ({ ...f, [zoneName]: false }))
  }

  async function handleSignOut() {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  // Loading states
  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ ...mono, fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.1em' }}>LOADING...</span>
      </div>
    )
  }

  if (session === null) return null // redirecting

  const subscribedZones   = ZONES.filter(z => isSubscribed(z.name))
  const subscribedCount   = subscribedZones.length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>

      {/* Nav */}
      <nav style={{
        height: '56px',
        borderBottom: '1px solid var(--rule)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 48px',
        justifyContent: 'space-between',
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
          <span style={{ ...mono, fontSize: '11px', letterSpacing: '0.06em', color: 'var(--muted)' }}>
            {session.user.email}
          </span>
          <button
            onClick={handleSignOut}
            style={{
              ...mono,
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: 'transparent',
              border: '1px solid var(--rule)',
              color: 'var(--ink)',
              padding: '6px 14px',
              cursor: 'pointer',
            }}
          >
            SIGN OUT
          </button>
        </div>
      </nav>

      {/* Page content */}
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '56px 48px' }}>

        {/* Page header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
            PREFERENCES
          </div>
          <h1 style={{ ...mono, fontSize: '24px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Zone Alerts
          </h1>
          <p style={{ ...body, fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
            Subscribe to zones to receive email alerts when the risk level escalates.
            {subscribedCount > 0 && ` You are tracking ${subscribedCount} zone${subscribedCount !== 1 ? 's' : ''}.`}
          </p>
        </div>

        {/* Summary strip */}
        {subscribedCount > 0 && (
          <div style={{
            border: '1px solid var(--rule)',
            background: 'var(--off)',
            padding: '14px 20px',
            marginBottom: '36px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <span style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              ACTIVE SUBSCRIPTIONS
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--rule)' }} />
            {subscribedZones.map(z => (
              <span key={z.id} style={{
                ...mono,
                fontSize: '10px',
                color: RISK_COLOR[z.riskLevel],
                background: RISK_BG[z.riskLevel],
                padding: '3px 8px',
                borderRadius: '2px',
                fontWeight: 600,
              }}>
                {z.name.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Zone list */}
        <SectionHeader label="ALL MONITORED ZONES" />

        {subLoading ? (
          <div style={{ ...mono, fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.08em' }}>Loading...</div>
        ) : (
          <div style={{ border: '1px solid var(--rule)' }}>
            {ZONES.map((zone, i) => {
              const subscribed = isSubscribed(zone.name)
              const freq       = getFrequency(zone.name)
              const isToggling = toggling[zone.name] ?? false

              return (
                <div
                  key={zone.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '16px 20px',
                    borderBottom: i < ZONES.length - 1 ? '1px solid var(--rule)' : 'none',
                    background: subscribed ? 'var(--off)' : 'var(--white)',
                  }}
                >
                  {/* Risk badge */}
                  <span style={{
                    ...mono,
                    fontSize: '9px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: RISK_COLOR[zone.riskLevel],
                    background: RISK_BG[zone.riskLevel],
                    padding: '3px 7px',
                    borderRadius: '2px',
                    flexShrink: 0,
                    minWidth: '60px',
                    textAlign: 'center',
                  }}>
                    {zone.riskLevel.toUpperCase()}
                  </span>

                  {/* Zone name + score */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...mono, fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '2px' }}>
                      {zone.name}
                    </div>
                    <div style={{ ...mono, fontSize: '10px', color: 'var(--muted)' }}>
                      Score {zone.riskScore.toFixed(1)} / 10
                    </div>
                  </div>

                  {/* Alert frequency (only when subscribed) */}
                  {subscribed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ ...mono, fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        ALERTS:
                      </span>
                      <select
                        value={freq}
                        onChange={e => changeFrequency(zone.name, e.target.value as AlertFreq)}
                        disabled={freqChanging[zone.name]}
                        style={{
                          ...mono,
                          fontSize: '10px',
                          color: 'var(--ink)',
                          background: 'var(--white)',
                          border: '1px solid var(--rule)',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          outline: 'none',
                          appearance: 'auto',
                        }}
                      >
                        <option value="instant">Instant</option>
                        <option value="daily">Daily Digest</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  )}

                  {/* Toggle button */}
                  <button
                    onClick={() => toggleSubscription(zone.name)}
                    disabled={isToggling}
                    style={{
                      ...mono,
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      background: subscribed ? 'transparent' : 'var(--ink)',
                      color: subscribed ? 'var(--ink)' : '#fff',
                      border: subscribed ? '1px solid var(--rule)' : '1px solid var(--ink)',
                      padding: '7px 16px',
                      cursor: isToggling ? 'default' : 'pointer',
                      opacity: isToggling ? 0.5 : 1,
                      flexShrink: 0,
                      borderRadius: 0,
                    }}
                  >
                    {isToggling ? '...' : subscribed ? 'UNSUBSCRIBE' : 'SUBSCRIBE'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Account section */}
        <div style={{ marginTop: '56px' }}>
          <SectionHeader label="ACCOUNT" />
          <div style={{ border: '1px solid var(--rule)', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  SIGNED IN AS
                </div>
                <div style={{ ...mono, fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                  {session.user.email}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  ...mono,
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: 'transparent',
                  border: '1px solid var(--rule)',
                  color: 'var(--ink)',
                  padding: '8px 18px',
                  cursor: 'pointer',
                  borderRadius: 0,
                }}
              >
                SIGN OUT
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
