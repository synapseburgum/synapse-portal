import Link from 'next/link'
import { 
  Sprout, 
  Calendar, 
  Package, 
  CheckSquare,
  Plus,
  ChevronRight,
  Leaf
} from 'lucide-react'
import { prisma } from '@/lib/db'

async function getGardeningData() {
  const today = new Date()
  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  
  try {
    const [plants, upcomingTasks, activePlantings, seedInventory] = await Promise.all([
      prisma.gardenPlant.count(),
      prisma.gardenTask.findMany({
        where: { completed: false, dueDate: { gte: today, lte: thirtyDaysFromNow } },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      prisma.gardenPlanting.findMany({
        where: { status: { in: ['sown', 'germinated', 'transplanted', 'growing'] } },
        include: { plant: true },
        orderBy: { sowDate: 'desc' },
        take: 5,
      }),
      prisma.seedInventory.findMany({
        include: { plant: true },
        where: { quantity: { gt: 0 } },
        take: 10,
      }),
    ])
    
    return { plants, upcomingTasks, activePlantings, seedInventory }
  } catch (error) {
    return { plants: 0, upcomingTasks: [], activePlantings: [], seedInventory: [] }
  }
}

export default async function GardeningPage() {
  const { plants, upcomingTasks, activePlantings, seedInventory } = await getGardeningData()
  
  return (
    <div className="container">
      {/* Header */}
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ color: 'var(--success)' }}>🌱</span> Gardening
          </h1>
          <p className="text-muted mb-0">Manage your plants, seeds, and tasks</p>
        </div>
        <Link href="/gardening/plants/new" className="btn btn-success">
          <Plus />
          Add Plant
        </Link>
      </header>

      {/* Quick Stats */}
      <section className="section">
        <div className="stats-grid">
          <div className="stat-card hero">
            <div className="stat-icon success">
              <Leaf />
            </div>
            <div className="stat-value">{plants}</div>
            <div className="stat-label">Plant Varieties</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon accent">
              <Sprout />
            </div>
            <div className="stat-value">{activePlantings.length}</div>
            <div className="stat-label">Active Plantings</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning">
              <Package />
            </div>
            <div className="stat-value">{seedInventory.length}</div>
            <div className="stat-label">Seed Types</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info">
              <CheckSquare />
            </div>
            <div className="stat-value">{upcomingTasks.length}</div>
            <div className="stat-label">Tasks (30 days)</div>
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Quick Access</h2>
        </div>
        <div className="apps-grid">
          <Link href="/gardening/plants" className="app-card">
            <div className="app-icon success">
              <Sprout />
            </div>
            <div className="app-content">
              <div className="app-title">Plants</div>
              <div className="app-description">Browse all varieties</div>
            </div>
            <span className="app-arrow">
              <ChevronRight />
            </span>
          </Link>
          <Link href="/gardening/calendar" className="app-card">
            <div className="app-icon accent">
              <Calendar />
            </div>
            <div className="app-content">
              <div className="app-title">Calendar</div>
              <div className="app-description">Sowing & harvest schedule</div>
            </div>
            <span className="app-arrow">
              <ChevronRight />
            </span>
          </Link>
          <Link href="/gardening/seeds" className="app-card">
            <div className="app-icon warning">
              <Package />
            </div>
            <div className="app-content">
              <div className="app-title">Seed Inventory</div>
              <div className="app-description">Stock & expiry tracking</div>
            </div>
            <span className="app-arrow">
              <ChevronRight />
            </span>
          </Link>
          <Link href="/gardening/tasks" className="app-card">
            <div className="app-icon info">
              <CheckSquare />
            </div>
            <div className="app-content">
              <div className="app-title">Tasks</div>
              <div className="app-description">To-dos & reminders</div>
            </div>
            <span className="app-arrow">
              <ChevronRight />
            </span>
          </Link>
        </div>
      </section>

      {/* Content Rows */}
      <section className="section">
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h3 className="card-title">Upcoming Tasks</h3>
              </div>
              <div className="card-body">
                {upcomingTasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <CheckSquare />
                    </div>
                    <p className="empty-state-text">No upcoming tasks</p>
                  </div>
                ) : (
                  <div>
                    {upcomingTasks.map((task) => (
                      <div key={task.id} className="list-item">
                        <div className="list-item-content">
                          <div className="list-item-title">{task.title}</div>
                          <div className="list-item-meta">
                            {task.dueDate.toLocaleDateString()}
                            {task.location && ` • ${task.location}`}
                          </div>
                        </div>
                        <span className="badge muted">{task.recurring || 'once'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-12 col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <h3 className="card-title">Active Plantings</h3>
              </div>
              <div className="card-body">
                {activePlantings.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Sprout />
                    </div>
                    <p className="empty-state-text">No active plantings</p>
                  </div>
                ) : (
                  <div>
                    {activePlantings.map((planting) => (
                      <div key={planting.id} className="list-item">
                        <div className="list-item-content">
                          <div className="list-item-title">{planting.plant.name}</div>
                          <div className="list-item-meta">
                            Sown: {planting.sowDate.toLocaleDateString()}
                            {planting.location && ` • ${planting.location}`}
                          </div>
                        </div>
                        <span className="badge success">{planting.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
