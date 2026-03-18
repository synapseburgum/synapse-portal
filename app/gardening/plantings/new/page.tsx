import { redirect } from 'next/navigation'
import { Save } from 'lucide-react'
import { prisma } from '@/lib/db'

async function createPlantingAction(formData: FormData) {
  'use server'

  const plantId = String(formData.get('plantId') || '').trim()
  const sowDate = String(formData.get('sowDate') || '').trim()

  if (!plantId || !sowDate) return

  await prisma.gardenPlanting.create({
    data: {
      plantId,
      location: String(formData.get('location') || '').trim() || null,
      sowDate: new Date(sowDate),
      transplantDate: formData.get('transplantDate') ? new Date(String(formData.get('transplantDate'))) : null,
      expectedHarvestDate: formData.get('expectedHarvestDate') ? new Date(String(formData.get('expectedHarvestDate'))) : null,
      quantity: formData.get('quantity') ? Number(formData.get('quantity')) : null,
      status: String(formData.get('status') || 'sown'),
      notes: String(formData.get('notes') || '').trim() || null,
    },
  })

  redirect('/gardening/plantings')
}

async function getPlants() {
  try {
    return await prisma.gardenPlant.findMany({ orderBy: { name: 'asc' } })
  } catch {
    return []
  }
}

export default async function NewPlantingPage() {
  const plants = await getPlants()
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Add Planting</h1>
          <p className="text-muted mb-0">Log new sowings and track status progression</p>
        </div>
      </header>

      <section className="section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Planting Details</h2>
          </div>
          <div className="card-body">
            <form action={createPlantingAction} style={{ display: 'grid', gap: 'var(--space-6)' }}>
              <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Plant *</span>
                  <select name="plantId" className="form-input" required>
                    <option value="">Select plant</option>
                    {plants.map((plant) => (
                      <option key={plant.id} value={plant.id}>
                        {plant.name}{plant.variety ? ` • ${plant.variety}` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Status</span>
                  <select name="status" className="form-input" defaultValue="sown">
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
                  <span className="list-item-title">Sow Date *</span>
                  <input type="date" name="sowDate" className="form-input" defaultValue={today} required />
                </label>

                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Location</span>
                  <input name="location" className="form-input" placeholder="Greenhouse, bed-1, pot, etc." />
                </label>

                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Quantity</span>
                  <input type="number" name="quantity" className="form-input" min={0} />
                </label>

                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Transplant Date</span>
                  <input type="date" name="transplantDate" className="form-input" />
                </label>

                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Expected Harvest</span>
                  <input type="date" name="expectedHarvestDate" className="form-input" />
                </label>
              </div>

              <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                <span className="list-item-title">Notes</span>
                <textarea name="notes" className="form-input" rows={4} placeholder="Conditions, observations, reminders..." />
              </label>

              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary">
                  <Save />
                  Save Planting
                </button>
                <a href="/gardening/plantings" className="btn btn-secondary">Cancel</a>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
