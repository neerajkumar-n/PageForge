import Anthropic from '@anthropic-ai/sdk'
import aiConfig from '@/config/ai.config'
import { mockQA } from '@/lib/mock/fixtures'
import { buildCharacteristicsPrompt, mergeCharacteristics } from './characteristics'
import type { BusinessContext, CopyOutput, DesignOutput, MessagingOutput, QAOutput } from '@/types'
import type { AgentCharacteristics } from '@/config/ai.config'

function buildSystemPrompt(characteristics: AgentCharacteristics): string {
  return `${buildCharacteristicsPrompt(characteristics)}

# YOUR TASK
Perform a comprehensive CRO and brand consistency audit on the assembled B2B landing page.

# EVALUATION CRITERIA

## CRO Checklist (check each one)
1. Primary value prop clear within 5 seconds of landing (hero section)
2. Single primary CTA — not competing with secondary CTAs
3. Social proof (testimonials or logos) within 2 scrolls of the hero
4. Price anchored before the CTA section
5. Objections addressed before the bottom CTA
6. Hero headline is ≤ 10 words (mobile consideration)
7. All CTAs are specific (not "Learn More" or "Get Started" alone)
8. Problem section creates genuine emotional resonance

## Brand Voice Consistency
- Does the tone match the declared brand tone throughout all sections?
- Are there sections that feel noticeably different from others?
- Are there any hollow corporate phrases that slipped through?

## Issue Severity Guide
- critical: Will measurably reduce conversion. Fix before launch.
- warning: Likely reduces conversion. Fix if possible.
- info: Best practice suggestion. Fix if time allows.

# OUTPUT FORMAT
Return ONLY valid JSON. No markdown, no commentary:

interface QAOutput {
  score: number                // 0-100. Be honest. 85+ means ready to ship.
  issues: Array<{
    severity: "critical" | "warning" | "info"
    section: string            // which section has the issue
    message: string            // specific, actionable description
    autoFixed: false
  }>
  suggestions: string[]        // 3-5 prioritized improvement suggestions
  approved: boolean            // true if score >= 75 and no critical issues
}
`
}

function buildUserPrompt(
  context: BusinessContext,
  messaging: MessagingOutput,
  copy: CopyOutput,
  design: DesignOutput
): string {
  const selectedDirection = design.directions.find(
    (d) => d.id === design.selectedDirectionId
  )

  return `Audit this assembled landing page:

PRODUCT: ${context.productName}
BRAND TONE: ${context.tone}
ICP: ${context.icp.role} at ${context.icp.company}

APPROVED MESSAGING:
Primary headline: "${messaging.primaryHeadline}"
Primary CTA: "${messaging.primaryCTA}"
Key objections to address: ${messaging.keyObjections.join(', ')}

DESIGN DIRECTION: ${selectedDirection?.name ?? 'Unknown'}
SECTION ORDER: ${design.sectionOrder.join(' → ')}

FULL COPY:
${copy.sections.map((s) => `\n--- ${s.sectionType.toUpperCase()} ---\nHeadline: ${s.headline ?? 'n/a'}\nBody: ${s.body ?? 'n/a'}\nCTA: ${s.ctaText ?? 'n/a'}`).join('\n')}

Audit thoroughly and return the JSON now.`
}

export async function runQAAgent(
  context: BusinessContext,
  messaging: MessagingOutput,
  copy: CopyOutput,
  design: DesignOutput,
  characteristicOverrides?: Partial<AgentCharacteristics>
): Promise<QAOutput> {
  if (aiConfig.mockMode) return mockQA(context)

  const characteristics = mergeCharacteristics(
    aiConfig.agentCharacteristics.qa,
    characteristicOverrides ?? {}
  )

  const client = new Anthropic({
    apiKey: aiConfig.apiKey,
    baseURL: aiConfig.baseURL,
  })

  const response = await client.messages.create({
    model: aiConfig.model,
    max_tokens: 3000,
    system: buildSystemPrompt(characteristics),
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(context, messaging, copy, design),
      },
    ],
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as QAOutput
  } catch {
    throw new Error(`QA agent returned invalid JSON: ${text.slice(0, 200)}`)
  }
}
