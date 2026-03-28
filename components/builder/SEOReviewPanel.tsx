'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, ChevronRight, RefreshCw, Tag, Search, Globe, Code } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { usePipelineStore } from '@/lib/store/pipeline'
import { Button } from '@/components/ui/Button'
import type { SEOOutput } from '@/types'

function EditableField({
  label,
  value,
  onChange,
  multiline = false,
  maxLength,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  maxLength?: number
  hint?: string
}) {
  const charCount = value.length
  const isOver = maxLength ? charCount > maxLength : false

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{label}</label>
        {maxLength && (
          <span className={['text-xs font-mono', isOver ? 'text-red-500' : 'text-zinc-500'].join(' ')}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={['w-full text-sm border rounded-lg px-3 py-2 resize-none outline-none transition-colors', isOver ? 'border-red-300 focus:border-red-400' : 'border-zinc-800 focus:border-indigo-400'].join(' ')}
          rows={3}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={['w-full text-sm border rounded-lg px-3 py-2 outline-none transition-colors', isOver ? 'border-red-300 focus:border-red-400' : 'border-zinc-800 focus:border-indigo-400'].join(' ')}
        />
      )}
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}

function SERPPreview({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">SERP Preview</p>
      <div className="space-y-0.5">
        <p className="text-xs text-zinc-500 truncate">{url || 'https://yoursite.com'}</p>
        <p className="text-[#1a0dab] text-lg leading-tight hover:underline cursor-pointer line-clamp-1">
          {title || 'Page title will appear here'}
        </p>
        <p className="text-sm text-zinc-400 line-clamp-2 leading-snug">
          {description || 'Meta description will appear here. Make it compelling to maximize click-through rates.'}
        </p>
      </div>
    </div>
  )
}

export function SEOReviewPanel() {
  const router = useRouter()
  const { context, messaging, copy, seo, setSEO, updateSEOField, setStep } = usePipelineStore()

  const [loading, setLoading] = useState(!seo)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!seo && context && messaging && copy) {
      generateSEO()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function generateSEO() {
    setLoading(true)
    setGenerating(true)
    try {
      const res = await fetch('/api/seo-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, messaging, copy }),
      })
      if (!res.ok) throw new Error('SEO agent failed')
      const data: SEOOutput = await res.json()
      setSEO(data)
      toast.success('SEO metadata generated!')
    } catch {
      toast.error('SEO agent failed. Please try again.')
    } finally {
      setLoading(false)
      setGenerating(false)
    }
  }

  function handleApprove() {
    if (!seo) return
    toast.success('SEO approved! Building your preview...')
    setStep('preview')
    router.push('/builder/preview')
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 rounded-full bg-violet-950/20 flex items-center justify-center">
          <Loader2 className="animate-spin text-violet-400" size={24} />
        </div>
        <div className="text-center">
          <p className="font-semibold text-zinc-100">SEO Agent is running</p>
          <p className="text-sm text-zinc-500 mt-1">Generating meta tags, schema markup, and keyword strategy...</p>
        </div>
      </div>
    )
  }

  if (!seo) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">SEO Review</h1>
          <p className="text-zinc-500 mt-1 text-sm">Review and edit your metadata before building the final page.</p>
        </div>
        <button
          onClick={generateSEO}
          disabled={generating}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 border border-zinc-800 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
          Regenerate
        </button>
      </div>

      {/* SERP Preview */}
      <SERPPreview
        title={seo.pageTitle}
        description={seo.metaDescription}
        url={context?.ctaUrl ?? ''}
      />

      {/* Meta Tags */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-violet-400" />
          <h2 className="font-semibold text-zinc-100">Search Meta Tags</h2>
        </div>

        <EditableField
          label="Page Title"
          value={seo.pageTitle}
          onChange={(v) => updateSEOField('pageTitle', v)}
          maxLength={60}
          hint="Appears in the browser tab and SERP result"
        />
        <EditableField
          label="Meta Description"
          value={seo.metaDescription}
          onChange={(v) => updateSEOField('metaDescription', v)}
          multiline
          maxLength={160}
          hint="Appears in search results below the title. Write to maximize click-through."
        />
        <EditableField
          label="H1 Tag"
          value={seo.h1}
          onChange={(v) => updateSEOField('h1', v)}
          hint="The primary visible headline — should match or be close to your approved hero headline"
        />
      </section>

      {/* Open Graph */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-violet-400" />
          <h2 className="font-semibold text-zinc-100">Social Sharing (Open Graph)</h2>
        </div>

        <EditableField
          label="OG Title"
          value={seo.ogTitle}
          onChange={(v) => updateSEOField('ogTitle', v)}
          maxLength={70}
          hint="Shown when shared on LinkedIn, Slack, X"
        />
        <EditableField
          label="OG Description"
          value={seo.ogDescription}
          onChange={(v) => updateSEOField('ogDescription', v)}
          multiline
          maxLength={200}
          hint="Social sharing description — can be more benefit-forward than meta description"
        />
      </section>

      {/* Keywords */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-violet-400" />
          <h2 className="font-semibold text-zinc-100">Keyword Strategy</h2>
        </div>

        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Focus Keyword</p>
          <div className="flex items-center gap-2">
            <span className="bg-violet-950/200/15 text-violet-400 text-sm font-semibold px-3 py-1.5 rounded-full">
              {seo.focusKeyword}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">All Keywords</p>
          <div className="flex flex-wrap gap-2">
            {seo.keywords.map((kw, i) => (
              <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {seo.secondaryKeywords.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Secondary Keywords</p>
            <div className="flex flex-wrap gap-2">
              {seo.secondaryKeywords.map((kw, i) => (
                <span key={i} className="text-xs bg-blue-950/20 text-blue-400 px-2.5 py-1 rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Schema Markup */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code size={16} className="text-violet-400" />
            <h2 className="font-semibold text-zinc-100">Schema Markup (JSON-LD)</h2>
          </div>
          <span className="text-xs bg-green-100 text-green-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <CheckCircle size={10} /> {seo.schemaType}
          </span>
        </div>
        <pre className="text-xs bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto text-zinc-300 leading-relaxed">
          {JSON.stringify(seo.schemaMarkup, null, 2)}
        </pre>
      </section>

      <div className="flex justify-end pt-2 pb-8">
        <Button onClick={handleApprove} size="lg">
          Approve SEO & build preview <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
