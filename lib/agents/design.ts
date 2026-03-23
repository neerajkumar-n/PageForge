import Anthropic from '@anthropic-ai/sdk'
import aiConfig from '@/config/ai.config'
import { mockDesign } from '@/lib/mock/fixtures'
import { buildCharacteristicsPrompt, mergeCharacteristics } from './characteristics'
import type { BusinessContext, DesignOutput } from '@/types'
import type { AgentCharacteristics } from '@/config/ai.config'

function buildSystemPrompt(characteristics: AgentCharacteristics): string {
  return `${buildCharacteristicsPrompt(characteristics)}

# YOUR TASK
Generate exactly 3 distinct design directions for a B2B landing page.
Each direction represents a meaningfully different visual identity — not just color swaps.

# DIRECTION ARCHETYPES (use these as a starting point but adapt to the product)
1. Enterprise/Trust — clean, authoritative, data-forward (ideal for risk-averse buyers, CFOs, legal)
2. Bold/Startup — high contrast, energetic, modern (ideal for ambitious buyers, Series A-C companies)
3. Minimal/Technical — precise, information-dense, almost brutalist (ideal for developer-adjacent or RevOps buyers)

# COLOR PALETTE REQUIREMENTS
For each direction, return a complete ColorPalette:
- primary: main brand color (must contrast with white at WCAG AA)
- primaryForeground: text on primary color (usually #FFFFFF or #000000)
- accent: highlight/CTA color (must differ meaningfully from primary)
- background: page background (near-white, never pure #FFFFFF unless intentional)
- foreground: primary text color (must contrast with background at WCAG AA — usually near-black)
- muted: subtle background for cards/sections (slightly off background)
- mutedForeground: secondary text (must contrast with muted at 4.5:1)
- border: subtle divider color

# OUTPUT FORMAT
Return ONLY valid JSON matching this TypeScript interface. No markdown, no commentary:

interface DesignOutput {
  directions: Array<{
    id: string               // "dir-enterprise" | "dir-startup" | "dir-technical"
    name: string             // 2-3 word evocative name
    description: string      // 2-3 sentences: who it resonates with + why
    palette: {
      primary: string        // hex color
      primaryForeground: string
      accent: string
      background: string
      foreground: string
      muted: string
      mutedForeground: string
      border: string
    }
    typography: {
      heading: string        // Google Font name for headings
      body: string           // Google Font name for body text
    }
    heroVariant: "centered" | "left-aligned" | "split"
    mood: string             // 1 sentence: the emotional feeling this creates
  }>
  selectedDirectionId: string   // recommend one direction based on the ICP
  sectionOrder: string[]        // recommended section order for this product type
  componentPicks: {             // recommended variants for sections with multiple layouts
    hero?: string
    features?: string
    testimonials?: string
    pricing?: string
  }
}
`
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
