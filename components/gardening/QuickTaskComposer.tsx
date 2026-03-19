'use client'

import { useMemo, useState } from 'react'
import { Mic, MicOff, Plus, SquareCheckBig } from 'lucide-react'

type ComposerTask = {
  id: string
  title: string
  dueDate: string
  recurring: string | null
}

type QuickTaskCreated = {
  id: string
  title: string
  dueDate: string
  recurring: string | null
}

interface QuickTaskComposerProps {
  onTaskCreated?: (task: QuickTaskCreated) => void
}

type SpeechRecognitionCtor = new () => {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((ev: { error?: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
}

function parseDateHint(input: string): { dueDate: string; recurring: string | null } {
  const text = input.toLowerCase()
  const now = new Date()

  if (text.includes('tomorrow')) {
    const d = new Date(now)
    d.setDate(d.getDate() + 1)
    return { dueDate: d.toISOString().slice(0, 10), recurring: null }
  }

  if (text.includes('next week')) {
    const d = new Date(now)
    d.setDate(d.getDate() + 7)
    return { dueDate: d.toISOString().slice(0, 10), recurring: null }
  }

  if (text.includes('daily') || text.includes('every day')) {
    return { dueDate: now.toISOString().slice(0, 10), recurring: 'daily' }
  }

  if (text.includes('weekly') || text.includes('every week')) {
    return { dueDate: now.toISOString().slice(0, 10), recurring: 'weekly' }
  }

  return { dueDate: now.toISOString().slice(0, 10), recurring: null }
}

export default function QuickTaskComposer({ onTaskCreated }: QuickTaskComposerProps) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [recurring, setRecurring] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<ComposerTask[]>([])

  const supportsVoice = typeof window !== 'undefined' && (!!window.SpeechRecognition || !!window.webkitSpeechRecognition)

  const statusLabel = useMemo(() => {
    if (isListening) return 'Listening… say task + when due (e.g. "Water tomatoes tomorrow")'
    return 'Tip: you can type quickly or use voice input.'
  }, [isListening])

  async function createTask(payload: { title: string; dueDate: string; recurring: string | null }) {
    const res = await fetch('/api/gardening/tasks/quick-add', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `Failed with status ${res.status}`)
    }

    const data = await res.json()
    return data.task as ComposerTask
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const task = await createTask({
        title: title.trim(),
        dueDate,
        recurring: recurring || null,
      })
      setCreated((prev) => [task, ...prev].slice(0, 4))
      onTaskCreated?.({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        recurring: task.recurring,
      })
      setTitle('')
      setRecurring('')
      setDueDate(new Date().toISOString().slice(0, 10))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  function onVoiceCapture() {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Ctor) return

    setError(null)
    const rec = new Ctor()
    rec.lang = 'en-GB'
    rec.continuous = false
    rec.interimResults = false

    rec.onresult = (ev) => {
      const transcript = ev.results[0]?.[0]?.transcript?.trim()
      if (!transcript) return
      setTitle(transcript)
      const parsed = parseDateHint(transcript)
      setDueDate(parsed.dueDate)
      setRecurring(parsed.recurring || '')
    }

    rec.onerror = (ev) => {
      setError(ev.error ? `Voice capture error: ${ev.error}` : 'Voice capture failed')
    }

    rec.onend = () => {
      setIsListening(false)
    }

    setIsListening(true)
    rec.start()
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <SquareCheckBig size={18} /> Quick Add Task
        </h3>
      </div>
      <div className="card-body" style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
            <span className="list-item-title">Task</span>
            <input
              className="form-input"
              placeholder="e.g. Check slug traps"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-2)' }}>
            <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
              <span className="list-item-title">Due date</span>
              <input type="date" className="form-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>

            <label style={{ display: 'grid', gap: 'var(--space-1)' }}>
              <span className="list-item-title">Repeat</span>
              <select className="form-input" value={recurring} onChange={(e) => setRecurring(e.target.value)}>
                <option value="">One-off</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <button className="btn btn-primary" type="submit" disabled={submitting || !title.trim()}>
              <Plus size={16} /> {submitting ? 'Adding…' : 'Add task'}
            </button>
            <button
              className="btn btn-outline"
              type="button"
              onClick={onVoiceCapture}
              disabled={!supportsVoice || isListening}
              title={supportsVoice ? 'Capture task by voice' : 'Voice capture not supported in this browser'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />} {isListening ? 'Listening…' : 'Voice'}
            </button>
          </div>
        </form>

        <p className="text-muted mb-0" style={{ fontSize: 'var(--text-xs)' }}>{statusLabel}</p>

        {error ? <p className="badge error" style={{ width: 'fit-content' }}>{error}</p> : null}

        {created.length > 0 ? (
          <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {created.map((task) => (
              <div key={task.id} className="list-item" style={{ padding: 'var(--space-2) 0' }}>
                <div className="list-item-content">
                  <div className="list-item-title">{task.title}</div>
                  <div className="list-item-meta">Due {new Date(task.dueDate).toLocaleDateString()} {task.recurring ? `• ${task.recurring}` : ''}</div>
                </div>
                <span className="badge success">Added</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
