import Link from 'next/link'
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

export default async function HomePage() {
  const { notifications, gardenTasks, recentStats } = await getStats()
  
  return (
    <div className="container">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 mb-1">Welcome back, Tim</h1>
        <p className="text-muted mb-0">Here's what's happening today</p>
      </div>

      {/* Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-value">{notifications}</div>
            <div className="stat-label">Unread Notifications</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-value">{gardenTasks}</div>
            <div className="stat-label">Garden Tasks Due</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-value">—</div>
            <div className="stat-label">Bets This Week</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-value">—</div>
            <div className="stat-label">Agent Runs</div>
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <h2 className="h5 mb-3">Apps</h2>
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-4">
          <Link href="/gardening" className="app-card">
            <div className="app-icon bg-success bg-opacity-10">🌱</div>
            <div>
              <div className="fw-semibold">Gardening</div>
              <small className="text-muted">Plants, seeds, calendar & tasks</small>
            </div>
          </Link>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <div className="app-card opacity-50">
            <div className="app-icon bg-secondary bg-opacity-10">📊</div>
            <div>
              <div className="fw-semibold">Analytics</div>
              <small className="text-muted">Coming soon</small>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <div className="app-card opacity-50">
            <div className="app-icon bg-secondary bg-opacity-10">🤖</div>
            <div>
              <div className="fw-semibold">Agents</div>
              <small className="text-muted">Coming soon</small>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h5 card-title mb-3">Recent Notifications</h3>
              <div className="text-muted text-center py-4">
                No notifications yet
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h5 card-title mb-3">Quick Actions</h3>
              <div className="d-grid gap-2">
                <Link href="/gardening/tasks" className="btn btn-outline-success">
                  📝 Add Garden Task
                </Link>
                <Link href="/gardening/seeds" className="btn btn-outline-primary">
                  🌾 Update Seed Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
