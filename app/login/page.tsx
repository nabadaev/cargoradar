'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'

const mono: React.CSSProperties = { fontFamily: 'var(--mono)' }
const body: React.CSSProperties = { fontFamily: 'var(--body)' }

type Status = 'idle' | 'loading' | 'sent' | 'error'

export default function LoginPage() {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setError('')

    const supabase = getSupabaseClient()
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cargoradar.vercel.app'}/auth/callback`

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    })

    if (authError) {
      setError(authError.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--white)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Nav */}
      <nav style={{
        height: '56px',
        borderBottom: '1px solid var(--rule)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 48px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red)', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ ...mono, fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink)' }}>
            CARGORADAR
          </span>
        </Link>
      </nav>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Header */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{
              ...mono,
              fontSize: '9px',
              letterSpacing: '0.18em',
              color: 'var(--muted)',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}>
              SIGN IN
            </div>
            <h1 style={{
              ...mono,
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
              marginBottom: '10px',
            }}>
              Access your account
            </h1>
            <p style={{ ...body, fontSize: '14px', color: 'var(--muted)', lineHeight: 1.6 }}>
              Enter your email and we&apos;ll send a sign-in link. No password required.
            </p>
          </div>

          {status === 'sent' ? (
            <div style={{
              border: '1px solid var(--rule)',
              padding: '24px',
              background: 'var(--off)',
            }}>
              <div style={{ ...mono, fontSize: '11px', color: '#1a6b3a', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '8px' }}>
                ✓ CHECK YOUR EMAIL
              </div>
              <p style={{ ...body, fontSize: '13px', color: 'var(--ink)', lineHeight: 1.6 }}>
                We sent a sign-in link to <strong>{email}</strong>. Click it to access your account.
              </p>
              <p style={{ ...body, fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, marginTop: '10px' }}>
                The link expires in 1 hour. Check your spam folder if it doesn&apos;t arrive.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Email input */}
              <div style={{ display: 'flex', border: '1px solid var(--rule)', marginBottom: '10px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                  placeholder="your@company.com"
                  required
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    ...mono,
                    fontSize: '13px',
                    color: 'var(--ink)',
                    padding: '12px 14px',
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  display: 'block',
                  width: '100%',
                  background: 'var(--ink)',
                  color: '#fff',
                  border: 'none',
                  cursor: status === 'loading' ? 'default' : 'pointer',
                  ...mono,
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '14px',
                  borderRadius: 0,
                  opacity: status === 'loading' ? 0.7 : 1,
                }}
              >
                {status === 'loading' ? 'SENDING...' : 'SEND SIGN-IN LINK'}
              </button>

              {status === 'error' && error && (
                <p style={{ ...mono, fontSize: '11px', color: 'var(--red)', marginTop: '10px' }}>
                  {error}
                </p>
              )}
            </form>
          )}

          {/* Footer note */}
          <p style={{
            ...mono,
            fontSize: '10px',
            color: 'var(--muted)',
            letterSpacing: '0.06em',
            marginTop: '20px',
            lineHeight: 1.6,
          }}>
            BY SIGNING IN YOU AGREE TO RECEIVE FREIGHT INTELLIGENCE ALERTS.
          </p>

        </div>
      </div>
    </div>
  )
}
