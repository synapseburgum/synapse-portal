import Link from 'next/link'
import { Calendar, ChevronRight, MapPin, Sprout } from 'lucide-react'
import StatusBadge from './StatusBadge'

interface PlantingCardProps {
  id: string
  plantName: string
  location?: string | null
  sowDate: Date
  status: string
  quantity?: number | null
}

export default function PlantingCard({
  id,
  plantName,
  location,
  sowDate,
  status,
  quantity,
}: PlantingCardProps) {
  const daysSinceSown = Math.max(0, Math.floor((Date.now() - new Date(sowDate).getTime()) / (1000 * 60 * 60 * 24)))

  return (
    <Link href={`/gardening/plantings/${id}`} className="app-card">
      <div className="app-icon success">
        <Sprout />
      </div>

      <div className="app-content">
        <div className="app-title">{plantName}</div>
        <div className="app-description" style={{ display: 'grid', gap: 'var(--space-1)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Calendar size={14} /> Sown {new Date(sowDate).toLocaleDateString()} ({daysSinceSown} days ago)
          </span>
          {location ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <MapPin size={14} /> {location}
            </span>
          ) : null}
          {quantity ? <span>Quantity: {quantity}</span> : null}
          <span><StatusBadge status={status} /></span>
        </div>
      </div>

      <span className="app-arrow">
        <ChevronRight />
      </span>
    </Link>
  )
}
