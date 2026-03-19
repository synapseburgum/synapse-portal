'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewPlotPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const locationOptions = [
    { value: 'backyard', label: 'Backyard' },
    { value: 'allotment', label: 'Allotment' },
    { value: 'balcony', label: 'Balcony' },
    { value: 'greenhouse', label: 'Greenhouse' },
    { value: 'indoor', label: 'Indoor' },
    { value: 'other', label: 'Other' },
  ]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      width: formData.get('width'),
      height: formData.get('height'),
      location: formData.get('location'),
      notes: formData.get('notes'),
    }

    try {
      const response = await fetch('/api/gardening/plots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY || 'dev-key'}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/gardening/plots')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create plot')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Failed to create plot:', error)
      alert('Failed to create plot')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '768px' }}>
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
          <h1 style={{ marginBottom: 'var(--space-1)' }}>New Plot</h1>
          <p className="text-muted mb-0">Define a new growing area</p>
        </div>
      </header>

      {/* Form */}
      <section className="section">
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-body">
              {/* Name */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Plot Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  placeholder="e.g., Back Garden, Allotment Plot 5"
                  required
                />
              </div>

              {/* Dimensions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div className="form-group">
                  <label htmlFor="width" className="form-label">
                    Width (meters) *
                  </label>
                  <input
                    type="number"
                    id="width"
                    name="width"
                    className="form-control"
                    placeholder="e.g., 10"
                    step="0.1"
                    min="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="height" className="form-label">
                    Height (meters) *
                  </label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    className="form-control"
                    placeholder="e.g., 8"
                    step="0.1"
                    min="0.1"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="form-group">
                <label htmlFor="location" className="form-label">
                  Location
                </label>
                <select id="location" name="location" className="form-control">
                  <option value="">Select location...</option>
                  {locationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label htmlFor="notes" className="form-label">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  rows={3}
                  placeholder="Orientation, sunlight, special features..."
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Plot'}
            </button>
            <Link href="/gardening/plots" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}
