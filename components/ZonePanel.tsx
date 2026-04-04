import RiskScore from '@/components/RiskScore'
import type { Zone } from '@/lib/mapdata'

interface NewsItem {
  date: string
  headline: string
  source: string
  severity: number
}

const PLACEHOLDER_NEWS: NewsItem[] = [
  { date: 'APR 03', headline: 'Major insurers suspend war-risk coverage for transits', source: 'Lloyd\'s Market Bulletin', severity: 9 },
  { date: 'APR 02', headline: 'Container carriers announce indefinite route suspension', source: 'Alphaliner', severity: 8 },
  { date: 'APR 01', headline: 'IMO issues urgent navigational warning to mariners', source: 'Maritime Executive', severity: 7 },
]

function severityColor(s: number) {
  if (s >= 8) return '#c0392b'
  if (s >= 5) return '#b8680a'
  return '#1a6b3a'
}

interface Props {
  zone: Zone | null
  onClose: () => void
}

export default function ZonePanel({ zone, onClose }: Props) {
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
              <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.16em', color: 'var(--muted)', textTransform: 'uppercase' }}>
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

            <h2 style={{ fontFamily: 'var(--mono)', fontSize: '18px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '12px', lineHeight: 1.2 }}>
              {zone.name}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <RiskScore level={zone.riskLevel} score={zone.riskScore} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)' }}>
                Updated Apr 03, 2026
              </span>
            </div>
          </div>

          {/* Description */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--rule)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              SITUATION
            </div>
            <p style={{ fontFamily: 'var(--body)', fontSize: '13px', color: 'var(--ink)', lineHeight: 1.65 }}>
              {zone.description}
            </p>
          </div>

          {/* Coordinates */}
          <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--rule)', display: 'flex', gap: '24px' }}>
            {[
              { label: 'LAT', value: `${zone.coordinates[1].toFixed(1)}°N` },
              { label: 'LON', value: `${zone.coordinates[0].toFixed(1)}°E` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--ink)', fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* News feed */}
          <div style={{ padding: '16px 24px 0' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
              LATEST INTELLIGENCE
            </div>

            {PLACEHOLDER_NEWS.map((item, i) => (
              <div key={i} style={{ borderTop: '1px solid var(--rule)', padding: '14px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '0.1em', color: 'var(--muted)' }}>
                    {item.date}
                  </span>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: '9px', fontWeight: 600,
                    color: severityColor(item.severity),
                    background: `${severityColor(item.severity)}15`,
                    padding: '1px 6px', borderRadius: '2px',
                  }}>
                    {item.severity}/10
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--body)', fontSize: '13px', color: 'var(--ink)', lineHeight: 1.5, marginBottom: '4px' }}>
                  {item.headline}
                </p>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)' }}>
                  {item.source}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ padding: '20px 24px', marginTop: 'auto', borderTop: '1px solid var(--rule)' }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: '10px' }}>
              GET ALERTS FOR THIS ZONE
            </p>
            <a href="/" style={{
              display: 'block', textAlign: 'center',
              fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
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
