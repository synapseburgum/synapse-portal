import { CalendarEvent } from './CalendarView'

interface CalendarWeekProps {
  date: Date
  events: CalendarEvent[]
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function CalendarWeek({ date, events }: CalendarWeekProps) {
  const start = startOfWeek(date)
  const days = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(start)
    d.setDate(start.getDate() + index)
    return d
  })

  return (
    <div className="calendar-week-scroll">
      {days.map((day) => {
        const key = day.toISOString().slice(0, 10)
        const dayEvents = events.filter((event) => event.date.slice(0, 10) === key)

        return (
          <div key={key} className="calendar-week-column">
            <div className="calendar-week-heading">{day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</div>
            <div className="calendar-events-stack">
              {dayEvents.length === 0 ? (
                <div className="calendar-empty">No events</div>
              ) : (
                dayEvents.map((event) => (
                  <div key={event.id} className={`calendar-event event-${event.type}`}>
                    <div className="calendar-event-title">{event.title}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
