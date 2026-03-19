'use client'

import { useState, useTransition } from 'react'
import { Archive } from 'lucide-react'

interface TaskArchiveButtonProps {
  taskId: string
}

export default function TaskArchiveButton({ taskId }: TaskArchiveButtonProps) {
  const [hidden, setHidden] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (hidden) return null

  const onArchive = () => {
    startTransition(async () => {
      const res = await fetch('/api/gardening/tasks/archive', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': 'synapse-internal-key-change-in-production',
        },
        body: JSON.stringify({ id: taskId }),
      })

      if (res.ok) {
        setHidden(true)
      }
    })
  }

  return (
    <button
      type="button"
      className="btn btn-outline"
      style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}
      onClick={onArchive}
      disabled={isPending}
      aria-label="Archive task"
      title="Archive task"
    >
      <Archive size={14} />
      {isPending ? 'Archiving…' : 'Archive'}
    </button>
  )
}
