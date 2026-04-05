'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { ZONES, TRADE_LANES } from '@/lib/mapdata'
import { getSupabaseClient } from '@/lib/supabase'
import type { Zone } from '@/lib/mapdata'

// Risk colors — aligned with ZonePanel and design system
const RISK_COLOR: Record<string, string> = {
  critical: '#c0392b',
  high:     '#b8680a',
  medium:   '#b8680a',
  low:      '#1a6b3a',
}

const riskMatch = (colors: Record<string, string>) => [
  'match', ['get', 'riskLevel'],
  'critical', colors.critical,
  'high',     colors.high,
  'medium',   colors.medium,
  'low',      colors.low,
  '#6e6e6e',
]

// Build GeoJSON FeatureCollection for hot zones,
// merging live scores from Supabase over the static defaults
function buildZoneGeoJSON(
  liveScores: Record<string, { risk_score: number; risk_level: string }>,
) {
  return {
    type: 'FeatureCollection' as const,
    features: ZONES.map(z => {
      const live = liveScores[z.name]
      return {
        type: 'Feature' as const,
        properties: {
          id:        z.id,
          name:      z.name,
          riskLevel: live?.risk_level ?? z.riskLevel,
          riskScore: live?.risk_score ?? z.riskScore,
        },
        geometry: { type: 'Point' as const, coordinates: z.coordinates },
      }
    }),
  }
}

interface Props {
  onZoneClick: (zone: Zone) => void
}

export default function MapView({ onZoneClick }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<mapboxgl.Map | null>(null)
  const callbackRef   = useRef(onZoneClick)
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { callbackRef.current = onZoneClick })

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [40.0, 10.0],
      zoom: 2.0,
      projection: { name: 'mercator' },
      attributionControl: false,
    })

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left')
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')

    mapRef.current = map

    // Fetch live zone scores from Supabase and update the map source
    async function refreshZoneScores() {
      if (!mapRef.current) return
      try {
        const supabase = getSupabaseClient()
        const { data } = await supabase
          .from('zones')
          .select('name, risk_score, risk_level')

        const liveScores: Record<string, { risk_score: number; risk_level: string }> = {}
        if (data) {
          for (const row of data) {
            liveScores[row.name] = { risk_score: row.risk_score, risk_level: row.risk_level }
          }
        }

        const source = mapRef.current.getSource('hot-zones') as mapboxgl.GeoJSONSource | undefined
        if (source) {
          source.setData(buildZoneGeoJSON(liveScores))
        }
      } catch {
        // Silently continue — map will retain last known data
      }
    }

    map.on('load', () => {
      // ── Trade lane lines ──────────────────────────────────────
      map.addSource('trade-lanes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: TRADE_LANES.map(lane => ({
            type: 'Feature' as const,
            properties: { id: lane.id, riskLevel: lane.riskLevel },
            geometry: { type: 'LineString' as const, coordinates: lane.coordinates },
          })),
        },
      })

      map.addLayer({
        id: 'trade-lanes-line',
        type: 'line',
        source: 'trade-lanes',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-width': 1.5,
          'line-dasharray': [3, 2],
          'line-opacity': 0.55,
          'line-color': riskMatch(RISK_COLOR) as mapboxgl.Expression,
        },
      })

      // ── Hot zone circles — initialise with static data ────────
      map.addSource('hot-zones', {
        type: 'geojson',
        data: buildZoneGeoJSON({}),   // static defaults; refreshed immediately below
      })

      map.addLayer({
        id: 'hot-zones-mist-outer',
        type: 'circle',
        source: 'hot-zones',
        paint: {
          'circle-radius': 52,
          'circle-color': riskMatch(RISK_COLOR) as mapboxgl.Expression,
          'circle-opacity': 0.06,
          'circle-blur': 1,
        },
      })

      map.addLayer({
        id: 'hot-zones-mist-mid',
        type: 'circle',
        source: 'hot-zones',
        paint: {
          'circle-radius': 34,
          'circle-color': riskMatch(RISK_COLOR) as mapboxgl.Expression,
          'circle-opacity': 0.12,
          'circle-blur': 0.8,
        },
      })

      map.addLayer({
        id: 'hot-zones-mist-core',
        type: 'circle',
        source: 'hot-zones',
        paint: {
          'circle-radius': 18,
          'circle-color': riskMatch(RISK_COLOR) as mapboxgl.Expression,
          'circle-opacity': 0.35,
          'circle-blur': 0.5,
        },
      })

      // Risk score label
      map.addLayer({
        id: 'hot-zones-scores',
        type: 'symbol',
        source: 'hot-zones',
        layout: {
          'text-field': ['number-format', ['get', 'riskScore'], { 'min-fraction-digits': 1, 'max-fraction-digits': 1 }] as mapboxgl.Expression,
          'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': riskMatch(RISK_COLOR) as mapboxgl.Expression,
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      })

      // ── Interaction ───────────────────────────────────────────
      for (const layerId of ['hot-zones-mist-outer', 'hot-zones-mist-mid', 'hot-zones-mist-core']) {
        map.on('click', layerId, e => {
          const props = e.features?.[0]?.properties
          if (!props) return
          const zone = ZONES.find(z => z.id === props.id)
          if (zone) callbackRef.current(zone)
        })
        map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = '' })
      }

      // ── Fetch live scores immediately, then every 5 minutes ───
      refreshZoneScores()
      intervalRef.current = setInterval(refreshZoneScores, 5 * 60 * 1000)
    })

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      map.remove()
      mapRef.current = null
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
