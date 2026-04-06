import { createClient } from '@supabase/supabase-js'

// Singleton — a new createClient() call on every render loses localStorage auth state.
// One instance rehydrates from localStorage once and keeps the JWT for all queries.
// Returns any — no generated DB types yet, avoids 'never' inference on .from() calls.
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

// Cast helper — use when querying tables with no generated types to avoid
// TypeScript inferring 'never' on .from() results.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromTable(client: ReturnType<typeof getSupabaseClient>, table: string): any {
  return (client as any).from(table)
}
