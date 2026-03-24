import { NextRequest, NextResponse } from 'next/server'
import { runBuilderAgent } from '@/lib/agents/builder'
import type { BusinessContext, CopyOutput, DesignOutput, MessagingOutput, QAOutput, SEOOutput } from '@/types'

interface BuilderAgentRequest {
  context: BusinessContext
  messaging: MessagingOutput
  copy: CopyOutput
  design: DesignOutput
  seo: SEOOutput
  qa: QAOutput
}

export async function POST(req: NextRequest) {
  let body: BuilderAgentRequest

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { context, messaging, copy, design, seo, qa } = body

  if (!context || !messaging || !copy || !design || !seo) {
    return NextResponse.json(
      { error: 'Missing required inputs: context, messaging, copy, design, and seo are all required' },
      { status: 400 }
    )
  }

  try {
    const result = await runBuilderAgent({ context, messaging, copy, design, seo, qa })
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Builder agent error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
