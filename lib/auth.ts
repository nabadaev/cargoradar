'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from './supabase'
import type { Session } from '@supabase/supabase-js'

/**
 * Returns the current Supabase session.
 * undefined = loading, null = not signed in, Session = signed in.
 */
export function useSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    const supabase = getSupabaseClient()

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return session
}
