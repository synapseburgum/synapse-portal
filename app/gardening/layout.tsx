import Link from 'next/link'
import { Sprout, Package, CheckSquare, Calendar, Leaf, Trees, MapPin } from 'lucide-react'

const navItems = [
  { href: '/gardening', label: 'Overview', icon: Leaf },
  { href: '/gardening/plants', label: 'Plants', icon: Sprout },
  { href: '/gardening/seeds', label: 'Seeds', icon: Package },
  { href: '/gardening/plots', label: 'Plots', icon: MapPin },
  { href: '/gardening/plantings', label: 'Plantings', icon: Trees },
  { href: '/gardening/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/gardening/calendar', label: 'Calendar', icon: Calendar },
]

export default function GardeningLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Sub-navigation */}
      <nav className="gardening-nav">
        <div className="container">
          <div className="gardening-nav-inner">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} className="gardening-nav-link">
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
      {children}
    </>
  )
}
