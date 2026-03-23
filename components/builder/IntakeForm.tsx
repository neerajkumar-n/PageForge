'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { usePipelineStore } from '@/lib/store/pipeline'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { BusinessContext } from '@/types'

const TONE_OPTIONS: { value: BusinessContext['tone']; label: string; desc: string }[] = [
  { value: 'enterprise', label: 'Enterprise', desc: 'Authoritative, formal, trust-first' },
  { value: 'startup', label: 'Startup', desc: 'Bold, energetic, ambitious' },
  { value: 'technical', label: 'Technical', desc: 'Precise, data-driven, direct' },
  { value: 'friendly', label: 'Friendly', desc: 'Conversational, warm, approachable' },
]

export function IntakeForm() {
  const router = useRouter()
  const { setContext, setStep } = usePipelineStore()

  const [form, setForm] = useState<Partial<BusinessContext>>({
    tone: 'startup',
  })
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
    const newErrors: Partial<Record<string, string>> = {}
    if (!form.companyName?.trim()) newErrors.companyName = 'Required'
    if (!form.productName?.trim()) newErrors.productName = 'Required'
    if (!form.productDescription?.trim()) newErrors.productDescription = 'Required'
    if (!form.useCase?.trim()) newErrors.useCase = 'Required'
    if (!form.icp?.role?.trim()) newErrors['icp.role'] = 'Required'
    if (!form.icp?.company?.trim()) newErrors['icp.company'] = 'Required'
    if (!form.icp?.painPoints?.trim()) newErrors['icp.painPoints'] = 'Required'
    if (!form.icp?.goals?.trim()) newErrors['icp.goals'] = 'Required'
    if (!form.primaryCTA?.trim()) newErrors.primaryCTA = 'Required'
    if (!form.ctaUrl?.trim()) newErrors.ctaUrl = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const context = form as BusinessContext
      setContext(context)
      setStep('research')
      router.push('/builder/research')
    } catch {
      toast.error('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-10">

      {/* Product */}
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Your product</h2>
          <p className="text-sm text-gray-500 mt-1">Tell the AI what you're building and who it's for.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company name" required value={form.companyName ?? ''} onChange={(e) => update('companyName', e.target.value)} error={errors.companyName} placeholder="Acme Inc." />
          <Input label="Product name" required value={form.productName ?? ''} onChange={(e) => update('productName', e.target.value)} error={errors.productName} placeholder="Clairo" />
        </div>
        <Textarea label="Product description" required value={form.productDescription ?? ''} onChange={(e) => update('productDescription', e.target.value)} error={errors.productDescription} placeholder="What does your product do? Be specific — the AI uses this to generate specific, outcome-focused copy." className="min-h-[100px]" />
        <Textarea label="Primary use case" required value={form.useCase ?? ''} onChange={(e) => update('useCase', e.target.value)} error={errors.useCase} placeholder="The single most important thing customers use this product for." />
      </section>

      {/* ICP */}
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Ideal customer profile (ICP)</h2>
          <p className="text-sm text-gray-500 mt-1">The more specific, the better the copy.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Job role / title" required value={form.icp?.role ?? ''} onChange={(e) => update('icp.role', e.target.value)} error={errors['icp.role']} placeholder="VP of Sales, RevOps Director" />
          <Input label="Company type / size" required value={form.icp?.company ?? ''} onChange={(e) => update('icp.company', e.target.value)} error={errors['icp.company']} placeholder="Mid-market B2B SaaS, 100–1000 employees" />
        </div>
        <Textarea label="Their pain points" required value={form.icp?.painPoints ?? ''} onChange={(e) => update('icp.painPoints', e.target.value)} error={errors['icp.painPoints']} placeholder="What keeps them up at night? What frustrates them daily? Be specific." />
        <Textarea label="Their goals" required value={form.icp?.goals ?? ''} onChange={(e) => update('icp.goals', e.target.value)} error={errors['icp.goals']} placeholder="What does success look like for them? What are they trying to achieve this quarter?" />
      </section>

      {/* Competitors & CTA */}
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Competitive positioning</h2>
          <p className="text-sm text-gray-500 mt-1">Help the AI differentiate you.</p>
        </div>
        <Textarea label="Main competitors" value={form.competitors ?? ''} onChange={(e) => update('competitors', e.target.value)} placeholder="Who are you competing against? (e.g. Clari, Gong, manual spreadsheets)" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Primary CTA text" required value={form.primaryCTA ?? ''} onChange={(e) => update('primaryCTA', e.target.value)} error={errors.primaryCTA} placeholder="See your live forecast accuracy" />
          <Input label="CTA destination URL" required value={form.ctaUrl ?? ''} onChange={(e) => update('ctaUrl', e.target.value)} error={errors.ctaUrl} placeholder="https://yourapp.com/signup" />
        </div>
      </section>

      {/* Tone */}
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Brand tone</h2>
          <p className="text-sm text-gray-500 mt-1">Choose the voice that fits your brand.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TONE_OPTIONS.map((opt) => (
            <label key={opt.value} className={['flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all', form.tone === opt.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'].join(' ')}>
              <input type="radio" name="tone" value={opt.value} checked={form.tone === opt.value} onChange={() => update('tone', opt.value)} className="sr-only" />
              <span className="font-semibold text-sm text-gray-900">{opt.label}</span>
              <span className="text-xs text-gray-500">{opt.desc}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Optional */}
      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Optional: existing copy</h2>
          <p className="text-sm text-gray-500 mt-1">Paste any copy you like. The AI will match the voice.</p>
        </div>
        <Textarea label="Existing copy examples" value={form.existingCopyExamples ?? ''} onChange={(e) => update('existingCopyExamples', e.target.value)} placeholder="Paste headlines, taglines, or copy you want the AI to match in style." className="min-h-[100px]" />
      </section>

      <div className="flex justify-end pb-8">
        <Button type="submit" size="lg" loading={submitting}>
          Build my landing page →
        </Button>
      </div>
    </form>
  )
}
