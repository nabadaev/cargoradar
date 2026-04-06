import { getSupabaseClient, fromTable } from './supabase'

export async function getUserPlan(): Promise<'free' | 'pro' | 'team'> {
  const supabase = getSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return 'free'
  try {
    const result = await fromTable(supabase, 'users')
      .select('plan')
      .eq('id', session.user.id)
      .single()
    const plan = (result.data as { plan?: string } | null)?.plan
    if (plan === 'pro' || plan === 'team') return plan
  } catch {
    // users table may not exist — default to free
  }
  return 'free'
}
