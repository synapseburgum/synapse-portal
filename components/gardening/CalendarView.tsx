'use client'

import { useEffect, useMemo, useState } from 'react'
import CalendarDay from './CalendarDay'
import CalendarWeek from './CalendarWeek'
import CalendarMonth from './CalendarMonth'

export type CalendarViewMode = 'day' | 'week' | 'month'

export interface CalendarEvent {
  id: string
  type: 'sowing' | 'harvest' | 'task' | 'transplant'
  title: string
  date: string
  endDate?: string
  source?: string
}

function getRange(date: Date, view: CalendarViewMode) {
  const from = new Date(date)
  const to = new Date(date)

  if (view === 'day') {
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
  } else if (view === 'week') {
    const day = from.getDay() || 7
    from.setDate(from.getDate() - (day - 1))
    to.setDate(from.getDate() + 6)
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
  } else {
    from.setDate(1)
    to.setMonth(to.getMonth() + 1)
    to.setDate(0)
    from.setHours(0, 0, 0, 0)
    to.setHours(23, 59, 59, 999)
  }

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  }
}

export default function CalendarView() {
  const [view, setView] = useState<CalendarViewMode>('month')
  const [cursorDate, setCursorDate] = useState(() => new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)

  const range = useMemo(() => getRange(cursorDate, view), [cursorDate, view])

  useEffect(() => {
    let active = true
    async function loadEvents() {
      setLoading(true)
      const res = await fetch(`/api/gardening/calendar?view=${view}&from=${range.from}&to=${range.to}`)
      const data = await res.json()
      if (active) {
        setEvents(Array.isArray(data.events) ? data.events : [])
        setLoading(false)
      }
    }
    loadEvents()

    return () => {
      active = false
    }
  }, [view, range.from, range.to])

  const move = (direction: -1 | 1) => {
    const next = new Date(cursorDate)
    if (view === 'day') next.setDate(next.getDate() + direction)
    if (view === 'week') next.setDate(next.getDate() + direction * 7)
    if (view === 'month') next.setMonth(next.getMonth() + direction)
    setCursorDate(next)
  }

  return (
    <div className="calendar-shell">
      <div className="calendar-controls">
        <div className="category-filter">
          {(['day', 'week', 'month'] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              className={`category-filter-btn ${view === mode ? 'active' : ''}`}
              onClick={() => setView(mode)}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-outline" onClick={() => move(-1)}>Previous</button>
          <button className="btn btn-outline" onClick={() => setCursorDate(new Date())}>Today</button>
          <button className="btn btn-outline" onClick={() => move(1)}>Next</button>
        </div>
      </div>

      {loading ? (
        <div className="card"><div className="card-body">Loading calendar…</div></div>
      ) : null}

      {!loading && view === 'day' ? <CalendarDay date={cursorDate} events={events} /> : null}
      {!loading && view === 'week' ? <CalendarWeek date={cursorDate} events={events} /> : null}
      {!loading && view === 'month' ? <CalendarMonth date={cursorDate} events={events} /> : null}
    </div>
  )
}
