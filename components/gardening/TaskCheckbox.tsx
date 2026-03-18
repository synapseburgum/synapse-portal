'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'

interface TaskCheckboxProps {
  taskId: string
  checked: boolean
  date: string
}

export default function TaskCheckbox({ taskId, checked, date }: TaskCheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked)
  const [isPending, startTransition] = useTransition()

  const onToggle = () => {
    const next = !isChecked
    setIsChecked(next)

    startTransition(async () => {
      const res = await fetch(`/api/gardening/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ date, completed: next }),
      })

      if (!res.ok) {
        setIsChecked(!next)
      }
    })
  }

  return (
    <button
      type="button"
      className={`task-checkbox ${isChecked ? 'checked' : ''}`}
      onClick={onToggle}
      disabled={isPending}
      aria-label={isChecked ? 'Mark task incomplete' : 'Mark task complete'}
      aria-pressed={isChecked}
    >
      {isChecked ? <Check size={14} /> : null}
    </button>
  )
}
