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

  if (messages.length === 0) {
    return `Start the research conversation. Introduce yourself in one sentence, then ask the mandatory context questions.${fileSection}`
  }

  return `Continue the research conversation based on what has been shared.${fileSection}${historySection}`
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

  const lastUserMessage = messages.filter((m) => m.role === 'user').pop()
  const userWantsToComplete =
    lastUserMessage?.content.toLowerCase().includes('complete') ||
    lastUserMessage?.content.toLowerCase().includes('done') ||
    lastUserMessage?.content.toLowerCase().includes("that's all") ||
    lastUserMessage?.content.toLowerCase().includes("that's all")

  if (aiConfig.mockMode) {
    if (userWantsToComplete) {
      return { message: '', isComplete: true, output: mockResearchOutput(messages, fileContents) }
    }
    if (messages.length === 0) {
      return {
        message: `Hi! I'm your Research Agent. I'll gather everything needed to build a landing page that actually converts.\n\nTo get started, I need a few things:\n\n1. **What does your company do?** (1–3 sentences in plain English)\n2. **Who is your target customer?** (role, company size, industry)\n3. **What problem does the product solve for them?**\n4. **What's the primary action you want visitors to take?** (book a demo, start a trial, etc.)`,
        isComplete: false,
      }
    }
    return {
      message: `Thanks for sharing that. A few more things that will unlock sharper copy:\n\n1. Do you have any **customer quotes or testimonials** — real words from customers describing their problem or outcome?\n2. **Do you have specific numbers?** (e.g., "40% faster", "saves 6 hours/week", "3x pipeline")\n3. List **2–4 competitors**. I'll analyze their positioning so we can differentiate.\n\nAlso, do you have any **existing documentation** (product docs, sales decks, positioning guides)? If yes, please attach the file.\n\nOnce you've shared these, I'll summarize what I've gathered and confirm with you before finalizing the research brief. Type "complete" when you're ready to confirm.`,
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
