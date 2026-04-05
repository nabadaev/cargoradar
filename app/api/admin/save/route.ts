import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { ZONES } from '@/lib/mapdata'
import type { NewsAnalysis } from '@/lib/claude'
import type { CMRSResult } from '@/lib/scoring'

export async function POST(req: NextRequest) {
  const { rawContent, zoneId, credibility, result } = await req.json() as {
    rawContent: string
    zoneId: string
    credibility: number
    result: { analysis: NewsAnalysis; cmrs: CMRSResult }
  }

  const zone = ZONES.find(z => z.id === zoneId)
  if (!zone) return NextResponse.json({ error: 'Unknown zone' }, { status: 400 })

  const supabase = createServiceClient()
  const { analysis, cmrs } = result

  // Insert news item
  const { error: newsError } = await supabase.from('news_items').insert({
    zone_id:          zoneId,
    headline:         rawContent.split('\n')[0].slice(0, 255),
    raw_content:      rawContent,
    ai_summary:       analysis.summary,
    ai_impact:        analysis.impact_lane,
    ai_severity:      analysis.rawSeverity,
    event_category:   analysis.eventCategory,
    event_type:       analysis.eventType,
    proximity_score:  analysis.proximityScore,
    credibility_score: credibility,
    cmrs_score:       cmrs.score,
    impact_zone:      analysis.impact_zone,
    impact_region:    analysis.impact_region,
    impact_lane:      analysis.impact_lane,
    published_at:     new Date().toISOString(),
  })

  if (newsError) {
    return NextResponse.json({ error: newsError.message }, { status: 500 })
  }

  // Update zone risk score
  const { error: zoneError } = await supabase
    .from('zones')
    .update({ risk_score: cmrs.score, risk_level: cmrs.riskLevel, updated_at: new Date().toISOString() })
    .eq('id', zoneId)

  if (zoneError) {
    // Non-fatal — news is saved, zone update failed
    console.error('Zone update failed:', zoneError.message)
  }

  return NextResponse.json({ ok: true })
}
