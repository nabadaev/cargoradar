// TODO: Stripe webhook route — activate when STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET are set
//
// Full implementation:
//   1. npm install stripe
//   2. Add STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET to .env.local
//   3. Replace this file with the real webhook handler:
//
//   import { stripe } from '@/lib/stripe'
//   import { createServiceClient } from '@/lib/supabase'
//   import { NextResponse } from 'next/server'
//
//   export async function POST(req: Request) {
//     const body = await req.text()
//     const sig  = req.headers.get('stripe-signature')!
//     let event
//     try {
//       event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
//     } catch (err) {
//       return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
//     }
//
//     const supabase = createServiceClient()
//
//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object
//       const userId  = session.metadata?.user_id
//       if (userId) {
//         await supabase.from('users').upsert({ id: userId, plan: 'pro' }, { onConflict: 'id' })
//       }
//     }
//
//     if (event.type === 'customer.subscription.deleted') {
//       const sub    = event.data.object
//       const custId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
//       await supabase.from('users').update({ plan: 'free' }).eq('stripe_customer_id', custId)
//     }
//
//     return NextResponse.json({ received: true })
//   }

import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Stripe webhook not yet configured. Add STRIPE_SECRET_KEY to .env.local.' },
    { status: 501 }
  )
}
