import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import {
  ArrowRight,
  Bell,
  Bot,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Radar,
  Sprout,
  TriangleAlert,
} from 'lucide-react'
import { getDailyBriefData } from '@/lib/brief'

function BriefStat({
  icon,
  value,
  label,
  tone = 'accent',
}: {
  icon: React.ReactNode
  value: number
  label: string
  tone?: 'accent' | 'warning' | 'secondary' | 'success'
}) {
  return (
    <div className="brief-stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default async function DailyBriefPage() {
  const brief = await getDailyBriefData()

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Daily Brief</h1>
          <p className="text-muted mb-0">
            What needs attention first — generated {formatDistanceToNow(new Date(brief.generatedAt), { addSuffix: true })}
          </p>
        </div>
      </header>

      <section className="section">
        <div className="brief-stats-grid">
          <BriefStat icon={<Bell />} value={brief.summary.unreadNotifications} label="Unread notifications" />
          <BriefStat icon={<Sprout />} value={brief.summary.dueTodayTasks} label="Garden tasks due today" tone="success" />
          <BriefStat icon={<TriangleAlert />} value={brief.summary.overdueTasks} label="Overdue tasks" tone="warning" />
          <BriefStat icon={<Bot />} value={brief.summary.offlineAgents} label="Agents offline" tone="secondary" />
        </div>
      </section>

      <section className="section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Priority Queue</h2>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {brief.attention.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-state-icon">
                  <CheckCircle2 />
                </div>
                <p className="empty-state-text">Clear board. No urgent issues right now.</p>
              </div>
            ) : (
              brief.attention.map((item) => (
                <Link key={item.type} href={item.href} className={`brief-priority-item ${item.severity === 'high' ? 'high' : 'medium'}`}>
                  <div className="brief-priority-main">
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <ArrowRight size={18} />
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h3 className="card-title">Due / Overdue Tasks</h3>
              </div>
              <div className="card-body" style={{ display: 'grid', gap: 'var(--space-2)' }}>
                {brief.tasks.length === 0 ? (
                  <p className="text-muted mb-0">No open tasks due yet.</p>
                ) : (
                  brief.tasks.map((task) => (
                    <div key={task.id} className="list-item">
                      <div className="list-item-content">
                        <div className="list-item-title">{task.title}</div>
                        <div className="list-item-meta">
                          <Clock3 size={12} /> {format(new Date(task.dueDate), 'EEE d MMM, HH:mm')}
                          {task.recurring ? ` • ${task.recurring}` : ''}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <Link href="/gardening/tasks" className="btn btn-outline" style={{ marginTop: 'var(--space-2)' }}>
                  <Sprout size={16} /> Open tasks
                </Link>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h3 className="card-title">Agent Watchlist</h3>
              </div>
              <div className="card-body" style={{ display: 'grid', gap: 'var(--space-2)' }}>
                {brief.watchlist.length === 0 ? (
                  <p className="text-muted mb-0">All tracked agents are active.</p>
                ) : (
                  brief.watchlist.map((agent) => (
                    <div key={agent.name} className="agent-status-item agent-status-item-monitor">
                      <div className="agent-status-main">
                        <strong className="agent-name">{agent.name}</strong>
                        <span className="agent-last-seen">
                          {agent.lastSeen
                            ? `${agent.health} • ${formatDistanceToNow(new Date(agent.lastSeen), { addSuffix: true })}`
                            : `${agent.health} • no recent events`}
                        </span>
                        {agent.lastMessage ? <span className="agent-message-preview">{agent.lastMessage}</span> : null}
                      </div>
                    </div>
                  ))
                )}
                <Link href="/agents" className="btn btn-outline" style={{ marginTop: 'var(--space-2)' }}>
                  <Radar size={16} /> Open monitor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Unread Notifications</h3>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {brief.notifications.length === 0 ? (
              <p className="text-muted mb-0">No unread notifications.</p>
            ) : (
              brief.notifications.map((notification) => (
                <div key={notification.id} className="brief-notification-item">
                  <div className="brief-notification-icon">
                    <CircleAlert size={16} />
                  </div>
                  <div className="brief-notification-main">
                    <strong>{notification.title}</strong>
                    <span>{notification.message}</span>
                    <small>
                      {notification.source ? `${notification.source} • ` : ''}
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
