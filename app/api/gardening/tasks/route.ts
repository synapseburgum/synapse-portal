import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// GET /api/gardening/tasks - List tasks
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const completed = searchParams.get('completed')
  const upcoming = searchParams.get('upcoming') === 'true'
  
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const where: any = {}
    
    if (completed !== null) {
      where.completed = completed === 'true'
    }
    
    if (upcoming) {
      where.completed = false
      where.dueDate = { gte: today }
    }
    
    const tasks = await prisma.gardenTask.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      take: 50,
    })
    
    return NextResponse.json({ tasks })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/gardening/tasks - Create task
export async function POST(request: NextRequest) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const task = await prisma.gardenTask.create({
      data: {
        title: body.title,
        description: body.description,
        dueDate: new Date(body.dueDate),
        recurring: body.recurring,
      },
    })
    
    return NextResponse.json({ task })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

// PATCH /api/gardening/tasks - Complete task
export async function PATCH(request: NextRequest) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { id, completed } = body
    
    const task = await prisma.gardenTask.update({
      where: { id },
      data: {
        completed: completed ?? true,
        completedAt: completed ? new Date() : null,
      },
    })
    
    return NextResponse.json({ task })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
