import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function normalizeToDay(value?: string) {
  const d = value ? new Date(value) : new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// PATCH /api/gardening/tasks/[id]/complete
// Persistent completion tracking using TaskCompletion model for recurring tasks.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const completed = body.completed !== false
    const date = normalizeToDay(body.date)

    const task = await prisma.gardenTask.findUnique({ where: { id } })
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.recurring) {
      if (completed) {
        const completion = await prisma.taskCompletion.upsert({
          where: {
            taskId_date: {
              taskId: id,
              date,
            },
          },
          create: {
            taskId: id,
            date,
          },
          update: {
            completedAt: new Date(),
          },
        })

        return NextResponse.json({ success: true, completion })
      }

      await prisma.taskCompletion.deleteMany({
        where: {
          taskId: id,
          date,
        },
      })

      return NextResponse.json({ success: true, removed: true })
    }

    const updatedTask = await prisma.gardenTask.update({
      where: { id },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, task: updatedTask })
  } catch {
    return NextResponse.json({ error: 'Failed to toggle completion' }, { status: 500 })
  }
}
