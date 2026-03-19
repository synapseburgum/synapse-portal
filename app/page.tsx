import Link from 'next/link'
import {
  Bell,
  Sprout,
  Bot,
  ChevronRight,
  Plus,
  Package,
  Activity,
  ExternalLink,
  SquareTerminal,
  MessageCircle,
  Gauge,
  CheckCircle2,
  Clock3,
  CircleOff,
  Radar,
  Newspaper,
  CloudSun,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { prisma } from '@/lib/db'
import { AgentHealth, AgentStatus, getAgentStatuses } from '@/lib/agents'

const QUICK_LINKS = [
  {
    title: 'Telegram',
    description: 'Primary messaging inbox',
    href: process.env.TELEGRAM_WEB_URL || 'https://web.telegram.org/a/',
    icon: MessageCircle,
    external: true,
  },
  {
    title: 'Kanban / Agent Board',
    description: 'Open tasks and runs',
    href: process.env.KANBAN_URL || 'http://localhost:8787',
    icon: SquareTerminal,
    external: true,
  },
  {
    title: 'CNS Dashboard',
    description: 'Local CNS instance',
    href: process.env.CNS_DASHBOARD_URL || 'http://localhost:3001',
    icon: Gauge,
    external: true,
  },
]

async function getStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  try {
    const [notifications, gardenTasks, agentStatuses] = await Promise.all([
      prisma.notification.count({ where: { isRead: false } }),
      prisma.gardenTask.count({ where: { completed: false, dueDate: { gte: today } } }),
      getAgentStatuses(),
    ])

    const activeAgents = agentStatuses.filter((agent) => agent.health === 'active').length

    return { notifications, gardenTasks, agentStatuses, activeAgents }
  } catch {
    return { notifications: 0, gardenTasks: 0, agentStatuses: [], activeAgents: 0 }
  }
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function HealthBadge({ health }: { health: AgentHealth }) {
  if (health === 'active') {
    return (
      <span className="badge success">
        <CheckCircle2 size={12} style={{ marginRight: 4 }} /> Active
      </span>
    )
  }

  if (health === 'idle') {
    return (
      <span className="badge warning">
        <Clock3 size={12} style={{ marginRight: 4 }} /> Idle
      </span>
    )
  }

  return (
    <span className="badge muted">
      <CircleOff size={12} style={{ marginRight: 4 }} /> Offline
    </span>
  )
}

export default async function HomePage() {
  const { notifications, gardenTasks, agentStatuses, activeAgents } = await getStats()

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>{getGreeting()}, Tim</h1>
          <p className="text-muted mb-0">Here&apos;s what&apos;s happening today</p>
        </div>
      </header>

      <section className="section">
        <div className="stats-grid">
          <div className="stat-card hero">
            <div className="stat-icon accent">
              <Bell />
            </div>
            <div className="stat-value">{notifications}</div>
            <div className="stat-label">Unread Notifications</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success">
              <Sprout />
            </div>
            <div className="stat-value">{gardenTasks}</div>
            <div className="stat-label">Garden Tasks Due</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon secondary">
              <Bot />
            </div>
            <div className="stat-value">{activeAgents}</div>
            <div className="stat-label">Agents Active (20m)</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info">
              <Activity />
            </div>
            <div className="stat-value">{agentStatuses.length}</div>
            <div className="stat-label">Tracked Agents</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Apps</h2>
        </div>
        <div className="apps-grid">
          <Link href="/gardening" className="app-card">
            <div className="app-icon success">
              <Sprout />
            </div>
            <div className="app-content">
              <div className="app-title">Gardening</div>
              <div className="app-description">Plants, seeds, calendar & tasks</div>
            </div>
            <span className="app-arrow">
              <ChevronRight />
            </span>
          </Link>
          <div className="app-card disabled">
            <div className="app-icon muted">
              <Activity />
            </div>
            <div className="app-content">
              <div className="app-title">Analytics</div>
              <div className="app-description">Coming soon</div>
            </div>
          </div>
          <Link href="/agents" className="app-card">
            <div className="app-icon secondary">
              <Radar />
            </div>
            <div className="app-content">
              <div className="app-title">Agent Monitor</div>
              <div className="app-description">Live status for all orchestration agents</div>
            </div>
            <span className="app-arrow">
              <ChevronRight />
            </span>
          </Link>
          <Link href="/brief" className="app-card">
            <div className="app-icon info">
              <Newspaper />
            </div>
            <div className="app-content">
              <div className="app-title">Daily Brief</div>
              <div className="app-description">One-screen overnight priorities and next actions</div>
            </div>
            <span className="app-arrow">
              <ChevronRight />
            </span>
          </Link>
          <Link href="/weather" className="app-card">
            <div className="app-icon warning">
              <CloudSun />
            </div>
            <div className="app-content">
              <div className="app-title">Garden Weather</div>
              <div className="app-description">12-hour weather window with practical gardening guidance</div>
            </div>
            <span className="app-arrow">
              <ChevronRight />
            </span>
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h3 className="card-title">Agent Status Monitor</h3>
              </div>
              <div className="card-body" style={{ display: 'grid', gap: 'var(--space-2)' }}>
                {agentStatuses.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Bot />
                    </div>
                    <p className="empty-state-text">No agent telemetry yet</p>
                  </div>
                ) : (
                  <>
                    {agentStatuses.map((agent) => (
                      <div key={agent.name} className="agent-status-item">
                        <div className="agent-status-main">
                          <strong className="agent-name">{agent.name}</strong>
                          {agent.lastSeen ? (
                            <span className="agent-last-seen">
                              {formatDistanceToNow(agent.lastSeen, { addSuffix: true })}
                            </span>
                          ) : (
                            <span className="agent-last-seen">no recent events</span>
                          )}
                        </div>
                        <div className="agent-status-side">
                          <HealthBadge health={agent.health} />
                        </div>
                      </div>
                    ))}

                    <Link href="/agents" className="btn btn-outline" style={{ marginTop: 'var(--space-2)' }}>
                      <Radar size={16} />
                      Open full monitor
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h3 className="card-title">Quick Actions</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <Link href="/gardening/tasks/new" className="btn btn-success">
                  <Plus />
                  Add Garden Task
                </Link>
                <Link href="/gardening/seeds" className="btn btn-outline">
                  <Package />
                  Update Seed Inventory
                </Link>

                <div className="quick-links-stack">
                  {QUICK_LINKS.map((link) => {
                    const Icon = link.icon
                    return (
                      <a
                        key={link.title}
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noreferrer' : undefined}
                        className="quick-link-row"
                      >
                        <span className="quick-link-main">
                          <Icon size={16} />
                          <span>
                            <span className="quick-link-title">{link.title}</span>
                            <span className="quick-link-description">{link.description}</span>
                          </span>
                        </span>
                        <ExternalLink size={15} />
                      </a>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
