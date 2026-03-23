import { NextRequest, NextResponse } from 'next/server'
import { runResearchAgent } from '@/lib/agents/research'
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

  try {
    const result = await runResearchAgent(context, messages, fileContents)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Research agent error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
