import type { Metadata } from 'next'
import 'bootstrap/dist/css/bootstrap.min.css'
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
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
          <div className="container">
            <a className="navbar-brand fw-bold" href="/">
              ⚡ Synapse
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <a className="nav-link" href="/">Dashboard</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/gardening">🌱 Gardening</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <main className="py-4">
          {children}
        </main>
        <footer className="footer mt-auto py-3 bg-light">
          <div className="container text-center text-muted">
            <small>Synapse Portal • Built with Next.js</small>
          </div>
        </footer>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" async></script>
      </body>
    </html>
  )
}
