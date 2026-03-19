'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Activity, AlertCircle, Bot, CheckCircle2, CircleOff, Clock3, RefreshCw, Wifi } from 'lucide-react'

type AgentHealth = 'active' | 'idle' | 'offline'

type AgentStatus = {
  name: string
  health: AgentHealth
  lastSeen: string | null
  lastMessage: string | null
}

type AgentResponse = {
  ok: boolean
  data?: {
    summary: {
      active: number
      idle: number
      offline: number
    }
    agents: AgentStatus[]
  }
  error?: string
}

function HealthBadge({ health }: { health: AgentHealth }) {
  if (health === 'active') {
    return (
      <span className="badge success">
        <CheckCircle2 size={12} style={{ marginRight: 4 }} /> Active
      </span>
    )
  }

  if (health === 'idle') {
    return (
      <span className="badge warning">
        <Clock3 size={12} style={{ marginRight: 4 }} /> Idle
      </span>
    )
  }

  return (
    <span className="badge muted">
      <CircleOff size={12} style={{ marginRight: 4 }} /> Offline
    </span>
  )
}

export default function AgentMonitorClient() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [summary, setSummary] = useState({ active: 0, idle: 0, offline: 0 })
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const load = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)

    try {
      const response = await fetch('/api/agents/status', { cache: 'no-store' })
      const payload = (await response.json()) as AgentResponse

      if (!response.ok || !payload.ok || !payload.data) {
        setError(payload.error || 'Unable to load agent statuses')
        return
      }

      setAgents(payload.data.agents)
      setSummary(payload.data.summary)
      setLastUpdated(new Date())
      setError(null)
    } catch {
      setError('Unable to connect to status endpoint')
    } finally {
      setLoading(false)
      if (isManual) setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load(false)
    const timer = setInterval(() => void load(false), 60_000)
    return () => clearInterval(timer)
  }, [load])

  const sortedAgents = useMemo(() => {
    const order = { active: 0, idle: 1, offline: 2 }
    return [...agents].sort((a, b) => {
      const statusCmp = order[a.health] - order[b.health]
      if (statusCmp !== 0) return statusCmp
      return a.name.localeCompare(b.name)
    })
  }, [agents])

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Agent Status Monitor</h1>
          <p className="text-muted mb-0">Live heartbeat for main, clark, scout, and the rest of your multi-agent stack</p>
        </div>
        <button className="btn btn-outline" onClick={() => void load(true)} disabled={isRefreshing || loading}>
          <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
          Refresh
        </button>
      </header>

      <section className="section">
        <div className="stats-grid agent-monitor-stats-grid">
          <div className="stat-card hero">
            <div className="stat-icon success">
              <Wifi />
            </div>
            <div className="stat-value">{summary.active}</div>
            <div className="stat-label">Active (last 20m)</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <Clock3 />
            </div>
            <div className="stat-value">{summary.idle}</div>
            <div className="stat-label">Idle (20m–3h)</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon secondary">
              <CircleOff />
            </div>
            <div className="stat-value">{summary.offline}</div>
            <div className="stat-label">Offline (&gt; 3h)</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon info">
              <Bot />
            </div>
            <div className="stat-value">{agents.length}</div>
            <div className="stat-label">Tracked Agents</div>
          </div>
        </div>

        <p className="text-muted mb-0" style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
          {lastUpdated ? `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}` : 'Waiting for first update...'}
        </p>
      </section>

      <section className="section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Agents</h2>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {loading ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-state-icon">
                  <Activity />
                </div>
                <p className="empty-state-text">Loading status…</p>
              </div>
            ) : error ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-state-icon">
                  <AlertCircle />
                </div>
                <p className="empty-state-text" style={{ maxWidth: 340 }}>{error}</p>
              </div>
            ) : sortedAgents.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <div className="empty-state-icon">
                  <Bot />
                </div>
                <p className="empty-state-text">No agent telemetry yet</p>
              </div>
            ) : (
              sortedAgents.map((agent) => (
                <div key={agent.name} className="agent-status-item agent-status-item-monitor">
                  <div className="agent-status-main">
                    <strong className="agent-name">{agent.name}</strong>
                    {agent.lastSeen ? (
                      <span className="agent-last-seen">{formatDistanceToNow(new Date(agent.lastSeen), { addSuffix: true })}</span>
                    ) : (
                      <span className="agent-last-seen">no recent events</span>
                    )}
                    {agent.lastMessage ? (
                      <span className="agent-message-preview">{agent.lastMessage}</span>
                    ) : null}
                  </div>
                  <div className="agent-status-side">
                    <HealthBadge health={agent.health} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
