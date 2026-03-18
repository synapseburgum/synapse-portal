import Link from 'next/link'
import { 
  Bell, 
  Sprout, 
  TrendingUp, 
  Zap,
  BarChart3,
  Bot,
  ChevronRight,
  Plus,
  Package
} from 'lucide-react'
import { prisma } from '@/lib/db'

async function getStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  try {
    const [notifications, gardenTasks, recentStats] = await Promise.all([
      prisma.notification.count({ where: { isRead: false } }),
      prisma.gardenTask.count({ where: { completed: false, dueDate: { gte: today } } }),
      prisma.dailyStat.findMany({
        where: { date: today },
        take: 5,
      }),
    ])
    
    return { notifications, gardenTasks, recentStats }
  } catch (error) {
    // DB might not be set up yet
    return { notifications: 0, gardenTasks: 0, recentStats: [] }
  }
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function HomePage() {
  const { notifications, gardenTasks } = await getStats()
  
  return (
    <div className="container">
      {/* Header */}
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>{getGreeting()}, Tim</h1>
          <p className="text-muted mb-0">Here&apos;s what&apos;s happening today</p>
        </div>
      </header>

      {/* Stats Grid */}
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
              <TrendingUp />
            </div>
            <div className="stat-value">—</div>
            <div className="stat-label">Bets This Week</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info">
              <Zap />
            </div>
            <div className="stat-value">—</div>
            <div className="stat-label">Agent Runs</div>
          </div>
        </div>
      </section>

      {/* Apps Grid */}
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
              <BarChart3 />
            </div>
            <div className="app-content">
              <div className="app-title">Analytics</div>
              <div className="app-description">Coming soon</div>
            </div>
          </div>
          <div className="app-card disabled">
            <div className="app-icon muted">
              <Bot />
            </div>
            <div className="app-content">
              <div className="app-title">Agents</div>
              <div className="app-description">Coming soon</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Rows */}
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
                <Link href="/gardening/tasks" className="btn btn-success">
                  <Plus />
                  Add Garden Task
                </Link>
                <Link href="/gardening/seeds" className="btn btn-outline">
                  <Package />
                  Update Seed Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
