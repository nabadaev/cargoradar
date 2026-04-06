import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { createCheckoutUrl } from '@/lib/lemonsqueezy'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const plan: 'pro' | 'sme' = body.plan

    const supabase = getSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const variantId = plan === 'pro'
      ? process.env.LEMONSQUEEZY_PRO_VARIANT_ID!
      : process.env.LEMONSQUEEZY_SME_VARIANT_ID!

    const checkoutUrl = await createCheckoutUrl(
      session.user.id,
      session.user.email ?? '',
      variantId
    )

    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    console.error('checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
