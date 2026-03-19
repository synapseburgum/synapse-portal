'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Leaf, Newspaper, CloudSun, Inbox, Menu, X, Gauge, Bot, SunMedium } from 'lucide-react'

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Dashboard',
    Icon: LayoutDashboard,
    external: false,
  },
  {
    href: '/gardening',
    label: 'Gardening',
    Icon: Leaf,
    external: false,
  },
  {
    href: '/today',
    label: 'Today',
    Icon: SunMedium,
    external: false,
  },
  {
    href: '/agents',
    label: 'Agents',
    Icon: Bot,
    external: false,
  },
  {
    href: '/brief',
    label: 'Brief',
    Icon: Newspaper,
    external: false,
  },
  {
    href: '/weather',
    label: 'Weather',
    Icon: CloudSun,
    external: false,
  },
  {
    href: '/inbox',
    label: 'Inbox',
    Icon: Inbox,
    external: false,
  },
  {
    href: 'http://localhost:3477',
    label: 'CNS',
    Icon: Gauge,
    external: true,
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
        {NAV_ITEMS.map(({ href, label, Icon, external }) => (
          <li key={href}>
            {external ? (
              <a href={href} target="_blank" rel="noreferrer" className="nav-link">
                <Icon size={18} />
                {label}
              </a>
            ) : (
              <Link href={href} className={`nav-link ${isActive(pathname, href) ? 'active' : ''}`}>
                <Icon size={18} />
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
