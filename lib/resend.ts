import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAlertEmail({
  to,
  zoneName,
  headline,
  summary,
  severity,
}: {
  to: string
  zoneName: string
  headline: string
  summary: string
  severity: number
}) {
  return resend.emails.send({
    from: 'CargoRadar <alerts@cargoradar.io>',
    to,
    subject: `[ALERT] ${zoneName} — Severity ${severity}/10`,
    html: `<p><strong>${headline}</strong></p><p>${summary}</p>`,
  })
}

export async function sendWaitlistConfirmation({ to }: { to: string }) {
  return resend.emails.send({
    from: 'CargoRadar <hello@cargoradar.io>',
    to,
    subject: "You're on the CargoRadar waitlist",
    html: `<p>You're on the list. We'll be in touch when CargoRadar launches.</p>`,
  })
}
