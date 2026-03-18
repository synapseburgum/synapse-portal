import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/db'
import SeedCard from '@/components/gardening/SeedCard'

async function getSeeds(lowStockOnly: boolean) {
  try {
    return await prisma.seedInventory.findMany({
      where: lowStockOnly ? { quantity: { lte: 10 } } : undefined,
      include: { plant: true },
      orderBy: [{ expiryDate: 'asc' }, { createdAt: 'desc' }],
    })
  } catch {
    return []
  }
}

export default async function SeedsPage({
  searchParams,
}: {
  searchParams: Promise<{ lowStock?: string }>
}) {
  const params = await searchParams
  const lowStockOnly = params.lowStock === 'true'
  const seeds = await getSeeds(lowStockOnly)

  return (
    <div className="container">
      <header className="section-header" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ marginBottom: 'var(--space-1)' }}>Seed Inventory</h1>
          <p className="text-muted mb-0">Track stock levels, expiry dates, and seed batches</p>
        </div>
        <Link href="/gardening/seeds/new" className="btn btn-success">
          <Plus />
          Add Seed Batch
        </Link>
      </header>

      <section className="section">
        <div className="category-filter-wrapper">
          <Link href="/gardening/seeds" className={`category-filter-btn ${!lowStockOnly ? 'active' : ''}`}>
            All Seeds
          </Link>
          <Link href="/gardening/seeds?lowStock=true" className={`category-filter-btn ${lowStockOnly ? 'active' : ''}`}>
            Low Stock
          </Link>
        </div>
      </section>

      <section className="section">
        {seeds.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <div className="empty-state-text">
                  {lowStockOnly ? 'No low-stock seeds right now.' : 'No seed inventory yet. Add your first seed batch.'}
                </div>
                <Link href="/gardening/seeds/new" className="btn btn-primary mt-4">
                  <Plus />
                  Add Seed Batch
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="apps-grid">
            {seeds.map((seed) => (
              <SeedCard
                key={seed.id}
                id={seed.id}
                plantId={seed.plantId}
                plantName={seed.plant.name}
                quantity={seed.quantity}
                supplier={seed.supplier}
                batchCode={seed.batchCode}
                expiryDate={seed.expiryDate}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
