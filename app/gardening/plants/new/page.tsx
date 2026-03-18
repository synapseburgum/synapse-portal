import { redirect } from 'next/navigation'
import { Save } from 'lucide-react'
import { prisma } from '@/lib/db'

const monthOptions = [
  { value: '', label: 'Not set' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

function toIntOrNull(value: FormDataEntryValue | null) {
  if (!value || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toFloatOrNull(value: FormDataEntryValue | null) {
  if (!value || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

async function createPlantAction(formData: FormData) {
  'use server'

  const name = String(formData.get('name') || '').trim()
  const category = String(formData.get('category') || '').trim()

  if (!name || !category) {
    return
  }

  await prisma.gardenPlant.create({
    data: {
      name,
      variety: String(formData.get('variety') || '').trim() || null,
      category,
      description: String(formData.get('description') || '').trim() || null,
      sowIndoorStart: toIntOrNull(formData.get('sowIndoorStart')),
      sowIndoorEnd: toIntOrNull(formData.get('sowIndoorEnd')),
      sowOutdoorStart: toIntOrNull(formData.get('sowOutdoorStart')),
      sowOutdoorEnd: toIntOrNull(formData.get('sowOutdoorEnd')),
      harvestStart: toIntOrNull(formData.get('harvestStart')),
      harvestEnd: toIntOrNull(formData.get('harvestEnd')),
      daysToGerminate: toIntOrNull(formData.get('daysToGerminate')),
      daysToHarvest: toIntOrNull(formData.get('daysToHarvest')),
      spacingCm: toIntOrNull(formData.get('spacingCm')),
      depthCm: toFloatOrNull(formData.get('depthCm')),
    },
  })

  redirect('/gardening/plants')
}

export default function NewPlantPage() {
  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Add Plant</h1>
          <p className="text-muted mb-0">Create a new plant profile in your library</p>
        </div>
      </header>

      <section className="section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Plant Details</h2>
          </div>
          <div className="card-body">
            <form action={createPlantAction} style={{ display: 'grid', gap: 'var(--space-6)' }}>
              <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Plant Name *</span>
                  <input name="name" required className="form-input" placeholder="Tomato" />
                </label>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Variety</span>
                  <input name="variety" className="form-input" placeholder="Moneymaker" />
                </label>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Category *</span>
                  <select name="category" required className="form-input">
                    <option value="">Select category</option>
                    <option value="vegetable">Vegetable</option>
                    <option value="herb">Herb</option>
                    <option value="flower">Flower</option>
                    <option value="fruit">Fruit</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Sow Indoors (Start)</span>
                  <select name="sowIndoorStart" className="form-input">
                    {monthOptions.map((month) => (
                      <option key={`indoor-start-${month.value || 'na'}`} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Sow Indoors (End)</span>
                  <select name="sowIndoorEnd" className="form-input">
                    {monthOptions.map((month) => (
                      <option key={`indoor-end-${month.value || 'na'}`} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Sow Outdoors (Start)</span>
                  <select name="sowOutdoorStart" className="form-input">
                    {monthOptions.map((month) => (
                      <option key={`outdoor-start-${month.value || 'na'}`} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Sow Outdoors (End)</span>
                  <select name="sowOutdoorEnd" className="form-input">
                    {monthOptions.map((month) => (
                      <option key={`outdoor-end-${month.value || 'na'}`} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Harvest Start</span>
                  <select name="harvestStart" className="form-input">
                    {monthOptions.map((month) => (
                      <option key={`harvest-start-${month.value || 'na'}`} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Harvest End</span>
                  <select name="harvestEnd" className="form-input">
                    {monthOptions.map((month) => (
                      <option key={`harvest-end-${month.value || 'na'}`} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Days to Germinate</span>
                  <input type="number" name="daysToGerminate" className="form-input" min={0} />
                </label>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Days to Harvest</span>
                  <input type="number" name="daysToHarvest" className="form-input" min={0} />
                </label>
              </div>

              <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Spacing (cm)</span>
                  <input type="number" name="spacingCm" className="form-input" min={0} />
                </label>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Depth (cm)</span>
                  <input type="number" step="0.1" name="depthCm" className="form-input" min={0} />
                </label>
              </div>

              <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                <span className="list-item-title">Description / Notes</span>
                <textarea name="description" className="form-input" rows={4} placeholder="Helpful growing notes..." />
              </label>

              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary">
                  <Save />
                  Save Plant
                </button>
                <a href="/gardening/plants" className="btn btn-secondary">
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
