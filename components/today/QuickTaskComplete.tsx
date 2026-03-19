'use client'

import { useState } from 'react'
import { Check, Clock, AlertCircle, Sparkles } from 'lucide-react'

type Task = {
  id: string
  title: string
  dueDate: Date
  overdue: boolean
  whyItMatters?: string
  score: number
  horizon: 'now' | 'next' | 'later'
}

function formatDueDate(dueDate: Date, overdue: boolean): string {
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (overdue) {
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`
  }

  if (diffHours < 1) return 'Due soon'
  if (diffHours < 24) return `Due in ${diffHours} hour${diffHours === 1 ? '' : 's'}`
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  return `Due in ${diffDays} days`
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'var(--error)'
  if (score >= 60) return 'var(--warning)'
  if (score >= 40) return 'var(--accent)'
  return 'var(--text-muted)'
}

function getUrgencyClass(overdue: boolean, horizon: string): string {
  if (overdue) return 'urgency-critical'
  if (horizon === 'now') return 'urgency-high'
  if (horizon === 'next') return 'urgency-medium'
  return 'urgency-low'
}

export default function QuickTaskComplete({ tasks }: { tasks: Task[] }) {
  const [completing, setCompleting] = useState<string | null>(null)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  async function handleComplete(taskId: string) {
    setCompleting(taskId)
    try {
      const res = await fetch(`/api/gardening/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        setCompleted((prev) => new Set([...prev, taskId]))
      }
    } catch (error) {
      console.error('Failed to complete task:', error)
    } finally {
      setCompleting(null)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      {tasks.map((task) => {
        const isCompleted = completed.has(task.id)
        const isCompleting = completing === task.id

        return (
          <div
            key={task.id}
            className={`todo-priority-item ${getUrgencyClass(task.overdue, task.horizon)} ${isCompleted ? 'completed' : ''}`}
            style={{
              opacity: isCompleted ? 0.5 : 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            <div className="todo-priority-main">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <strong style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                  {task.title}
                </strong>
                <span 
                  className="priority-score"
                  style={{ color: getScoreColor(task.score) }}
                  title={`Priority score: ${task.score}/100`}
                >
                  {task.score}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {task.overdue ? <AlertCircle size={12} /> : <Clock size={12} />}
                  {formatDueDate(new Date(task.dueDate), task.overdue)}
                </span>
                {task.whyItMatters && (
                  <span className="why-it-matters">
                    <Sparkles size={10} style={{ flexShrink: 0 }} />
                    {task.whyItMatters}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              className={`task-checkbox ${isCompleted ? 'checked' : ''}`}
              onClick={() => !isCompleted && handleComplete(task.id)}
              disabled={isCompleting || isCompleted}
              aria-label={isCompleted ? 'Completed' : 'Mark complete'}
            >
              {isCompleting ? (
                <div className="spin" style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />
              ) : (
                isCompleted && <Check size={14} />
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
