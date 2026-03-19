import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { validateApiKey } from '@/lib/auth'

// GET /api/gardening/plots/[id]/beds/[bedId] - Get single bed
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bedId: string }> }
) {
  const { id, bedId } = await params
  
  try {
    const bed = await prisma.bed.findFirst({
      where: { id: bedId, plotId: id },
      include: {
        _count: { select: { plantings: true } },
      },
    })
    
    if (!bed) {
      return NextResponse.json({ error: 'Bed not found' }, { status: 404 })
    }
    
    return NextResponse.json({ bed })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bed' }, { status: 500 })
  }
}

// PUT /api/gardening/plots/[id]/beds/[bedId] - Update bed
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bedId: string }> }
) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  const { id, bedId } = await params
  
  try {
    const body = await request.json()
    
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.x !== undefined) updateData.x = parseFloat(body.x)
    if (body.y !== undefined) updateData.y = parseFloat(body.y)
    if (body.width !== undefined) updateData.width = parseFloat(body.width)
    if (body.height !== undefined) updateData.height = parseFloat(body.height)
    if (body.soilType !== undefined) updateData.soilType = body.soilType
    if (body.notes !== undefined) updateData.notes = body.notes
    
    const bed = await prisma.bed.update({
      where: { id: bedId },
      data: updateData,
    })
    
    return NextResponse.json({ bed })
  } catch (error) {
    console.error('Failed to update bed:', error)
    return NextResponse.json({ error: 'Failed to update bed' }, { status: 500 })
  }
}

// DELETE /api/gardening/plots/[id]/beds/[bedId] - Delete bed
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; bedId: string }> }
) {
  const auth = validateApiKey(request)
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }
  
  const { id, bedId } = await params
  
  try {
    // Verify bed belongs to this plot
    const bed = await prisma.bed.findFirst({
      where: { id: bedId, plotId: id },
    })
    
    if (!bed) {
      return NextResponse.json({ error: 'Bed not found' }, { status: 404 })
    }
    
    await prisma.bed.delete({
      where: { id: bedId },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete bed:', error)
    return NextResponse.json({ error: 'Failed to delete bed' }, { status: 500 })
  }
}
