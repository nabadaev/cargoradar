'use client'

import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company_name: company, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{
        border: '1px solid var(--rule)',
        padding: '24px 28px',
        fontFamily: 'var(--mono)',
      }}>
        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#1a6b3a' }}>
          YOU&apos;RE ON THE LIST
        </p>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px', fontFamily: 'var(--body)' }}>
          We&apos;ll notify you when CargoRadar launches.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Email + submit joined unit */}
      <div style={{
        display: 'flex',
        border: '1px solid var(--ink)',
        marginBottom: '12px',
      }}>
        <input
          type="email"
          required
          placeholder="your@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--mono)',
            fontSize: '13px',
            color: 'var(--ink)',
            padding: '12px 16px',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            background: 'var(--ink)',
            color: '#fff',
            border: 'none',
            borderLeft: '1px solid var(--ink)',
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '12px 22px',
            cursor: status === 'loading' ? 'wait' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {status === 'loading' ? 'SENDING...' : 'JOIN WAITLIST'}
        </button>
      </div>

      {/* Optional fields */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="Company (optional)"
          value={company}
          onChange={e => setCompany(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: '1px solid var(--rule)',
            outline: 'none',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            color: 'var(--ink)',
            padding: '10px 14px',
          }}
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: '1px solid var(--rule)',
            outline: 'none',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            color: role ? 'var(--ink)' : 'var(--muted)',
            padding: '10px 14px',
            cursor: 'pointer',
          }}
        >
          <option value="" disabled>Role (optional)</option>
          <option value="forwarder">Freight Forwarder</option>
          <option value="importer">Importer / Exporter</option>
          <option value="supply_chain">Supply Chain Manager</option>
          <option value="other">Other</option>
        </select>
      </div>

      {status === 'error' && (
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#c0392b', marginTop: '4px' }}>
          {errorMsg}
        </p>
      )}
    </form>
  )
}
