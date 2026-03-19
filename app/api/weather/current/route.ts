import { NextResponse } from 'next/server'
import { getWeatherSnapshot } from '@/lib/weather'

// GET /api/weather/current - Mobile weather snapshot for gardening decisions
export async function GET() {
  try {
    const snapshot = await getWeatherSnapshot()

    if (!snapshot) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Weather service unavailable',
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      ok: true,
      data: snapshot,
    })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch weather',
      },
      { status: 500 }
    )
  }
}
