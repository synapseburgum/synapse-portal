import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// GET /api/gardening/plots - List all plots
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location')
  
  try {
    const plots = await prisma.gardenPlot.findMany({
      where: location ? { location } : undefined,
      include: {
        _count: { select: { beds: true } },
      },
      orderBy: { name: 'asc' },
    })
    
    return NextResponse.json({ plots })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plots' }, { status: 500 })
  }
}

// POST /api/gardening/plots - Create a plot (agent or UI)
export async function POST(request: NextRequest) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const plot = await prisma.gardenPlot.create({
      data: {
        name: body.name,
        width: parseFloat(body.width),
        height: parseFloat(body.height),
        location: body.location,
        notes: body.notes,
      },
    })
    
    return NextResponse.json({ plot })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create plot' }, { status: 500 })
  }
}
