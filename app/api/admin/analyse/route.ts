import { NextRequest, NextResponse } from 'next/server'
import { analyseNewsItem } from '@/lib/claude'
import { computeCMRS } from '@/lib/scoring'
import { ZONES } from '@/lib/mapdata'

export async function POST(req: NextRequest) {
  const { rawContent, zoneId, credibility } = await req.json()

  if (!rawContent || !zoneId) {
    return NextResponse.json({ error: 'rawContent and zoneId required' }, { status: 400 })
  }

  const zone = ZONES.find(z => z.id === zoneId)
  if (!zone) return NextResponse.json({ error: 'Unknown zone' }, { status: 400 })

  const analysis = await analyseNewsItem(rawContent, zone.name)

  const cmrs = computeCMRS({
    eventCategory:      analysis.eventCategory,
    eventType:          analysis.eventType,
    proximityToLane:    analysis.proximityScore,
    sourceCredibility:  credibility,
    priorScore:         zone.riskScore,
    daysSinceLastUpdate: 0,
  })

  return NextResponse.json({ analysis, cmrs })
}
