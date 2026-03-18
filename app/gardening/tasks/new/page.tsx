import { redirect } from 'next/navigation'
import { Save } from 'lucide-react'
import { prisma } from '@/lib/db'

async function createTaskAction(formData: FormData) {
  'use server'

  const title = String(formData.get('title') || '').trim()
  const dueDate = String(formData.get('dueDate') || '').trim()

  if (!title || !dueDate) return

  await prisma.gardenTask.create({
    data: {
      title,
      description: String(formData.get('description') || '').trim() || null,
      dueDate: new Date(dueDate),
      recurring: String(formData.get('recurring') || '').trim() || null,
    },
  })

  redirect('/gardening/tasks')
}

export default function NewTaskPage() {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Add Garden Task</h1>
          <p className="text-muted mb-0">Create one-off or recurring tasks with persistent completion tracking</p>
        </div>
      </header>

      <section className="section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Task Details</h2>
          </div>
          <div className="card-body">
            <form action={createTaskAction} style={{ display: 'grid', gap: 'var(--space-6)' }}>
              <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Task Title *</span>
                  <input name="title" required className="form-input" placeholder="Water greenhouse seedlings" />
                </label>

                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Due Date *</span>
                  <input type="date" name="dueDate" required defaultValue={today} className="form-input" />
                </label>

                <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  <span className="list-item-title">Recurring</span>
                  <select name="recurring" className="form-input" defaultValue="">
                    <option value="">One-off</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>
              </div>

              <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                <span className="list-item-title">Description</span>
                <textarea name="description" className="form-input" rows={4} placeholder="What needs doing, where, and any reminders..." />
              </label>

              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary">
                  <Save />
                  Save Task
                </button>
                <a href="/gardening/tasks" className="btn btn-secondary">
                  Cancel
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
