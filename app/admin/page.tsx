'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ZONES } from '@/lib/mapdata'
import { useSession } from '@/lib/auth'
import type { NewsAnalysis } from '@/lib/claude'
import type { CMRSResult } from '@/lib/scoring'

const ADMIN_EMAILS = ['nabadaev@gmail.com']

const CREDIBILITY_OPTIONS = [
  { label: "Lloyd's List",    value: 1.00 },
  { label: 'Reuters',         value: 0.95 },
  { label: 'Bloomberg',       value: 0.95 },
  { label: 'Trade Press',     value: 0.75 },
  { label: 'Other',           value: 0.50 },
]

interface AnalysisResult {
  analysis: NewsAnalysis
  cmrs: CMRSResult
}

const mono: React.CSSProperties = { fontFamily: 'var(--mono)' }
const label: React.CSSProperties = { ...mono, fontSize: '10px', letterSpacing: '0.14em', color: 'var(--muted)', textTransform: 'uppercase' as const, marginBottom: '6px' }
const fieldset: React.CSSProperties = { marginBottom: '16px' }

function Field({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div style={fieldset}>
      <div style={label}>{title}</div>
      {children}
    </div>
  )
}

function inputStyle(full?: boolean): React.CSSProperties {
  return {
    width: full ? '100%' : 'auto',
    background: 'transparent',
    border: '1px solid var(--rule)',
    outline: 'none',
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    color: 'var(--ink)',
    padding: '8px 10px',
    boxSizing: 'border-box' as const,
  }
}

function riskColor(level: string) {
  const map: Record<string, string> = { critical: '#D4291A', high: '#C97A1A', medium: '#B5901A', low: '#2E7D45' }
  return map[level] ?? '#6e6e6e'
}

