import { NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createServiceClient, getSupabaseClient, fromTable } from '@/lib/supabase'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('X-Signature') ?? ''

  // Verify HMAC-SHA256 signature
  const hmac = createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)
  const digest = hmac.update(rawBody).digest('hex')

  if (digest !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payload = JSON.parse(rawBody)
  const eventName = payload.meta?.event_name
  const userId = payload.meta?.custom_data?.user_id
  const variantId = String(payload.data?.attributes?.variant_id ?? '')

  const proVariantId = process.env.LEMONSQUEEZY_PRO_VARIANT_ID ?? ''
  const smeVariantId = process.env.LEMONSQUEEZY_SME_VARIANT_ID ?? ''

  const plan = variantId === proVariantId ? 'pro'
    : variantId === smeVariantId ? 'sme'
    : 'free'

  if (!userId) return NextResponse.json({ ok: true })

  const supabase = createServiceClient() as unknown as ReturnType<typeof getSupabaseClient>

  switch (eventName) {
    case 'subscription_created':
    case 'subscription_payment_success':
    case 'subscription_plan_changed':
      await fromTable(supabase, 'users').update({
        plan,
        ls_subscription_id: payload.data?.id,
        ls_customer_id: String(payload.data?.attributes?.customer_id ?? ''),
        ls_variant_id: variantId,
      }).eq('id', userId)
      break

    case 'subscription_expired':
    case 'subscription_payment_failed':
      await fromTable(supabase, 'users').update({ plan: 'free' }).eq('id', userId)
      break

    case 'subscription_cancelled':
      await fromTable(supabase, 'users').update({
        ls_subscription_id: payload.data?.id,
      }).eq('id', userId)
      break
  }

  return NextResponse.json({ ok: true })
}
