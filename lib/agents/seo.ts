import Anthropic from '@anthropic-ai/sdk'
import aiConfig from '@/config/ai.config'
import { buildCharacteristicsPrompt, mergeCharacteristics } from './characteristics'
import { TASK, GUARDRAILS, OUTPUT_SCHEMA } from './prompts/seo'
import type { BusinessContext, MessagingOutput, CopyOutput, SEOOutput } from '@/types'
import type { AgentCharacteristics } from '@/config/ai.config'

function buildSystemPrompt(characteristics: AgentCharacteristics): string {
  const guardrailsSection = GUARDRAILS.map((g) => `- ${g}`).join('\n')
  return `${buildCharacteristicsPrompt(characteristics)}
${TASK}
# ADDITIONAL GUARDRAILS
${guardrailsSection}
${OUTPUT_SCHEMA}`
}

function buildUserPrompt(
  context: BusinessContext,
  messaging: MessagingOutput,
  copy: CopyOutput
): string {
  const heroSection = copy.sections.find((s) => s.sectionType === 'hero')
  const featuresSection = copy.sections.find((s) => s.sectionType === 'features')
  const faqSection = copy.sections.find((s) => s.sectionType === 'faq')

  return `Generate SEO metadata for this B2B landing page:

COMPANY: ${context.companyName}
PRODUCT: ${context.productName}
DESCRIPTION: ${context.productDescription}
USE CASE: ${context.useCase}
CTA URL: ${context.ctaUrl}

ICP:
- Role: ${context.icp.role}
- Company: ${context.icp.company}
- Pain points: ${context.icp.painPoints}

COMPETITORS: ${context.competitors || 'Not specified'}

APPROVED HEADLINE: ${messaging.primaryHeadline}
APPROVED SUBHEADLINE: ${messaging.subheadline}
POSITIONING: ${messaging.positioningStatement}

HERO COPY:
- Headline: ${heroSection?.headline ?? ''}
- Subheadline: ${heroSection?.subheadline ?? ''}
- Body: ${heroSection?.body ?? ''}

${featuresSection?.items ? `FEATURES:\n${featuresSection.items.map((i) => `- ${i.title}: ${i.description}`).join('\n')}` : ''}

${faqSection?.items ? `FAQ QUESTIONS:\n${faqSection.items.map((i) => `Q: ${i.title}`).join('\n')}` : ''}

Generate SEO metadata optimized for ${context.icp.role}s searching for solutions to: ${context.icp.painPoints.split('.')[0]}.

Return the JSON now. No preamble.`
}

export async function runSEOAgent(
  context: BusinessContext,
  messaging: MessagingOutput,
  copy: CopyOutput,
  characteristicOverrides?: Partial<AgentCharacteristics>
): Promise<SEOOutput> {
  if (aiConfig.mockMode) return mockSEO(context, messaging)

  const characteristics = mergeCharacteristics(
    aiConfig.agentCharacteristics.seo,
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
    messages: [{ role: 'user', content: buildUserPrompt(context, messaging, copy) }],
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as SEOOutput
  } catch {
    throw new Error(`SEO agent returned invalid JSON: ${text.slice(0, 200)}`)
  }
}

function mockSEO(context: BusinessContext, messaging: MessagingOutput): SEOOutput {
  const productLower = context.productName.toLowerCase()
  const companyLower = context.companyName.toLowerCase()

  return {
    pageTitle: `${context.productName} — ${context.productDescription.split(' ').slice(0, 6).join(' ')} | ${context.companyName}`,
    metaDescription: `${messaging.primaryHeadline}. ${context.productName} helps ${context.icp.role}s at ${context.icp.company} ${context.useCase.split('.')[0]}. ${context.primaryCTA}.`,
    h1: messaging.primaryHeadline,
    keywords: [
      `${productLower} software`,
      `best ${context.useCase.split(' ').slice(0, 4).join(' ')} tool`,
      `${context.icp.role.toLowerCase()} software`,
      `${companyLower} ${productLower}`,
      `${context.useCase.split(' ').slice(0, 3).join(' ')} platform`,
      `${context.icp.company.toLowerCase()} solution`,
      `b2b ${productLower}`,
      `${productLower} for ${context.icp.role.toLowerCase()}`,
      `${context.useCase.split(' ').slice(0, 4).join(' ')} automation`,
    ],
    schemaType: 'SoftwareApplication',
    ogTitle: messaging.primaryHeadline,
    ogDescription: `${messaging.subheadline} Join hundreds of ${context.icp.company} teams already using ${context.productName}.`,
    focusKeyword: `${productLower} software`,
    secondaryKeywords: [
      `${context.useCase.split(' ').slice(0, 3).join(' ')} tool`,
      `${context.icp.role.toLowerCase()} platform`,
      `b2b ${context.useCase.split(' ').slice(0, 2).join(' ')}`,
      `${companyLower} ${productLower} pricing`,
    ],
    schemaMarkup: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: context.productName,
      applicationCategory: 'BusinessApplication',
      description: context.productDescription,
      url: context.ctaUrl,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'PriceSpecification',
          description: 'Contact for pricing',
        },
      },
      publisher: {
        '@type': 'Organization',
        name: context.companyName,
      },
    },
    longTailKeywords: ['best revenue forecasting for mid-market saas', 'how to improve sales forecast accuracy'],
    semanticKeywords: ['pipeline visibility', 'deal scoring', 'CRM integration'],
    urlSlug: 'revenue-intelligence-for-sales-teams',
    h2Structure: [],
    technicalChecklist: [],
    headHtml: '<title>Mock SEO Title</title>',
    keywordRationale: 'Primary keyword chosen for high commercial intent.',
  }
}
