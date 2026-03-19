import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// GET /api/gardening/plots/[id] - Get single plot with beds
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const plot = await prisma.gardenPlot.findUnique({
      where: { id },
      include: {
        beds: {
          include: {
            plantings: {
              include: {
                plant: {
                  select: {
                    id: true,
                    name: true,
                    variety: true,
                    category: true,
                  }
                }
              }
            },
            _count: { select: { plantings: true } },
          },
          orderBy: { name: 'asc' },
        },
      },
    })
    
    if (!plot) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 })
    }
    
    return NextResponse.json({ plot })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plot' }, { status: 500 })
  }
}

// PUT /api/gardening/plots/[id] - Update plot
export async function PUT(
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
    const plot = await prisma.gardenPlot.update({
      where: { id },
      data: {
        name: body.name,
        width: body.width !== undefined ? parseFloat(body.width) : undefined,
        height: body.height !== undefined ? parseFloat(body.height) : undefined,
        location: body.location,
        notes: body.notes,
      },
    })
    
    return NextResponse.json({ plot })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update plot' }, { status: 500 })
  }
}

// DELETE /api/gardening/plots/[id] - Delete plot (cascades to beds)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  const { id } = await params
  
  try {
    await prisma.gardenPlot.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete plot' }, { status: 500 })
  }
}
