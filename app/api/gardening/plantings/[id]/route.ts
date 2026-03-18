import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// GET /api/gardening/plantings/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const planting = await prisma.gardenPlanting.findUnique({
      where: { id },
      include: { plant: true },
    })

    if (!planting) {
      return NextResponse.json({ error: 'Planting not found' }, { status: 404 })
    }

    return NextResponse.json({ planting })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch planting' }, { status: 500 })
  }
}

// PUT /api/gardening/plantings/[id]
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

    const planting = await prisma.gardenPlanting.update({
      where: { id },
      data: {
        plantId: body.plantId,
        location: body.location,
        sowDate: body.sowDate ? new Date(body.sowDate) : undefined,
        transplantDate: body.transplantDate ? new Date(body.transplantDate) : null,
        expectedHarvestDate: body.expectedHarvestDate ? new Date(body.expectedHarvestDate) : null,
        actualHarvestDate: body.actualHarvestDate ? new Date(body.actualHarvestDate) : null,
        quantity: body.quantity,
        status: body.status,
        notes: body.notes,
      },
      include: { plant: true },
    })

    return NextResponse.json({ planting })
  } catch {
    return NextResponse.json({ error: 'Failed to update planting' }, { status: 500 })
  }
}

// DELETE /api/gardening/plantings/[id]
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
    await prisma.gardenPlanting.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete planting' }, { status: 500 })
  }
}
