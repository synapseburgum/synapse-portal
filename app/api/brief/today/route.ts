import { NextResponse } from 'next/server'
import { getTodayOrLatestBrief } from '@/lib/briefStorage'

// GET /api/brief/today
// Returns today's brief, or most recent brief when today's does not exist.
export async function GET() {
  try {
    const brief = await getTodayOrLatestBrief(new Date())
    return NextResponse.json({ brief: brief || null })
  } catch {
    return NextResponse.json({ brief: null }, { status: 500 })
  }
}
