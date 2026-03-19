'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'

export default function TelegramDraftCard({ draft }: { draft: string }) {
  const [copied, setCopied] = useState(false)

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <h2 className="card-title">Telegram draft</h2>
        <a href="https://web.telegram.org/a/" target="_blank" rel="noreferrer" className="btn btn-outline">
          <ExternalLink size={16} /> Open Telegram
        </a>
      </div>
      <div className="card-body" style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <p className="text-muted mb-0" style={{ fontSize: 'var(--text-sm)' }}>
          Copy and send this morning snapshot in one tap.
        </p>
        <pre className="today-draft-box">{draft}</pre>
        <button type="button" className="btn btn-primary" onClick={copyDraft}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy draft'}
        </button>
      </div>
    </div>
  )
}
