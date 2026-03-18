import { redirect } from 'next/navigation'
import { Save } from 'lucide-react'
import { prisma } from '@/lib/db'

async function createSeedAction(formData: FormData) {
  'use server'

  const plantId = String(formData.get('plantId') || '').trim()
  const quantity = Number(formData.get('quantity') || 0)

  if (!plantId || !Number.isFinite(quantity)) return

  await prisma.seedInventory.create({
    data: {
      plantId,
      quantity,
      supplier: String(formData.get('supplier') || '').trim() || null,
      batchCode: String(formData.get('batchCode') || '').trim() || null,
      notes: String(formData.get('notes') || '').trim() || null,
      purchasedDate: formData.get('purchasedDate') ? new Date(String(formData.get('purchasedDate'))) : null,
      expiryDate: formData.get('expiryDate') ? new Date(String(formData.get('expiryDate'))) : null,
    },
  })

  redirect('/gardening/seeds')
}

async function getPlants() {
  try {
    return await prisma.gardenPlant.findMany({ orderBy: { name: 'asc' } })
  } catch {
    return []
  }
}

export default async function NewSeedPage() {
  const plants = await getPlants()

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Add Seed Batch</h1>
          <p className="text-muted mb-0">Record quantity, supplier, and expiry for your seeds</p>
        </div>
      </header>

      <section className="section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Seed Batch Details</h2>
          </div>
          <div className="card-body">
            <form action={createSeedAction} style={{ display: 'grid', gap: 'var(--space-6)' }}>
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
                  <span className="list-item-title">Quantity *</span>
                  <input type="number" name="quantity" className="form-input" min={0} required />
                </label>

                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Supplier</span>
                  <input name="supplier" className="form-input" placeholder="e.g. Real Seeds" />
                </label>

                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Batch Code</span>
                  <input name="batchCode" className="form-input" placeholder="e.g. TMT-2026-01" />
                </label>

                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Purchased Date</span>
                  <input type="date" name="purchasedDate" className="form-input" />
                </label>

                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Expiry Date</span>
                  <input type="date" name="expiryDate" className="form-input" />
                </label>
              </div>

              <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                <span className="list-item-title">Notes</span>
                <textarea name="notes" className="form-input" rows={4} placeholder="Germination rate, storage location, etc." />
              </label>

              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary">
                  <Save />
                  Save Seed Batch
                </button>
                <a href="/gardening/seeds" className="btn btn-secondary">
                  Cancel
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
