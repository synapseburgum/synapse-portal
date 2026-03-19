import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import MobileNav from '@/components/MobileNav'

export const metadata: Metadata = {
  title: 'Synapse Portal',
  description: 'Personal dashboard and app hub',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="navbar-inner">
            <Link href="/" className="navbar-brand">
              <span className="navbar-brand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10" />
                  <path d="M12 2v4" />
                  <path d="M12 8l4-4" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              Synapse
            </Link>
            <MobileNav />
          </div>
        </nav>
        <main className="py-4">
          {children}
        </main>
        <footer className="footer">
          <div className="footer-inner">
            <span className="footer-text">Synapse Portal</span>
            <div className="footer-status">
              <span className="footer-status-dot" />
              All systems operational
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
