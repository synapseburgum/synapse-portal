'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Loader2, Mic, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react'

type CaptureResult = {
  ok: boolean
  mode: 'garden_task' | 'notification'
  parsed?: {
    title: string
    dueDate: string
    recurring: string | null
    confidence: 'high' | 'medium'
    reason: string
  }
  task?: {
    id: string
    title: string
  }
  notification?: {
    id: string
    title: string
  }
  error?: string
}

const SUGGESTIONS = [
  'Water tomatoes tomorrow',
  'Every Sunday check greenhouse pests',
  'Add note: buy compost this weekend',
  'Sow spinach next Monday',
]

export default function QuickCaptureClient() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CaptureResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => text.trim().length > 2 && !loading, [text, loading])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/inbox/capture', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      const payload = await response.json()

      if (!response.ok) {
        setError(payload?.error || 'Capture failed')
      } else {
        setResult(payload)
        setText('')
      }
    } catch {
      setError('Network error while capturing. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="quick-capture-shell">
      <div className="quick-capture-intro">
        <span className="badge accent">
          <Sparkles size={12} style={{ marginRight: 4 }} /> Natural language
        </span>
        <h1 style={{ marginBottom: 'var(--space-2)' }}>Quick Capture</h1>
        <p className="text-muted mb-0">Drop a messy thought, get a structured task or note in seconds.</p>
      </div>

      <form className="quick-capture-form" onSubmit={submit}>
        <label className="quick-capture-label" htmlFor="capture-text">
          Capture text
        </label>
        <textarea
          id="capture-text"
          className="form-input quick-capture-textarea"
          placeholder="e.g. water chilli plants tomorrow morning"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
        />

        <div className="quick-capture-suggestions" aria-label="Example captures">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="quick-capture-chip"
              onClick={() => setText(suggestion)}
            >
              <Mic size={14} />
              {suggestion}
            </button>
          ))}
        </div>

        <button type="submit" className="btn btn-primary quick-capture-submit" disabled={!canSubmit}>
          {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
          {loading ? 'Capturing…' : 'Capture now'}
        </button>
      </form>

      {error ? (
        <div className="quick-capture-result error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      {result?.ok ? (
        <div className="quick-capture-result success">
          <div className="quick-capture-result-head">
            <CheckCircle2 size={16} />
            <strong>{result.mode === 'garden_task' ? 'Task created' : 'Note captured'}</strong>
          </div>

          {result.parsed ? (
            <div className="quick-capture-result-grid">
              <div>
                <small>Parsed title</small>
                <div>{result.parsed.title}</div>
              </div>
              <div>
                <small>Due date</small>
                <div>{new Date(result.parsed.dueDate).toLocaleDateString()}</div>
              </div>
              <div>
                <small>Recurring</small>
                <div>{result.parsed.recurring || 'One-off'}</div>
              </div>
              <div>
                <small>Confidence</small>
                <div style={{ textTransform: 'capitalize' }}>{result.parsed.confidence}</div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
