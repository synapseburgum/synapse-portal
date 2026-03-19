'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { CalendarDays, ChevronDown, ChevronRight, ExternalLink, RefreshCcw } from 'lucide-react'

type BriefLink = { title: string; url: string }
type BriefSection = {
  title: string
  summary: string
  details?: string
  links?: BriefLink[]
  tags?: string[]
}
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

function normalizeSection(input: unknown): BriefSection | null {
  if (!input || typeof input !== 'object') return null
  const obj = input as Record<string, unknown>

  const title = String(obj.title || '').trim()
  const summary = String(obj.summary || obj.content || '').trim()
  if (!title || !summary) return null

  const details = typeof obj.details === 'string' ? obj.details.trim() : undefined

  const links = Array.isArray(obj.links)
    ? obj.links
        .map((link) => {
          if (!link || typeof link !== 'object') return null
          const l = link as Record<string, unknown>
          const lt = String(l.title || '').trim()
          const lu = String(l.url || '').trim()
          if (!lt || !lu) return null
          return { title: lt, url: lu }
        })
        .filter((v): v is BriefLink => Boolean(v))
    : undefined

  const parsedTags = Array.isArray(obj.tags)
    ? obj.tags.map((tag) => String(tag || '').trim()).filter(Boolean)
    : undefined

  return {
    title,
    summary,
    ...(details ? { details } : {}),
    ...(links && links.length > 0 ? { links } : {}),
    ...(parsedTags && parsedTags.length > 0 ? { tags: parsedTags } : {}),
  }
}

function normalizeBrief(input: unknown): Brief | null {
  if (!input || typeof input !== 'object') return null
  const obj = input as Record<string, unknown>

  const date = String(obj.date || '').trim()
  const title = String(obj.title || '').trim()
  const summary = String(obj.summary || '').trim()
  const generatedAt = String(obj.generatedAt || '').trim()

  if (!date || !title || !summary || !generatedAt) return null

  const rawSections = Array.isArray(obj.sections) ? obj.sections : []
  const sections = rawSections.map(normalizeSection).filter((s): s is BriefSection => Boolean(s))

  const rawSources = Array.isArray(obj.sources) ? obj.sources : []
  const sources = rawSources
    .map((src) => {
      if (!src || typeof src !== 'object') return null
      const source = src as Record<string, unknown>
      const st = String(source.title || '').trim()
      const su = String(source.url || '').trim()
      if (!st || !su) return null
      return { title: st, url: su }
    })
    .filter((v): v is BriefSource => Boolean(v))

  return {
    date,
    title,
    summary,
    sections,
    sources,
    generatedAt,
  }
}

export default function BriefClient() {
  const [brief, setBrief] = useState<Brief | null>(null)
  const [archive, setArchive] = useState<BriefListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]))

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

      const nextBrief = normalizeBrief(todayJson?.brief || null)
      setBrief(nextBrief)
      setArchive(Array.isArray(listJson?.briefs) ? listJson.briefs : [])
      setExpandedSections(new Set(nextBrief && nextBrief.sections.length > 0 ? [0] : []))
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

  function toggleSection(index: number) {
    setExpandedSections((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

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
              <p className="mb-0" style={{ marginTop: 'var(--space-2)', lineHeight: 1.6 }}>{brief.summary}</p>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {brief.sections.map((section, index) => {
                const isExpanded = expandedSections.has(index)
                const hasDetails = Boolean(section.details)

                return (
                  <article key={`${section.title}-${index}`} className="brief-section-card" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                    <div className="brief-section-content" style={{ display: 'grid', gap: 'var(--space-2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                        <div>
                          <h3 className="brief-section-title" style={{ marginBottom: 'var(--space-1)' }}>{section.title}</h3>
                          <p className="mb-0" style={{ lineHeight: 1.6 }}>{section.summary}</p>
                        </div>

                        {hasDetails ? (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)', flexShrink: 0 }}
                            onClick={() => toggleSection(index)}
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            {isExpanded ? 'Show less' : 'Read more'}
                          </button>
                        ) : null}
                      </div>

                      {section.tags && section.tags.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                          {section.tags.map((tag) => (
                            <span key={`${section.title}-tag-${tag}`} className="badge muted">#{tag}</span>
                          ))}
                        </div>
                      ) : null}

                      {isExpanded && section.details ? (
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-3)' }}>
                          <div className="brief-markdown">
                            <ReactMarkdown>{section.details}</ReactMarkdown>
                          </div>

                          {section.links && section.links.length > 0 ? (
                            <div style={{ marginTop: 'var(--space-3)', display: 'grid', gap: 'var(--space-2)' }}>
                              <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Related links</h4>
                              {section.links.map((link) => (
                                <a
                                  key={`${section.title}-${link.url}`}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="quick-link-row"
                                >
                                  <span className="quick-link-main">
                                    <ExternalLink size={15} />
                                    <span>
                                      <span className="quick-link-title">{link.title}</span>
                                      <span className="quick-link-description">{link.url}</span>
                                    </span>
                                  </span>
                                  <ExternalLink size={14} />
                                </a>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </article>
                )
              })}
            </div>

            <div>
              <h3 className="brief-section-title" style={{ marginBottom: 'var(--space-3)' }}>Sources</h3>
              {brief.sources.length === 0 ? (
                <p className="text-muted mb-0">No sources listed.</p>
              ) : (
                <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  {brief.sources.map((source) => (
                    <a
                      key={`${source.title}-${source.url}`}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="quick-link-row"
                    >
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
