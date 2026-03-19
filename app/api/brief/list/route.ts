import { NextResponse } from 'next/server'
import { listBriefSummaries } from '@/lib/briefStorage'

// GET /api/brief/list
// Returns available brief files (date + title + generatedAt).
export async function GET() {
  try {
    const briefs = await listBriefSummaries()
    return NextResponse.json({ briefs })
  } catch {
    return NextResponse.json({ briefs: [] }, { status: 500 })
  }
}
