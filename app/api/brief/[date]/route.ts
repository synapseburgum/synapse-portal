import { NextRequest, NextResponse } from 'next/server'
import { readBriefByDate } from '@/lib/briefStorage'

// GET /api/brief/[date]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params
    const brief = await readBriefByDate(date)

    return NextResponse.json({ ok: true, data: brief })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to fetch brief by date' }, { status: 500 })
  }
}
