'use client'
import { useState, useEffect } from 'react'
import { Monitor, Smartphone, Download, Copy, AlertTriangle, CheckCircle, Info, ChevronDown } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { usePipelineStore } from '@/lib/store/pipeline'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function PreviewPanel() {
  const { generatedPage, qa, resetSession } = usePipelineStore()
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [showIssues, setShowIssues] = useState(false)
  const [loading, setLoading] = useState(!generatedPage)

  useEffect(() => {
    if (!generatedPage) {
      const t = setTimeout(() => setLoading(false), 3000)
      return () => clearTimeout(t)
    }
  }, [generatedPage])

  function downloadHTML() {
    if (!generatedPage?.html) return toast.error('HTML not generated yet')
    const blob = new Blob([generatedPage.html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'landing-page.html'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('HTML downloaded!')
  }

  function downloadReact() {
    if (!generatedPage?.reactComponent) return toast.error('React component not generated yet')
    const blob = new Blob([generatedPage.reactComponent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'LandingPage.tsx'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('React component downloaded!')
  }

  function copyWebflow() {
    if (!generatedPage?.webflowJson) return toast.error('Webflow JSON not generated yet')
    navigator.clipboard.writeText(JSON.stringify(generatedPage.webflowJson, null, 2))
    toast.success('Webflow JSON copied to clipboard!')
  }

  const scoreColor = !qa ? 'gray' : qa.score >= 85 ? 'green' : qa.score >= 70 ? 'amber' : 'red'
  const severityMap = { critical: 'error', warning: 'warning', info: 'info' } as const

  return (
    <div className="flex flex-col h-full">
      {/* Top toolbar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewport('desktop')}
              className={['p-1.5 rounded-md transition-all', viewport === 'desktop' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'].join(' ')}
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={['p-1.5 rounded-md transition-all', viewport === 'mobile' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'].join(' ')}
            >
              <Smartphone size={16} />
            </button>
          </div>
          <span className="text-sm text-gray-400">{viewport === 'desktop' ? '1280px' : '375px'}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* QA Score */}
          {qa && (
            <button
              onClick={() => setShowIssues(!showIssues)}
              className={['flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                scoreColor === 'green' ? 'border-green-200 bg-green-50 text-green-700' :
                scoreColor === 'amber' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                'border-red-200 bg-red-50 text-red-700'
              ].join(' ')}
            >
              {scoreColor === 'green' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              QA Score: {qa.score}/100
              <ChevronDown size={12} className={showIssues ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
          )}

          {/* Export buttons */}
          <Button variant="outline" size="sm" onClick={downloadHTML}>
            <Download size={14} /> HTML
          </Button>
          <Button variant="outline" size="sm" onClick={downloadReact}>
            <Download size={14} /> React
          </Button>
          <Button variant="outline" size="sm" onClick={copyWebflow}>
            <Copy size={14} /> Webflow JSON
          </Button>
          <button
            onClick={() => { if (confirm('Start over? This will clear all your work.')) resetSession() }}
            className="text-xs text-gray-400 hover:text-gray-600 underline ml-2"
          >
            Start over
          </button>
        </div>
      </div>

      {/* QA Issues panel */}
      {showIssues && qa && (
        <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <h3 className="font-semibold text-sm text-gray-700">QA Issues ({qa.issues.length})</h3>
          <div className="space-y-2">
            {qa.issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Badge variant={severityMap[issue.severity]} size="sm" className="shrink-0 mt-0.5">{issue.severity}</Badge>
                <div>
                  <span className="font-medium text-gray-700">{issue.section}: </span>
                  <span className="text-gray-600">{issue.message}</span>
                </div>
              </div>
            ))}
          </div>
          {qa.suggestions.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Suggestions</h4>
              <ul className="space-y-1">
                {qa.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <Info size={12} className="text-blue-400 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Preview iframe */}
      <div className="flex-1 flex justify-center overflow-auto bg-gray-100 rounded-xl p-4">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Building your page...</p>
            </div>
          </div>
        ) : generatedPage?.html ? (
          <iframe
            srcDoc={generatedPage.html}
            className="bg-white shadow-xl rounded-lg transition-all"
            style={{ width: viewport === 'desktop' ? '100%' : 375, height: 800, border: 'none' }}
            title="Landing page preview"
          />
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-400">
            <div className="text-center">
              <p className="text-sm">Preview not available yet.</p>
              <p className="text-xs mt-1 text-gray-300">Complete all previous steps to generate the page.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
