import Link from 'next/link'
import { AlertTriangle, Bot, CheckSquare, CloudSun, RefreshCw, Calendar, Activity, Clock, Zap, ArrowRight, Layers } from 'lucide-react'
import { getTodaySummary, TodayPriority } from '@/lib/today'
import TelegramDraftCard from '@/components/today/TelegramDraftCard'
import QuickTaskComplete from '@/components/today/QuickTaskComplete'
import QuickCapture from '@/components/today/QuickCapture'
import HorizonCard from '@/components/today/HorizonCard'

export const revalidate = 0

function levelBadge(level: 'high' | 'medium') {
  return level === 'high' ? 'badge error' : 'badge warning'
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'var(--error)'
  if (score >= 60) return 'var(--warning)'
  if (score >= 40) return 'var(--accent)'
  return 'var(--text-muted)'
}

type HorizonItems = TodayPriority[]

function HorizonSection({ 
  title, 
  icon, 
  items, 
  emptyMessage 
}: { 
  title: string
  icon: React.ReactNode
  items: HorizonItems
  emptyMessage: string
}) {
  if (items.length === 0) {
    return (
      <div className="horizon-section-empty">
        <div className="horizon-section-empty-text">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div className="card-body" style={{ display: 'grid', gap: 'var(--space-2)' }}>
      {items.map((item) => (
        <HorizonCard key={item.id} item={item} />
      ))}
    </div>
  )
}

export default async function TodayPage() {
  const summary = await getTodaySummary()

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>{summary.greeting}, Tim</h1>
          <p className="text-muted mb-0">{summary.dateLabel}</p>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <section className="section" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="brief-stats-grid">
          <div className="brief-stat-card">
            <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Overdue</div>
            <div style={{ fontSize: 'var(--text-2xl)', lineHeight: 1.1, color: summary.counts.overdue > 0 ? 'var(--error)' : 'var(--text-primary)' }}>{summary.counts.overdue}</div>
          </div>
          <div className="brief-stat-card">
            <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Due today</div>
            <div style={{ fontSize: 'var(--text-2xl)', lineHeight: 1.1 }}>{summary.counts.dueToday}</div>
          </div>
          <div className="brief-stat-card">
            <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Offline agents</div>
            <div style={{ fontSize: 'var(--text-2xl)', lineHeight: 1.1, color: summary.counts.offlineAgents > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>{summary.counts.offlineAgents}</div>
          </div>
          <div className="brief-stat-card">
            <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Unread alerts</div>
            <div style={{ fontSize: 'var(--text-2xl)', lineHeight: 1.1 }}>{summary.counts.unreadNotifications}</div>
          </div>
        </div>
      </section>

      {/* NOW Section - Immediate Priorities */}
      <section className="section" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card horizon-card horizon-now">
          <div className="card-header horizon-header">
            <h2 className="card-title horizon-title">
              <span className="horizon-icon"><Zap size={18} /></span>
              Now
              <span className="horizon-subtitle">Immediate priorities</span>
            </h2>
            <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
              {summary.horizonGroups.now.length} item{summary.horizonGroups.now.length !== 1 ? 's' : ''}
            </span>
          </div>
          <HorizonSection 
            title="Now" 
            icon={<Zap size={18} />}
            items={summary.horizonGroups.now}
            emptyMessage="All clear! No immediate priorities right now."
          />
        </div>
      </section>

      {/* NEXT Section - This Week */}
      <section className="section" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card horizon-card horizon-next">
          <div className="card-header horizon-header">
            <h2 className="card-title horizon-title">
              <span className="horizon-icon"><ArrowRight size={18} /></span>
              Next
              <span className="horizon-subtitle">Coming up this week</span>
            </h2>
            <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
              {summary.horizonGroups.next.length} item{summary.horizonGroups.next.length !== 1 ? 's' : ''}
            </span>
          </div>
          <HorizonSection 
            title="Next" 
            icon={<ArrowRight size={18} />}
            items={summary.horizonGroups.next}
            emptyMessage="Nothing on deck for this week yet."
          />
        </div>
      </section>

      {/* LATER Section - Future */}
      <section className="section" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card horizon-card horizon-later">
          <div className="card-header horizon-header">
            <h2 className="card-title horizon-title">
              <span className="horizon-icon"><Layers size={18} /></span>
              Later
              <span className="horizon-subtitle">Future & backlog</span>
            </h2>
            <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
              {summary.horizonGroups.later.length} item{summary.horizonGroups.later.length !== 1 ? 's' : ''}
            </span>
          </div>
          <HorizonSection 
            title="Later" 
            icon={<Layers size={18} />}
            items={summary.horizonGroups.later}
            emptyMessage="No future items queued. A clean slate!"
          />
        </div>
      </section>

      {/* Urgent Tasks Section - Quick Complete */}
      {summary.urgentTasks.length > 0 && (
        <section className="section" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card todo-priority-card">
            <div className="card-header">
              <h2 className="card-title">
                <CheckSquare size={18} style={{ display: 'inline', marginRight: 'var(--space-2)' }} />
                Quick Complete
              </h2>
              <p className="text-muted" style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                Tick off tasks without leaving this page
              </p>
            </div>
            <div className="card-body" style={{ display: 'grid', gap: 'var(--space-2)' }}>
              <QuickTaskComplete tasks={summary.urgentTasks} />
            </div>
          </div>
        </section>
      )}

      {/* Today's Schedule */}
      {summary.todayEvents.length > 0 && (
        <section className="section" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Calendar size={18} style={{ display: 'inline', marginRight: 'var(--space-2)' }} />
                Today&apos;s Schedule
              </h2>
            </div>
            <div className="card-body" style={{ display: 'grid', gap: 'var(--space-2)' }}>
              {summary.todayEvents.map((event) => (
                <div key={event.id} className={`calendar-event event-${event.type}`}>
                  <div className="calendar-event-title">{event.title}</div>
                  <div className="calendar-event-row">
                    {event.time && (
                      <div className="calendar-event-meta">
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {formatTime(new Date(event.time))}
                      </div>
                    )}
                    {event.whyItMatters && (
                      <div className="calendar-event-why">{event.whyItMatters}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {summary.recentActivity.length > 0 && (
        <section className="section" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Activity size={18} style={{ display: 'inline', marginRight: 'var(--space-2)' }} />
                Recent Activity
              </h2>
            </div>
            <div className="card-body" style={{ display: 'grid', gap: 'var(--space-2)' }}>
              {summary.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="brief-notification-item">
                  <div className="brief-notification-icon">
                    {activity.type === 'agent' ? <Bot size={14} /> : <Activity size={14} />}
                  </div>
                  <div className="brief-notification-main">
                    <strong>{activity.title}</strong>
                    {activity.message && <span>{activity.message}</span>}
                    <small>{new Date(activity.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions Grid */}
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

      {/* Weather Check */}
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

      {/* Quick Capture */}
      <section className="section" style={{ marginBottom: 'var(--space-6)' }}>
        <QuickCapture />
      </section>

      {/* Telegram Draft */}
      <section className="section">
        <TelegramDraftCard draft={summary.telegramDraft} />
      </section>
    </div>
  )
}
