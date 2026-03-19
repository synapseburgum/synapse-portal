'use client'

import { useState, useEffect } from 'react'
import type { Bed } from './PlotCanvas'

interface BedEditorProps {
  bed: Bed | null
  onUpdate: (bedId: string, updates: Partial<Bed>) => void
  onDelete: (bedId: string) => void
  onClose: () => void
}

const SOIL_TYPE_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'clay', label: 'Clay' },
  { value: 'sandy', label: 'Sandy' },
  { value: 'loam', label: 'Loam' },
  { value: 'compost-rich', label: 'Compost-Rich' },
  { value: 'chalky', label: 'Chalky' },
  { value: 'silty', label: 'Silty' },
]

export default function BedEditor({ bed, onUpdate, onDelete, onClose }: BedEditorProps) {
  const [formData, setFormData] = useState({
    name: '',
    width: '1',
    height: '1',
    soilType: '',
    notes: '',
  })
  
  const [hasChanges, setHasChanges] = useState(false)
  
  useEffect(() => {
    if (bed) {
      setFormData({
        name: bed.name,
        width: bed.width.toString(),
        height: bed.height.toString(),
        soilType: bed.soilType || '',
        notes: bed.notes || '',
      })
      setHasChanges(false)
    }
  }, [bed])
  
  if (!bed) {
    return (
      <div className="bed-editor bed-editor-empty">
        <div className="bed-editor-empty-state">
          <p className="text-muted">Select a bed to edit its properties</p>
          <p className="text-muted" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
            Or click on the plot to add a new bed
          </p>
        </div>
      </div>
    )
  }
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }
  
  const handleSave = () => {
    const updates: Partial<Bed> = {
      name: formData.name,
      width: parseFloat(formData.width) || 1,
      height: parseFloat(formData.height) || 1,
      soilType: formData.soilType || null,
      notes: formData.notes || null,
    }
    
    onUpdate(bed.id, updates)
    setHasChanges(false)
  }
  
  const handleDelete = () => {
    if (confirm(`Delete "${bed.name}"? This will also remove any plantings in this bed.`)) {
      onDelete(bed.id)
    }
  }
  
  const getPlantingCount = (): number => {
    if (typeof bed.plantings === 'number') return bed.plantings
    if (bed.plantings && 'count' in bed.plantings) return bed.plantings.count
    return 0
  }
  
  return (
    <div className="bed-editor">
      <div className="bed-editor-header">
        <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>Edit Bed</h3>
        <button onClick={onClose} className="btn btn-secondary" style={{ padding: 'var(--space-2)' }}>
          ✕
        </button>
      </div>
      
      <div className="bed-editor-content">
        {/* Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="bed-name">Name *</label>
          <input
            id="bed-name"
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Bed 1, Herb Zone"
          />
        </div>
        
        {/* Position (read-only) */}
        <div className="form-group">
          <label className="form-label">Position</label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              type="text"
              className="form-input"
              value={`X: ${bed.x.toFixed(1)}m`}
              disabled
              style={{ flex: 1, opacity: 0.6 }}
            />
            <input
              type="text"
              className="form-input"
              value={`Y: ${bed.y.toFixed(1)}m`}
              disabled
              style={{ flex: 1, opacity: 0.6 }}
            />
          </div>
          <small className="text-muted" style={{ display: 'block', marginTop: 'var(--space-1)' }}>
            Drag bed on canvas to reposition
          </small>
        </div>
        
        {/* Dimensions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="bed-width">Width (m) *</label>
            <input
              id="bed-width"
              type="number"
              step="0.5"
              min="0.5"
              className="form-input"
              value={formData.width}
              onChange={(e) => handleChange('width', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="bed-height">Height (m) *</label>
            <input
              id="bed-height"
              type="number"
              step="0.5"
              min="0.5"
              className="form-input"
              value={formData.height}
              onChange={(e) => handleChange('height', e.target.value)}
            />
          </div>
        </div>
        
        {/* Soil Type */}
        <div className="form-group">
          <label className="form-label" htmlFor="bed-soil">Soil Type</label>
          <select
            id="bed-soil"
            className="form-input"
            value={formData.soilType}
            onChange={(e) => handleChange('soilType', e.target.value)}
          >
            {SOIL_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Notes */}
        <div className="form-group">
          <label className="form-label" htmlFor="bed-notes">Notes</label>
          <textarea
            id="bed-notes"
            className="form-input"
            rows={3}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Special conditions, sunlight, etc."
          />
        </div>
        
        {/* Stats */}
        <div className="bed-editor-stats">
          <div className="bed-stat">
            <span className="bed-stat-label">Plantings</span>
            <span className="bed-stat-value">{getPlantingCount()}</span>
          </div>
          <div className="bed-stat">
            <span className="bed-stat-label">Area</span>
            <span className="bed-stat-value">{(bed.width * bed.height).toFixed(1)}m²</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="bed-editor-actions">
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={!hasChanges || !formData.name.trim()}
          >
            Save Changes
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger"
          >
            Delete Bed
          </button>
        </div>
      </div>
      
      <style>{`
        .bed-editor {
          background: var(--bg-elevated);
          border: 1px solid oklch(0.18 0.015 270 / 0.08);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        
        .bed-editor-empty {
          padding: var(--space-6);
          text-align: center;
        }
        
        .bed-editor-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
        }
        
        .bed-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid oklch(0.18 0.015 270 / 0.08);
          background: var(--bg-sunken);
        }
        
        .bed-editor-content {
          padding: var(--space-5);
        }
        
        .form-group {
          margin-bottom: var(--space-3);
        }
        
        .form-label {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: var(--space-1);
        }
        
        .form-input {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          border: 1px solid oklch(0.18 0.015 270 / 0.14);
          border-radius: var(--radius-md);
          background: var(--bg-base);
          color: var(--text-primary);
          font: inherit;
          font-size: var(--text-sm);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        
        .form-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px oklch(0.62 0.18 195 / 0.15);
        }
        
        .form-input:disabled {
          cursor: not-allowed;
        }
        
        .bed-editor-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-3);
          margin-bottom: var(--space-4);
          padding: var(--space-3);
          background: var(--bg-sunken);
          border-radius: var(--radius-md);
        }
        
        .bed-stat {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        
        .bed-stat-label {
          font-size: var(--text-xs);
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .bed-stat-value {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .bed-editor-actions {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-4);
        }
        
        .bed-editor-actions .btn {
          flex: 1;
        }
        
        .btn-danger {
          background: var(--error);
          color: white;
        }
        
        .btn-danger:hover {
          background: oklch(0.58 0.20 25);
          color: white;
        }
        
        @media (max-width: 640px) {
          .bed-editor-content {
            padding: var(--space-4);
          }
          
          .bed-editor-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
