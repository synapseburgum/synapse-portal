import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseQuickCapture } from '@/lib/quickCapture'

// POST /api/inbox/capture
// Natural-language quick capture tuned for mobile-first task entry.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const text = typeof body?.text === 'string' ? body.text.trim() : ''

    if (!text) {
      return NextResponse.json({ error: 'Missing required field: text' }, { status: 400 })
    }

    const parsed = parseQuickCapture(text)

    if (parsed.intent === 'garden_task') {
      const task = await prisma.gardenTask.create({
        data: {
          title: parsed.title,
          description: parsed.description,
          dueDate: parsed.dueDate,
          recurring: parsed.recurring,
        },
      })

      const notification = await prisma.notification.create({
        data: {
          type: 'success',
          title: 'Quick task captured',
          message: `Added \"${task.title}\" for ${task.dueDate.toLocaleDateString()}.`,
          source: 'quick-capture',
        },
      })

      return NextResponse.json({
        ok: true,
        mode: 'garden_task',
        task,
        parsed,
        notification,
      })
    }

    const note = await prisma.notification.create({
      data: {
        type: 'info',
        title: 'Quick capture note',
        message: parsed.raw,
        source: 'quick-capture',
      },
    })

    return NextResponse.json({
      ok: true,
      mode: 'notification',
      notification: note,
      parsed,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to process quick capture' }, { status: 500 })
  }
}
