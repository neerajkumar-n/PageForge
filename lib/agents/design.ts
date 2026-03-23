import Anthropic from '@anthropic-ai/sdk'
import aiConfig from '@/config/ai.config'
import { mockDesign } from '@/lib/mock/fixtures'
import { buildCharacteristicsPrompt, mergeCharacteristics } from './characteristics'
import { TASK, DIRECTION_ARCHETYPES, COLOR_REQUIREMENTS, GUARDRAILS, OUTPUT_SCHEMA } from './prompts/design'
import type { BusinessContext, DesignOutput } from '@/types'
import type { AgentCharacteristics } from '@/config/ai.config'

function buildSystemPrompt(characteristics: AgentCharacteristics): string {
  const guardrailsSection = GUARDRAILS.map((g) => `- ${g}`).join('\n')
  return `${buildCharacteristicsPrompt(characteristics)}
${TASK}
${DIRECTION_ARCHETYPES}
${COLOR_REQUIREMENTS}
# ADDITIONAL GUARDRAILS
${guardrailsSection}
${OUTPUT_SCHEMA}`
}

function buildUserPrompt(context: BusinessContext): string {
  return `Generate 3 design directions for:

COMPANY: ${context.companyName}
PRODUCT: ${context.productName}
DESCRIPTION: ${context.productDescription}
TONE: ${context.tone}

ICP:
- Role: ${context.icp.role}
- Company: ${context.icp.company}
- Pain points: ${context.icp.painPoints}

Consider what visual identity will immediately resonate with this specific ICP and build trust for this specific product category.

Return the JSON now. No preamble.`
}

export async function runDesignAgent(
  context: BusinessContext,
  characteristicOverrides?: Partial<AgentCharacteristics>
): Promise<DesignOutput> {
  if (aiConfig.mockMode) return mockDesign(context)

  const characteristics = mergeCharacteristics(
    aiConfig.agentCharacteristics.design,
    characteristicOverrides ?? {}
  )

  const client = new Anthropic({
    apiKey: aiConfig.apiKey,
    baseURL: aiConfig.baseURL,
  })

  const response = await client.messages.create({
    model: aiConfig.model,
    max_tokens: 4000,
    system: buildSystemPrompt(characteristics),
    messages: [{ role: 'user', content: buildUserPrompt(context) }],
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as DesignOutput
  } catch {
    throw new Error(`Design agent returned invalid JSON: ${text.slice(0, 200)}`)
  }
}
