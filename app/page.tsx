import Link from 'next/link'
import {
  Bell,
  Sprout,
  Zap,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Newspaper,
  CloudSun,
  MessageSquarePlus,
  Plus,
  Package,
  Gauge,
  Bot,
  SunMedium,
} from 'lucide-react'
import { prisma } from '@/lib/db'
import { getAgentHealthCounts, getAgentStatuses } from '@/lib/agents'

const QUICK_LINKS = [
  {
    title: 'CNS Dashboard',
    description: 'Open CNS local dashboard',
    href: 'http://localhost:3477',
    icon: Gauge,
    external: true,
  },
  {
    title: 'Telegram',
    description: 'Primary messaging inbox',
    href: process.env.TELEGRAM_WEB_URL || 'https://web.telegram.org/a/',
    icon: MessageSquarePlus,
    external: true,
  },
]

async function getStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  try {
    const [notifications, gardenTasks, pinnedBriefs, agentStatuses] = await Promise.all([
      prisma.notification.count({ where: { isRead: false } }),
      prisma.gardenTask.count({ where: { completed: false, dueDate: { gte: today } } }),
      prisma.dailyBrief.count({ where: { isPinned: true } }),
      getAgentStatuses(),
    ])

    const agentCounts = getAgentHealthCounts(agentStatuses)

    return { notifications, gardenTasks, pinnedBriefs, agentCounts }
  } catch {
    return {
      notifications: 0,
      gardenTasks: 0,
      pinnedBriefs: 0,
      agentCounts: { active: 0, idle: 0, offline: 0 },
    }
  }
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function HomePage() {
  const { notifications, gardenTasks, pinnedBriefs, agentCounts } = await getStats()

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
              <Newspaper />
            </div>
            <div className="stat-value">{pinnedBriefs}</div>
            <div className="stat-label">Pinned Briefs</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info">
              <Bot />
            </div>
            <div className="stat-value">{agentCounts.offline}</div>
            <div className="stat-label">Agents Offline</div>
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
          <Link href="/brief" className="app-card">
            <div className="app-icon info">
              <Newspaper />
            </div>
            <div className="app-content">
              <div className="app-title">Daily Brief</div>
              <div className="app-description">TL;DR plus full briefing archive</div>
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
              <div className="app-description">Practical weather guidance</div>
            </div>
            <span className="app-arrow">
              <ChevronRight />
            </span>
          </Link>
          <Link href="/inbox" className="app-card">
            <div className="app-icon accent">
              <MessageSquarePlus />
            </div>
            <div className="app-content">
              <div className="app-title">Quick Capture Inbox</div>
              <div className="app-description">Turn rough notes into tasks</div>
            </div>
            <span className="app-arrow">
              <ChevronRight />
            </span>
          </Link>
          <Link href="/today" className="app-card">
            <div className="app-icon info">
              <SunMedium />
            </div>
            <div className="app-content">
              <div className="app-title">Today</div>
              <div className="app-description">Morning priorities + Telegram-ready snapshot</div>
            </div>
            <span className="app-arrow">
              <ChevronRight />
            </span>
          </Link>
          <Link href="/agents" className="app-card">
            <div className="app-icon secondary">
              <Bot />
            </div>
            <div className="app-content">
              <div className="app-title">Agent Monitor</div>
              <div className="app-description">Live status for all Synapse agents</div>
            </div>
            <span className="app-arrow">
              <ChevronRight />
            </span>
          </Link>
          <a href="http://localhost:3477" target="_blank" rel="noreferrer" className="app-card">
            <div className="app-icon secondary">
              <Gauge />
            </div>
            <div className="app-content">
              <div className="app-title">CNS Dashboard</div>
              <div className="app-description">Open CNS and session controls</div>
            </div>
            <span className="app-arrow">
              <ExternalLink />
            </span>
          </a>
          <div className="app-card disabled">
            <div className="app-icon muted">
              <BarChart3 />
            </div>
            <div className="app-content">
              <div className="app-title">Analytics</div>
              <div className="app-description">Coming soon</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h3 className="card-title">Recent Notifications</h3>
              </div>
              <div className="card-body">
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Bell />
                  </div>
                  <p className="empty-state-text">No notifications yet</p>
                </div>
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
                <Link href="/today" className="btn btn-outline">
                  <SunMedium />
                  Open Today View
                </Link>
                <Link href="/agents" className="btn btn-outline">
                  <Bot />
                  Open Agent Monitor
                </Link>
                <Link href="/gardening/seeds" className="btn btn-outline">
                  <Package />
                  Update Seed Inventory
                </Link>
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
      </section>
    </div>
  )
}
