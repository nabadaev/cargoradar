import { createClient } from '@supabase/supabase-js'

// Singleton — a new createClient() call on every render loses localStorage auth state.
// One instance rehydrates from localStorage once and keeps the JWT for all queries.
let _client: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return _client
}

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
