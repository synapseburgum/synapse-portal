import { CalendarDays, Repeat } from 'lucide-react'
import TaskCheckbox from './TaskCheckbox'

interface TaskItemProps {
  id: string
  title: string
  description?: string | null
  dueDate: Date
  recurring?: string | null
  completedForDate: boolean
  date: string
}

export default function TaskItem({
  id,
  title,
  description,
  dueDate,
  recurring,
  completedForDate,
  date,
}: TaskItemProps) {
  return (
    <div className="task-item">
      <TaskCheckbox taskId={id} checked={completedForDate} date={date} />

      <div className="task-item-content">
        <div className={`task-item-title ${completedForDate ? 'done' : ''}`}>{title}</div>
        <div className="task-item-meta">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <CalendarDays size={13} /> Due {new Date(dueDate).toLocaleDateString()}
          </span>
          {recurring ? (
            <span className="badge accent" style={{ marginLeft: 'var(--space-2)' }}>
              <Repeat size={12} style={{ marginRight: '4px' }} /> {recurring}
            </span>
          ) : null}
        </div>
        {description ? <p className="text-muted mb-0" style={{ fontSize: 'var(--text-sm)' }}>{description}</p> : null}
      </div>
    </div>
  )
}
