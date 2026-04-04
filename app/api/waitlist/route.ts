import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendWaitlistConfirmation } from '@/lib/resend'

export async function POST(req: NextRequest) {
  let body: { email?: string; company_name?: string; role?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { error: dbError } = await supabase.from('waitlist').insert({
    email,
    company_name: body.company_name?.trim() || null,
    role: body.role || null,
  })

  if (dbError) {
    // Unique constraint → already on list
    if (dbError.code === '23505') {
      return NextResponse.json({ error: "You're already on the waitlist." }, { status: 409 })
    }
    console.error('[waitlist] db error:', dbError)
    return NextResponse.json({ error: 'Could not save your email. Please try again.' }, { status: 500 })
  }

  // Send confirmation email (non-blocking — don't fail the signup if email fails)
  try {
    await sendWaitlistConfirmation({ to: email })
  } catch (emailErr) {
    console.error('[waitlist] resend error:', emailErr)
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
