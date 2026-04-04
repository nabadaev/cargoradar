export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

const styles: Record<RiskLevel, { bg: string; color: string; label: string }> = {
  critical: { bg: 'rgba(192,57,43,0.10)',  color: '#c0392b', label: 'CRITICAL' },
  high:     { bg: 'rgba(184,104,10,0.10)', color: '#b8680a', label: 'HIGH' },
  medium:   { bg: 'rgba(184,104,10,0.10)', color: '#b8680a', label: 'MEDIUM' },
  low:      { bg: 'rgba(26,107,58,0.10)',  color: '#1a6b3a', label: 'LOW' },
}

export default function RiskScore({ level, score }: { level: RiskLevel; score: number }) {
  const s = styles[level]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: s.bg,
      color: s.color,
      borderRadius: '2px',
      fontFamily: 'var(--mono)',
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.08em',
      padding: '3px 8px',
    }}>
      {s.label} {score.toFixed(1)}
    </span>
  )
}
