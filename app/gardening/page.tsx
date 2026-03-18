import Link from 'next/link'
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">🌱 Gardening</h1>
          <p className="text-muted mb-0">Manage your plants, seeds, and tasks</p>
        </div>
        <Link href="/gardening/plants/new" className="btn btn-success">
          + Add Plant
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-value">{plants}</div>
            <div className="stat-label">Plant Varieties</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-value">{activePlantings.length}</div>
            <div className="stat-label">Active Plantings</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-value">{seedInventory.length}</div>
            <div className="stat-label">Seed Types</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-value">{upcomingTasks.length}</div>
            <div className="stat-label">Tasks (30 days)</div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <Link href="/gardening/plants" className="app-card">
            <div className="app-icon bg-success bg-opacity-10">🌿</div>
            <div>
              <div className="fw-semibold">Plants</div>
              <small className="text-muted">Browse all varieties</small>
            </div>
          </Link>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <Link href="/gardening/calendar" className="app-card">
            <div className="app-icon bg-primary bg-opacity-10">📅</div>
            <div>
              <div className="fw-semibold">Calendar</div>
              <small className="text-muted">Sowing & harvest schedule</small>
            </div>
          </Link>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <Link href="/gardening/seeds" className="app-card">
            <div className="app-icon bg-warning bg-opacity-10">🌾</div>
            <div>
              <div className="fw-semibold">Seed Inventory</div>
              <small className="text-muted">Stock & expiry tracking</small>
            </div>
          </Link>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <Link href="/gardening/tasks" className="app-card">
            <div className="app-icon bg-info bg-opacity-10">✅</div>
            <div>
              <div className="fw-semibold">Tasks</div>
              <small className="text-muted">To-dos & reminders</small>
            </div>
          </Link>
        </div>
      </div>

      {/* Content Rows */}
      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h5 card-title mb-3">Upcoming Tasks</h3>
              {upcomingTasks.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">No upcoming tasks</p>
              ) : (
                <div className="list-group list-group-flush">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-medium">{task.title}</div>
                        <small className="text-muted">{task.dueDate.toLocaleDateString()}</small>
                      </div>
                      <span className="badge bg-secondary">{task.recurring || 'once'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h5 card-title mb-3">Active Plantings</h3>
              {activePlantings.length === 0 ? (
                <p className="text-muted text-center py-4 mb-0">No active plantings</p>
              ) : (
                <div className="list-group list-group-flush">
                  {activePlantings.map((planting) => (
                    <div key={planting.id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-medium">{planting.plant.name}</div>
                        <small className="text-muted">
                          Sown: {planting.sowDate.toLocaleDateString()}
                          {planting.location && ` • ${planting.location}`}
                        </small>
                      </div>
                      <span className="badge bg-success">{planting.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
