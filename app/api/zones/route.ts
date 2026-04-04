import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Zones API — Phase 3' })
}
