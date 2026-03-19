import Link from 'next/link'
import { MessageSquarePlus, CheckSquare, Bell } from 'lucide-react'
import { prisma } from '@/lib/db'
import QuickCaptureClient from '@/components/quickcapture/QuickCaptureClient'

async function getCaptureContext() {
  try {
    const [pendingTasks, quickCaptureNotes] = await Promise.all([
      prisma.gardenTask.count({ where: { completed: false } }),
      prisma.notification.count({ where: { source: 'quick-capture', isRead: false } }),
    ])

    return { pendingTasks, quickCaptureNotes }
  } catch {
    return { pendingTasks: 0, quickCaptureNotes: 0 }
  }
}

export default async function InboxPage() {
  const { pendingTasks, quickCaptureNotes } = await getCaptureContext()

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Inbox</h1>
          <p className="text-muted mb-0">Fast capture for phone-first, Telegram-style notes and tasks.</p>
        </div>
      </header>

      <section className="section">
        <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="stat-card hero">
            <div className="stat-icon accent">
              <MessageSquarePlus />
            </div>
            <div className="stat-value">Quick</div>
            <div className="stat-label">Capture in natural language</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon info">
              <CheckSquare />
            </div>
            <div className="stat-value">{pendingTasks}</div>
            <div className="stat-label">Open Garden Tasks</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon secondary">
              <Bell />
            </div>
            <div className="stat-value">{quickCaptureNotes}</div>
            <div className="stat-label">Unread Capture Notes</div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <QuickCaptureClient />
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <Link href="/gardening/tasks" className="btn btn-outline">
            View Garden Tasks
          </Link>
          <Link href="/brief" className="btn btn-outline">
            Back to Daily Brief
          </Link>
        </div>
      </section>
    </div>
  )
}
