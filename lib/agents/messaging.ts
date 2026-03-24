import Anthropic from '@anthropic-ai/sdk'
import aiConfig from '@/config/ai.config'
import { mockMessaging } from '@/lib/mock/fixtures'
import { buildCharacteristicsPrompt, mergeCharacteristics } from './characteristics'
import { TASK, GUARDRAILS, OUTPUT_SCHEMA } from './prompts/messaging'
import type { BusinessContext, MessagingOutput } from '@/types'
import type { AgentCharacteristics } from '@/config/ai.config'

function buildSystemPrompt(characteristics: AgentCharacteristics): string {
  const guardrailsSection = GUARDRAILS.map((g) => `- ${g}`).join('\n')
  return `${buildCharacteristicsPrompt(characteristics)}
${TASK}
# ADDITIONAL GUARDRAILS
${guardrailsSection}
${OUTPUT_SCHEMA}`
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
