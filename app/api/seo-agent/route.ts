import { NextRequest, NextResponse } from 'next/server'
import { runSEOAgent } from '@/lib/agents/seo'
import type { BusinessContext, MessagingOutput, CopyOutput } from '@/types'

interface SEOAgentRequest {
  context: BusinessContext
  messaging: MessagingOutput
  copy: CopyOutput
}

export async function POST(req: NextRequest) {
  let body: SEOAgentRequest

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { context, messaging, copy } = body

  if (!context || !messaging || !copy) {
    return NextResponse.json(
      { error: 'context, messaging, and copy are all required' },
      { status: 400 }
    )
  }

  try {
    const result = await runSEOAgent(context, messaging, copy)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SEO agent error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
