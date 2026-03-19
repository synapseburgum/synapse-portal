import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import {
  Sprout,
  Calendar,
  Package,
  CheckSquare,
  Plus,
  ChevronRight,
  Leaf,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { prisma } from '@/lib/db'
import GardeningDashboardClient from '@/components/gardening/GardeningDashboardClient'

type CriticalTodo = {
  id: string
  title: string
  dueDate: Date
  recurring: string | null
  urgency: 'critical' | 'high' | 'medium' | 'low'
  label: string
}

function classifyTaskUrgency(dueDate: Date): Pick<CriticalTodo, 'urgency' | 'label'> {
  const now = new Date()
  const startToday = new Date(now)
  startToday.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  const dueStart = new Date(due)
  dueStart.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((dueStart.getTime() - startToday.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { urgency: 'critical', label: 'Overdue' }
  if (diffDays === 0) return { urgency: 'critical', label: 'Due today' }
  if (diffDays <= 2) return { urgency: 'high', label: 'Due soon' }
  if (diffDays <= 7) return { urgency: 'medium', label: 'This week' }
  return { urgency: 'low', label: 'Planned' }
}

async function getGardeningData() {
  const today = new Date()
  const selectedDay = new Date(today)
  selectedDay.setHours(0, 0, 0, 0)

  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const criticalWindow = new Date(today)
  criticalWindow.setDate(criticalWindow.getDate() + 14)

  try {
    const [plants, upcomingTasks, criticalTaskRows, activePlantings, seedInventory] = await Promise.all([
      prisma.gardenPlant.count(),
      prisma.gardenTask.findMany({
        where: { archivedAt: null, completed: false, dueDate: { gte: today, lte: thirtyDaysFromNow } },
        orderBy: { dueDate: 'asc' },
        include: {
          completions: {
            where: { date: selectedDay },
            take: 1,
          },
        },
        take: 5,
      }),
      prisma.gardenTask.findMany({
        where: { archivedAt: null, completed: false, dueDate: { lte: criticalWindow } },
        orderBy: { dueDate: 'asc' },
        take: 8,
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

    const criticalTodos: CriticalTodo[] = criticalTaskRows.map((task) => {
      const urgency = classifyTaskUrgency(task.dueDate)
      return {
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        recurring: task.recurring,
        urgency: urgency.urgency,
        label: urgency.label,
      }
    })

    return { plants, upcomingTasks, activePlantings, seedInventory, criticalTodos }
  } catch (error) {
    return { plants: 0, upcomingTasks: [], activePlantings: [], seedInventory: [], criticalTodos: [] }
  }
}

export default async function GardeningPage() {
  const { plants, upcomingTasks, activePlantings, seedInventory, criticalTodos } = await getGardeningData()

  async function archiveTaskAction(formData: FormData) {
    'use server'

    const id = String(formData.get('id') || '').trim()
    if (!id) return

    await prisma.gardenTask.update({
      where: { id },
      data: { archivedAt: new Date() },
    })

    revalidatePath('/gardening')
    revalidatePath('/gardening/tasks')
    revalidatePath('/gardening/calendar')
  }

  const criticalCount = criticalTodos.filter((task) => task.urgency === 'critical').length
  const todayIso = new Date().toISOString()

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

      {/* Critical TODOs */}
      <section className="section">
        <div className="card todo-priority-card">
          <div className="card-header todo-priority-header">
            <div>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <AlertTriangle style={{ width: 18, height: 18, color: 'var(--error)' }} />
                Priority Garden TODOs
              </h3>
              <p className="text-muted mb-0" style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                Colour-coded by urgency so the must-do jobs stand out.
              </p>
            </div>
            <div className="todo-priority-meta">
              {criticalCount > 0 ? <span className="badge error">{criticalCount} critical</span> : <span className="badge success">No critical tasks</span>}
              <Link href="/gardening/tasks" className="btn btn-outline" style={{ padding: 'var(--space-2) var(--space-3)' }}>
                Open all tasks
              </Link>
            </div>
          </div>

          <div className="card-body">
            {criticalTodos.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                <div className="empty-state-icon">
                  <Clock />
                </div>
                <p className="empty-state-text">No urgent gardening tasks in the next two weeks.</p>
              </div>
            ) : (
              <div className="todo-priority-stack">
                {criticalTodos.map((task) => (
                  <div key={task.id} className={`todo-priority-item urgency-${task.urgency}`}>
                    <div className="todo-priority-main">
                      <strong>{task.title}</strong>
                      <span>
                        Due {task.dueDate.toLocaleDateString()} {task.recurring ? `• ${task.recurring}` : '• one-off'}
                      </span>
                    </div>
                    <span className={`badge ${task.urgency === 'critical' ? 'error' : task.urgency === 'high' ? 'warning' : task.urgency === 'medium' ? 'info' : 'accent'}`}>
                      {task.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
                <GardeningDashboardClient initialTasks={upcomingTasks} dateIso={todayIso} archiveAction={archiveTaskAction} />
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
