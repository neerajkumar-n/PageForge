import { NextRequest, NextResponse } from 'next/server'
import { runResearchAgent } from '@/lib/agents/research'
import { extractUrls, fetchPages, formatPagesForPrompt } from '@/lib/utils/fetchPage'
import type { BusinessContext, ResearchMessage } from '@/types'

interface ResearchAgentRequest {
  context: BusinessContext | null
  messages: ResearchMessage[]
  fileContents?: { name: string; content: string }[]
}

export async function POST(req: NextRequest) {
  let body: ResearchAgentRequest

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { context = null, messages, fileContents = [] } = body

  // Extract URLs from all user messages and fetch their content server-side
  const allUserText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ')

  // Also check the competitors field in context
  const competitorText = context?.competitors ?? ''
  const urlsToFetch = extractUrls(`${allUserText} ${competitorText}`)

  let enrichedFileContents = fileContents
  if (urlsToFetch.length > 0) {
    const pages = await fetchPages(urlsToFetch)
    const pageBlock = formatPagesForPrompt(pages)
    if (pageBlock) {
      enrichedFileContents = [
        ...fileContents,
        { name: 'competitor-pages.txt', content: pageBlock },
      ]
    }
  }

  try {
    const result = await runResearchAgent(context, messages, enrichedFileContents)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Research agent error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
