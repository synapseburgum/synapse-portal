import TaskItem from './TaskItem'

type FrontTask = {
  id: string
  title: string
  description: string | null
  dueDate: Date
  recurring: string | null
  completed: boolean
  completions: Array<{ id: string }>
}

interface FrontTaskListProps {
  tasks: FrontTask[]
  dateIso: string
  archiveAction: (formData: FormData) => Promise<void>
}

export default function FrontTaskList({ tasks, dateIso, archiveAction }: FrontTaskListProps) {
  if (tasks.length === 0) {
    return <p className="empty-state-text">No upcoming tasks</p>
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          id={task.id}
          title={task.title}
          description={task.description}
          dueDate={task.dueDate}
          recurring={task.recurring}
          completedForDate={task.recurring ? task.completions.length > 0 : task.completed}
          date={dateIso}
          archiveAction={archiveAction}
        />
      ))}
    </div>
  )
}
