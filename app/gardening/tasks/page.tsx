import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/db'
import TaskItem from '@/components/gardening/TaskItem'
import QuickTaskComposer from '@/components/gardening/QuickTaskComposer'

function normalizeDate(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

async function getTasks(dateStr?: string) {
  const selectedDate = dateStr ? normalizeDate(new Date(dateStr)) : normalizeDate(new Date())

  try {
    const tasks = await prisma.gardenTask.findMany({
      where: { archivedAt: null },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        completions: {
          where: { date: selectedDate },
          take: 1,
        },
      },
      take: 100,
    })

    return { tasks, selectedDate }
  } catch {
    return { tasks: [], selectedDate }
  }
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; mode?: string }>
}) {
  const params = await searchParams
  const mode = params.mode === 'all' ? 'all' : 'today'
  const { tasks, selectedDate } = await getTasks(params.date)

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

  const visibleTasks = tasks.filter((task) => {
    if (mode === 'all') return true
    const due = normalizeDate(task.dueDate)
    return due <= selectedDate || !!task.recurring
  })

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Garden Tasks</h1>
          <p className="text-muted mb-0">Persistent checklist for daily, weekly, and one-off jobs</p>
        </div>
        <Link href="/gardening/tasks/new" className="btn btn-success">
          <Plus />
          Add Task
        </Link>
      </header>

      <section className="section">
        <div className="category-filter-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className="category-filter" style={{ margin: 0 }}>
            <Link href="/gardening/tasks" className={`category-filter-btn ${mode === 'today' ? 'active' : ''}`}>
              Today / Due
            </Link>
            <Link href="/gardening/tasks?mode=all" className={`category-filter-btn ${mode === 'all' ? 'active' : ''}`}>
              All Tasks
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <QuickTaskComposer />
      </section>

      <section className="section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{visibleTasks.length} Tasks</h2>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {visibleTasks.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">No tasks yet. Add one and start checking them off.</p>
                <Link href="/gardening/tasks/new" className="btn btn-primary mt-4">
                  <Plus />
                  Add Task
                </Link>
              </div>
            ) : (
              visibleTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  dueDate={task.dueDate}
                  recurring={task.recurring}
                  completedForDate={task.recurring ? task.completions.length > 0 : task.completed}
                  date={selectedDate.toISOString()}
                  archiveAction={archiveTaskAction}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
