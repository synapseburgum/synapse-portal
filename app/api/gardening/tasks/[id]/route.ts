import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// GET /api/gardening/tasks/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const task = await prisma.gardenTask.findFirst({
      where: { id, archivedAt: null },
      include: { completions: { orderBy: { date: 'desc' }, take: 14 } },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ task })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

// PUT /api/gardening/tasks/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const task = await prisma.gardenTask.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        recurring: body.recurring,
        completed: body.completed,
        completedAt: body.completed ? new Date() : null,
      },
    })

    return NextResponse.json({ task })
  } catch {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE /api/gardening/tasks/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.gardenTask.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
