import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { fetchMaritimeNews } from '@/lib/rss'
import { analyseNewsItem } from '@/lib/claude'
import { computeCMRS } from '@/lib/scoring'
import { sendAlertEmail, sendWeeklyDigest } from '@/lib/resend'
import type { AlertNewsItem } from '@/lib/resend'
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
        // Save previous risk level for change detection
        const previousRiskLevel = zone.risk_level as string

        const rssItems = await fetchMaritimeNews(zone.name)

        // Track the most recently inserted news item for this zone
        let latestNewItem: AlertNewsItem | null = null

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
              // Track the first new item per zone as the latest
              if (!latestNewItem) {
                latestNewItem = {
                  ai_summary: analysis.summary,
                  impact_lane: analysis.impact_lane,
                  cmrs_score: cmrsResult.score,
                }
              }
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

        let clampedScore = zone.risk_score ?? 5
        let newRiskLevel: RiskLevel = riskLevelFromScore(clampedScore)

        if (recentNewsItems && recentNewsItems.length > 0) {
          const now = Date.now()
          type NewsScoreRow = { cmrs_score: number | null; created_at: string }
          const decayedScores = (recentNewsItems as NewsScoreRow[])
            .filter((n) => n.cmrs_score !== null && n.cmrs_score !== undefined)
            .map((n) => {
              const daysSince =
                (now - new Date(n.created_at).getTime()) / (1000 * 60 * 60 * 24)
              return (n.cmrs_score as number) * Math.exp(-0.1 * daysSince)
            })

          if (decayedScores.length > 0) {
            const weightedScore =
              decayedScores.reduce((sum, s) => sum + s, 0) / decayedScores.length
            clampedScore = Math.max(1, Math.min(10, Math.round(weightedScore * 10) / 10))
            newRiskLevel = riskLevelFromScore(clampedScore)

            await supabase
              .from('zones')
              .update({
                risk_score: clampedScore,
                risk_level: newRiskLevel,
                updated_at: new Date().toISOString(),
              })
              .eq('id', zone.id)

            // Insert score history row
            await supabase.from('zone_score_history').insert({
              zone_id: zone.id,
              risk_score: clampedScore,
              recorded_at: new Date().toISOString(),
            })

            // Send alerts if risk level escalated to high or critical
            if (
              newRiskLevel !== previousRiskLevel &&
              (newRiskLevel === 'high' || newRiskLevel === 'critical') &&
              latestNewItem
            ) {
              try {
                const { data: subscribers } = await supabase
                  .from('zone_alerts')
                  .select('email')
                  .eq('zone_name', zone.name)

                if (subscribers && subscribers.length > 0) {
                  for (const sub of subscribers) {
                    try {
                      await sendAlertEmail({
                        to: sub.email,
                        zoneName: zone.name,
                        riskLevel: newRiskLevel,
                        cmrsScore: clampedScore,
                        newsItem: latestNewItem,
                      })
                    } catch (emailErr) {
                      errors.push(
                        `Alert email to ${sub.email} for ${zone.name} — ${emailErr instanceof Error ? emailErr.message : String(emailErr)}`,
                      )
                    }
                  }
                }
              } catch (alertErr) {
                errors.push(
                  `Zone ${zone.name} alert query — ${alertErr instanceof Error ? alertErr.message : String(alertErr)}`,
                )
              }
            }
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

    // Send weekly digest every Monday
    const isMonday = new Date().getDay() === 1
    if (isMonday) {
      try {
        await sendWeeklyDigest()
      } catch (digestErr) {
        errors.push(`Weekly digest — ${digestErr instanceof Error ? digestErr.message : String(digestErr)}`)
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
