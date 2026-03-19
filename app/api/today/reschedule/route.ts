import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/today/reschedule
// Reschedule a task to a specific date/time
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, newDate } = body

    if (!type || !id || !newDate) {
      return NextResponse.json({ error: 'Missing type, id, or newDate' }, { status: 400 })
    }

    const parsedDate = new Date(newDate)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    // Handle different priority types
    switch (type) {
      case 'task': {
        const task = await prisma.gardenTask.findFirst({ where: { id, archivedAt: null } })
        if (!task) {
          return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        const updatedTask = await prisma.gardenTask.update({
          where: { id },
          data: {
            dueDate: parsedDate,
          },
        })

        return NextResponse.json({ 
          success: true, 
          task: updatedTask,
          rescheduledTo: parsedDate.toISOString(),
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid type for reschedule action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Reschedule error:', error)
    return NextResponse.json({ error: 'Failed to reschedule item' }, { status: 500 })
  }
}
