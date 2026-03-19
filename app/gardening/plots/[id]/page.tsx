import { ArrowLeft, Plus, MapPin, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'

async function getPlot(id: string) {
  try {
    const plot = await prisma.gardenPlot.findUnique({
      where: { id },
      include: {
        beds: {
          include: {
            _count: { select: { plantings: true } },
          },
          orderBy: { name: 'asc' },
        },
      },
    })
    return plot
  } catch {
    return null
  }
}

export default async function PlotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const plot = await getPlot(id)

  if (!plot) {
    notFound()
  }

  const locationLabels: Record<string, string> = {
    backyard: 'Backyard',
    allotment: 'Allotment',
    balcony: 'Balcony',
    greenhouse: 'Greenhouse',
    indoor: 'Indoor',
  }

  const soilTypeLabels: Record<string, string> = {
    clay: 'Clay',
    sandy: 'Sandy',
    loam: 'Loam',
    'compost-rich': 'Compost-Rich',
    chalky: 'Chalky',
    silty: 'Silty',
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <Link 
            href="/gardening/plots" 
            className="text-muted"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', marginBottom: 'var(--space-2)', textDecoration: 'none' }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            Back to Plots
          </Link>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>{plot.name}</h1>
          <p className="text-muted mb-0">
            {plot.width}m × {plot.height}m
            {plot.location && ` • ${locationLabels[plot.location] || plot.location}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-secondary">
            <Edit />
            <span className="hide-phone">Edit</span>
          </button>
          <button className="btn btn-danger">
            <Trash2 />
            <span className="hide-phone">Delete</span>
          </button>
        </div>
      </header>

      {/* Plot Info */}
      {plot.notes && (
        <section className="section">
          <div className="card">
            <div className="card-body">
              <p style={{ margin: 0, fontStyle: 'italic' }}>{plot.notes}</p>
            </div>
          </div>
        </section>
      )}

      {/* Beds Section */}
      <section className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ margin: 0 }}>Beds & Zones</h2>
          <button className="btn btn-success">
            <Plus />
            <span className="hide-phone">Add Bed</span>
          </button>
        </div>

        {plot.beds.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <MapPin />
                </div>
                <p className="empty-state-text">
                  No beds or zones defined yet. Add beds to organize plantings within this plot.
                </p>
                <button className="btn btn-primary mt-4">
                  <Plus />
                  Add First Bed
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="apps-grid">
            {plot.beds.map((bed) => (
              <div key={bed.id} className="card card-hover">
                <div className="card-body">
                  <h3 style={{ margin: '0 0 var(--space-3) 0', fontSize: '1.125rem' }}>{bed.name}</h3>
                  
                  <div style={{ display: 'grid', gap: 'var(--space-2)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <div>
                      <strong>Position:</strong> ({bed.x}m, {bed.y}m)
                    </div>
                    <div>
                      <strong>Size:</strong> {bed.width}m × {bed.height}m
                    </div>
                    {bed.soilType && (
                      <div>
                        <strong>Soil:</strong> {soilTypeLabels[bed.soilType] || bed.soilType}
                      </div>
                    )}
                    <div>
                      <strong>Plantings:</strong> {bed._count.plantings}
                    </div>
                    {bed.notes && (
                      <div style={{ marginTop: 'var(--space-2)', fontStyle: 'italic' }}>
                        {bed.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Future: Plot Visualization */}
      <section className="section">
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
            <MapPin style={{ width: '3rem', height: '3rem', marginBottom: 'var(--space-3)', opacity: 0.5 }} />
            <p style={{ margin: 0 }}>
              Interactive plot visualization coming in Sprint 4
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
