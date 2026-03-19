import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// GET /api/gardening/plots/[id]/beds - List beds for a plot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const beds = await prisma.bed.findMany({
      where: { plotId: id },
      include: {
        _count: { select: { plantings: true } },
      },
      orderBy: { name: 'asc' },
    })
    
    return NextResponse.json({ beds })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch beds' }, { status: 500 })
  }
}

// POST /api/gardening/plots/[id]/beds - Create a bed in a plot
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  const { id } = await params
  
  try {
    const body = await request.json()
    const bed = await prisma.bed.create({
      data: {
        plotId: id,
        name: body.name,
        x: parseFloat(body.x || 0),
        y: parseFloat(body.y || 0),
        width: parseFloat(body.width),
        height: parseFloat(body.height),
        soilType: body.soilType,
        notes: body.notes,
      },
    })
    
    return NextResponse.json({ bed })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create bed' }, { status: 500 })
  }
}
