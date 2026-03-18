import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// GET /api/stats - Get all stats for a date range
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from') 
  const to = searchParams.get('to')
  
  try {
    const where: any = {}
    
    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from)
      if (to) where.date.lte = new Date(to)
    }
    
    const stats = await prisma.dailyStat.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 100,
    })
    
    return NextResponse.json({ stats })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

// POST /api/stats - Create or update a stat (agent access)
export async function POST(request: NextRequest) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { date, key, value, metadata } = body
    
    if (!date || !key || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields: date, key, value' }, { status: 400 })
    }
    
    const stat = await prisma.dailyStat.upsert({
      where: { date_key: { date: new Date(date), key } },
      update: { value, metadata },
      create: { date: new Date(date), key, value, metadata },
    })
    
    return NextResponse.json({ stat })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create/update stat' }, { status: 500 })
  }
}
