import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// GET /api/gardening/plants - List all plants
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  
  try {
    const plants = await prisma.gardenPlant.findMany({
      where: category ? { category } : undefined,
      include: {
        _count: { select: { plantings: true, seedInventory: true } },
      },
      orderBy: { name: 'asc' },
    })
    
    return NextResponse.json({ plants })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plants' }, { status: 500 })
  }
}

// POST /api/gardening/plants - Create a plant (agent or UI)
export async function POST(request: NextRequest) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const plant = await prisma.gardenPlant.create({
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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create plant' }, { status: 500 })
  }
}
