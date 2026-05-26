import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [menuOpen, setMenuOpen] = useState(false)

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Builds', href: '/builds' },
  ]

  if (!token) return <>{children}</> // Show login page

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-lg sm:text-2xl font-bold truncate">POE2 Build Companion</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden bg-slate-700 hover:bg-slate-600 p-2 rounded"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-2 rounded text-sm sm:text-base font-medium transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav
          className={`${
            menuOpen ? 'block' : 'hidden'
          } sm:block sm:w-64 bg-slate-800 text-white p-4 sm:min-h-screen absolute sm:relative top-0 left-0 w-full sm:w-64 z-30 sm:z-0 shadow-lg sm:shadow-none`}
        >
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded hover:bg-slate-700 transition"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
