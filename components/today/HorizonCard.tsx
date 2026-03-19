'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Check, Clock, Calendar, MoreVertical, Sparkles } from 'lucide-react'

type PriorityItem = {
  id: string
  title: string
  href: string
  level: 'high' | 'medium'
  whyItMatters: string
  score: number
  category: 'tasks' | 'agents' | 'notifications' | 'calendar' | 'system'
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'var(--error)'
  if (score >= 60) return 'var(--warning)'
  if (score >= 40) return 'var(--accent)'
  return 'var(--text-muted)'
}

function levelBadge(level: 'high' | 'medium') {
  return level === 'high' ? 'badge error' : 'badge warning'
}

export default function HorizonCard({ item }: { item: PriorityItem }) {
  const [showActions, setShowActions] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isSnoozing, setIsSnoozing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSnoozed, setIsSnoozed] = useState(false)
  const [snoozeMessage, setSnoozeMessage] = useState('')

  const handleComplete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isCompleting || isCompleted) return

    setIsCompleting(true)
    try {
      const res = await fetch('/api/today/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: item.category === 'tasks' ? 'task' : 'notification', id: item.id }),
      })

      if (res.ok) {
        setIsCompleted(true)
        setShowActions(false)
      }
    } catch {
      // Failed to complete - user can retry
    } finally {
      setIsCompleting(false)
    }
  }

  const handleSnooze = async (duration: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isSnoozing || isSnoozed) return

    setIsSnoozing(true)
    try {
      const res = await fetch('/api/today/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'task', id: item.id, duration }),
      })

      if (res.ok) {
        setIsSnoozed(true)
        setSnoozeMessage(duration === '2h' ? 'Snoozed for 2 hours' : 'Snoozed until tomorrow')
        setShowActions(false)
        setTimeout(() => {
          setIsSnoozed(false)
          setSnoozeMessage('')
        }, 3000)
      }
    } catch {
      // Failed to snooze - user can retry
    } finally {
      setIsSnoozing(false)
    }
  }

  const canComplete = item.category === 'tasks' || item.category === 'notifications'
  const canSnooze = item.category === 'tasks'

  if (isCompleted) {
    return (
      <div className="brief-priority-item completed" style={{ opacity: 0.5 }}>
        <div className="brief-priority-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Check size={16} style={{ color: 'var(--success)' }} />
            <strong style={{ textDecoration: 'line-through' }}>{item.title}</strong>
          </div>
        </div>
      </div>
    )
  }

  if (isSnoozed) {
    return (
      <div className="brief-priority-item" style={{ opacity: 0.6 }}>
        <div className="brief-priority-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Clock size={16} style={{ color: 'var(--accent)' }} />
            <strong>{item.title}</strong>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>
            {snoozeMessage}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`brief-priority-item ${item.level === 'high' ? 'high' : 'medium'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{ position: 'relative' }}
    >
      <Link href={item.href} className="brief-priority-main" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <strong>{item.title}</strong>
          <span 
            className="priority-score" 
            style={{ 
              fontSize: 'var(--text-xs)', 
              color: getScoreColor(item.score),
              fontWeight: 600,
            }}
            title={`Priority score: ${item.score}/100`}
          >
            {item.score}
          </span>
        </div>
        <span className="why-it-matters">
          <Sparkles size={10} style={{ flexShrink: 0 }} />
          {item.whyItMatters}
        </span>
      </Link>

      {/* Quick action buttons */}
      {showActions && (canComplete || canSnooze) && (
        <div className="horizon-actions" style={{
          position: 'absolute',
          right: 'var(--space-4)',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          gap: 'var(--space-2)',
          alignItems: 'center',
          background: 'var(--bg-primary)',
          padding: 'var(--space-2)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
        }}>
          {canComplete && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isCompleting}
              className="action-button complete"
              title="Mark complete"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--success)',
                color: 'white',
                cursor: 'pointer',
                opacity: isCompleting ? 0.5 : 1,
              }}
            >
              {isCompleting ? (
                <div className="spin" style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />
              ) : (
                <Check size={16} />
              )}
            </button>
          )}
          
          {canSnooze && (
            <>
              <button
                type="button"
                onClick={(e) => handleSnooze('2h', e)}
                disabled={isSnoozing}
                className="action-button snooze"
                title="Snooze 2h"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent)',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: isSnoozing ? 0.5 : 1,
                }}
              >
                <Clock size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => handleSnooze('1d', e)}
                disabled={isSnoozing}
                className="action-button snooze"
                title="Snooze 1 day"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--warning)',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: isSnoozing ? 0.5 : 1,
                }}
              >
                <Calendar size={16} />
              </button>
            </>
          )}
        </div>
      )}

      {/* Chevron for navigation */}
      <span style={{ display: 'inline-flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <span className={levelBadge(item.level)}>{item.level}</span>
        <ChevronRight size={16} />
      </span>
    </div>
  )
}
