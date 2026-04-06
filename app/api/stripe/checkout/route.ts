// TODO: Stripe checkout route — activate when STRIPE_SECRET_KEY is set
//
// Full implementation:
//   1. npm install stripe
//   2. Add STRIPE_SECRET_KEY + STRIPE_PRICE_ID to .env.local
//   3. Replace this file with the real checkout session creation:
//
//   import { stripe } from '@/lib/stripe'
//   import { getSupabaseClient } from '@/lib/supabase'
//   import { NextResponse } from 'next/server'
//
//   export async function POST(req: Request) {
//     const supabase = getSupabaseClient()
//     const { data: { session } } = await supabase.auth.getSession()
//     if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//
//     const checkoutSession = await stripe.checkout.sessions.create({
//       mode: 'subscription',
//       payment_method_types: ['card'],
//       line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
//       metadata: { user_id: session.user.id, email: session.user.email },
//       success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?upgraded=true`,
//       cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
//     })
//     return NextResponse.json({ url: checkoutSession.url })
//   }

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Stripe not yet configured. Add STRIPE_SECRET_KEY to .env.local.' },
    { status: 501 }
  )
}
