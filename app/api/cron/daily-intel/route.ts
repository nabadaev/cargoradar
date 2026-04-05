import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { fetchMaritimeNews } from '@/lib/rss'
import { analyseNewsItem } from '@/lib/claude'
import { computeCMRS } from '@/lib/scoring'
import type { RiskLevel } from '@/lib/mapdata'

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 8.0) return 'critical'
  if (score >= 6.0) return 'high'
  if (score >= 3.5) return 'medium'
  return 'low'
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  let zonesProcessed = 0
  let newItemsAdded = 0
  const errors: string[] = []
  const details: { zone: string; newItems: number; currentScore: number; riskLevel: string }[] = []

  try {
    const { data: zones, error: zonesError } = await supabase
      .from('zones')
      .select('id, name, risk_score, risk_level')

    if (zonesError) {
      return NextResponse.json({ error: zonesError.message }, { status: 500 })
    }

    if (!zones || zones.length === 0) {
      return NextResponse.json({ zonesProcessed: 0, newItemsAdded: 0, errors: [] })
    }

    for (const zone of zones) {
      try {
        const rssItems = await fetchMaritimeNews(zone.name)

        for (const item of rssItems) {
          try {
            // Check for duplicate by headline
            const { data: existing } = await supabase
              .from('news_items')
              .select('id')
              .eq('headline', item.title)
              .eq('zone_id', zone.id)
              .maybeSingle()

            if (existing) continue

            // Analyse with Claude
            const rawContent = `${item.title}\n${item.description}`
            const analysis = await analyseNewsItem(rawContent, zone.name)

            // Compute CMRS score
            const cmrsResult = computeCMRS({
              eventCategory: analysis.eventCategory,
              eventType: analysis.eventType,
              proximityToLane: analysis.proximityScore,
              sourceCredibility: 0.75,
              priorScore: zone.risk_score ?? 5,
              daysSinceLastUpdate: 0,
            })

            // Insert news item
            const { error: insertError } = await supabase.from('news_items').insert({
              zone_id: zone.id,
              headline: item.title,
              source_name: item.source,
              raw_content: rawContent,
              published_at: item.publishedAt,
              ai_summary: analysis.summary,
              ai_impact: analysis.impact_lane,
              ai_severity: analysis.rawSeverity,
              event_category: analysis.eventCategory,
              event_type: analysis.eventType,
              proximity_score: analysis.proximityScore,
              credibility_score: 0.75,
              cmrs_score: cmrsResult.score,
              impact_zone: analysis.impact_zone,
              impact_region: analysis.impact_region,
              impact_lane: analysis.impact_lane,
            })

            if (insertError) {
              errors.push(`Zone ${zone.name} — insert error: ${insertError.message}`)
            } else {
              newItemsAdded++
            }
          } catch (itemErr) {
            errors.push(
              `Zone ${zone.name}, item "${item.title}" — ${itemErr instanceof Error ? itemErr.message : String(itemErr)}`,
            )
          }
        }

        // Recalculate zone risk score from last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        const { data: recentNewsItems } = await supabase
          .from('news_items')
          .select('cmrs_score, created_at')
          .eq('zone_id', zone.id)
          .gte('created_at', thirtyDaysAgo)

        if (recentNewsItems && recentNewsItems.length > 0) {
          const now = Date.now()
          const decayedScores = recentNewsItems
            .filter((n) => n.cmrs_score !== null && n.cmrs_score !== undefined)
            .map((n) => {
              const daysSince =
                (now - new Date(n.created_at).getTime()) / (1000 * 60 * 60 * 24)
              return (n.cmrs_score as number) * Math.exp(-0.1 * daysSince)
            })

          if (decayedScores.length > 0) {
            const weightedScore =
              decayedScores.reduce((sum, s) => sum + s, 0) / decayedScores.length
            const clampedScore = Math.max(1, Math.min(10, Math.round(weightedScore * 10) / 10))
            const newRiskLevel = riskLevelFromScore(clampedScore)

            await supabase
              .from('zones')
              .update({
                risk_score: clampedScore,
                risk_level: newRiskLevel,
                updated_at: new Date().toISOString(),
              })
              .eq('id', zone.id)
          }
        }

        // Fetch updated score for details
        const { data: updatedZone } = await supabase
          .from('zones')
          .select('risk_score, risk_level')
          .eq('id', zone.id)
          .single()

        details.push({
          zone: zone.name,
          newItems: rssItems.length > 0 ? newItemsAdded - (details.reduce((s, d) => s + d.newItems, 0)) : 0,
          currentScore: updatedZone?.risk_score ?? zone.risk_score,
          riskLevel: updatedZone?.risk_level ?? zone.risk_level,
        })

        zonesProcessed++
      } catch (zoneErr) {
        errors.push(
          `Zone ${zone.name} — ${zoneErr instanceof Error ? zoneErr.message : String(zoneErr)}`,
        )
      }
    }

    return NextResponse.json({ zonesProcessed, newItemsAdded, errors, details })
  } catch (err) {
    return NextResponse.json(
      {
        zonesProcessed,
        newItemsAdded,
        errors: [...errors, err instanceof Error ? err.message : String(err)],
      },
      { status: 500 },
    )
  }
}
