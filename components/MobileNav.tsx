'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Leaf, Radar, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Dashboard',
    Icon: LayoutDashboard,
  },
  {
    href: '/gardening',
    label: 'Gardening',
    Icon: Leaf,
  },
  {
    href: '/agents',
    label: 'Agents',
    Icon: Radar,
  },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      <button
        type="button"
        className="navbar-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="main-navigation"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <ul id="main-navigation" className={`navbar-nav ${open ? 'open' : ''}`}>
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link href={href} className={`nav-link ${isActive(pathname, href) ? 'active' : ''}`}>
              <Icon size={18} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
