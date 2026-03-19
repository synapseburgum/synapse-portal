import { NextRequest, NextResponse } from 'next/server'
import { searchBriefs } from '@/lib/brief'

// GET /api/brief/search?q=query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    const results = await searchBriefs(q)
    return NextResponse.json({ ok: true, data: results })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to search briefs' }, { status: 500 })
  }
}
