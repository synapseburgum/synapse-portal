import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

function normalizeToDay(value?: string) {
  const d = value ? new Date(value) : new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// POST /api/gardening/tasks/batch-complete
// Body: { taskIds: string[], date?: string, completed?: boolean }
export async function POST(request: NextRequest) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const taskIds: string[] = Array.isArray(body.taskIds) ? body.taskIds : []
    const completed = body.completed !== false
    const date = normalizeToDay(body.date)

    if (taskIds.length === 0) {
      return NextResponse.json({ error: 'taskIds is required' }, { status: 400 })
    }

    const tasks = await prisma.gardenTask.findMany({
      where: { id: { in: taskIds }, archivedAt: null },
      select: { id: true, recurring: true },
    })

    const recurringIds = tasks.filter((t) => t.recurring).map((t) => t.id)
    const oneOffIds = tasks.filter((t) => !t.recurring).map((t) => t.id)

    if (recurringIds.length > 0) {
      if (completed) {
        await prisma.$transaction(
          recurringIds.map((id) =>
            prisma.taskCompletion.upsert({
              where: { taskId_date: { taskId: id, date } },
              create: { taskId: id, date },
              update: { completedAt: new Date() },
            })
          )
        )
      } else {
        await prisma.taskCompletion.deleteMany({
          where: {
            taskId: { in: recurringIds },
            date,
          },
        })
      }
    }

    if (oneOffIds.length > 0) {
      await prisma.gardenTask.updateMany({
        where: { id: { in: oneOffIds } },
        data: {
          completed,
          completedAt: completed ? new Date() : null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      updated: {
        recurring: recurringIds.length,
        oneOff: oneOffIds.length,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to batch update tasks' }, { status: 500 })
  }
}
