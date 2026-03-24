// ============================================================
// PageForge — Complete Type System
// ============================================================

// ── Business Context ──────────────────────────────────────

export interface BusinessContext {
  companyName: string
  productName: string
  productDescription: string
  useCase: string
  icp: {
    role: string
    company: string
    painPoints: string
    goals: string
  }
  competitors: string
  primaryCTA: string
  ctaUrl: string
  tone: 'enterprise' | 'startup' | 'technical' | 'friendly'
  existingCopyExamples?: string
}

// ── Research Agent ────────────────────────────────────────

export interface ResearchMessage {
  role: 'user' | 'assistant'
  content: string
}

/** Rich structured research brief output by the Research Agent */
export interface ResearchBrief {
  company: {
    name: string
    product: string
    category: string
    oneLiner: string
  }
  icp: {
    primaryRole: string
    companyType: string
    companySize: string
    industry: string
    painPoints: string[]
    goals: string[]
    sophisticationLevel: 'low' | 'medium' | 'high'
  }
  product: {
    coreFeatures: string[]
    keyDifferentiators: string[]
    proofPoints: string[]
    customerQuotes: string[]
  }
  competitive: {
    competitors: Array<{
      name: string
      headline: string
      cta: string
      positioning: string
    }>
    marketGaps: string[]
    overcrowdedAngles: string[]
  }
  pageGoal: {
    primaryCTA: string
    ctaUrl: string
    secondaryCTA: string
  }
  rawContext: {
    documentsIngested: string[]
    keyPhrasesFromDocuments: string[]
    contradictionsFound: string[]
  }
}

export interface ResearchOutput {
  /** Rich structured brief from the Research Agent */
  brief: ResearchBrief
  /** Derived BusinessContext for backward compatibility with downstream agents */
  context: BusinessContext
  filesProcessed: string[]
  conversationHistory: ResearchMessage[]
}

// ── Agent Outputs ─────────────────────────────────────────

export interface ValueProp {
  id: string
  headline: string
  description: string
  proof?: string
}

export interface ToneGuide {
  adjectives: string[]     // 3 adjectives describing the voice
  wordsToAvoid: string[]   // 3 words/phrases to avoid
  exampleSentence: string  // 1 example sentence in the right tone
}

export interface MessagingOutput {
  primaryHeadline: string
  headlineAlternatives: string[]
  subheadline: string
  valuePropositions: ValueProp[]
  primaryCTA: string
  ctaAlternatives: string[]
  emotionalDrivers: string[]
  keyObjections: string[]
  positioningStatement: string
  toneGuide: ToneGuide
  confidenceNotes: string[]   // assumptions made due to thin research brief
}

export interface CopyItem {
  id: string
  title: string
  description: string
  icon?: string
  proof?: string
  attribution?: string   // for testimonials: "Name, Title, Company"
  context?: string       // for testimonials: one-line use case
}

export interface SectionCopy {
  id: string
  sectionType: SectionType
  headline?: string
  subheadline?: string
  body?: string
  ctaText?: string
  secondaryCta?: string
  supportingLine?: string    // social proof line for hero
  trustSignals?: string[]    // for final CTA section
  visualDescription?: string // for solution section
  items?: CopyItem[]
  approved: boolean
  humanEdited: boolean
}

export interface CopyOutput {
  sections: SectionCopy[]
}

export interface ColorPalette {
  primary: string
  primaryForeground: string
  accent: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
}

export interface ComponentVariants {
  hero: 'centered' | 'left-aligned' | 'split'
  features: 'icon-grid' | 'list-with-screenshot' | 'alternating-rows'
  testimonials: 'quote-cards' | 'single-large-quote' | 'avatar-grid'
  cta: 'centered-banner' | 'split-with-form'
}

export interface DesignDirection {
  id: string
  name: string
  description: string
  palette: ColorPalette
  typography: {
    heading: string
    body: string
  }
  heroVariant: 'centered' | 'left-aligned' | 'split'
  mood: string
  spacingDensity: 'compact' | 'balanced' | 'airy'
  borderRadius: 'sharp' | 'subtle' | 'rounded'
  designNotes: string
  componentVariants: ComponentVariants
}

export interface DesignOutput {
  directions: DesignDirection[]
  selectedDirectionId: string
  sectionOrder: SectionType[]
  componentPicks: Partial<Record<SectionType, string>>
}

export interface H2StructureItem {
  section: string
  currentHeadline: string
  seoNote: string
}

export interface SEOChecklistItem {
  item: string
  pass: boolean
  note: string
}

export interface SEOOutput {
  pageTitle: string
  metaDescription: string
  h1: string
  focusKeyword: string
  secondaryKeywords: string[]
  longTailKeywords: string[]
  semanticKeywords: string[]
  keywords: string[]           // combined full keyword list
  urlSlug: string
  schemaType: string
  ogTitle: string
  ogDescription: string
  schemaMarkup: Record<string, unknown>
  h2Structure: H2StructureItem[]
  technicalChecklist: SEOChecklistItem[]
  headHtml: string             // ready-to-paste <head> block
  keywordRationale: string
}

export interface QAIssue {
  severity: 'critical' | 'warning' | 'info'
  section: string
  message: string
  remediation: string
  autoFixed: boolean
}

export interface CROChecklistItem {
  item: string
  pass: boolean
  note: string
}

export interface QAOutput {
  score: number
  issues: QAIssue[]
  croChecklist: CROChecklistItem[]
  suggestions: string[]
  approved: boolean
}

// ── Section & Pipeline Types ──────────────────────────────

export type SectionType =
  | 'hero'
  | 'logos'
  | 'problem'
  | 'solution'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'cta'

export type PipelineStep =
  | 'intake'
  | 'research'
  | 'running-agents'
  | 'messaging-review'
  | 'copy-review'
  | 'design-review'
  | 'seo-review'
  | 'building'
  | 'preview'
  | 'complete'

export interface AgentStatus {
  research: 'idle' | 'running' | 'done' | 'error' | 'skipped'
  messaging: 'idle' | 'running' | 'done' | 'error'
  copy: 'idle' | 'running' | 'done' | 'error'
  design: 'idle' | 'running' | 'done' | 'error'
  seo: 'idle' | 'running' | 'done' | 'error'
  qa: 'idle' | 'running' | 'done' | 'error'
}

// ── Feedback & Session ────────────────────────────────────

export interface FeedbackEntry {
  timestamp: string
  gate: 'messaging' | 'copy' | 'design' | 'seo' | 'final'
  field: string
  original: string
  revised: string
  revisionType: 'factual' | 'tone' | 'structural'
}

export interface WebflowSection {
  type: string
  slug: string
  content: Record<string, unknown>
  styles: Record<string, unknown>
  variant: string
}

export interface GeneratedPage {
  html: string
  reactComponent: string
  webflowJson: WebflowSection[]
  qaReport: QAOutput
}

export interface PipelineSession {
  id: string
  createdAt: string
  currentStep: PipelineStep
  context: BusinessContext | null
  research: ResearchOutput | null
  agentStatus: AgentStatus
  messaging: MessagingOutput | null
  copy: CopyOutput | null
  design: DesignOutput | null
  seo: SEOOutput | null
  qa: QAOutput | null
  feedbackLog: FeedbackEntry[]
  generatedPage: GeneratedPage | null
  /** Per-session overrides for agent characteristics */
  agentCharacteristicOverrides: Partial<import('@/config/ai.config').AgentConfigs>
}

// ── Component Props ───────────────────────────────────────

export interface SectionProps {
  copy: SectionCopy
  palette: ColorPalette
  typography: {
    heading: string
    body: string
  }
  variant?: string
}
