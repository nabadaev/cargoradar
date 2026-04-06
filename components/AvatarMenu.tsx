'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

const mono: React.CSSProperties = { fontFamily: 'var(--mono)' }

interface Props {
  email: string
}

export default function AvatarMenu({ email }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [open])

  async function handleSignOut() {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  const initial = (email[0] ?? '?').toUpperCase()

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Avatar circle */}
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'var(--ink)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...mono,
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}
        aria-label="Account menu"
      >
        {initial}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: '#fff',
          border: '1px solid var(--rule)',
          borderRadius: 0,
          zIndex: 50,
          minWidth: '200px',
          boxShadow: 'none',
        }}>
          {/* Email label — read-only */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--rule)',
            ...mono,
            fontSize: '10px',
            color: 'var(--muted)',
            letterSpacing: '0.04em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {email}
          </div>

          {/* ACCOUNT link */}
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            style={{
              display: 'block',
              padding: '10px 14px',
              ...mono,
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--rule)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--off)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            ACCOUNT
          </Link>

          {/* SIGN OUT button */}
          <button
            onClick={() => { setOpen(false); handleSignOut() }}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              ...mono,
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--off)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            SIGN OUT
          </button>
        </div>
      )}
    </div>
  )
}
