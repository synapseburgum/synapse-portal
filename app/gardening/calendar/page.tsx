import CalendarView from '@/components/gardening/CalendarView'

export default function GardeningCalendarPage() {
  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Gardening Calendar</h1>
          <p className="text-muted mb-0">Day, week, and month planning for sowing, harvesting, and tasks</p>
        </div>
      </header>

      <section className="section">
        <CalendarView />
      </section>
    </div>
  )
}
