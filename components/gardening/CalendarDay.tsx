import { CalendarEvent } from './CalendarView'

interface CalendarDayProps {
  date: Date
  events: CalendarEvent[]
}

export default function CalendarDay({ date, events }: CalendarDayProps) {
  const dayKey = date.toISOString().slice(0, 10)
  const dayEvents = events.filter((event) => event.date.slice(0, 10) === dayKey)

  return (
    <div className="calendar-grid">
      <div className="calendar-day-card">
        <h3 className="calendar-day-title">{date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
        {dayEvents.length === 0 ? (
          <p className="text-muted mb-0">No events for this day.</p>
        ) : (
          <div className="calendar-events-stack">
            {dayEvents.map((event) => (
              <div key={event.id} className={`calendar-event event-${event.type}`}>
                <div className="calendar-event-title">{event.title}</div>
                {event.source ? <div className="calendar-event-meta">{event.source}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
