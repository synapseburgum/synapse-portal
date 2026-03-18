import type { Metadata } from 'next'
import './globals.css'

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
            <a href="/" className="navbar-brand">
              <span className="navbar-brand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10" />
                  <path d="M12 2v4" />
                  <path d="M12 8l4-4" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              Synapse
            </a>
            <ul className="navbar-nav">
              <li>
                <a href="/" className="nav-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9" rx="1" />
                    <rect x="14" y="3" width="7" height="5" rx="1" />
                    <rect x="14" y="12" width="7" height="9" rx="1" />
                    <rect x="3" y="16" width="7" height="5" rx="1" />
                  </svg>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/gardening" className="nav-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 10V2" />
                    <path d="M12 10c-4 0-6 3-6 6 0 4 3 6 6 6s6-2 6-6c0-3-2-6-6-6z" />
                    <path d="M12 22v-6" />
                    <path d="M8 12h8" />
                  </svg>
                  Gardening
                </a>
              </li>
            </ul>
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
