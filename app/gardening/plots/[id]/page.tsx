'use client'

import { ArrowLeft, Plus, MapPin, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import PlotCanvas, { type Plot, type Bed } from '@/components/gardening/PlotCanvas'
import BedEditor from '@/components/gardening/BedEditor'

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'dev-key'

const locationLabels: Record<string, string> = {
  backyard: 'Backyard',
  allotment: 'Allotment',
  balcony: 'Balcony',
  greenhouse: 'Greenhouse',
  indoor: 'Indoor',
}

export default function PlotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const plotId = params.id as string
  
  const [plot, setPlot] = useState<Plot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null)
  const [selectedPlantingId, setSelectedPlantingId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas')
  
  const fetchPlot = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/gardening/plots/${plotId}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Plot not found')
        } else {
          setError('Failed to load plot. Please try again.')
        }
        return
      }
      
      const data = await response.json()
      setPlot(data.plot)
    } catch (err) {
      setError('Failed to load plot. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [plotId])
  
  useEffect(() => {
    fetchPlot()
  }, [fetchPlot])
  
  const handleAddBed = async (x: number, y: number) => {
    try {
      const response = await fetch(`/api/gardening/plots/${plotId}/beds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          name: `Bed ${plot?.beds.length ? plot.beds.length + 1 : 1}`,
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: 1,
          height: 1,
          soilType: null,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setPlot(prev => prev ? {
          ...prev,
          beds: [...prev.beds, data.bed],
        } : prev)
        setSelectedBedId(data.bed.id)
      }
    } catch {
      // Error adding bed - user can retry
    }
  }
  
  const handleUpdateBed = async (bedId: string, updates: Partial<Bed>) => {
    // Optimistic update
    setPlot(prev => {
      if (!prev) return prev
      return {
        ...prev,
        beds: prev.beds.map(bed => 
          bed.id === bedId ? { ...bed, ...updates } : bed
        ),
      }
    })
    
    try {
      const response = await fetch(`/api/gardening/plots/${plotId}/beds/${bedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        // Revert on error
        fetchPlot()
      }
    } catch {
      // Revert on error
      fetchPlot()
    }
  }
  
  const handleDeleteBed = async (bedId: string) => {
    try {
      const response = await fetch(`/api/gardening/plots/${plotId}/beds/${bedId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      })
      
      if (response.ok) {
        setPlot(prev => {
          if (!prev) return prev
          return {
            ...prev,
            beds: prev.beds.filter(bed => bed.id !== bedId),
          }
        })
        setSelectedBedId(null)
      }
    } catch {
      // Error deleting bed - user can retry
    }
  }
  
  if (loading) {
    return (
      <div className="container">
        <div className="section" style={{ marginTop: 'var(--space-4)' }}>
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <p className="text-muted">Loading plot...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !plot) {
    return (
      <div className="container">
        <div className="section" style={{ marginTop: 'var(--space-4)' }}>
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <MapPin />
                </div>
                <p className="empty-state-text">
                  {error || 'Plot not found'}
                </p>
                <Link href="/gardening/plots" className="btn btn-primary mt-4">
                  <ArrowLeft />
                  Back to Plots
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const selectedBed = selectedBedId ? plot.beds.find(b => b.id === selectedBedId) || null : null
  
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

      {/* View Toggle + Canvas/List */}
      <section className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ margin: 0 }}>Beds & Zones</h2>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={() => setViewMode('canvas')}
              className={`btn ${viewMode === 'canvas' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Canvas
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            >
              List
            </button>
          </div>
        </div>

        {viewMode === 'canvas' ? (
          <div className="plot-layout">
            <div className="plot-canvas-panel">
              <PlotCanvas
                plot={plot}
                selectedBedId={selectedBedId}
                onSelectBed={setSelectedBedId}
                onAddBed={handleAddBed}
                onUpdateBed={handleUpdateBed}
                onSelectPlanting={setSelectedPlantingId}
                selectedPlantingId={selectedPlantingId}
              />
            </div>
            <div className="plot-editor-panel">
              <BedEditor
                bed={selectedBed}
                onUpdate={handleUpdateBed}
                onDelete={handleDeleteBed}
                onClose={() => setSelectedBedId(null)}
                onSelectPlanting={setSelectedPlantingId}
                selectedPlantingId={selectedPlantingId}
              />
            </div>
          </div>
        ) : (
          <>
            {plot.beds.length === 0 ? (
              <div className="card">
                <div className="card-body">
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <MapPin />
                    </div>
                    <p className="empty-state-text">
                      No beds or zones defined yet. Switch to Canvas view to add beds interactively.
                    </p>
                    <button 
                      onClick={() => setViewMode('canvas')}
                      className="btn btn-primary mt-4"
                    >
                      <Plus />
                      Open Canvas
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="apps-grid">
                {plot.beds.map((bed) => (
                  <div 
                    key={bed.id} 
                    className="card card-hover"
                    onClick={() => {
                      setSelectedBedId(bed.id)
                      setViewMode('canvas')
                    }}
                    style={{ cursor: 'pointer' }}
                  >
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
                            <strong>Soil:</strong> {bed.soilType}
                          </div>
                        )}
                        <div>
                          <strong>Plantings:</strong> {typeof bed.plantings === 'number' ? bed.plantings : (bed.plantings as any)?.count || 0}
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
          </>
        )}
      </section>

      <style>{`
        .plot-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: var(--space-4);
        }
        
        @media (max-width: 1024px) {
          .plot-layout {
            grid-template-columns: 1fr;
          }
          
          .plot-editor-panel {
            order: -1;
          }
        }
        
        .plot-canvas-panel {
          min-width: 0;
        }
        
        .plot-editor-panel {
          position: sticky;
          top: calc(var(--navbar-height) + var(--space-4));
          align-self: start;
        }
      `}</style>
    </div>
  )
}
