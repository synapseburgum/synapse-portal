import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Pin,
  PinOff,
  Search,
  Share2,
  Volume2,
} from 'lucide-react'
import { getBriefByDate, listBriefArchive } from '@/lib/brief'
import { prisma } from '@/lib/db'

function isoDateOnly(date: Date) {
  return date.toISOString().slice(0, 10)
}

function shiftDate(date: Date, diffDays: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + diffDays)
  return d
}

async function toggleReadAction(formData: FormData) {
  'use server'
  const id = String(formData.get('id') || '')
  const nextRead = String(formData.get('nextRead') || 'false') === 'true'
  const date = String(formData.get('date') || '')

  if (!id) return

  await prisma.dailyBrief.update({ where: { id }, data: { isRead: nextRead } })
  redirect(`/brief?date=${date}`)
}

async function togglePinAction(formData: FormData) {
  'use server'
  const id = String(formData.get('id') || '')
  const nextPinned = String(formData.get('nextPinned') || 'false') === 'true'
  const date = String(formData.get('date') || '')

  if (!id) return

  await prisma.dailyBrief.update({ where: { id }, data: { isPinned: nextPinned } })
  redirect(`/brief?date=${date}`)
}

export default async function BriefPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; from?: string; to?: string; q?: string; expanded?: string }>
}) {
  const params = await searchParams
  const selected = params.date ? new Date(params.date) : new Date()
  if (Number.isNaN(selected.getTime())) notFound()

  selected.setHours(0, 0, 0, 0)

  const [brief, archive] = await Promise.all([
    getBriefByDate(isoDateOnly(selected)),
    listBriefArchive({
      from: params.from || null,
      to: params.to || null,
      query: params.q || null,
      take: 90,
    }),
  ])

  const expanded = params.expanded === '1'
  const prevDate = isoDateOnly(shiftDate(selected, -1))
  const nextDate = isoDateOnly(shiftDate(selected, 1))

  const sharePayload = `${brief.tldr}\n\n${brief.content}`
  const shareText = encodeURIComponent(sharePayload)

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Daily Brief</h1>
          <p className="text-muted mb-0">Morning TL;DR, searchable archive, and full daily context.</p>
        </div>
      </header>

      <section className="section">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <h2 className="card-title">{selected.toLocaleDateString()}</h2>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Link className="btn btn-outline" href={`/brief?date=${prevDate}${expanded ? '&expanded=1' : ''}`}>
                <ChevronLeft /> Previous
              </Link>
              <Link className="btn btn-outline" href={`/brief?date=${nextDate}${expanded ? '&expanded=1' : ''}`}>
                Next <ChevronRight />
              </Link>
            </div>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div className="brief-tldr-box">
              <strong>TL;DR</strong>
              <p className="mb-0" style={{ marginTop: 'var(--space-2)' }}>{brief.tldr}</p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <Link href={`/brief?date=${isoDateOnly(selected)}&expanded=${expanded ? '0' : '1'}`} className="btn btn-outline">
                {expanded ? 'Collapse full briefing' : 'Expand full briefing'}
              </Link>

              <form action={toggleReadAction}>
                <input type="hidden" name="id" value={brief.id} />
                <input type="hidden" name="date" value={isoDateOnly(selected)} />
                <input type="hidden" name="nextRead" value={(!brief.isRead).toString()} />
                <button type="submit" className="btn btn-outline">
                  {brief.isRead ? 'Mark unread' : 'Mark read'}
                </button>
              </form>

              <form action={togglePinAction}>
                <input type="hidden" name="id" value={brief.id} />
                <input type="hidden" name="date" value={isoDateOnly(selected)} />
                <input type="hidden" name="nextPinned" value={(!brief.isPinned).toString()} />
                <button type="submit" className="btn btn-outline">
                  {brief.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                  {brief.isPinned ? 'Unpin' : 'Pin'}
                </button>
              </form>

              <a className="btn btn-outline" href={`data:text/plain;charset=utf-8,${shareText}`} download={`brief-${isoDateOnly(selected)}.txt`}>
                <Share2 size={16} /> Export text
              </a>

              {brief.audioUrl ? (
                <a className="btn btn-outline" href={brief.audioUrl} target="_blank" rel="noreferrer">
                  <Volume2 size={16} /> Listen
                </a>
              ) : null}
            </div>

            {expanded ? (
              <pre className="brief-full-content">{brief.content}</pre>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Archive</h2>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <form method="GET" action="/brief" className="brief-search-grid">
              <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                <span className="list-item-title">From</span>
                <input className="form-input" type="date" name="from" defaultValue={params.from || ''} />
              </label>
              <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                <span className="list-item-title">To</span>
                <input className="form-input" type="date" name="to" defaultValue={params.to || ''} />
              </label>
              <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                <span className="list-item-title">Search content</span>
                <div className="brief-search-input-wrap">
                  <Search size={16} />
                  <input className="form-input" type="text" name="q" defaultValue={params.q || ''} placeholder="Find text in briefs" />
                </div>
              </label>
              <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
                <span className="list-item-title">Jump to date</span>
                <input className="form-input" type="date" name="date" defaultValue={isoDateOnly(selected)} />
              </label>
              <button className="btn btn-primary" type="submit">Apply</button>
            </form>

            {archive.length === 0 ? (
              <p className="text-muted mb-0">No briefs in this range yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                {archive.map((entry) => (
                  <Link key={entry.id} href={`/brief?date=${isoDateOnly(entry.date)}&expanded=0`} className="brief-archive-item">
                    <div>
                      <div className="brief-archive-date">{entry.date.toLocaleDateString()}</div>
                      <div className="brief-archive-tldr">{entry.tldr}</div>
                    </div>
                    <div className="brief-archive-meta">
                      {entry.isPinned ? <Pin size={14} /> : null}
                      {!entry.isRead ? <span className="badge warning">Unread</span> : <span className="badge muted">Read</span>}
                      {entry.audioUrl ? <ExternalLink size={14} /> : null}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
