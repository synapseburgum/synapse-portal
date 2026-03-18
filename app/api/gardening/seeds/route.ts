import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// GET /api/gardening/seeds - List seed inventory
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lowStock = searchParams.get('lowStock') === 'true'

  try {
    const seeds = await prisma.seedInventory.findMany({
      where: lowStock ? { quantity: { lte: 10 } } : undefined,
      include: { plant: true },
      orderBy: [{ expiryDate: 'asc' }, { createdAt: 'desc' }],
      take: 100,
    })

    return NextResponse.json({ seeds })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch seeds' }, { status: 500 })
  }
}

// POST /api/gardening/seeds - Create seed inventory entry
export async function POST(request: NextRequest) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const seed = await prisma.seedInventory.create({
      data: {
        plantId: body.plantId,
        quantity: body.quantity,
        purchasedDate: body.purchasedDate ? new Date(body.purchasedDate) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        supplier: body.supplier,
        batchCode: body.batchCode,
        notes: body.notes,
      },
      include: { plant: true },
    })

    return NextResponse.json({ seed })
  } catch {
    return NextResponse.json({ error: 'Failed to create seed entry' }, { status: 500 })
  }
}
