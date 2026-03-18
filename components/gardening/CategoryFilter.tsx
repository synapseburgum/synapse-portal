'use client'

import { useState } from 'react'

const categories = ['all', 'vegetable', 'herb', 'flower', 'fruit'] as const

interface CategoryFilterProps {
  value: string
  onChange: (category: string) => void
}

export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="category-filter">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`category-filter-btn ${value === cat ? 'active' : ''}`}
        >
          {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </div>
  )
}
