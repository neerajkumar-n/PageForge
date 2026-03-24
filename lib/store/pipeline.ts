'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  PipelineSession,
  PipelineStep,
  BusinessContext,
  ResearchOutput,
  MessagingOutput,
  CopyOutput,
  DesignOutput,
  SEOOutput,
  QAOutput,
  FeedbackEntry,
  GeneratedPage,
  SectionType,
  AgentStatus,
} from '@/types'
import type { AgentConfigs } from '@/config/ai.config'
import { defaultAgentCharacteristics } from '@/config/ai.config'

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function createDefaultSession(): PipelineSession {
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    currentStep: 'research',
    context: null,
    research: null,
    agentStatus: {
      research: 'idle',
      messaging: 'idle',
      copy: 'idle',
      design: 'idle',
      seo: 'idle',
      qa: 'idle',
    },
    messaging: null,
    copy: null,
    design: null,
    seo: null,
    qa: null,
    feedbackLog: [],
    generatedPage: null,
    agentCharacteristicOverrides: {},
  }
}

interface PipelineStore extends PipelineSession {
  // Navigation
  setStep: (step: PipelineStep) => void

  // Intake
  setContext: (ctx: BusinessContext) => void

  // Research
  setResearch: (data: ResearchOutput) => void

  // Agent status
  setAgentStatus: (agent: keyof AgentStatus, status: AgentStatus[keyof AgentStatus]) => void

  // Agent outputs
  setMessaging: (data: MessagingOutput) => void
  setCopy: (data: CopyOutput) => void
  setDesign: (data: DesignOutput) => void
  setQA: (data: QAOutput) => void
  setSEO: (data: SEOOutput) => void

  // Messaging gate edits
  updateMessagingField: (field: keyof MessagingOutput, value: unknown) => void
  updateValueProp: (id: string, field: string, value: string) => void

  // Copy gate edits
  updateSectionCopy: (sectionId: string, field: string, value: unknown) => void
  approveSectionCopy: (sectionId: string) => void
  skipSectionCopy: (sectionId: string) => void

  // Design gate
  selectDesignDirection: (id: string) => void
  reorderSections: (order: SectionType[]) => void
  toggleSection: (sectionType: SectionType) => void
  setComponentVariant: (sectionType: SectionType, variant: string) => void

  // SEO gate edits
  updateSEOField: (field: keyof SEOOutput, value: unknown) => void

  // Feedback log
  logFeedback: (entry: Omit<FeedbackEntry, 'timestamp'>) => void

  // Export
  setGeneratedPage: (page: GeneratedPage) => void

  // Agent characteristics (per-session overrides)
  updateAgentCharacteristics: (
    agent: keyof AgentConfigs,
    field: string,
    value: unknown
  ) => void
  resetAgentCharacteristics: (agent: keyof AgentConfigs) => void

  // Session management
  resetSession: () => void

  // Derived helpers
  getEffectiveCharacteristics: () => AgentConfigs
  getMessagingFeedback: () => FeedbackEntry[]
  getCopyFeedback: () => FeedbackEntry[]
}

