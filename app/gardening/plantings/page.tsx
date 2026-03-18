import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/db'
import PlantingCard from '@/components/gardening/PlantingCard'

const statuses = ['all', 'sown', 'germinated', 'transplanted', 'growing', 'flowering', 'fruiting', 'harvested', 'failed'] as const

async function getPlantings(status: string) {
  try {
    return await prisma.gardenPlanting.findMany({
      where: status === 'all' ? undefined : { status },
      include: { plant: true },
      orderBy: { sowDate: 'desc' },
    })
  } catch {
    return []
  }
}

export default async function PlantingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const status = statuses.includes((params.status as any) || 'all') ? ((params.status as any) || 'all') : 'all'
  const plantings = await getPlantings(status)

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Active Plantings</h1>
          <p className="text-muted mb-0">Track lifecycle status from sowing to harvest</p>
        </div>
        <Link href="/gardening/plantings/new" className="btn btn-success">
          <Plus />
          Add Planting
        </Link>
      </header>

      <section className="section">
        <div className="category-filter-wrapper">
          {statuses.map((item) => (
            <Link
              key={item}
              href={item === 'all' ? '/gardening/plantings' : `/gardening/plantings?status=${item}`}
              className={`category-filter-btn ${status === item ? 'active' : ''}`}
            >
              {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        {plantings.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <p className="empty-state-text">No plantings for this status yet.</p>
                <Link href="/gardening/plantings/new" className="btn btn-primary mt-4">
                  <Plus />
                  Add Planting
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="apps-grid">
            {plantings.map((planting) => (
              <PlantingCard
                key={planting.id}
                id={planting.id}
                plantName={planting.plant.name}
                location={planting.location}
                sowDate={planting.sowDate}
                status={planting.status}
                quantity={planting.quantity}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
