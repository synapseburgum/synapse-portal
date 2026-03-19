import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// POST /api/today/complete
// Mark a priority item as complete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id } = body

    if (!type || !id) {
      return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
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
            completed: true,
            completedAt: new Date(),
          },
        })

        return NextResponse.json({ success: true, task: updatedTask })
      }

      case 'notification': {
        const notification = await prisma.notification.findUnique({ where: { id } })
        if (!notification) {
          return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
        }

        await prisma.notification.update({
          where: { id },
          data: { isRead: true },
        })

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Complete error:', error)
    return NextResponse.json({ error: 'Failed to complete item' }, { status: 500 })
  }
}
