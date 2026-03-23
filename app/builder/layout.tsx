import Link from 'next/link'
import { StepProgress } from '@/components/builder/StepProgress'
import { AgentSettingsPanel } from '@/components/builder/AgentSettingsPanel'

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/builder/intake" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="font-bold text-gray-900 hidden sm:block">PageForge</span>
          </Link>

          {/* Step progress */}
          <div className="flex-1 flex justify-center overflow-x-auto">
            <StepProgress />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/builder/intake" className="text-xs text-gray-400 hover:text-gray-600 hidden sm:block">
              Start over
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
