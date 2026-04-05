import { NextRequest, NextResponse } from 'next/server'
import { analyseNewsItem } from '@/lib/claude'
import { computeCMRS } from '@/lib/scoring'
import { ZONES } from '@/lib/mapdata'

export async function POST(req: NextRequest) {
  const keyPreview = process.env.ANTHROPIC_API_KEY?.slice(0, 10) ?? 'MISSING'
  console.log('[analyse] ANTHROPIC_API_KEY prefix:', keyPreview)

  const { rawContent, zoneId, credibility } = await req.json()

  if (!rawContent || !zoneId) {
    return NextResponse.json({ error: 'rawContent and zoneId required' }, { status: 400 })
  }

  const zone = ZONES.find(z => z.id === zoneId)
  if (!zone) return NextResponse.json({ error: 'Unknown zone' }, { status: 400 })

  let analysis
  try {
    analysis = await analyseNewsItem(rawContent, zone.name)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: 'Claude API failed', detail: msg }, { status: 500 })
  }

  let cmrs
  try {
    cmrs = computeCMRS({
      eventCategory:      analysis.eventCategory,
      eventType:          analysis.eventType,
      proximityToLane:    analysis.proximityScore,
      sourceCredibility:  credibility,
      priorScore:         zone.riskScore,
      daysSinceLastUpdate: 0,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: 'CMRS computation failed', detail: msg, analysis }, { status: 500 })
  }

  return NextResponse.json({ analysis, cmrs })
}
