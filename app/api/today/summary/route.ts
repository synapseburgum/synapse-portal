import { NextResponse } from 'next/server'
import { getTodaySummary } from '@/lib/today'

// GET /api/today/summary
// Mobile-first morning triage payload for Tim's daily workflow.
export async function GET() {
  try {
    const summary = await getTodaySummary()

    return NextResponse.json({
      ok: true,
      data: summary,
    })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to build today summary',
      },
      { status: 500 }
    )
  }
}
