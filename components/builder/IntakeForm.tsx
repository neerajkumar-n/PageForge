'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ArrowRight, Zap } from 'lucide-react'
import { usePipelineStore } from '@/lib/store/pipeline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { BusinessContext } from '@/types'

const TONE_OPTIONS: { value: BusinessContext['tone']; label: string; desc: string; icon: string }[] = [
  { value: 'enterprise', label: 'Enterprise', desc: 'Authoritative, formal, trust-first',     icon: '🏛️' },
  { value: 'startup',    label: 'Startup',    desc: 'Bold, energetic, ambitious',              icon: '🚀' },
  { value: 'technical',  label: 'Technical',  desc: 'Precise, data-driven, direct',            icon: '⚙️' },
  { value: 'friendly',   label: 'Friendly',   desc: 'Conversational, warm, approachable',      icon: '👋' },
]

function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-violet-400 text-xs font-bold">{num}</span>
      </div>
      <div>
        <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
        <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

export function IntakeForm() {
  const router = useRouter()
  const { setContext, setStep } = usePipelineStore()

  const [form, setForm] = useState<Partial<BusinessContext>>({ tone: 'startup' })
  const [errors, setErrors] = useState<Partial<Record<keyof BusinessContext | string, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => {
      if (field.startsWith('icp.')) {
        const icpField = field.replace('icp.', '') as keyof BusinessContext['icp']
        return { ...prev, icp: { ...prev.icp, [icpField]: value } as BusinessContext['icp'] }
      }
      return { ...prev, [field]: value }
    })
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<Record<string, string>> = {}
    if (!form.companyName?.trim())             e.companyName         = 'Required'
    if (!form.productName?.trim())             e.productName         = 'Required'
    if (!form.productDescription?.trim())      e.productDescription  = 'Required'
    if (!form.useCase?.trim())                 e.useCase             = 'Required'
    if (!form.icp?.role?.trim())               e['icp.role']         = 'Required'
    if (!form.icp?.company?.trim())            e['icp.company']      = 'Required'
    if (!form.icp?.painPoints?.trim())         e['icp.painPoints']   = 'Required'
    if (!form.icp?.goals?.trim())              e['icp.goals']        = 'Required'
    if (!form.primaryCTA?.trim())              e.primaryCTA          = 'Required'
    if (!form.ctaUrl?.trim())                  e.ctaUrl              = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      setContext(form as BusinessContext)
      setStep('running-agents')
      router.push('/builder/hub')
    } catch {
      toast.error('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">

      {/* ── 01 Your product ─────────────────────────────── */}
      <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
        <SectionHeader num="01" title="Your product" subtitle="Tell the agents what you're building. Specifics produce better copy." />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Company name" required
              value={form.companyName ?? ''} error={errors.companyName}
              placeholder="Acme Inc."
              onChange={(e) => update('companyName', e.target.value)}
            />
            <Input
              label="Product name" required
              value={form.productName ?? ''} error={errors.productName}
              placeholder="Clairo"
              onChange={(e) => update('productName', e.target.value)}
            />
          </div>
          <Textarea
            label="Product description" required
            value={form.productDescription ?? ''} error={errors.productDescription}
            placeholder="What does your product do? Be specific — the AI uses this to generate outcome-focused copy."
            className="min-h-[100px]"
            onChange={(e) => update('productDescription', e.target.value)}
          />
          <Textarea
            label="Primary use case" required
            value={form.useCase ?? ''} error={errors.useCase}
            placeholder="The single most important thing customers use this product for."
            onChange={(e) => update('useCase', e.target.value)}
          />
        </div>
      </section>

      {/* ── 02 ICP ──────────────────────────────────────── */}
      <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
        <SectionHeader num="02" title="Ideal customer profile" subtitle="The more specific you are here, the more targeted the copy." />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Job role / title" required
              value={form.icp?.role ?? ''} error={errors['icp.role']}
              placeholder="VP of Sales, RevOps Director"
              onChange={(e) => update('icp.role', e.target.value)}
            />
            <Input
              label="Company type / size" required
              value={form.icp?.company ?? ''} error={errors['icp.company']}
              placeholder="Mid-market B2B SaaS, 100–1,000 employees"
              onChange={(e) => update('icp.company', e.target.value)}
            />
          </div>
          <Textarea
            label="Their pain points" required
            value={form.icp?.painPoints ?? ''} error={errors['icp.painPoints']}
            placeholder="What keeps them up at night? What frustrates them daily? Be specific."
            onChange={(e) => update('icp.painPoints', e.target.value)}
          />
          <Textarea
            label="Their goals" required
            value={form.icp?.goals ?? ''} error={errors['icp.goals']}
            placeholder="What does success look like? What are they trying to achieve this quarter?"
            onChange={(e) => update('icp.goals', e.target.value)}
          />
        </div>
      </section>

      {/* ── 03 Positioning & CTA ────────────────────────── */}
      <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
        <SectionHeader num="03" title="Competitive positioning & CTA" subtitle="Help the agents differentiate you and set the page conversion goal." />
        <div className="space-y-4">
          <Textarea
            label="Main competitors (optional)"
            value={form.competitors ?? ''}
            placeholder="Who are you competing against? (e.g. Clari, Gong, spreadsheets)"
            onChange={(e) => update('competitors', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Primary CTA text" required
              value={form.primaryCTA ?? ''} error={errors.primaryCTA}
              placeholder="See your live forecast accuracy"
              onChange={(e) => update('primaryCTA', e.target.value)}
            />
            <Input
              label="CTA destination URL" required
              value={form.ctaUrl ?? ''} error={errors.ctaUrl}
              placeholder="https://yourapp.com/signup"
              onChange={(e) => update('ctaUrl', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ── 04 Brand tone ───────────────────────────────── */}
      <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
        <SectionHeader num="04" title="Brand tone" subtitle="Sets the voice across all copy sections." />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TONE_OPTIONS.map((opt) => {
            const selected = form.tone === opt.value
            return (
              <label
                key={opt.value}
                className={[
                  'flex flex-col gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  selected
                    ? 'border-violet-500/60 bg-violet-600/10 shadow-[0_0_12px_rgba(124,58,237,0.15)]'
                    : 'border-zinc-700/60 bg-zinc-900 hover:border-zinc-600',
                ].join(' ')}
              >
                <input type="radio" name="tone" value={opt.value} checked={selected} onChange={() => update('tone', opt.value)} className="sr-only" />
                <span className="text-lg">{opt.icon}</span>
                <span className={['font-semibold text-sm', selected ? 'text-violet-300' : 'text-zinc-300'].join(' ')}>{opt.label}</span>
                <span className="text-xs text-zinc-500 leading-relaxed">{opt.desc}</span>
              </label>
            )
          })}
        </div>
      </section>

      {/* ── 05 Optional ─────────────────────────────────── */}
      <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
        <SectionHeader num="05" title="Existing copy (optional)" subtitle="Paste examples you like. The agents will match the voice." />
        <Textarea
          label="Copy examples"
          value={form.existingCopyExamples ?? ''}
          placeholder="Paste headlines, taglines, or copy you want the AI to match in style."
          className="min-h-[90px]"
          onChange={(e) => update('existingCopyExamples', e.target.value)}
        />
      </section>

      {/* Submit */}
      <div className="flex items-center justify-between pb-8">
        <p className="text-xs text-zinc-600">
          Fields marked <span className="text-violet-400">*</span> are required
        </p>
        <button
          type="submit"
          disabled={submitting}
          className={[
            'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all',
            'bg-gradient-to-r from-violet-600 to-violet-700 text-white',
            'hover:from-violet-500 hover:to-violet-600',
            'shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Launching agents...
            </>
          ) : (
            <>
              <Zap size={15} />
              Build my landing page
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
