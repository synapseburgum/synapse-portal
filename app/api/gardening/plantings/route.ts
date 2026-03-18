import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// GET /api/gardening/plantings - List plantings
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  
  try {
    const plantings = await prisma.gardenPlanting.findMany({
      where: status ? { status: status as any } : undefined,
      include: { plant: true },
      orderBy: { sowDate: 'desc' },
      take: 50,
    })
    
    return NextResponse.json({ plantings })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch plantings' }, { status: 500 })
  }
}

// POST /api/gardening/plantings - Create planting
export async function POST(request: NextRequest) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const planting = await prisma.gardenPlanting.create({
      data: {
        plantId: body.plantId,
        location: body.location,
        sowDate: new Date(body.sowDate),
        transplantDate: body.transplantDate ? new Date(body.transplantDate) : undefined,
        quantity: body.quantity,
        notes: body.notes,
      },
      include: { plant: true },
    })
    
    return NextResponse.json({ planting })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create planting' }, { status: 500 })
  }
}

// PATCH /api/gardening/plantings - Update planting status
export async function PATCH(request: NextRequest) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { id, status, actualHarvestDate } = body
    
    const planting = await prisma.gardenPlanting.update({
      where: { id },
      data: {
        status: status as any,
        actualHarvestDate: actualHarvestDate ? new Date(actualHarvestDate) : undefined,
      },
      include: { plant: true },
    })
    
    return NextResponse.json({ planting })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update planting' }, { status: 500 })
  }
}
