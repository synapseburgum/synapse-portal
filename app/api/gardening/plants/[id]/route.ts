import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// GET /api/gardening/plants/[id] - Get single plant
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const plant = await prisma.gardenPlant.findUnique({
      where: { id },
      include: {
        seedInventory: true,
        plantings: {
          orderBy: { sowDate: 'desc' },
        },
      },
    })

    if (!plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    return NextResponse.json({ plant })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch plant' }, { status: 500 })
  }
}

// PUT /api/gardening/plants/[id] - Update plant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const plant = await prisma.gardenPlant.update({
      where: { id },
      data: {
        name: body.name,
        variety: body.variety,
        category: body.category,
        description: body.description,
        sowIndoorStart: body.sowIndoorStart,
        sowIndoorEnd: body.sowIndoorEnd,
        sowOutdoorStart: body.sowOutdoorStart,
        sowOutdoorEnd: body.sowOutdoorEnd,
        harvestStart: body.harvestStart,
        harvestEnd: body.harvestEnd,
        daysToGerminate: body.daysToGerminate,
        daysToHarvest: body.daysToHarvest,
        spacingCm: body.spacingCm,
        depthCm: body.depthCm,
        notes: body.notes,
        imageUrl: body.imageUrl,
      },
    })

    return NextResponse.json({ plant })
  } catch {
    return NextResponse.json({ error: 'Failed to update plant' }, { status: 500 })
  }
}

// DELETE /api/gardening/plants/[id] - Delete plant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params

    await prisma.gardenPlant.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete plant' }, { status: 500 })
  }
}
