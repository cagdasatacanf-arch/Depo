import React from 'react'
import Dashboard from '@/components/Dashboard'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white shadow p-4">
        <h1 className="text-3xl font-bold">📊 DEPO Dashboard</h1>
      </header>

      {/* Main Content - Dashboard renders here */}
      <main className="max-w-7xl mx-auto p-8">
        <Dashboard />
      </main>

      {/* Bottom Bar */}
      <footer className="bg-gray-100 p-4 text-center text-gray-600 mt-8">
        <p>© 2026 Financial Dashboard</p>
      </footer>
    </div>
  )
}
