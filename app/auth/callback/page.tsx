'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabaseClient()

    // Supabase parses the #access_token fragment automatically on getSession()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/settings')
      } else {
        // Occasionally the session takes a moment — retry once after a short delay
        setTimeout(async () => {
          const { data } = await supabase.auth.getSession()
          if (data.session) {
            router.replace('/settings')
          } else {
            router.replace('/login?error=expired')
          }
        }, 1200)
      }
    })
  }, [router])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--white)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          letterSpacing: '0.14em',
          color: 'var(--muted)',
          textTransform: 'uppercase',
        }}>
          SIGNING IN...
        </div>
      </div>
    </div>
  )
}
