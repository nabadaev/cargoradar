'use client'

import { useEffect, useState } from 'react'
import RiskScore from '@/components/RiskScore'
import { getSupabaseClient } from '@/lib/supabase'
import { HOT_ZONES } from '@/lib/mapdata'
import type { Zone } from '@/lib/mapdata'

interface LiveZone {
  id: string
  name: string
  risk_score: number
  risk_level: string
}

export default function LiveRiskWidget() {
  const [zones, setZones] = useState<Zone[]>(HOT_ZONES)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase
      .from('zones')
      .select('id, name, risk_score, risk_level')
      .then(result => {
        const data = result.data
        if (data && data.length > 0) {
          const live = data as LiveZone[]
          setZones(
            HOT_ZONES.map(z => {
              const match = live.find(d => d.name === z.name)
              return match
                ? { ...z, riskScore: match.risk_score, riskLevel: match.risk_level as Zone['riskLevel'] }
                : z
            })
          )
        }
        setLoaded(true)
      }, () => setLoaded(true))
  }, [])

  return (
    <div style={{ border: '1px solid var(--rule)' }}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--rule)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: '10px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase' as const,
          color: 'var(--muted)',
        }}>
          LIVE RISK OVERVIEW
        </span>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--mono)',
          fontSize: '10px',
          color: 'var(--muted)',
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: loaded ? '#4caa72' : 'var(--muted)',
            display: 'inline-block',
          }} />
          {loaded ? 'LIVE' : 'LOADING'}
        </span>
      </div>

      {zones.map((zone, i) => (
        <div key={zone.id} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '11px 20px',
          borderBottom: i < zones.length - 1 ? '1px solid var(--rule)' : undefined,
        }}>
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            color: 'var(--ink)',
            fontWeight: 500,
          }}>
            {zone.name}
          </span>
          <RiskScore level={zone.riskLevel} score={zone.riskScore} />
        </div>
      ))}
    </div>
  )
}
