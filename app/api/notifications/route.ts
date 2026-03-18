import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// GET /api/notifications - List notifications
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unreadOnly') === 'true'
  const limit = parseInt(searchParams.get('limit') || '50')
  
  try {
    const notifications = await prisma.notification.findMany({
      where: unreadOnly ? { isRead: false } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    
    return NextResponse.json({ notifications })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// POST /api/notifications - Create notification (agent access)
export async function POST(request: NextRequest) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { type, title, message, source } = body
    
    if (!title || !message) {
      return NextResponse.json({ error: 'Missing required fields: title, message' }, { status: 400 })
    }
    
    const notification = await prisma.notification.create({
      data: {
        type: type || 'info',
        title,
        message,
        source,
      },
    })
    
    return NextResponse.json({ notification })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

// PATCH /api/notifications - Mark as read
export async function PATCH(request: NextRequest) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { id, markAllRead } = body
    
    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      })
      return NextResponse.json({ success: true })
    }
    
    if (!id) {
      return NextResponse.json({ error: 'Missing notification id' }, { status: 400 })
    }
    
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
    
    return NextResponse.json({ notification })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
