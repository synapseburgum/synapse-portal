import { NextRequest, NextResponse } from 'next/server'
import { saveBrief, validateBriefPayload } from '@/lib/briefStorage'

function isAuthorized(request: NextRequest) {
  const bearer = request.headers.get('authorization')
  const xApiKey = request.headers.get('x-api-key')
  const expected = process.env.BRIEF_API_KEY || process.env.PORTAL_API_KEY || ''

  const token = bearer?.startsWith('Bearer ') ? bearer.slice(7).trim() : null
  const provided = token || xApiKey || ''

  const host = request.headers.get('host') || ''
  const forwardedFor = request.headers.get('x-forwarded-for') || ''
  const localhostHost = host.startsWith('localhost:') || host.startsWith('127.0.0.1:')
  const localhostForwarded = forwardedFor.includes('127.0.0.1') || forwardedFor.includes('::1')

  if (expected) return provided === expected
  return localhostHost || localhostForwarded
}

// POST /api/brief
// Stores one brief file per day at /data/briefs/YYYY-MM-DD.json
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await request.json()
    const validated = validateBriefPayload(payload)

    if (!validated.ok) {
      return NextResponse.json({ success: false, error: validated.error }, { status: 400 })
    }

    const savedPath = await saveBrief(validated.data)
    return NextResponse.json({ success: true, path: savedPath })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to store brief' }, { status: 500 })
  }
}
