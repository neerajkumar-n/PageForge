import Anthropic from '@anthropic-ai/sdk'
import aiConfig from '@/config/ai.config'
import { buildCharacteristicsPrompt, mergeCharacteristics } from './characteristics'
import { TASK, GUARDRAILS, OUTPUT_SCHEMA } from './prompts/research'
import type { BusinessContext, ResearchBrief, ResearchMessage, ResearchOutput } from '@/types'
import type { AgentCharacteristics } from '@/config/ai.config'

function buildSystemPrompt(characteristics: AgentCharacteristics): string {
  const guardrailsSection = GUARDRAILS.map((g) => `- ${g}`).join('\n')
  return `${buildCharacteristicsPrompt(characteristics)}
${TASK}
# GUARDRAILS
${guardrailsSection}
${OUTPUT_SCHEMA}`
}

function buildUserPrompt(
  messages: ResearchMessage[],
  fileContents: { name: string; content: string }[]
): string {
  const fileSection =
    fileContents.length > 0
      ? `\n\n# ATTACHED FILES\n${fileContents.map((f) => `## ${f.name}\n${f.content}`).join('\n\n')}`
      : ''

  const historySection =
    messages.length > 0
      ? `\n\n# CONVERSATION SO FAR\n${messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}`
      : ''

  // Turn 1: no messages yet — ask all questions in one shot
  if (messages.length === 0) {
    return `Begin Turn 1. Ask all your questions in a single message now.${fileSection}`
  }

  // Turn 2: user has replied — synthesize everything and output the JSON brief
  const userMessages = messages.filter((m) => m.role === 'user')
  if (userMessages.length >= 1) {
    return `The user has answered your questions. This is Turn 2. Synthesize all information — their answers, any attached files, and any competitor page content — then output ONLY the completion JSON brief with no preamble.${fileSection}${historySection}`
  }

  return `Continue based on what has been shared.${fileSection}${historySection}`
}

/** Derive a flat BusinessContext from the richer ResearchBrief for downstream agents */
function deriveBusinessContext(brief: ResearchBrief): BusinessContext {
  const tone = (() => {
    const level = brief.icp.sophisticationLevel
    const size = brief.icp.companySize.toLowerCase()
    if (size.includes('enterprise') || level === 'high') return 'enterprise' as const
    if (brief.icp.industry.toLowerCase().includes('tech') || level === 'medium') return 'technical' as const
    return 'startup' as const
  })()

  return {
    companyName: brief.company.name,
    productName: brief.company.product,
    productDescription: brief.company.oneLiner,
    useCase: brief.product.keyDifferentiators.join('; ') || brief.company.category,
    icp: {
      role: brief.icp.primaryRole,
      company: `${brief.icp.companyType} (${brief.icp.companySize})`,
      painPoints: brief.icp.painPoints.join(', '),
      goals: brief.icp.goals.join(', '),
    },
    competitors: brief.competitive.competitors.map((c) => c.name).join(', ') || 'Unknown',
    primaryCTA: brief.pageGoal.primaryCTA,
    ctaUrl: brief.pageGoal.ctaUrl,
    tone,
    existingCopyExamples: brief.rawContext.keyPhrasesFromDocuments.join('\n') || undefined,
  }
}

export interface ResearchAgentResponse {
  message: string
  isComplete: boolean
  output?: ResearchOutput
}

