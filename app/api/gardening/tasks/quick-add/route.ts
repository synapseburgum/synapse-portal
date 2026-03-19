import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/gardening/tasks/quick-add
// Lightweight endpoint for in-app quick capture UI (manual + voice-filled form submission).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const title = typeof body.title === 'string' ? body.title.trim() : ''

    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
    }

    const dueDate = body.dueDate ? new Date(body.dueDate) : new Date()
    if (Number.isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: 'Invalid due date' }, { status: 400 })
    }

    const task = await prisma.gardenTask.create({
      data: {
        title,
        description: typeof body.description === 'string' ? body.description.trim() || null : null,
        dueDate,
        recurring: typeof body.recurring === 'string' && body.recurring.trim() ? body.recurring.trim() : null,
      },
    })

    return NextResponse.json({ task })
  } catch {
    return NextResponse.json({ error: 'Failed to create quick task' }, { status: 500 })
  }
}
