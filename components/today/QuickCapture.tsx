'use client'

import { useState } from 'react'
import { Plus, Check, AlertTriangle } from 'lucide-react'

export default function QuickCapture() {
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return

    setSubmitting(true)
    setResult(null)

    try {
      const res = await fetch('/api/inbox/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setResult({ success: true, message: 'Task created successfully!' })
        setNote('')
      } else {
        setResult({ success: false, message: data.error || 'Failed to create task' })
      }
    } catch (error) {
      setResult({ success: false, message: 'Failed to create task' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Plus size={18} style={{ display: 'inline', marginRight: 'var(--space-2)' }} />
          Quick Capture
        </h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <textarea
            className="form-input quick-capture-textarea"
            placeholder="Quickly capture a task or note... e.g., 'Water tomatoes tomorrow at 9am'"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            disabled={submitting}
          />
          <button
            type="submit"
            className="btn btn-primary quick-capture-submit"
            disabled={!note.trim() || submitting}
          >
            {submitting ? (
              <>
                <div className="spin" style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Task
              </>
            )}
          </button>
        </form>

        {result && (
          <div
            className={`quick-capture-result ${result.success ? 'success' : 'error'}`}
            style={{ marginTop: 'var(--space-3)' }}
          >
            {result.success ? (
              <>
                <Check size={16} />
                <span>{result.message}</span>
              </>
            ) : (
              <>
                <AlertTriangle size={16} />
                <span>{result.message}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
