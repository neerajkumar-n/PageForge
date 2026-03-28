import type { Metadata } from 'next'
import { IntakeForm } from '@/components/builder/IntakeForm'

export const metadata: Metadata = {
  title: 'Build your landing page — PageForge',
}

export default function IntakePage() {
  return (
    <div>
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-100">Tell us about your product</h1>
        <p className="text-zinc-500 mt-2 text-sm leading-relaxed max-w-lg mx-auto">
          Fill this in once — then run Research, Messaging, Copy, Design, SEO, and QA agents independently from the hub.
        </p>
      </div>
      <IntakeForm />
    </div>
  )
}
