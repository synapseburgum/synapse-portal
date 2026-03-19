'use client'

import { useState, useRef, useCallback } from 'react'

export interface Planting {
  id: string
  plantId: string
  bedId: string | null
  positionX: number | null
  positionY: number | null
  status: string
  sowDate: string
  quantity: number | null
  plant: {
    id: string
    name: string
    variety: string | null
    category: string
  }
}

export interface Bed {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  soilType: string | null
  notes?: string | null
  plantings?: Planting[] | { count: number } | number
}

export interface Plot {
  id: string
  name: string
  width: number
  height: number
  location?: string | null
  notes?: string | null
  beds: Bed[]
}

interface PlotCanvasProps {
  plot: Plot
  selectedBedId: string | null
  onSelectBed: (bedId: string | null) => void
  onAddBed: (x: number, y: number) => void
  onUpdateBed: (bedId: string, updates: Partial<Bed>) => void
  onSelectPlanting?: (plantingId: string | null) => void
  selectedPlantingId?: string | null
  readOnly?: boolean
}

const SOIL_COLORS: Record<string, string> = {
  clay: '#c17f59',
  sandy: '#e8d4a0',
  loam: '#6b8e4e',
  'compost-rich': '#3d2914',
  chalky: '#f0ebe3',
  silty: '#b8a88a',
}

const DEFAULT_BED_COLOR = '#6b8e4e'

const STATUS_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
  sown: { fill: 'transparent', stroke: '#22c55e', label: 'Sown' },
  germinated: { fill: '#86efac', stroke: '#22c55e', label: 'Germinated' },
  growing: { fill: '#4ade80', stroke: '#16a34a', label: 'Growing' },
  flowering: { fill: '#d946ef', stroke: '#a855f7', label: 'Flowering' },
  fruiting: { fill: '#fb923c', stroke: '#ea580c', label: 'Fruiting' },
  harvested: { fill: '#a8a29e', stroke: '#78716c', label: 'Harvested' },
  failed: { fill: '#f87171', stroke: '#dc2626', label: 'Failed' },
}

