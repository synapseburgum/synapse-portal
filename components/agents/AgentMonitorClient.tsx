'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Activity, AlertTriangle, CheckCircle2, Clock3, ExternalLink, RefreshCw, WifiOff } from 'lucide-react'

type AgentHealth = 'active' | 'idle' | 'offline'

type AgentStatus = {
  name: string
  health: AgentHealth
  lastSeen: string | null
  lastMessage: string | null
}

type AgentStatusResponse = {
  ok: boolean
  data?: {
    generatedAt: string
    counts: {
      active: number
      idle: number
      offline: number
    }
    agents: AgentStatus[]
  }
  error?: string
}

const AUTO_REFRESH_MS = 45_000

function toRelativeTime(dateIso: string | null) {
  if (!dateIso) return 'No recent events'

  const now = Date.now()
  const then = new Date(dateIso).getTime()
  const diffMs = now - then

  if (Number.isNaN(then)) return 'Unknown'

  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`

  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function healthLabel(health: AgentHealth) {
  if (health === 'active') return 'Active'
  if (health === 'idle') return 'Idle'
  return 'Offline'
}

function healthBadgeClass(health: AgentHealth) {
  if (health === 'active') return 'badge success'
  if (health === 'idle') return 'badge warning'
  return 'badge error'
}

export default function AgentMonitorClient() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [agents, setAgents] = useState<AgentStatus[]>([])

  const load = useCallback(async (isManual = false) => {
    try {
      setError(null)
      if (isManual) setRefreshing(true)

      const res = await fetch('/api/agents/status', { cache: 'no-store' })
      const json = (await res.json()) as AgentStatusResponse

      if (!res.ok || !json.ok || !json.data) {
        throw new Error(json.error || 'Failed to load agent status')
      }

      setGeneratedAt(json.data.generatedAt)
      setAgents(json.data.agents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent status')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load(false)

    const id = window.setInterval(() => {
      load(false)
    }, AUTO_REFRESH_MS)

    return () => window.clearInterval(id)
  }, [load])

  const counts = useMemo(() => {
    return {
      active: agents.filter((a) => a.health === 'active').length,
      idle: agents.filter((a) => a.health === 'idle').length,
      offline: agents.filter((a) => a.health === 'offline').length,
    }
  }, [agents])

  const attentionList = useMemo(() => {
    return agents
      .filter((agent) => agent.health !== 'active')
      .sort((a, b) => {
        const score = { offline: 0, idle: 1, active: 2 }
        return score[a.health] - score[b.health]
      })
  }, [agents])

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <section className="section" style={{ marginBottom: 0 }}>
        <div className="stats-grid agent-monitor-stats-grid">
          <div className="stat-card hero">
            <div className="stat-icon accent">
              <Activity />
            </div>
            <div className="stat-value">{agents.length}</div>
            <div className="stat-label">Total Agents</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success">
              <CheckCircle2 />
            </div>
            <div className="stat-value">{counts.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning">
              <Clock3 />
            </div>
            <div className="stat-value">{counts.idle}</div>
            <div className="stat-label">Idle</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--error-subtle)', color: 'var(--error)' }}>
              <WifiOff />
            </div>
            <div className="stat-value">{counts.offline}</div>
            <div className="stat-label">Offline</div>
          </div>
        </div>
      </section>

      <section className="section" style={{ marginBottom: 0 }}>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <h2 className="card-title">Live monitor</h2>
            <div style={{ display: 'inline-flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                {generatedAt ? `Updated ${toRelativeTime(generatedAt)}` : 'Waiting for first update'}
              </span>
              <button type="button" className="btn btn-outline" onClick={() => load(true)} disabled={refreshing}>
                <RefreshCw size={16} className={refreshing ? 'spin' : undefined} />
                Refresh
              </button>
            </div>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {loading ? <p className="text-muted mb-0">Loading agent status…</p> : null}

            {error ? (
              <div className="quick-capture-result error">
                <AlertTriangle size={16} />
                {error}
              </div>
            ) : null}

            {!loading && !error && attentionList.length === 0 ? (
              <div className="quick-capture-result success">
                <div className="quick-capture-result-head">
                  <CheckCircle2 size={16} />
                  <strong>All agents are active.</strong>
                </div>
                <p className="mb-0" style={{ fontSize: 'var(--text-sm)' }}>
                  No intervention needed right now.
                </p>
              </div>
            ) : null}

            {!loading && !error && attentionList.length > 0 ? (
              <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                {attentionList.map((agent) => (
                  <article key={agent.name} className="agent-status-item agent-status-item-monitor">
                    <div className="agent-status-main">
                      <strong className="agent-name">{agent.name}</strong>
                      <span className="agent-last-seen">Last seen: {toRelativeTime(agent.lastSeen)}</span>
                      {agent.lastMessage ? <p className="agent-message-preview">{agent.lastMessage}</p> : null}
                    </div>
                    <span className={healthBadgeClass(agent.health)}>{healthLabel(agent.health)}</span>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section" style={{ marginBottom: 0 }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">All agents</h2>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {agents.map((agent) => (
              <article key={agent.name} className="agent-status-item">
                <div className="agent-status-main">
                  <strong className="agent-name">{agent.name}</strong>
                  <span className="agent-last-seen">{toRelativeTime(agent.lastSeen)}</span>
                </div>
                <span className={healthBadgeClass(agent.health)}>{healthLabel(agent.health)}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ marginBottom: 0 }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick links</h2>
          </div>
          <div className="card-body quick-links-stack">
            <a href="http://localhost:3477" target="_blank" rel="noreferrer" className="quick-link-row">
              <span className="quick-link-main">
                <Activity size={16} />
                <span>
                  <span className="quick-link-title">Open CNS Dashboard</span>
                  <span className="quick-link-description">Session controls and logs</span>
                </span>
              </span>
              <ExternalLink size={15} />
            </a>
            <a href="https://web.telegram.org/a/" target="_blank" rel="noreferrer" className="quick-link-row">
              <span className="quick-link-main">
                <ExternalLink size={16} />
                <span>
                  <span className="quick-link-title">Open Telegram</span>
                  <span className="quick-link-description">Primary inbox for Tim</span>
                </span>
              </span>
              <ExternalLink size={15} />
            </a>
            <Link href="/brief" className="quick-link-row">
              <span className="quick-link-main">
                <Clock3 size={16} />
                <span>
                  <span className="quick-link-title">Daily Brief</span>
                  <span className="quick-link-description">Triage priorities and context</span>
                </span>
              </span>
              <ExternalLink size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
