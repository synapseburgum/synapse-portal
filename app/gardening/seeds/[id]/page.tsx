import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Package, Store } from 'lucide-react'
import { prisma } from '@/lib/db'

async function getSeed(id: string) {
  try {
    return await prisma.seedInventory.findUnique({
      where: { id },
      include: { plant: true },
    })
  } catch {
    return null
  }
}

export default async function SeedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const seed = await getSeed(id)

  if (!seed) notFound()

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <Link href="/gardening/seeds" className="nav-link" style={{ padding: 0, marginBottom: 'var(--space-3)', width: 'fit-content' }}>
            <ArrowLeft />
            Back to Seed Inventory
          </Link>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>{seed.plant.name} Seeds</h1>
          <p className="text-muted mb-0">Batch details and stock information</p>
        </div>
      </header>

      <section className="section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Seed Batch Info</h2>
          </div>
          <div className="card-body">
            <div className="list-item">
              <div className="list-item-content">
                <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Package size={16} /> Quantity
                </div>
                <div className="list-item-meta">{seed.quantity} seeds</div>
              </div>
            </div>
            <div className="list-item">
              <div className="list-item-content">
                <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Store size={16} /> Supplier
                </div>
                <div className="list-item-meta">{seed.supplier || 'Not set'}</div>
              </div>
            </div>
            <div className="list-item">
              <div className="list-item-content">
                <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Calendar size={16} /> Purchased
                </div>
                <div className="list-item-meta">{seed.purchasedDate ? new Date(seed.purchasedDate).toLocaleDateString() : 'Not set'}</div>
              </div>
            </div>
            <div className="list-item">
              <div className="list-item-content">
                <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Calendar size={16} /> Expiry
                </div>
                <div className="list-item-meta">{seed.expiryDate ? new Date(seed.expiryDate).toLocaleDateString() : 'Not set'}</div>
              </div>
            </div>
            <div className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">Batch Code</div>
                <div className="list-item-meta">{seed.batchCode || 'Not set'}</div>
              </div>
            </div>
            <div className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">Notes</div>
                <div className="list-item-meta">{seed.notes || 'No notes'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
