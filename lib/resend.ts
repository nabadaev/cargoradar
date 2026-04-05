import { Resend } from 'resend'

const getResend = () => new Resend(process.env.RESEND_API_KEY)

export async function sendWaitlistConfirmation({ to }: { to: string }) {
  const resend = getResend()
  await resend.emails.send({
    from: 'CargoRadar <noreply@cargoradar.vercel.app>',
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
    from: 'CargoRadar Alerts <noreply@cargoradar.vercel.app>',
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
