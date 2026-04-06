import { Resend } from 'resend'
import { createServiceClient } from './supabase'

const getResend = () => new Resend(process.env.RESEND_API_KEY)

export async function sendWaitlistConfirmation({ to }: { to: string }) {
  const resend = getResend()
  await resend.emails.send({
    from: 'CargoRadar <onboarding@resend.dev>',
    to,
    subject: 'You\'re on the CargoRadar waitlist',
    text: `You're on the waitlist.\n\nWe'll be in touch when CargoRadar launches.\n\n— CargoRadar`,
  })
}

export interface AlertNewsItem {
  ai_summary: string
  impact_lane: string
  cmrs_score: number | null
}

export async function sendWeeklyDigest() {
  const supabase = createServiceClient()
  const resend   = getResend()

  // 1. Get all unique subscriber emails
  const { data: alertRows, error: alertsErr } = await supabase
    .from('zone_alerts')
    .select('email')
  if (alertsErr || !alertRows || alertRows.length === 0) return

  const allEmails = (alertRows as { email: string }[]).map(r => r.email)
  const emails = Array.from(new Set(allEmails))

  // 2. Get top 5 zones by risk_score
  const { data: topZones } = await supabase
    .from('zones')
    .select('name, risk_score, risk_level')
    .order('risk_score', { ascending: false })
    .limit(5)

  if (!topZones || topZones.length === 0) return

  // 3. Build plain-text body
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  type ZoneRow = { name: string; risk_score: number; risk_level: string }
  const zoneLines = (topZones as ZoneRow[])
    .map(z => `  ${z.name.padEnd(32)} ${z.risk_score.toFixed(1)}  ${z.risk_level.toUpperCase()}`)
    .join('\n')

  const text = `CARGORADAR WEEKLY BRIEF — ${dateStr}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP ZONES BY RISK SCORE

${zoneLines}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
View full intelligence map:
https://cargoradar.vercel.app/map

CargoRadar | Ocean Freight Intelligence
To unsubscribe, reply with "unsubscribe all"`

  // 4. Send to each subscriber
  for (const to of emails) {
    try {
      await resend.emails.send({
        from: 'CargoRadar <onboarding@resend.dev>',
        to,
        subject: `CargoRadar Weekly — ${dateStr} Far East–Europe Brief`,
        text,
      })
    } catch (err) {
      console.error(`[weekly digest] failed to send to ${to}:`, err)
    }
  }
}

export async function sendAlertEmail({
  to,
  zoneName,
  riskLevel,
  cmrsScore,
  newsItem,
}: {
  to: string
  zoneName: string
  riskLevel: string
  cmrsScore: number
  newsItem: AlertNewsItem
}) {
  const resend = getResend()
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()

  await resend.emails.send({
    from: 'CargoRadar Alerts <onboarding@resend.dev>',
    to,
    subject: `CargoRadar Alert: ${zoneName} risk escalated to ${riskLevel.toUpperCase()}`,
    text: `CARGORADAR INTELLIGENCE ALERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Zone: ${zoneName}
Risk Level: ${riskLevel.toUpperCase()}
CMRS Score: ${cmrsScore.toFixed(1)}
Updated: ${date}

SITUATION
${newsItem.ai_summary}

LANE IMPACT — FAR EAST → EUROPE
${newsItem.impact_lane || 'No lane impact data available.'}

View full intelligence brief:
https://cargoradar.vercel.app/map

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To unsubscribe from ${zoneName} alerts, reply with "unsubscribe ${zoneName}"
CargoRadar | Ocean Freight Intelligence`,
  })
}