export async function runResearchAgent(
  _context: BusinessContext | null,
  messages: ResearchMessage[],
  fileContents: { name: string; content: string }[] = [],
  characteristicOverrides?: Partial<AgentCharacteristics>
): Promise<ResearchAgentResponse> {
  const characteristics = mergeCharacteristics(
    aiConfig.agentCharacteristics.research,
    characteristicOverrides ?? {}
  )

  if (aiConfig.mockMode) {
    // Turn 2: user has responded — output the completed brief
    const userMessages = messages.filter((m) => m.role === 'user')
    if (userMessages.length >= 1) {
      return { message: '', isComplete: true, output: mockResearchOutput(messages, fileContents) }
    }
    // Turn 1: no messages yet — ask all questions at once
    return {
      message: `I need 10 quick answers to build your research brief. Answer all in one reply — you don't need to be perfect.

1. **Company & product** — What does your company do and what is the product called? (1–3 sentences)
2. **Target customer** — Who is your ideal customer? (job title, company type, company size)
3. **Core problem** — What specific problem does your product solve for them?
4. **Key differentiator** — What is the ONE thing that makes you different from competitors?
5. **Proof points** — Do you have metrics or results customers have seen? (e.g., "40% faster", "saves 6 hrs/week")
6. **Customer language** — Do you have any real quotes from customers? (paste verbatim — exact words are gold)
7. **Competitors** — List 2–4 competitor names or URLs. (If you share URLs, I'll analyze their live sites.)
8. **Primary CTA** — What action do you want page visitors to take? (e.g., "Book a demo", "Start free trial")
9. **CTA destination URL** — What URL should the CTA button link to?
10. **Brand tone** — How should the page feel? (enterprise/formal, startup/bold, technical/precise, friendly/warm)

If you have product docs, a sales deck, or positioning doc — attach the file now alongside your answers.`,
      isComplete: false,
    }
  }

  const client = new Anthropic({
    apiKey: aiConfig.apiKey,
    baseURL: aiConfig.baseURL,
  })

  const userPrompt = buildUserPrompt(messages, fileContents)

  const response = await client.messages.create({
    model: aiConfig.model,
    max_tokens: 2000,
    system: buildSystemPrompt(characteristics),
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()

  // Detect if agent output the completion JSON
  const trimmed = text.replace(/```json|```/g, '').trim()
  if (trimmed.startsWith('{')) {
    try {
      const brief = JSON.parse(trimmed) as ResearchBrief
      const context = deriveBusinessContext(brief)
      const output: ResearchOutput = {
        brief,
        context,
        filesProcessed: fileContents.map((f) => f.name),
        conversationHistory: messages,
      }
      return { message: '', isComplete: true, output }
    } catch {
      // Not valid JSON — treat as conversation message
    }
  }

  return { message: text, isComplete: false }
}

function mockResearchOutput(
  messages: ResearchMessage[],
  fileContents: { name: string; content: string }[]
): ResearchOutput {
  const brief: ResearchBrief = {
    company: {
      name: 'Acme Corp',
      product: 'Acme Revenue Intelligence',
      category: 'Revenue Intelligence Software',
      oneLiner: 'Acme Revenue Intelligence gives B2B sales teams accurate deal forecasts so they stop missing targets.',
    },
    icp: {
      primaryRole: 'VP of Sales',
      companyType: 'B2B SaaS company',
      companySize: '50–500 employees',
      industry: 'Software / Technology',
      painPoints: [
        'Manual CRM updates mean forecast data is always stale',
        'Deals slip through the cracks because no one knows which ones are actually at risk',
        'Sales leaders spend 3+ hours every Monday preparing forecast reviews',
      ],
      goals: [
        'Hit quarterly revenue targets consistently',
        'Give leadership accurate pipeline visibility without manual effort',
        'Free up rep time from admin so they can sell more',
      ],
      sophisticationLevel: 'medium',
    },
    product: {
      coreFeatures: [
        'AI-powered deal scoring and risk detection',
        'Automatic CRM activity capture',
        'Real-time pipeline health dashboard',
        'Forecast accuracy tracking',
      ],
      keyDifferentiators: [
        'No manual CRM updates required — activity captured automatically',
        'Forecasts update in real time, not weekly',
        'Works alongside existing CRM — no migration required',
      ],
      proofPoints: [
        '40% improvement in forecast accuracy in first 90 days',
        'Saves sales leaders 3+ hours per week on forecast prep',
        '2x pipeline visibility without additional headcount',
      ],
      customerQuotes: [
        '"We finally stopped flying blind into board meetings." — Sarah K., VP Sales, Series B startup',
        '"Our forecast accuracy went from 60% to 94% in one quarter." — Marcus T., CRO, 200-person SaaS',
      ],
    },
    competitive: {
      competitors: [
        { name: 'Clari', headline: 'Revenue platform for the enterprise', cta: 'Get a demo', positioning: 'Enterprise-first, broad platform' },
        { name: 'Gong', headline: 'Revenue intelligence from your conversations', cta: 'Get a demo', positioning: 'Conversation intelligence leader' },
        { name: 'Salesforce Einstein', headline: 'AI built into your CRM', cta: 'Try free', positioning: 'Native CRM AI' },
      ],
      marketGaps: [
        'None of the major players focus on mid-market (50–500 employees) specifically',
        'Competitors require lengthy implementations (6–12 months); fast time-to-value is unclaimed',
        'Price transparency is absent — no competitor shows pricing publicly',
      ],
      overcrowdedAngles: [
        '"AI-powered forecasting" — every competitor claims this',
        '"Single source of truth for revenue" — overused positioning',
      ],
    },
    pageGoal: {
      primaryCTA: 'Book a 20-min demo',
      ctaUrl: 'https://app.acme.com/demo',
      secondaryCTA: 'See a 3-min product tour',
    },
    rawContext: {
      documentsIngested: fileContents.map((f) => f.name),
      keyPhrasesFromDocuments: fileContents.length > 0 ? ['[Extracted from attached files]'] : [],
      contradictionsFound: [],
    },
  }

  const context = deriveBusinessContext(brief)

  return {
    brief,
    context,
    filesProcessed: fileContents.map((f) => f.name),
    conversationHistory: messages,
  }
}
