import { NextResponse } from 'next/server'
import { getOrCreateDailyBrief } from '@/lib/brief'

// GET /api/brief/daily - today's brief (auto-generated if absent)
export async function GET() {
  try {
    const brief = await getOrCreateDailyBrief(new Date())

    return NextResponse.json({
      ok: true,
      data: brief,
    })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch daily brief',
      },
      { status: 500 }
    )
  }
}
