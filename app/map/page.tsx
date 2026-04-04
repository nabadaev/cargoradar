'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import ZonePanel from '@/components/ZonePanel'
import type { HotZone } from '@/lib/mapdata'

// Mapbox requires client-only rendering — no SSR
const MapView = dynamic(() => import('@/components/Map/MapView'), { ssr: false })

function MapNav({ search, onSearch }: { search: string; onSearch: (v: string) => void }) {
  return (
    <nav style={{
      height: '56px',
      background: '#fff',
      borderBottom: '1px solid var(--rule)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '20px',
      flexShrink: 0,
      zIndex: 10,
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red)', flexShrink: 0, display: 'inline-block' }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink)' }}>
          CARGORADAR
        </span>
      </Link>

      <div style={{ width: '1px', height: '20px', background: 'var(--rule)' }} />

      <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.16em', color: 'var(--muted)', textTransform: 'uppercase' }}>
        RISK MAP
      </span>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', border: '1px solid var(--rule)', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', padding: '0 10px', letterSpacing: '0.06em' }}>
          SEARCH
        </span>
        <div style={{ width: '1px', height: '28px', background: 'var(--rule)' }} />
        <input
          type="text"
          placeholder="Port, zone, lane..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            color: 'var(--ink)',
            padding: '7px 12px',
            width: '200px',
          }}
        />
      </div>

      <Link href="/" style={{
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.12em',
        color: '#fff',
        background: 'var(--ink)',
        padding: '7px 16px',
        textDecoration: 'none',
        textTransform: 'uppercase',
      }}>
        JOIN WAITLIST
      </Link>
    </nav>
  )
}

export default function MapPage() {
  const [selectedZone, setSelectedZone] = useState<HotZone | null>(null)
  const [search, setSearch] = useState('')

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <MapNav search={search} onSearch={setSearch} />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MapView onZoneClick={setSelectedZone} />
        <ZonePanel zone={selectedZone} onClose={() => setSelectedZone(null)} />
      </div>
    </div>
  )
}
