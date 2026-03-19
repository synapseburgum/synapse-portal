import { NextResponse } from 'next/server'
import { getDailyBriefData } from '@/lib/brief'

// GET /api/brief/daily - Consolidated overnight priorities for mobile + agent clients
export async function GET() {
  try {
    const data = await getDailyBriefData()

    return NextResponse.json({
      ok: true,
      data,
    })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to generate daily brief',
      },
      { status: 500 }
    )
  }
}
