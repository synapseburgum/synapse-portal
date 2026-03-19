import { Plus, Map } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/db'

async function getPlots(location?: string) {
  try {
    const where = location && location !== 'all' ? { location } : {}
    const plots = await prisma.gardenPlot.findMany({
      where,
      include: {
        _count: { select: { beds: true } },
      },
      orderBy: { name: 'asc' },
    })
    return plots
  } catch {
    return []
  }
}

export default async function PlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>
}) {
  const params = await searchParams
  const location = params.location || 'all'
  const plots = await getPlots(location)

  const locationLabels: Record<string, string> = {
    backyard: 'Backyard',
    allotment: 'Allotment',
    balcony: 'Balcony',
    greenhouse: 'Greenhouse',
    indoor: 'Indoor',
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Garden Plots</h1>
          <p className="text-muted mb-0">{plots.length} plots • Manage your growing areas</p>
        </div>
        <Link href="/gardening/plots/new" className="btn btn-success">
          <Plus />
          <span className="hide-phone">Add Plot</span>
        </Link>
      </header>

      {/* Filter */}
      <section className="section">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-lg-8">
            <div className="category-filter-wrapper">
              <Link 
                href="/gardening/plots" 
                className={`category-filter-btn ${location === 'all' ? 'active' : ''}`}
              >
                All
              </Link>
              {['backyard', 'allotment', 'balcony', 'greenhouse', 'indoor'].map((loc) => (
                <Link
                  key={loc}
                  href={`/gardening/plots?location=${loc}`}
                  className={`category-filter-btn ${location === loc ? 'active' : ''}`}
                >
                  {locationLabels[loc]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Plots List */}
      <section className="section">
        {plots.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Map />
                </div>
                <p className="empty-state-text">
                  {location === 'all' 
                    ? 'No plots yet. Create your first plot to start organizing your garden.'
                    : `No ${locationLabels[location]?.toLowerCase() || location} plots. Try a different location or create one.`}
                </p>
                <Link href="/gardening/plots/new" className="btn btn-primary mt-4">
                  <Plus />
                  Add Plot
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="apps-grid">
            {plots.map((plot) => (
              <Link
                key={plot.id}
                href={`/gardening/plots/${plot.id}`}
                className="card card-hover"
              >
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-3)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{plot.name}</h3>
                    {plot.location && (
                      <span className="badge badge-secondary">{locationLabels[plot.location] || plot.location}</span>
                    )}
                  </div>
                  
                  <div style={{ display: 'grid', gap: 'var(--space-2)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <div>
                      <strong>Size:</strong> {plot.width}m × {plot.height}m
                    </div>
                    <div>
                      <strong>Beds:</strong> {plot._count.beds}
                    </div>
                    {plot.notes && (
                      <div style={{ marginTop: 'var(--space-2)', fontStyle: 'italic' }}>
                        {plot.notes}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
