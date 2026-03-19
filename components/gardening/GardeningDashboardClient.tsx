'use client'

import { useMemo, useState } from 'react'
import QuickTaskComposer from './QuickTaskComposer'
import FrontTaskList from './FrontTaskList'

type Task = {
  id: string
  title: string
  description: string | null
  dueDate: Date
  recurring: string | null
  completed: boolean
  completions: Array<{ id: string }>
}

type NewTask = {
  id: string
  title: string
  dueDate: string
  recurring: string | null
}

interface GardeningDashboardClientProps {
  initialTasks: Task[]
  dateIso: string
  archiveAction: (formData: FormData) => Promise<void>
}

export default function GardeningDashboardClient({ initialTasks, dateIso, archiveAction }: GardeningDashboardClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [tasks],
  )

  function handleTaskCreated(task: NewTask) {
    setTasks((prev) => {
      const next: Task[] = [
        {
          id: task.id,
          title: task.title,
          description: null,
          dueDate: new Date(task.dueDate),
          recurring: task.recurring,
          completed: false,
          completions: [],
        },
        ...prev,
      ]

      return next.slice(0, 10)
    })
  }

  return (
    <>
      <QuickTaskComposer onTaskCreated={handleTaskCreated} />
      <div style={{ marginTop: 'var(--space-6)' }}>
        <FrontTaskList tasks={sortedTasks} dateIso={dateIso} archiveAction={archiveAction} />
      </div>
    </>
  )
}
