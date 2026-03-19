import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// POST /api/brief - create/update brief (auth required)
export async function POST(request: NextRequest) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const date = new Date(body.date)
    date.setHours(0, 0, 0, 0)

    const brief = await prisma.dailyBrief.upsert({
      where: { date },
      update: {
        tldr: body.tldr,
        content: body.content,
        audioUrl: body.audioUrl || null,
        isRead: body.isRead ?? false,
        isPinned: body.isPinned ?? false,
      },
      create: {
        date,
        tldr: body.tldr,
        content: body.content,
        audioUrl: body.audioUrl || null,
        isRead: body.isRead ?? false,
        isPinned: body.isPinned ?? false,
      },
    })

    return NextResponse.json({ ok: true, data: brief })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to create/update brief' }, { status: 500 })
  }
}

// PATCH /api/brief - quick read/pin toggles
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const id = String(body.id || '')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const updated = await prisma.dailyBrief.update({
      where: { id },
      data: {
        ...(typeof body.isRead === 'boolean' ? { isRead: body.isRead } : {}),
        ...(typeof body.isPinned === 'boolean' ? { isPinned: body.isPinned } : {}),
      },
    })

    return NextResponse.json({ ok: true, data: updated })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to update brief flags' }, { status: 500 })
  }
}
