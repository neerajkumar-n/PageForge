import Link from 'next/link'
import { StartOverLink } from '@/components/builder/StartOverLink'
import { StepProgress } from '@/components/builder/StepProgress'

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Glass header */}
      <header className="bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/builder/hub" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="text-white text-xs font-bold tracking-tight">P</span>
            </div>
            <span className="font-semibold text-zinc-50 hidden sm:block group-hover:text-violet-400 transition-colors text-sm">
              PageForge
            </span>
          </Link>

          {/* Step progress — center */}
          <div className="hidden md:flex flex-1 justify-center">
            <StepProgress />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            <StartOverLink />
          </div>

        </div>

        {/* Mobile step progress */}
        <div className="md:hidden border-t border-zinc-800/60 px-4 py-2 flex justify-center">
          <StepProgress />
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