export default function AdminPage() {
  const session = useSession()
  const router  = useRouter()

  // Client-side auth + admin guard
  useEffect(() => {
    if (session === null) {
      router.replace('/login?next=/admin')
      return
    }
    if (session && !ADMIN_EMAILS.includes(session.user.email ?? '')) {
      router.replace('/map')
    }
  }, [session, router])

  const [rawContent, setRawContent]     = useState('')
  const [zoneId, setZoneId]             = useState(ZONES[0].id)
  const [credibility, setCredibility]   = useState(1.00)
  const [analysing, setAnalysing]       = useState(false)
  const [saving, setSaving]             = useState(false)
  const [result, setResult]             = useState<AnalysisResult | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [saveMsg, setSaveMsg]           = useState<string | null>(null)

  const selectedZone = ZONES.find(z => z.id === zoneId)!

  async function handleAnalyse() {
    if (!rawContent.trim()) return
    setAnalysing(true)
    setError(null)
    setResult(null)
    setSaveMsg(null)

    try {
      const res = await fetch('/api/admin/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent, zoneId, credibility }),
      })
      if (!res.ok) throw new Error(await res.text())
      setResult(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setAnalysing(false)
    }
  }

  async function handleSave() {
    if (!result) return
    setSaving(true)
    setSaveMsg(null)
    setError(null)

    try {
      const res = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawContent, zoneId, credibility, result }),
      })
      if (!res.ok) throw new Error(await res.text())
      setSaveMsg('Saved — zone risk score updated.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  // Show nothing while session is loading or if not admin
  if (session === undefined || session === null) return null
  if (!ADMIN_EMAILS.includes(session.user.email ?? '')) return null

  return (
    <div style={{ minHeight: '100vh', background: '#fff', padding: '40px 48px', maxWidth: '960px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--rule)', paddingBottom: '20px', marginBottom: '32px' }}>
        <div style={{ ...mono, fontSize: '10px', letterSpacing: '0.16em', color: 'var(--muted)', marginBottom: '8px' }}>
          CARGORADAR / ADMIN
        </div>
        <h1 style={{ ...mono, fontSize: '20px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          Intelligence Intake
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>

        {/* Left: Input form */}
        <div>
          <Field title="Raw News Content">
            <textarea
              value={rawContent}
              onChange={e => setRawContent(e.target.value)}
              placeholder="Paste headline + body text..."
              rows={10}
              style={{ ...inputStyle(true), resize: 'vertical' }}
            />
          </Field>

          <Field title="Hot Zone">
            <select
              value={zoneId}
              onChange={e => setZoneId(e.target.value)}
              style={inputStyle(true)}
            >
              {ZONES.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </Field>

          <Field title="Source Credibility">
            <select
              value={credibility}
              onChange={e => setCredibility(parseFloat(e.target.value))}
              style={inputStyle(true)}
            >
              {CREDIBILITY_OPTIONS.map(o => (
                <option key={o.label} value={o.value}>{o.label} ({o.value})</option>
              ))}
            </select>
          </Field>

          <button
            onClick={handleAnalyse}
            disabled={analysing || !rawContent.trim()}
            style={{
              ...mono,
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: '#fff',
              background: analysing ? 'var(--muted)' : 'var(--ink)',
              border: 'none',
              padding: '12px 24px',
              cursor: analysing ? 'default' : 'pointer',
              textTransform: 'uppercase',
              width: '100%',
            }}
          >
            {analysing ? 'Analysing...' : 'Analyse with AI'}
          </button>

          {error && (
            <div style={{ ...mono, fontSize: '11px', color: '#D4291A', marginTop: '12px' }}>
              {error}
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div>
          {!result && !analysing && (
            <div style={{ ...mono, fontSize: '11px', color: 'var(--muted)', paddingTop: '8px' }}>
              Analysis will appear here.
            </div>
          )}

          {result && (() => {
            const { analysis, cmrs } = result
            const color = riskColor(cmrs.riskLevel)
            return (
              <div>
                {/* CMRS Score */}
                <div style={{ border: `1px solid ${color}`, padding: '16px 20px', marginBottom: '20px' }}>
                  <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '6px' }}>
                    CMRS SCORE
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span style={{ ...mono, fontSize: '32px', fontWeight: 700, color, lineHeight: 1 }}>
                      {cmrs.score.toFixed(1)}
                    </span>
                    <span style={{ ...mono, fontSize: '12px', color, fontWeight: 600, letterSpacing: '0.08em' }}>
                      {cmrs.riskLevel.toUpperCase()}
                    </span>
                    <span style={{ ...mono, fontSize: '11px', color: cmrs.delta >= 0 ? '#D4291A' : '#2E7D45' }}>
                      {cmrs.delta >= 0 ? '+' : ''}{cmrs.delta.toFixed(1)} vs prior
                    </span>
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '16px' }}>
                    <span style={{ ...mono, fontSize: '10px', color: 'var(--muted)' }}>
                      {analysis.eventCategory.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span style={{ ...mono, fontSize: '10px', background: `${color}18`, color, padding: '1px 6px', borderRadius: '2px', fontWeight: 600 }}>
                      {analysis.eventType}
                    </span>
                    <span style={{ ...mono, fontSize: '10px', color: 'var(--muted)' }}>
                      proximity {(analysis.proximityScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Analysis sections */}
                {[
                  { title: 'Summary',                  body: analysis.summary },
                  { title: `Zone Impact — ${selectedZone.name}`, body: analysis.impact_zone },
                  { title: 'Regional Impact',          body: analysis.impact_region },
                  { title: 'Lane Impact — Far East → Europe', body: analysis.impact_lane },
                ].map(({ title, body }) => (
                  <div key={title} style={{ borderTop: '1px solid var(--rule)', paddingTop: '14px', marginBottom: '14px' }}>
                    <div style={label}>{title}</div>
                    <p style={{ fontFamily: 'var(--body)', fontSize: '13px', color: 'var(--ink)', lineHeight: 1.65 }}>
                      {body}
                    </p>
                  </div>
                ))}

                {/* Save button */}
                <div style={{ borderTop: '1px solid var(--rule)', paddingTop: '16px' }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      ...mono,
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      color: 'var(--ink)',
                      background: 'transparent',
                      border: '1px solid var(--ink)',
                      padding: '10px 20px',
                      cursor: saving ? 'default' : 'pointer',
                      textTransform: 'uppercase',
                      width: '100%',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save to Supabase'}
                  </button>
                  {saveMsg && (
                    <div style={{ ...mono, fontSize: '11px', color: '#2E7D45', marginTop: '8px' }}>
                      {saveMsg}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
