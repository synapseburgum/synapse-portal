import BriefClient from '@/components/brief/BriefClient'

export default function BriefPage() {
  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Daily Brief</h1>
          <p className="text-muted mb-0">Latest education + physics + AI briefing pipeline.</p>
        </div>
      </header>

      <BriefClient />
    </div>
  )
}
