import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, getSupabaseClient } from '@/lib/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: { email?: string; zone_name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, zone_name } = body

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (!zone_name) {
    return NextResponse.json({ error: 'zone_name required' }, { status: 400 })
  }

  // Attempt to get the authenticated user's id to store in zone_alerts
  let user_id: string | null = null
  try {
    const anonClient = getSupabaseClient()
    const { data: { session } } = await anonClient.auth.getSession()
    if (session?.user?.id) {
      user_id = session.user.id
    }
  } catch {
    // Non-fatal — proceed without user_id (anonymous subscription)
  }

  const supabase = createServiceClient()

  const row: Record<string, string | null> = {
    email: email.trim().toLowerCase(),
    zone_name,
  }
  if (user_id) row.user_id = user_id

  const { error } = await supabase
    .from('zone_alerts')
    .insert(row)

  if (error) {
    // 23505 = unique_violation — already subscribed, treat as success
    if (error.code === '23505') {
      return NextResponse.json({ success: true })
    }
    console.error('zone_alerts insert error:', error)
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
