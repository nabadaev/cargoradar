import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js'

lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! })

export async function createCheckoutUrl(
  userId: string,
  userEmail: string,
  variantId: string
): Promise<string> {
  const checkout = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID!,
    variantId,
    {
      checkoutOptions: { dark: false },
      checkoutData: {
        email: userEmail,
        custom: { user_id: userId },
      },
      productOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://cargoradar.vercel.app'}/account?upgraded=true`,
        receiptButtonText: 'Go to Account',
        receiptThankYouNote: 'Welcome to CargoRadar Pro. Your intelligence dashboard is ready.',
      },
    }
  )

  const url = checkout.data?.data?.attributes?.url
  if (!url) throw new Error('Failed to create checkout URL')
  return url
}