export default function PlotCanvas({
  plot,
  selectedBedId,
  onSelectBed,
  onAddBed,
  onUpdateBed,
  onSelectPlanting,
  selectedPlantingId,
  readOnly = false,
}: PlotCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragState, setDragState] = useState<{
    bedId: string
    startX: number
    startY: number
    originalX: number
    originalY: number
  } | null>(null)
  
  const [resizeState, setResizeState] = useState<{
    bedId: string
    corner: 'nw' | 'ne' | 'sw' | 'se'
    startX: number
    startY: number
    originalX: number
    originalY: number
    originalWidth: number
    originalHeight: number
  } | null>(null)
  
  const [gridEnabled, setGridEnabled] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  
  // Scale: pixels per meter (responsive)
  const getViewBox = useCallback(() => {
    const padding = 0.5
    return `${-padding} ${-padding} ${plot.width + padding * 2} ${plot.height + padding * 2}`
  }, [plot.width, plot.height])
  
  const getBedColor = (bed: Bed) => {
    return bed.soilType ? SOIL_COLORS[bed.soilType] || DEFAULT_BED_COLOR : DEFAULT_BED_COLOR
  }
  
  const snapValue = (value: number): number => {
    if (!snapToGrid) return value
    return Math.round(value * 2) / 2 // Snap to 0.5m grid
  }
  
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly || dragState || resizeState) return
    
    const svg = svgRef.current
    if (!svg) return
    
    const rect = svg.getBoundingClientRect()
    const viewBox = svg.viewBox.baseVal
    
    // Convert screen coords to SVG coords
    const scaleX = viewBox.width / rect.width
    const scaleY = viewBox.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX + viewBox.x
    const y = (e.clientY - rect.top) * scaleY + viewBox.y
    
    // Check if clicked on a bed
    const clickedBed = plot.beds.find(bed => 
      x >= bed.x && x <= bed.x + bed.width &&
      y >= bed.y && y <= bed.y + bed.height
    )
    
    if (clickedBed) {
      onSelectBed(clickedBed.id)
    } else {
      // Add new bed at click position
      onAddBed(snapValue(x - 0.5), snapValue(y - 0.5))
    }
  }
  
  const handleBedMouseDown = (e: React.MouseEvent, bedId: string) => {
    if (readOnly) return
    e.stopPropagation()
    
    const bed = plot.beds.find(b => b.id === bedId)
    if (!bed) return
    
    const svg = svgRef.current
    if (!svg) return
    
    const rect = svg.getBoundingClientRect()
    const viewBox = svg.viewBox.baseVal
    const scaleX = viewBox.width / rect.width
    const scaleY = viewBox.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX + viewBox.x
    const y = (e.clientY - rect.top) * scaleY + viewBox.y
    
    setDragState({
      bedId,
      startX: x,
      startY: y,
      originalX: bed.x,
      originalY: bed.y,
    })
    
    onSelectBed(bedId)
  }
  
  const handleResizeMouseDown = (e: React.MouseEvent, bedId: string, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    if (readOnly) return
    e.stopPropagation()
    
    const bed = plot.beds.find(b => b.id === bedId)
    if (!bed) return
    
    const svg = svgRef.current
    if (!svg) return
    
    const rect = svg.getBoundingClientRect()
    const viewBox = svg.viewBox.baseVal
    const scaleX = viewBox.width / rect.width
    const scaleY = viewBox.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX + viewBox.x
    const y = (e.clientY - rect.top) * scaleY + viewBox.y
    
    setResizeState({
      bedId,
      corner,
      startX: x,
      startY: y,
      originalX: bed.x,
      originalY: bed.y,
      originalWidth: bed.width,
      originalHeight: bed.height,
    })
  }
  
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    
    const rect = svg.getBoundingClientRect()
    const viewBox = svg.viewBox.baseVal
    const scaleX = viewBox.width / rect.width
    const scaleY = viewBox.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX + viewBox.x
    const y = (e.clientY - rect.top) * scaleY + viewBox.y
    
    if (dragState) {
      const dx = x - dragState.startX
      const dy = y - dragState.startY
      
      let newX = dragState.originalX + dx
      let newY = dragState.originalY + dy
      
      if (snapToGrid) {
        newX = snapValue(newX)
        newY = snapValue(newY)
      }
      
      // Constrain to plot bounds
      const bed = plot.beds.find(b => b.id === dragState.bedId)
      if (bed) {
        newX = Math.max(0, Math.min(plot.width - bed.width, newX))
        newY = Math.max(0, Math.min(plot.height - bed.height, newY))
      }
      
      onUpdateBed(dragState.bedId, { x: newX, y: newY })
    }
    
    if (resizeState) {
      const dx = x - resizeState.startX
      const dy = y - resizeState.startY
      
      let newX = resizeState.originalX
      let newY = resizeState.originalY
      let newWidth = resizeState.originalWidth
      let newHeight = resizeState.originalHeight
      
      switch (resizeState.corner) {
        case 'se':
          newWidth = Math.max(0.5, resizeState.originalWidth + dx)
          newHeight = Math.max(0.5, resizeState.originalHeight + dy)
          break
        case 'sw':
          newX = resizeState.originalX + dx
          newWidth = Math.max(0.5, resizeState.originalWidth - dx)
          newHeight = Math.max(0.5, resizeState.originalHeight + dy)
          break
        case 'ne':
          newY = resizeState.originalY + dy
          newWidth = Math.max(0.5, resizeState.originalWidth + dx)
          newHeight = Math.max(0.5, resizeState.originalHeight - dy)
          break
        case 'nw':
          newX = resizeState.originalX + dx
          newY = resizeState.originalY + dy
          newWidth = Math.max(0.5, resizeState.originalWidth - dx)
          newHeight = Math.max(0.5, resizeState.originalHeight - dy)
          break
      }
      
      if (snapToGrid) {
        newX = snapValue(newX)
        newY = snapValue(newY)
        newWidth = snapValue(newWidth)
        newHeight = snapValue(newHeight)
      }
      
      // Constrain to plot bounds
      newX = Math.max(0, newX)
      newY = Math.max(0, newY)
      newWidth = Math.min(plot.width - newX, newWidth)
      newHeight = Math.min(plot.height - newY, newHeight)
      
      onUpdateBed(resizeState.bedId, { x: newX, y: newY, width: newWidth, height: newHeight })
    }
  }, [dragState, resizeState, snapToGrid, plot, onUpdateBed])
  
  const handleMouseUp = useCallback(() => {
    setDragState(null)
    setResizeState(null)
  }, [])
  
  const getPlantingCount = (bed: Bed): number => {
    if (typeof bed.plantings === 'number') return bed.plantings
    if (bed.plantings && 'count' in bed.plantings) return bed.plantings.count
    return 0
  }
  
  return (
    <div className="plot-canvas-wrapper">
      {/* Controls */}
      <div className="plot-controls">
        <label className="plot-control-toggle">
          <input
            type="checkbox"
            checked={gridEnabled}
            onChange={(e) => setGridEnabled(e.target.checked)}
          />
          <span>Show Grid</span>
        </label>
        <label className="plot-control-toggle">
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => setSnapToGrid(e.target.checked)}
          />
          <span>Snap to Grid</span>
        </label>
      </div>

      {/* Status Legend */}
      <div className="plot-legend">
        <span className="plot-legend-title">Planting Status:</span>
        <div className="plot-legend-items">
          {Object.entries(STATUS_COLORS).map(([key, config]) => (
            <div key={key} className="plot-legend-item">
              <span
                className="plot-legend-dot"
                style={{ backgroundColor: config.fill, borderColor: config.stroke }}
              />
              <span className="plot-legend-label">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Canvas */}
      <div className="plot-canvas-container">
        <svg
          ref={svgRef}
          viewBox={getViewBox()}
          className="plot-canvas"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Background */}
          <rect
            x={0}
            y={0}
            width={plot.width}
            height={plot.height}
            className="plot-background"
          />
          
          {/* Grid */}
          {gridEnabled && (
            <g className="plot-grid">
              {/* Vertical lines */}
              {Array.from({ length: Math.ceil(plot.width) + 1 }, (_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i}
                  y1={0}
                  x2={i}
                  y2={plot.height}
                  className="plot-grid-line"
                />
              ))}
              {/* Horizontal lines */}
              {Array.from({ length: Math.ceil(plot.height) + 1 }, (_, i) => (
                <line
                  key={`h-${i}`}
                  x1={0}
                  y1={i}
                  x2={plot.width}
                  y2={i}
                  className="plot-grid-line"
                />
              ))}
            </g>
          )}
          
          {/* Plot border */}
          <rect
            x={0}
            y={0}
            width={plot.width}
            height={plot.height}
            className="plot-border"
          />
          
          {/* Beds */}
          {plot.beds.map((bed) => {
            const isSelected = bed.id === selectedBedId
            const isDragging = dragState?.bedId === bed.id || resizeState?.bedId === bed.id
            
            return (
              <g key={bed.id} className={isDragging ? 'bed-dragging' : ''}>
                {/* Bed rectangle */}
                <rect
                  x={bed.x}
                  y={bed.y}
                  width={bed.width}
                  height={bed.height}
                  className={`bed-rect ${isSelected ? 'bed-selected' : ''}`}
                  style={{ fill: getBedColor(bed) }}
                  onMouseDown={(e) => handleBedMouseDown(e, bed.id)}
                />
                
                {/* Bed label */}
                <text
                  x={bed.x + bed.width / 2}
                  y={bed.y + bed.height / 2}
                  className="bed-label"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                >
                  {bed.name}
                </text>
                
                {/* Dimensions */}
                <text
                  x={bed.x + bed.width / 2}
                  y={bed.y + bed.height / 2 + 0.35}
                  className="bed-dimensions"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                >
                  {bed.width}m × {bed.height}m
                </text>
                
                {/* Planting markers */}
                {Array.isArray(bed.plantings) && bed.plantings.map((planting) => {
                  if (!planting.positionX || !planting.positionY) return null
                  
                  const statusConfig = STATUS_COLORS[planting.status] || STATUS_COLORS.sown
                  const isPlantingSelected = planting.id === selectedPlantingId
                  const cx = bed.x + planting.positionX
                  const cy = bed.y + planting.positionY
                  const radius = 0.08
                  
                  return (
                    <g key={planting.id}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill={statusConfig.fill}
                        stroke={statusConfig.stroke}
                        strokeWidth={isPlantingSelected ? 0.03 : 0.02}
                        className="planting-marker"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onSelectPlanting) {
                            onSelectPlanting(isPlantingSelected ? null : planting.id)
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <title>{planting.plant.name} ({statusConfig.label})</title>
                    </g>
                  )
                })}
                
                {/* Resize handles (only when selected) */}
                {isSelected && !readOnly && (
                  <>
                    {/* NW */}
                    <rect
                      x={bed.x - 0.1}
                      y={bed.y - 0.1}
                      width={0.2}
                      height={0.2}
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeMouseDown(e, bed.id, 'nw')}
                    />
                    {/* NE */}
                    <rect
                      x={bed.x + bed.width - 0.1}
                      y={bed.y - 0.1}
                      width={0.2}
                      height={0.2}
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeMouseDown(e, bed.id, 'ne')}
                    />
                    {/* SW */}
                    <rect
                      x={bed.x - 0.1}
                      y={bed.y + bed.height - 0.1}
                      width={0.2}
                      height={0.2}
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeMouseDown(e, bed.id, 'sw')}
                    />
                    {/* SE */}
                    <rect
                      x={bed.x + bed.width - 0.1}
                      y={bed.y + bed.height - 0.1}
                      width={0.2}
                      height={0.2}
                      className="resize-handle"
                      onMouseDown={(e) => handleResizeMouseDown(e, bed.id, 'se')}
                    />
                  </>
                )}
              </g>
            )
          })}
          
          {/* Scale indicator */}
          <g className="plot-scale">
            <line x1={0} y1={plot.height + 0.25} x2={1} y2={plot.height + 0.25} className="scale-line" />
            <text x={0.5} y={plot.height + 0.4} className="scale-text" textAnchor="middle">
              1m
            </text>
          </g>
        </svg>
      </div>
      
      <style>{`
        .plot-canvas-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        
        .plot-controls {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
        }
        
        .plot-control-toggle {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--text-secondary);
          cursor: pointer;
        }
        
        .plot-control-toggle input {
          width: 16px;
          height: 16px;
          accent-color: var(--accent);
        }
        
        .plot-legend {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-wrap: wrap;
          padding: var(--space-2) var(--space-3);
          background: var(--bg-sunken);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
        }
        
        .plot-legend-title {
          color: var(--text-muted);
          font-weight: 600;
        }
        
        .plot-legend-items {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }
        
        .plot-legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }
        
        .plot-legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border-width: 2px;
          border-style: solid;
        }
        
        .plot-legend-label {
          color: var(--text-secondary);
        }
        
        .plot-canvas-container {
          background: var(--bg-sunken);
          border: 1px solid oklch(0.18 0.015 270 / 0.08);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          overflow: hidden;
        }
        
        .plot-canvas {
          width: 100%;
          height: 400px;
          background: var(--bg-base);
          border-radius: var(--radius-md);
        }
        
        .plot-background {
          fill: var(--bg-elevated);
        }
        
        .plot-grid-line {
          stroke: oklch(0.18 0.015 270 / 0.08);
          stroke-width: 0.02;
        }
        
        .plot-border {
          fill: none;
          stroke: oklch(0.18 0.015 270 / 0.15);
          stroke-width: 0.05;
        }
        
        .bed-rect {
          stroke: oklch(0 0 0 / 0.25);
          stroke-width: 0.03;
          rx: 0.08;
          cursor: move;
          transition: filter 0.15s var(--ease-out-expo);
        }
        
        .bed-rect:hover {
          filter: brightness(1.1);
        }
        
        .bed-selected {
          stroke-width: 0.06;
          stroke: var(--accent);
          filter: drop-shadow(0 0 0.15px var(--accent));
        }
        
        .bed-dragging .bed-rect {
          opacity: 0.8;
        }
        
        .bed-label {
          font-size: 0.18px;
          font-weight: 600;
          fill: white;
          text-shadow: 0 0 0.05px oklch(0 0 0 / 0.5);
        }
        
        .bed-dimensions {
          font-size: 0.12px;
          fill: oklch(1 0 0 / 0.7);
        }
        
        .resize-handle {
          fill: var(--accent);
          stroke: white;
          stroke-width: 0.015;
          cursor: pointer;
          rx: 0.02;
        }
        
        .resize-handle:hover {
          fill: var(--accent-hover);
        }
        
        .planting-marker {
          transition: all 0.15s var(--ease-out-expo);
          filter: drop-shadow(0 0 0.02px oklch(0 0 0 / 0.3));
        }
        
        .planting-marker:hover {
          filter: drop-shadow(0 0 0.05px oklch(0 0 0 / 0.5)) brightness(1.2);
          r: 0.1;
        }
        
        .scale-line {
          stroke: var(--text-muted);
          stroke-width: 0.03;
        }
        
        .scale-text {
          font-size: 0.14px;
          fill: var(--text-muted);
        }
        
        @media (max-width: 640px) {
          .plot-canvas {
            height: 300px;
          }
          
          .plot-controls {
            gap: var(--space-3);
          }
        }
      `}</style>
    </div>
  )
}
