interface StatusBadgeProps {
  status: string
}

const statusMap: Record<string, { label: string; className: string }> = {
  sown: { label: 'Sown', className: 'accent' },
  germinated: { label: 'Germinated', className: 'info' },
  transplanted: { label: 'Transplanted', className: 'secondary' },
  growing: { label: 'Growing', className: 'success' },
  flowering: { label: 'Flowering', className: 'warning' },
  fruiting: { label: 'Fruiting', className: 'warning' },
  harvested: { label: 'Harvested', className: 'success' },
  failed: { label: 'Failed', className: 'error' },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const mapped = statusMap[status] || { label: status, className: 'muted' }
  return <span className={`badge ${mapped.className}`}>{mapped.label}</span>
}
