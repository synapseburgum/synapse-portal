'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, ExternalLink, RefreshCcw } from 'lucide-react'

type BriefSection = { title: string; content: string }
type BriefSource = { title: string; url: string }

type Brief = {
  date: string
  title: string
  summary: string
  sections: BriefSection[]
  sources: BriefSource[]
  generatedAt: string
}

type BriefListItem = {
  date: string
  title: string
  generatedAt: string
}

export default function BriefClient() {
  const [brief, setBrief] = useState<Brief | null>(null)
  const [archive, setArchive] = useState<BriefListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)

    try {
      const [todayRes, listRes] = await Promise.all([
        fetch('/api/brief/today', { cache: 'no-store' }),
        fetch('/api/brief/list', { cache: 'no-store' }),
      ])

      const todayJson = await todayRes.json()
      const listJson = await listRes.json()

      if (!todayRes.ok || !listRes.ok) {
        throw new Error('Failed to fetch brief data')
      }

      setBrief(todayJson?.brief || null)
      setArchive(Array.isArray(listJson?.briefs) ? listJson.briefs : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brief')
      setBrief(null)
      setArchive([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <section className="section">
        <div className="card">
          <div className="card-body">
            <p className="mb-0">Loading daily brief…</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="section">
        <div className="card">
          <div className="card-body" style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <p className="mb-0">Failed to load brief: {error}</p>
            <button type="button" className="btn btn-outline" onClick={load}>
              <RefreshCcw size={16} /> Retry
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (!brief) {
    return (
      <section className="section">
        <div className="card">
          <div className="card-body" style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <p className="mb-0">No brief available yet. Post one to <code>/api/brief</code> to populate this page.</p>
            <button type="button" className="btn btn-outline" onClick={load}>
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="section" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <h2 className="card-title" style={{ fontSize: 'var(--text-xl)' }}>{brief.title}</h2>
            <span className="badge info">
              <CalendarDays size={13} style={{ marginRight: 4 }} />
              {brief.date}
            </span>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div className="brief-tldr-box">
              <strong>Summary</strong>
              <p className="mb-0" style={{ marginTop: 'var(--space-2)' }}>{brief.summary}</p>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {brief.sections.map((section) => (
                <article key={section.title} className="brief-section-card">
                  <h3 className="brief-section-title">{section.title}</h3>
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{section.content}</p>
                </article>
              ))}
            </div>

            <div>
              <h3 className="brief-section-title" style={{ marginBottom: 'var(--space-3)' }}>Sources</h3>
              {brief.sources.length === 0 ? (
                <p className="text-muted mb-0">No sources listed.</p>
              ) : (
                <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  {brief.sources.map((source) => (
                    <a key={`${source.title}-${source.url}`} href={source.url} target="_blank" rel="noreferrer" className="quick-link-row">
                      <span className="quick-link-main">
                        <ExternalLink size={16} />
                        <span>
                          <span className="quick-link-title">{source.title}</span>
                          <span className="quick-link-description">{source.url}</span>
                        </span>
                      </span>
                      <ExternalLink size={15} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <p className="text-muted mb-0" style={{ fontSize: 'var(--text-xs)' }}>
              Generated at: {new Date(brief.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <h2 className="card-title">Available briefs</h2>
            <button type="button" className="btn btn-outline" onClick={load}>
              <RefreshCcw size={16} /> Refresh
            </button>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {archive.map((item) => (
              <div key={item.date} className="brief-archive-item" style={{ cursor: 'default' }}>
                <div>
                  <div className="brief-archive-date">{item.date}</div>
                  <div className="brief-archive-tldr">{item.title}</div>
                </div>
                <div className="brief-archive-meta">
                  <span className="badge muted">{new Date(item.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
