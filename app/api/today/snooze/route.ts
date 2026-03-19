import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/today/snooze
// Snooze a task by pushing it to later or delaying by X hours/days
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id, duration } = body

    if (!type || !id || !duration) {
      return NextResponse.json({ error: 'Missing type, id, or duration' }, { status: 400 })
    }

    // Parse duration (e.g., "2h", "1d", "3d")
    const match = duration.match(/^(\d+)([hd])$/)
    if (!match) {
      return NextResponse.json({ error: 'Invalid duration format. Use format like "2h" or "1d"' }, { status: 400 })
    }

    const value = parseInt(match[1])
    const unit = match[2]

    // Calculate new due date
    const now = new Date()
    const newDueDate = new Date(now)

    if (unit === 'h') {
      newDueDate.setHours(newDueDate.getHours() + value)
    } else if (unit === 'd') {
      newDueDate.setDate(newDueDate.getDate() + value)
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
            dueDate: newDueDate,
          },
        })

        return NextResponse.json({ 
          success: true, 
          task: updatedTask,
          snoozedUntil: newDueDate.toISOString(),
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid type for snooze action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Snooze error:', error)
    return NextResponse.json({ error: 'Failed to snooze item' }, { status: 500 })
  }
}
