import Link from 'next/link'
import { StartOverLink } from '@/components/builder/StartOverLink'

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/builder/hub" className="flex items-center gap-2 shrink-0 group">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="font-bold text-gray-900 hidden sm:block group-hover:text-indigo-600 transition-colors">
              PageForge
            </span>
          </Link>

          {/* Center label */}
          <p className="text-sm text-gray-400 hidden sm:block">Agent Hub</p>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            <StartOverLink />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
