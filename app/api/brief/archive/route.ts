import { NextRequest, NextResponse } from 'next/server'
import { listBriefArchive } from '@/lib/brief'

// GET /api/brief/archive?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const briefs = await listBriefArchive({ from, to, take: 120 })

    return NextResponse.json({ ok: true, data: briefs })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to load archive' }, { status: 500 })
  }
}
