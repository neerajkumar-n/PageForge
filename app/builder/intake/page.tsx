import type { Metadata } from 'next'
import { IntakeForm } from '@/components/builder/IntakeForm'

export const metadata: Metadata = {
  title: 'Build your landing page — PageForge',
}

export default function IntakePage() {
  return (
    <div>
      <div className="max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Tell us about your product</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Fill this in once — then run any agent independently from the hub. Research, Messaging, Copy, Design, SEO, and QA all work on their own.
        </p>
      </div>
      <IntakeForm />
    </div>
  )
}
