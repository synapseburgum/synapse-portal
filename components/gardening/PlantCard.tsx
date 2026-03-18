'use client'

import Link from 'next/link'
import { ChevronRight, Flower2, Leaf, Sprout, Apple, type LucideIcon } from 'lucide-react'
import type { ComponentType } from 'react'

interface PlantCardProps {
  id: string
  name: string
  variety?: string | null
  category: string
  sowIndoorStart?: number | null
  sowIndoorEnd?: number | null
  sowOutdoorStart?: number | null
  sowOutdoorEnd?: number | null
  imageUrl?: string | null
}

const categoryIcons: Record<string, ComponentType<{ size?: number }>> = {
  vegetable: Sprout,
  herb: Leaf,
  flower: Flower2,
  fruit: Apple,
}

const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getSowingWindow(plant: PlantCardProps): string | null {
  const indoor = plant.sowIndoorStart && plant.sowIndoorEnd
    ? `${monthNames[plant.sowIndoorStart]}-${monthNames[plant.sowIndoorEnd]}`
    : null
  const outdoor = plant.sowOutdoorStart && plant.sowOutdoorEnd
    ? `${monthNames[plant.sowOutdoorStart]}-${monthNames[plant.sowOutdoorEnd]}`
    : null

  if (indoor && outdoor) return `Indoor: ${indoor} • Outdoor: ${outdoor}`
  if (indoor) return `Sow indoors: ${indoor}`
  if (outdoor) return `Sow outdoors: ${outdoor}`
  return null
}

export default function PlantCard({
  id,
  name,
  variety,
  category,
  sowIndoorStart,
  sowIndoorEnd,
  sowOutdoorStart,
  sowOutdoorEnd,
  imageUrl,
}: PlantCardProps) {
  const sowingWindow = getSowingWindow({
    id, name, variety, category,
    sowIndoorStart, sowIndoorEnd, sowOutdoorStart, sowOutdoorEnd, imageUrl,
  })

  const Icon = categoryIcons[category] || Sprout

  return (
    <Link href={`/gardening/plants/${id}`} className="app-card">
      <div
        className="app-icon success"
        style={{ background: imageUrl ? `url(${imageUrl}) center/cover` : undefined }}
      >
        {imageUrl ? null : <Icon size={20} />}
      </div>
      <div className="app-content">
        <div className="app-title">
          {name}
          {variety ? <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}> • {variety}</span> : null}
        </div>
        <div className="app-description">
          {sowingWindow || 'No sowing info'}
        </div>
      </div>
      <span className="app-arrow">
        <ChevronRight />
      </span>
    </Link>
  )
}
