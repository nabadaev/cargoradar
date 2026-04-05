import { NextRequest, NextResponse } from 'next/server'
import { generateZoneSituation } from '@/lib/claude'

// Simple in-memory cache: zone_name → { text, cachedAt }
const cache = new Map<string, { text: string; cachedAt: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function POST(req: NextRequest) {
  const { zone_name, news_items } = await req.json()
  if (!zone_name) return NextResponse.json({ error: 'zone_name required' }, { status: 400 })

  // Check cache
  const cached = cache.get(zone_name)
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return NextResponse.json({ situation: cached.text })
  }

  try {
    const situation = await generateZoneSituation(zone_name, news_items ?? [])
    cache.set(zone_name, { text: situation, cachedAt: Date.now() })
    return NextResponse.json({ situation })
  } catch {
    return NextResponse.json({ situation: null })
  }
}
