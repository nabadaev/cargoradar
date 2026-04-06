import Link from 'next/link'
import RiskScore from '@/components/RiskScore'
import WaitlistForm from '@/components/WaitlistForm'
import LiveRiskWidget from '@/components/LiveRiskWidget'
import { HOT_ZONES } from '@/lib/mapdata'
import { createServiceClient } from '@/lib/supabase'
import type { Zone } from '@/lib/mapdata'

// ─── Ticker ──────────────────────────────────────────────────────────────────

interface TickerZone {
  name: string
  riskScore: number
  riskLevel: string
}

function Ticker({ zones }: { zones: TickerZone[] }) {
  const items = zones.map(z => ({
    name: z.name.toUpperCase(),
    score: z.riskScore,
    level: z.riskLevel,
  }))

  const scoreColor = (level: string) => {
    if (level === 'critical') return '#e05c4b'
    if (level === 'high')     return '#d4913a'
    if (level === 'medium')   return '#d4913a'
    return '#4caa72'
  }

  const content = [...items, ...items] // double for seamless loop

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '32px',
      background: 'var(--ink)',
      zIndex: 100,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div className="ticker-track" style={{ display: 'flex', alignItems: 'center' }}>
        {content.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', paddingRight: '64px', flexShrink: 0 }}>
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>
              {item.name}
            </span>
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              letterSpacing: '0.06em',
              color: scoreColor(item.level),
              marginLeft: '8px',
              fontWeight: 600,
            }}>
              {item.score.toFixed(1)}
            </span>
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.35)',
              margin: '0 24px 0 24px',
            }}>
              /
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav style={{
      position: 'fixed',
      top: '32px',
      left: 0,
      right: 0,
      height: '56px',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--rule)',
      zIndex: 90,
      display: 'flex',
      alignItems: 'center',
      padding: '0 48px',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--red)',
          display: 'inline-block',
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'var(--ink)',
        }}>
          CARGORADAR
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link href="/login" style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          letterSpacing: '0.1em',
          color: 'var(--muted)',
          textDecoration: 'none',
          textTransform: 'uppercase',
        }}>
          SIGN IN
        </Link>
        <Link href="/map" style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          color: '#fff',
          background: 'var(--ink)',
          padding: '10px 18px',
          textDecoration: 'none',
          textTransform: 'uppercase',
        }}>
          VIEW MAP
        </Link>
      </div>
    </nav>
  )
}

// ─── Section header ──────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '56px' }}>
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: '10px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--rule)' }} />
    </div>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'DAILY INTELLIGENCE',
      body: 'RSS feeds from 8 maritime sources analysed by AI every evening. New incidents scored and categorised automatically.',
    },
    {
      num: '02',
      title: 'CMRS SCORING',
      body: "The CargoRadar Maritime Risk Score applies Caldara & Iacoviello's GPR methodology — the same framework used by the Federal Reserve — adapted for ocean freight.",
    },
    {
      num: '03',
      title: 'INSTANT ALERTS',
      body: 'Subscribe to any hot zone. Get emailed the moment risk escalates — with AI-generated impact analysis specific to your trade lane.',
    },
  ]

  return (
    <section style={{ padding: '80px 48px', maxWidth: '1100px', margin: '0 auto' }}>
      <SectionLabel label="HOW IT WORKS" />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        borderTop: '1px solid var(--rule)',
        borderLeft: '1px solid var(--rule)',
      }}>
        {steps.map(s => (
          <div key={s.num} style={{
            borderRight: '1px solid var(--rule)',
            borderBottom: '1px solid var(--rule)',
            padding: '36px 32px',
          }}>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              color: 'var(--muted)',
              letterSpacing: '0.14em',
              marginBottom: '8px',
            }}>
              {s.num}
            </div>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--ink)',
              marginTop: '8px',
              marginBottom: '8px',
            }}>
              {s.title}
            </div>
            <div style={{
              fontFamily: 'var(--body)',
              fontSize: '13px',
              color: 'var(--muted)',
              lineHeight: 1.65,
              marginTop: '8px',
            }}>
              {s.body}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Features grid ───────────────────────────────────────────────────────────

const FEATURES = [
  { label: '01', title: 'Live Risk Scores', body: 'Every critical choke point on the Far East → Europe route scored 1–10, updated daily from verified sources.' },
  { label: '02', title: 'AI Impact Analysis', body: 'Claude reads the noise so you don\'t have to. Plain-language impact for every alert on your lane.' },
  { label: '03', title: 'Trade Lane Tracking', body: 'Far East → Europe via Cape of Good Hope — monitor the chokepoints that affect your cargo directly.' },
  { label: '04', title: 'Instant Alerts', body: 'Email notification the moment severity spikes on any zone you follow.' },
  { label: '05', title: 'Weekly Digest', body: 'A clean summary every Monday of what moved, what changed, and what to watch.' },
  { label: '06', title: 'Interactive Map', body: 'Mapbox-powered world map. Click any hot zone to pull the full intelligence brief.' },
]

