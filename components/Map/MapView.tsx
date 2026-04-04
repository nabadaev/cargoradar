'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { HOT_ZONES, TRADE_LANES } from '@/lib/mapdata'
import type { HotZone } from '@/lib/mapdata'

// DESIGN.md risk colors
const STROKE: Record<string, string> = {
  critical: '#c0392b',
  high:     '#b8680a',
  medium:   '#b8680a',
  low:      '#1a6b3a',
}

const FILL: Record<string, string> = {
  critical: 'rgba(192,57,43,0.08)',
  high:     'rgba(184,104,10,0.08)',
  medium:   'rgba(184,104,10,0.08)',
  low:      'rgba(26,107,58,0.08)',
}

const riskMatch = (colors: Record<string, string>) => [
  'match', ['get', 'riskLevel'],
  'critical', colors.critical,
  'high',     colors.high,
  'medium',   colors.medium,
  'low',      colors.low,
  '#6e6e6e',
]

interface Props {
  onZoneClick: (zone: HotZone) => void
}

export default function MapView({ onZoneClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef      = useRef<mapboxgl.Map | null>(null)
  const callbackRef = useRef(onZoneClick)

  useEffect(() => { callbackRef.current = onZoneClick })

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [20, 20],
      zoom: 2.1,
      projection: { name: 'mercator' },
      attributionControl: false,
    })

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left')
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')

    mapRef.current = map

    map.on('load', () => {
      // ── Trade lane lines ────────────────────────────────────────
      map.addSource('trade-lanes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: TRADE_LANES.map(lane => ({
            type: 'Feature' as const,
            properties: { id: lane.id, riskLevel: lane.riskLevel },
            geometry: { type: 'LineString' as const, coordinates: lane.waypoints },
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
          'line-color': riskMatch(STROKE) as mapboxgl.Expression,
        },
      })

      // ── Hot zone circles ────────────────────────────────────────
      map.addSource('hot-zones', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: HOT_ZONES.map(z => ({
            type: 'Feature' as const,
            properties: { id: z.id, name: z.name, riskLevel: z.riskLevel, riskScore: z.riskScore },
            geometry: { type: 'Point' as const, coordinates: z.coordinates },
          })),
        },
      })

      map.addLayer({
        id: 'hot-zones-fill',
        type: 'circle',
        source: 'hot-zones',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 14, 3, 26, 5, 48, 8, 90] as mapboxgl.Expression,
          'circle-color': riskMatch(FILL) as mapboxgl.Expression,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': riskMatch(STROKE) as mapboxgl.Expression,
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
          'text-color': riskMatch(STROKE) as mapboxgl.Expression,
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      })

      // ── Interaction ─────────────────────────────────────────────
      map.on('click', 'hot-zones-fill', e => {
        const props = e.features?.[0]?.properties
        if (!props) return
        const zone = HOT_ZONES.find(z => z.id === props.id)
        if (zone) callbackRef.current(zone)
      })

      map.on('mouseenter', 'hot-zones-fill', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'hot-zones-fill', () => { map.getCanvas().style.cursor = '' })
    })

    return () => { map.remove(); mapRef.current = null }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
