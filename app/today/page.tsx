import Link from 'next/link'
import { AlertTriangle, Bot, CheckSquare, ChevronRight, CloudSun, RefreshCw } from 'lucide-react'
import { getTodaySummary } from '@/lib/today'
import TelegramDraftCard from '@/components/today/TelegramDraftCard'

export const revalidate = 0

function levelBadge(level: 'high' | 'medium') {
  return level === 'high' ? 'badge error' : 'badge warning'
}

export default async function TodayPage() {
  const summary = await getTodaySummary()

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Today</h1>
          <p className="text-muted mb-0">One-screen morning command center for mobile triage.</p>
        </div>
      </header>

      <section className="section" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="brief-stats-grid">
          <div className="brief-stat-card">
            <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Overdue</div>
            <div style={{ fontSize: 'var(--text-2xl)', lineHeight: 1.1 }}>{summary.counts.overdue}</div>
          </div>
          <div className="brief-stat-card">
            <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Due today</div>
            <div style={{ fontSize: 'var(--text-2xl)', lineHeight: 1.1 }}>{summary.counts.dueToday}</div>
          </div>
          <div className="brief-stat-card">
            <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Offline agents</div>
            <div style={{ fontSize: 'var(--text-2xl)', lineHeight: 1.1 }}>{summary.counts.offlineAgents}</div>
          </div>
          <div className="brief-stat-card">
            <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Unread alerts</div>
            <div style={{ fontSize: 'var(--text-2xl)', lineHeight: 1.1 }}>{summary.counts.unreadNotifications}</div>
          </div>
        </div>
      </section>

      <section className="section" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <h2 className="card-title">Priority queue</h2>
            <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
              Updated {new Date(summary.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {summary.priorities.map((item) => (
              <Link key={item.id} href={item.href} className={`brief-priority-item ${item.level === 'high' ? 'high' : 'medium'}`}>
                <div className="brief-priority-main">
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
                <span style={{ display: 'inline-flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  <span className={levelBadge(item.level)}>{item.level}</span>
                  <ChevronRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="today-action-grid">
          <Link href="/gardening/tasks" className="today-action-card">
            <span className="today-action-icon"><CheckSquare size={18} /></span>
            <span>
              <strong>Open tasks</strong>
              <small>Handle overdue and due items</small>
            </span>
          </Link>
          <Link href="/agents" className="today-action-card">
            <span className="today-action-icon"><Bot size={18} /></span>
            <span>
              <strong>Open agents</strong>
              <small>Investigate idle/offline sessions</small>
            </span>
          </Link>
          <Link href="/brief" className="today-action-card">
            <span className="today-action-icon"><RefreshCw size={18} /></span>
            <span>
              <strong>Daily brief</strong>
              <small>Read full context and archive</small>
            </span>
          </Link>
          <Link href="/weather" className="today-action-card">
            <span className="today-action-icon"><CloudSun size={18} /></span>
            <span>
              <strong>Weather</strong>
              <small>Adjust gardening plan for conditions</small>
            </span>
          </Link>
        </div>
      </section>

      <section className="section" style={{ marginBottom: 'var(--space-6)' }}>
        {summary.weather ? (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Weather check</h2>
            </div>
            <div className="card-body" style={{ display: 'grid', gap: 'var(--space-2)' }}>
              <p className="mb-0"><strong>{Math.round(summary.weather.temperatureC)}°C</strong> · {summary.weather.condition}</p>
              <p className="text-muted mb-0" style={{ fontSize: 'var(--text-sm)' }}>{summary.weather.recommendation}</p>
            </div>
          </div>
        ) : (
          <div className="quick-capture-result error">
            <AlertTriangle size={16} /> Weather data unavailable right now.
          </div>
        )}
      </section>

      <section className="section">
        <TelegramDraftCard draft={summary.telegramDraft} />
      </section>
    </div>
  )
}
