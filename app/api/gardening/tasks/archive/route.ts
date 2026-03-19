import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// POST /api/gardening/tasks/archive
// Body: { id?: string, ids?: string[] }
// Archives tasks (soft-delete) so they no longer show in normal lists.
export async function POST(request: NextRequest) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const ids = [
      ...(typeof body.id === 'string' && body.id.trim() ? [body.id.trim()] : []),
      ...(Array.isArray(body.ids) ? body.ids.filter((v: unknown) => typeof v === 'string' && v.trim()) : []),
    ]

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Task id(s) required' }, { status: 400 })
    }

    const now = new Date()
    const result = await prisma.gardenTask.updateMany({
      where: {
        id: { in: ids },
        archivedAt: null,
      },
      data: {
        archivedAt: now,
      },
    })

    return NextResponse.json({ success: true, archived: result.count })
  } catch {
    return NextResponse.json({ error: 'Failed to archive task(s)' }, { status: 500 })
  }
}
