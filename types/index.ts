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

// ── Agent Outputs ─────────────────────────────────────────

export interface ValueProp {
  id: string
  headline: string
  description: string
  proof?: string
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
}

export interface CopyItem {
  id: string
  title: string
  description: string
  icon?: string
}

export interface SectionCopy {
  id: string
  sectionType: SectionType
  headline?: string
  subheadline?: string
  body?: string
  ctaText?: string
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
}

export interface DesignOutput {
  directions: DesignDirection[]
  selectedDirectionId: string
  sectionOrder: SectionType[]
  componentPicks: Partial<Record<SectionType, string>>
}

export interface SEOOutput {
  pageTitle: string
  metaDescription: string
  h1: string
  keywords: string[]
  schemaType: string
}

export interface QAIssue {
  severity: 'critical' | 'warning' | 'info'
  section: string
  message: string
  autoFixed: boolean
}

export interface QAOutput {
  score: number
  issues: QAIssue[]
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
  | 'running-agents'
  | 'messaging-review'
  | 'copy-review'
  | 'design-review'
  | 'building'
  | 'preview'
  | 'complete'

export interface AgentStatus {
  messaging: 'idle' | 'running' | 'done' | 'error'
  copy: 'idle' | 'running' | 'done' | 'error'
  design: 'idle' | 'running' | 'done' | 'error'
  qa: 'idle' | 'running' | 'done' | 'error'
}

// ── Feedback & Session ────────────────────────────────────

export interface FeedbackEntry {
  timestamp: string
  gate: 'messaging' | 'copy' | 'design' | 'final'
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
}

export interface GeneratedPage {
  html: string
  reactComponent: string
  webflowJson: WebflowSection[]
}

export interface PipelineSession {
  id: string
  createdAt: string
  currentStep: PipelineStep
  context: BusinessContext | null
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
