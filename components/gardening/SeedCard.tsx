import Link from 'next/link'
import { AlertTriangle, CalendarClock, ChevronRight, Package, Warehouse } from 'lucide-react'

interface SeedCardProps {
  id: string
  plantId: string
  plantName: string
  quantity: number
  supplier?: string | null
  batchCode?: string | null
  expiryDate?: Date | null
}

function monthsUntil(date?: Date | null) {
  if (!date) return null
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30))
}

export default function SeedCard({
  id,
  plantId,
  plantName,
  quantity,
  supplier,
  batchCode,
  expiryDate,
}: SeedCardProps) {
  const lowStock = quantity <= 10
  const monthsLeft = monthsUntil(expiryDate)
  const expiringSoon = monthsLeft !== null && monthsLeft <= 6

  return (
    <Link href={`/gardening/seeds/${id}`} className="app-card">
      <div className={`app-icon ${lowStock ? 'warning' : 'accent'}`}>
        <Package />
      </div>

      <div className="app-content">
        <div className="app-title">{plantName}</div>
        <div className="app-description" style={{ display: 'grid', gap: 'var(--space-1)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Warehouse size={14} /> {quantity} seeds
          </span>

          {supplier ? <span>Supplier: {supplier}</span> : null}
          {batchCode ? <span>Batch: {batchCode}</span> : null}

          {expiryDate ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                color: expiringSoon ? 'var(--warning)' : undefined,
              }}
            >
              {expiringSoon ? <AlertTriangle size={14} /> : <CalendarClock size={14} />}
              Expires {new Date(expiryDate).toLocaleDateString()}
            </span>
          ) : null}
        </div>
      </div>

      <span className="app-arrow">
        <ChevronRight />
      </span>
    </Link>
  )
}
