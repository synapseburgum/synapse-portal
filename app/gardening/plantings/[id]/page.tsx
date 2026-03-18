import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, Save } from 'lucide-react'
import { prisma } from '@/lib/db'
import StatusBadge from '@/components/gardening/StatusBadge'

async function getPlanting(id: string) {
  try {
    return await prisma.gardenPlanting.findUnique({
      where: { id },
      include: { plant: true },
    })
  } catch {
    return null
  }
}

async function updatePlantingStatus(formData: FormData) {
  'use server'

  const id = String(formData.get('id') || '').trim()
  const status = String(formData.get('status') || '').trim()

  if (!id || !status) return

  await prisma.gardenPlanting.update({
    where: { id },
    data: {
      status,
      actualHarvestDate:
        status === 'harvested' ? new Date(String(formData.get('actualHarvestDate') || new Date().toISOString())) : null,
    },
  })

  redirect(`/gardening/plantings/${id}`)
}

export default async function PlantingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const planting = await getPlanting(id)

  if (!planting) notFound()

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <Link href="/gardening/plantings" className="nav-link" style={{ padding: 0, marginBottom: 'var(--space-3)', width: 'fit-content' }}>
            <ArrowLeft />
            Back to Plantings
          </Link>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>{planting.plant.name}</h1>
          <p className="text-muted mb-0">Current status: <StatusBadge status={planting.status} /></p>
        </div>
      </header>

      <section className="section">
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h2 className="card-title">Planting Timeline</h2>
              </div>
              <div className="card-body">
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Calendar size={16} /> Sown
                    </div>
                    <div className="list-item-meta">{new Date(planting.sowDate).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">Transplanted</div>
                    <div className="list-item-meta">{planting.transplantDate ? new Date(planting.transplantDate).toLocaleDateString() : 'Not set'}</div>
                  </div>
                </div>
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">Expected harvest</div>
                    <div className="list-item-meta">{planting.expectedHarvestDate ? new Date(planting.expectedHarvestDate).toLocaleDateString() : 'Not set'}</div>
                  </div>
                </div>
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title">Actual harvest</div>
                    <div className="list-item-meta">{planting.actualHarvestDate ? new Date(planting.actualHarvestDate).toLocaleDateString() : 'Not harvested yet'}</div>
                  </div>
                </div>
                <div className="list-item">
                  <div className="list-item-content">
                    <div className="list-item-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <MapPin size={16} /> Location
                    </div>
                    <div className="list-item-meta">{planting.location || 'Not set'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h2 className="card-title">Update Status</h2>
              </div>
              <div className="card-body">
                <form action={updatePlantingStatus} style={{ display: 'grid', gap: 'var(--space-4)' }}>
                  <input type="hidden" name="id" value={planting.id} />

                  <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                    <span className="list-item-title">Status</span>
                    <select name="status" className="form-input" defaultValue={planting.status}>
                      <option value="sown">Sown</option>
                      <option value="germinated">Germinated</option>
                      <option value="transplanted">Transplanted</option>
                      <option value="growing">Growing</option>
                      <option value="flowering">Flowering</option>
                      <option value="fruiting">Fruiting</option>
                      <option value="harvested">Harvested</option>
                      <option value="failed">Failed</option>
                    </select>
                  </label>

                  <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                    <span className="list-item-title">Actual Harvest Date (if harvested)</span>
                    <input type="date" name="actualHarvestDate" className="form-input" />
                  </label>

                  <button type="submit" className="btn btn-primary">
                    <Save />
                    Update Status
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
