import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

type CalendarEvent = {
  id: string
  type: 'sowing' | 'harvest' | 'task' | 'transplant'
  title: string
  date: string
  endDate?: string
  source?: string
}

function toISODate(date: Date) {
  return new Date(date).toISOString()
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')

  const from = fromParam ? new Date(fromParam) : new Date()
  const to = toParam ? new Date(toParam) : new Date()

  try {
    const [tasks, plantings, plants] = await Promise.all([
      prisma.gardenTask.findMany({
        where: {
          archivedAt: null,
          dueDate: { gte: from, lte: to },
        },
      }),
      prisma.gardenPlanting.findMany({
        where: {
          OR: [
            { sowDate: { gte: from, lte: to } },
            { expectedHarvestDate: { gte: from, lte: to } },
            { transplantDate: { gte: from, lte: to } },
          ],
        },
        include: { plant: true },
      }),
      prisma.gardenPlant.findMany(),
    ])

    const events: CalendarEvent[] = []

    for (const task of tasks) {
      events.push({
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        date: toISODate(task.dueDate),
        source: 'task',
      })
    }

    for (const planting of plantings) {
      events.push({
        id: `sow-${planting.id}`,
        type: 'sowing',
        title: `${planting.plant.name}: Sowing`,
        date: toISODate(planting.sowDate),
        source: planting.location || 'planting',
      })

      if (planting.transplantDate) {
        events.push({
          id: `transplant-${planting.id}`,
          type: 'transplant',
          title: `${planting.plant.name}: Transplant`,
          date: toISODate(planting.transplantDate),
          source: planting.location || 'planting',
        })
      }

      if (planting.expectedHarvestDate) {
        events.push({
          id: `harvest-${planting.id}`,
          type: 'harvest',
          title: `${planting.plant.name}: Expected harvest`,
          date: toISODate(planting.expectedHarvestDate),
          source: planting.location || 'planting',
        })
      }
    }

    const year = from.getFullYear()
    const fromMonth = from.getMonth() + 1
    const toMonth = to.getMonth() + 1

    for (const plant of plants) {
      if (plant.sowOutdoorStart && plant.sowOutdoorEnd) {
        for (let month = plant.sowOutdoorStart; month <= plant.sowOutdoorEnd; month++) {
          if (month >= fromMonth && month <= toMonth) {
            events.push({
              id: `window-sow-${plant.id}-${month}`,
              type: 'sowing',
              title: `${plant.name}: Outdoor sowing window`,
              date: new Date(year, month - 1, 1).toISOString(),
              source: 'plant library',
            })
          }
        }
      }

      if (plant.harvestStart && plant.harvestEnd) {
        for (let month = plant.harvestStart; month <= plant.harvestEnd; month++) {
          if (month >= fromMonth && month <= toMonth) {
            events.push({
              id: `window-harvest-${plant.id}-${month}`,
              type: 'harvest',
              title: `${plant.name}: Harvest window`,
              date: new Date(year, month - 1, 1).toISOString(),
              source: 'plant library',
            })
          }
        }
      }
    }

    return NextResponse.json({ events })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
  }
}
