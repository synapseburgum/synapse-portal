import { Plus, Sprout } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import PlantCard from '@/components/gardening/PlantCard'

async function getPlants(category?: string) {
  try {
    const where = category && category !== 'all' ? { category } : {}
    const plants = await prisma.gardenPlant.findMany({
      where,
      orderBy: { name: 'asc' },
    })
    return plants
  } catch {
    return []
  }
}

export default async function PlantsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const category = params.category || 'all'
  const plants = await getPlants(category)

  return (
    <div className="container">
      {/* Header */}
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Plant Library</h1>
          <p className="text-muted mb-0">{plants.length} plants in your library</p>
        </div>
        <Link href="/gardening/plants/new" className="btn btn-success">
          <Plus />
          <span className="hide-mobile">Add Plant</span>
        </Link>
      </header>

      {/* Search & Filter */}
      <section className="section">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-lg-8">
            {/* Client-side filter handled by URL param */}
            <div className="category-filter-wrapper">
              <Link 
                href="/gardening/plants" 
                className={`category-filter-btn ${category === 'all' ? 'active' : ''}`}
              >
                All
              </Link>
              {['vegetable', 'herb', 'flower', 'fruit'].map((cat) => (
                <Link
                  key={cat}
                  href={`/gardening/plants?category=${cat}`}
                  className={`category-filter-btn ${category === cat ? 'active' : ''}`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Plants List */}
      <section className="section">
        {plants.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Sprout />
                </div>
                <p className="empty-state-text">
                  {category === 'all' 
                    ? 'No plants yet. Add your first plant to get started.'
                    : `No ${category} plants. Try a different category or add one.`}
                </p>
                <Link href="/gardening/plants/new" className="btn btn-primary mt-4">
                  <Plus />
                  Add Plant
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="apps-grid">
            {plants.map((plant) => (
              <PlantCard
                key={plant.id}
                id={plant.id}
                name={plant.name}
                variety={plant.variety}
                category={plant.category}
                sowIndoorStart={plant.sowIndoorStart}
                sowIndoorEnd={plant.sowIndoorEnd}
                sowOutdoorStart={plant.sowOutdoorStart}
                sowOutdoorEnd={plant.sowOutdoorEnd}
                imageUrl={plant.imageUrl}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
