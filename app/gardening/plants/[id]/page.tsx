import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Clock3,
  Flower2,
  Info,
  Pencil,
  Ruler,
  Sprout,
  Sun,
  Thermometer,
} from 'lucide-react'
import { prisma } from '@/lib/db'

const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatWindow(start?: number | null, end?: number | null) {
  if (!start || !end) return 'Not set'
  if (start === end) return monthNames[start]
  return `${monthNames[start]}–${monthNames[end]}`
}

function categoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

async function getPlant(id: string) {
  try {
    return await prisma.gardenPlant.findUnique({
      where: { id },
      include: {
        seedInventory: true,
        plantings: {
          orderBy: { sowDate: 'desc' },
          take: 5,
        },
      },
    })
  } catch {
    return null
  }
}

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const plant = await getPlant(id)

  if (!plant) {
    notFound()
  }

  const totalSeedQty = plant.seedInventory.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <Link href="/gardening/plants" className="nav-link" style={{ padding: 0, marginBottom: 'var(--space-3)', width: 'fit-content' }}>
            <ArrowLeft />
            Back to Plant Library
          </Link>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>
            {plant.name}
            {plant.variety ? <span className="text-tertiary" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)' }}> • {plant.variety}</span> : null}
          </h1>
          <p className="text-muted mb-0">
            {categoryLabel(plant.category)} • Last updated {new Date(plant.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <Link href={`/gardening/plants/${plant.id}/edit`} className="btn btn-outline" aria-disabled="true">
          <Pencil />
          Edit (coming soon)
        </Link>
      </header>

      <section className="section">
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h2 className="card-title">Sowing & Harvest Windows</h2>
              </div>
              <div className="card-body">
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Sun size={16} /> Sow Indoors
                    </div>
                    <div className="list-item-meta">{formatWindow(plant.sowIndoorStart, plant.sowIndoorEnd)}</div>
                  </div>
                </div>
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Sprout size={16} /> Sow Outdoors
                    </div>
                    <div className="list-item-meta">{formatWindow(plant.sowOutdoorStart, plant.sowOutdoorEnd)}</div>
                  </div>
                </div>
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Calendar size={16} /> Harvest Window
                    </div>
                    <div className="list-item-meta">{formatWindow(plant.harvestStart, plant.harvestEnd)}</div>
                  </div>
                </div>
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Clock3 size={16} /> Time to Harvest
                    </div>
                    <div className="list-item-meta">{plant.daysToHarvest ? `${plant.daysToHarvest} days` : 'Not set'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h2 className="card-title">Growing Specs</h2>
              </div>
              <div className="card-body">
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Flower2 size={16} /> Category
                    </div>
                    <div className="list-item-meta">{categoryLabel(plant.category)}</div>
                  </div>
                </div>
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Ruler size={16} /> Spacing
                    </div>
                    <div className="list-item-meta">{plant.spacingCm ? `${plant.spacingCm} cm` : 'Not set'}</div>
                  </div>
                </div>
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Thermometer size={16} /> Sowing Depth
                    </div>
                    <div className="list-item-meta">{plant.depthCm ? `${plant.depthCm} cm` : 'Not set'}</div>
                  </div>
                </div>
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Info size={16} /> Current Stock
                    </div>
                    <div className="list-item-meta">{totalSeedQty} seeds across {plant.seedInventory.length} batches</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Notes</h2>
          </div>
          <div className="card-body">
            <p className="mb-0 text-secondary" style={{ maxWidth: '65ch' }}>
              {plant.description || plant.notes || 'No notes yet for this plant.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
