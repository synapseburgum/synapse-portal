import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// GET /api/gardening/seeds/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const seed = await prisma.seedInventory.findUnique({
      where: { id },
      include: { plant: true },
    })

    if (!seed) {
      return NextResponse.json({ error: 'Seed entry not found' }, { status: 404 })
    }

    return NextResponse.json({ seed })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch seed entry' }, { status: 500 })
  }
}

// PUT /api/gardening/seeds/[id]
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

    const seed = await prisma.seedInventory.update({
      where: { id },
      data: {
        plantId: body.plantId,
        quantity: body.quantity,
        purchasedDate: body.purchasedDate ? new Date(body.purchasedDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        supplier: body.supplier,
        batchCode: body.batchCode,
        notes: body.notes,
      },
      include: { plant: true },
    })

    return NextResponse.json({ seed })
  } catch {
    return NextResponse.json({ error: 'Failed to update seed entry' }, { status: 500 })
  }
}

// DELETE /api/gardening/seeds/[id]
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
    await prisma.seedInventory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete seed entry' }, { status: 500 })
  }
}
