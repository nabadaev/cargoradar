import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const getResend = () => new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, zone_name, risk_level, risk_score } = body as {
      email: string
      zone_name: string
      risk_level: string
      risk_score: number
    }

    if (!email || !zone_name) {
      return NextResponse.json({ error: 'email and zone_name are required' }, { status: 400 })
    }

    const resend = getResend()
    await resend.emails.send({
      from: 'CargoRadar <onboarding@resend.dev>',
      to: email,
      subject: 'CargoRadar — Alert subscription confirmed',
      text: [
        'CARGORADAR',
        '',
        `You're now subscribed to alerts for: ${zone_name}`,
        '',
        "You'll receive an email when risk levels change significantly for this zone.",
        '',
        `Current risk level: ${(risk_level ?? '').toUpperCase()} ${risk_score ?? ''}`,
        '',
        'Manage your subscriptions:',
        'https://cargoradar.vercel.app/settings',
        '',
        '— CargoRadar Intelligence',
      ].join('\n'),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[confirm-email]', err)
    return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 })
  }
}
