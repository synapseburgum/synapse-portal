import { CalendarEvent } from './CalendarView'

interface CalendarMonthProps {
  date: Date
  events: CalendarEvent[]
}

function getMonthGrid(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const start = new Date(first)
  const day = first.getDay() || 7
  start.setDate(first.getDate() - (day - 1))

  return Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export default function CalendarMonth({ date, events }: CalendarMonthProps) {
  const days = getMonthGrid(date)
  const month = date.getMonth()

  return (
    <div className="calendar-month-grid">
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
        <div key={label} className="calendar-month-label">{label}</div>
      ))}

      {days.map((day) => {
        const key = day.toISOString().slice(0, 10)
        const dayEvents = events.filter((event) => event.date.slice(0, 10) === key)
        const inMonth = day.getMonth() === month

        return (
          <div key={key} className={`calendar-month-cell ${inMonth ? '' : 'outside'}`}>
            <div className="calendar-month-day">{day.getDate()}</div>
            <div className="calendar-month-dots">
              {dayEvents.slice(0, 3).map((event) => (
                <span key={event.id} className={`calendar-dot dot-${event.type}`} title={event.title} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