function FeaturesGrid() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      borderTop: '1px solid var(--rule)',
      borderLeft: '1px solid var(--rule)',
    }}>
      {FEATURES.map(f => (
        <div key={f.label} style={{
          borderRight: '1px solid var(--rule)',
          borderBottom: '1px solid var(--rule)',
          padding: '36px 32px',
        }}>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            color: 'var(--muted)',
            letterSpacing: '0.14em',
            marginBottom: '16px',
          }}>
            {f.label}
          </div>
          <div style={{
            fontFamily: 'var(--mono)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: 'var(--ink)',
            marginBottom: '10px',
          }}>
            {f.title}
          </div>
          <div style={{
            fontFamily: 'var(--body)',
            fontSize: '14px',
            color: 'var(--muted)',
            lineHeight: 1.6,
          }}>
            {f.body}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Zones table ─────────────────────────────────────────────────────────────

function ZonesTable({ zones }: { zones: Zone[] }) {
  return (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      border: '1px solid var(--rule)',
      fontFamily: 'var(--mono)',
      fontSize: '12px',
    }}>
      <thead>
        <tr>
          {['Zone', 'Region', 'Risk Level', 'Score'].map(h => (
            <th key={h} style={{
              background: 'var(--off)',
              padding: '10px 16px',
              textAlign: 'left',
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              fontWeight: 500,
              borderBottom: '1px solid var(--rule)',
            }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {zones.map((zone, i) => {
          const region = zoneRegion(zone.id)
          return (
            <tr key={zone.id} style={{ background: i % 2 === 0 ? 'var(--white)' : 'transparent' }}>
              <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--rule)', color: 'var(--ink)', fontWeight: 500 }}>
                {zone.name}
              </td>
              <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--rule)', color: 'var(--muted)' }}>
                {region}
              </td>
              <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--rule)' }}>
                <RiskScore level={zone.riskLevel} score={zone.riskScore} />
              </td>
              <td style={{ padding: '13px 16px', borderBottom: '1px solid var(--rule)', color: 'var(--ink)', fontWeight: 600 }}>
                {zone.riskScore.toFixed(1)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function zoneRegion(id: string): string {
  const map: Record<string, string> = {
    'red-sea':       'Middle East / Africa',
    'hormuz':        'Middle East',
    'panama':        'Central America',
    'suez':          'North Africa',
    'malacca':       'Southeast Asia',
    'taiwan-strait': 'East Asia',
    'black-sea':     'Eastern Europe',
    'rotterdam':     'Northwest Europe',
    'shanghai':      'East Asia',
    'la-lb':         'North America',
  }
  return map[id] || '—'
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{ padding: '80px 48px 100px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '80px', alignItems: 'start' }}>

        {/* Left — headline + form */}
        <div className="fade-up fade-up-1">
          <div style={{
            display: 'inline-block',
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            border: '1px solid var(--rule)',
            padding: '4px 10px',
            marginBottom: '32px',
          }}>
            OCEAN FREIGHT INTELLIGENCE
          </div>

          <h1 style={{
            fontFamily: 'var(--mono)',
            fontSize: 'clamp(48px, 6vw, 80px)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-3px',
            color: 'var(--ink)',
            marginBottom: '24px',
          }}>
            Know before it hits<br />your shipment.
          </h1>

          <p style={{
            fontFamily: 'var(--body)',
            fontSize: '16px',
            color: 'var(--muted)',
            lineHeight: 1.65,
            marginBottom: '40px',
            maxWidth: '420px',
          }}>
            CargoRadar monitors the Far East → Europe trade lane in real time — tracking the Red Sea crisis, Cape of Good Hope diversion, Strait of Hormuz tensions, and every chokepoint in between. Know before it hits your shipment.
          </p>

          <WaitlistForm />

          <p style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            color: 'var(--muted)',
            letterSpacing: '0.06em',
            marginTop: '14px',
          }}>
            FREE DURING EARLY ACCESS · NO SPAM
          </p>
        </div>

        {/* Right — live risk panel (client component) */}
        <div className="fade-up fade-up-2">
          <LiveRiskWidget />
        </div>
      </div>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  // Fetch live zone data server-side for ticker and zones table
  let liveZones: Zone[] = HOT_ZONES
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('zones').select('name, risk_score, risk_level')
    if (data && data.length > 0) {
      liveZones = HOT_ZONES.map(z => {
        const live = data.find((d: { name: string; risk_score: number; risk_level: string }) => d.name === z.name)
        return live ? { ...z, riskScore: live.risk_score, riskLevel: live.risk_level as Zone['riskLevel'] } : z
      })
    }
  } catch {
    // fall back to static data
  }

  return (
    <>
      <Ticker zones={liveZones} />
      <Nav />

      <div style={{ paddingTop: '88px' /* ticker 32px + nav 56px */ }}>

        <Hero />

        {/* How It Works section */}
        <HowItWorks />

        {/* Features section */}
        <section style={{ padding: '100px 48px', maxWidth: '1100px', margin: '0 auto' }}>
          <SectionLabel label="PLATFORM CAPABILITIES" />
          <FeaturesGrid />
        </section>

        {/* Zones section */}
        <section style={{ padding: '0 48px 100px', maxWidth: '1100px', margin: '0 auto' }}>
          <SectionLabel label="MONITORED HOT ZONES" />
          <ZonesTable zones={liveZones} />
        </section>

        {/* Bottom CTA */}
        <section style={{
          background: 'var(--ink)',
          padding: '80px 48px',
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '48px' }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--mono)',
                fontSize: 'clamp(20px, 3vw, 32px)',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.01em',
                marginBottom: '12px',
              }}>
                Don&apos;t get caught off guard.
              </h2>
              <p style={{
                fontFamily: 'var(--body)',
                fontSize: '15px',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6,
              }}>
                Join freight professionals who use CargoRadar to stay ahead of disruptions before they hit their shipments.
              </p>
            </div>
            <div style={{ minWidth: '320px' }}>
              <WaitlistForm />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          padding: '24px 48px',
          borderTop: '1px solid var(--rule)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} />
            CARGORADAR
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em' }}>
            OCEAN FREIGHT INTELLIGENCE · {new Date().getFullYear()}
          </span>
        </footer>

      </div>
    </>
  )
}