export const usePipelineStore = create<PipelineStore>()(
  persist(
    (set, get) => ({
      ...createDefaultSession(),

      // ── Navigation ──────────────────────────────────────

      setStep: (step) => set({ currentStep: step }),

      // ── Intake ──────────────────────────────────────────

      setContext: (ctx) => set({ context: ctx }),

      // ── Research ────────────────────────────────────────

      setResearch: (data) => set({ research: data }),

      // ── Agent Status ────────────────────────────────────

      setAgentStatus: (agent, status) =>
        set((state) => ({
          agentStatus: { ...state.agentStatus, [agent]: status },
        })),

      // ── Agent Outputs ───────────────────────────────────

      setMessaging: (data) => set({ messaging: data }),

      setCopy: (data) => set({ copy: data }),

      setDesign: (data) => set({ design: data }),

      setQA: (data) => set({ qa: data }),

      setSEO: (data) => set({ seo: data }),

      // ── Messaging Gate Edits ────────────────────────────

      updateMessagingField: (field, value) =>
        set((state) => {
          if (!state.messaging) return state
          return { messaging: { ...state.messaging, [field]: value } }
        }),

      updateValueProp: (id, field, value) =>
        set((state) => {
          if (!state.messaging) return state
          return {
            messaging: {
              ...state.messaging,
              valuePropositions: state.messaging.valuePropositions.map((vp) =>
                vp.id === id ? { ...vp, [field]: value } : vp
              ),
            },
          }
        }),

      // ── Copy Gate Edits ─────────────────────────────────

      updateSectionCopy: (sectionId, field, value) =>
        set((state) => {
          if (!state.copy) return state
          return {
            copy: {
              ...state.copy,
              sections: state.copy.sections.map((s) =>
                s.id === sectionId
                  ? { ...s, [field]: value, humanEdited: true }
                  : s
              ),
            },
          }
        }),

      approveSectionCopy: (sectionId) =>
        set((state) => {
          if (!state.copy) return state
          return {
            copy: {
              ...state.copy,
              sections: state.copy.sections.map((s) =>
                s.id === sectionId ? { ...s, approved: true } : s
              ),
            },
          }
        }),

      skipSectionCopy: (sectionId) =>
        set((state) => {
          if (!state.copy) return state
          return {
            copy: {
              ...state.copy,
              sections: state.copy.sections.map((s) =>
                s.id === sectionId ? { ...s, approved: true } : s
              ),
            },
          }
        }),

      // ── Design Gate ─────────────────────────────────────

      selectDesignDirection: (id) =>
        set((state) => {
          if (!state.design) return state
          return { design: { ...state.design, selectedDirectionId: id } }
        }),

      reorderSections: (order) =>
        set((state) => {
          if (!state.design) return state
          return { design: { ...state.design, sectionOrder: order } }
        }),

      toggleSection: (sectionType) =>
        set((state) => {
          if (!state.design) return state
          const current = state.design.sectionOrder
          const exists = current.includes(sectionType)
          return {
            design: {
              ...state.design,
              sectionOrder: exists
                ? current.filter((s) => s !== sectionType)
                : [...current, sectionType],
            },
          }
        }),

      setComponentVariant: (sectionType, variant) =>
        set((state) => {
          if (!state.design) return state
          return {
            design: {
              ...state.design,
              componentPicks: {
                ...state.design.componentPicks,
                [sectionType]: variant,
              },
            },
          }
        }),

      // ── SEO Gate Edits ──────────────────────────────────

      updateSEOField: (field, value) =>
        set((state) => {
          if (!state.seo) return state
          return { seo: { ...state.seo, [field]: value } }
        }),

      // ── Feedback Log ────────────────────────────────────

      logFeedback: (entry) =>
        set((state) => ({
          feedbackLog: [
            ...state.feedbackLog,
            { ...entry, timestamp: new Date().toISOString() },
          ],
        })),

      // ── Export ──────────────────────────────────────────

      setGeneratedPage: (page) => set({ generatedPage: page }),

      // ── Agent Characteristics ───────────────────────────

      updateAgentCharacteristics: (agent, field, value) =>
        set((state) => ({
          agentCharacteristicOverrides: {
            ...state.agentCharacteristicOverrides,
            [agent]: {
              ...(state.agentCharacteristicOverrides[agent] ??
                defaultAgentCharacteristics[agent]),
              [field]: value,
            },
          },
        })),

      resetAgentCharacteristics: (agent) =>
        set((state) => {
          const overrides = { ...state.agentCharacteristicOverrides }
          delete overrides[agent]
          return { agentCharacteristicOverrides: overrides }
        }),

      // ── Session Management ──────────────────────────────

      resetSession: () => set(createDefaultSession()),

      // ── Derived Helpers ─────────────────────────────────

      getEffectiveCharacteristics: () => {
        const state = get()
        const result = { ...defaultAgentCharacteristics }
        for (const agent of Object.keys(defaultAgentCharacteristics) as Array<
          keyof AgentConfigs
        >) {
          if (state.agentCharacteristicOverrides[agent]) {
            result[agent] = {
              ...defaultAgentCharacteristics[agent],
              ...state.agentCharacteristicOverrides[agent],
            }
          }
        }
        return result
      },

      getMessagingFeedback: () =>
        get().feedbackLog.filter((e) => e.gate === 'messaging'),

      getCopyFeedback: () =>
        get().feedbackLog.filter((e) => e.gate === 'copy'),
    }),
    {
      name: 'pageforge-pipeline',
      version: 2,
    }
  )
)
