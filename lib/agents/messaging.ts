import Anthropic from '@anthropic-ai/sdk'
import aiConfig from '@/config/ai.config'
import { mockMessaging } from '@/lib/mock/fixtures'
import { buildCharacteristicsPrompt, mergeCharacteristics } from './characteristics'
import type { BusinessContext, MessagingOutput } from '@/types'
import type { AgentCharacteristics } from '@/config/ai.config'

function buildSystemPrompt(characteristics: AgentCharacteristics): string {
  return `${buildCharacteristicsPrompt(characteristics)}

# YOUR TASK
You are generating the core messaging framework for a B2B landing page. This framework will be used by a copywriter agent and reviewed by a human before any copy is written.

# OUTPUT FORMAT
Return ONLY valid JSON matching this exact TypeScript interface. No markdown fences, no commentary, no explanation:

interface MessagingOutput {
  primaryHeadline: string          // Max 10 words. Specific outcome. No generic verbs.
  headlineAlternatives: string[]   // Exactly 3 alternatives. Different angles, not variations.
  subheadline: string              // 1–2 sentences. Expands primary headline. Includes a credibility signal.
  valuePropositions: Array<{       // Exactly 3 value props
    id: string                     // "vp-1", "vp-2", "vp-3"
    headline: string               // Benefit-focused, 6–10 words
    description: string            // 2–3 sentences. Specific, not abstract.
    proof: string                  // A stat, a customer type, or a verifiable claim
  }>
  primaryCTA: string               // 4–7 words. Action + specific outcome. No "Learn More".
  ctaAlternatives: string[]        // Exactly 3 alternatives. Different conversion moments.
  emotionalDrivers: string[]       // 4 emotional motivations of the ICP. What they fear, want, resent.
  keyObjections: string[]          // 4 objections the ICP will raise before buying. Be specific.
  positioningStatement: string     // Full "For X who Y, Product Z is the A that B. Unlike C, we D." format.
}

# CRITICAL REQUIREMENTS
- Think from the ICP's perspective, not the company's. What does this product mean for their career, their team, their quarter?
- Every headline must be specific to this product. If it could apply to any SaaS tool, rewrite it.
- Ground every claim in a specific outcome: time saved, revenue impact, headcount, percentage improvement.
- The positioningStatement must name real competitors or a real competitive category.
`
}

function buildUserPrompt(context: BusinessContext): string {
  return `Generate the messaging framework for this B2B product:

COMPANY: ${context.companyName}
PRODUCT: ${context.productName}
DESCRIPTION: ${context.productDescription}
USE CASE: ${context.useCase}
BRAND TONE: ${context.tone}

ICP PROFILE:
- Role: ${context.icp.role}
- Company type: ${context.icp.company}
- Pain points: ${context.icp.painPoints}
- Goals: ${context.icp.goals}

COMPETITORS: ${context.competitors}
PRIMARY CTA: ${context.primaryCTA}
CTA URL: ${context.ctaUrl}
${context.existingCopyExamples ? `EXISTING COPY EXAMPLES (match this voice):\n${context.existingCopyExamples}` : ''}

Return the JSON now. No preamble.`
}

export async function runMessagingAgent(
  context: BusinessContext,
  characteristicOverrides?: Partial<AgentCharacteristics>
): Promise<MessagingOutput> {
  if (aiConfig.mockMode) return mockMessaging(context)

  const characteristics = mergeCharacteristics(
    aiConfig.agentCharacteristics.messaging,
    characteristicOverrides ?? {}
  )

  const client = new Anthropic({
    apiKey: aiConfig.apiKey,
    baseURL: aiConfig.baseURL,
  })

  const response = await client.messages.create({
    model: aiConfig.model,
    max_tokens: aiConfig.maxTokens,
    system: buildSystemPrompt(characteristics),
    messages: [{ role: 'user', content: buildUserPrompt(context) }],
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as MessagingOutput
  } catch {
    throw new Error(`Messaging agent returned invalid JSON: ${text.slice(0, 200)}`)
  }
}
