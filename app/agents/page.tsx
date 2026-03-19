import AgentMonitorClient from '@/components/agents/AgentMonitorClient'

export const revalidate = 0

export default function AgentsPage() {
  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Agent Monitor</h1>
          <p className="text-muted mb-0">
            Live status for Tim&apos;s multi-agent setup. Built for quick mobile checks and fast intervention.
          </p>
        </div>
      </header>

      <AgentMonitorClient />
    </div>
  )
}
