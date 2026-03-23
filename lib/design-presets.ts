// ============================================================
// PageForge — Pre-built B2B Design Presets
//
// 6 battle-tested archetypes for B2B SaaS landing pages.
// Users can select one as a starting point before or instead
// of the AI-generated directions.
// ============================================================

import type { DesignDirection, SectionType } from '@/types'

export interface DesignPreset {
  id: string
  category: string
  label: string
  description: string
  bestFor: string[]
  direction: DesignDirection
}

const DEFAULT_SECTION_ORDER: SectionType[] = [
  'hero', 'logos', 'problem', 'features', 'testimonials', 'pricing', 'faq', 'cta',
]

export const B2B_DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'preset-enterprise',
    category: 'Enterprise',
    label: 'Enterprise Trust',
    description: 'Dark navy authority with generous whitespace. Signals permanence and reliability to CFOs and procurement teams.',
    bestFor: ['Enterprise B2B', 'Finance & Legal tech', 'Security & Compliance', 'Infrastructure'],
    direction: {
      id: 'preset-enterprise',
      name: 'Enterprise Trust',
      description: 'Built for risk-averse buyers who need to justify the decision upward. Navy and slate convey reliability without being boring.',
      palette: {
        primary: '#0F2D5E',
        primaryForeground: '#FFFFFF',
        accent: '#2563EB',
        background: '#F8FAFC',
        foreground: '#0F172A',
        muted: '#F1F5F9',
        mutedForeground: '#475569',
        border: '#CBD5E1',
      },
      typography: { heading: 'Inter', body: 'Inter' },
      heroVariant: 'left-aligned',
      mood: 'Authoritative and data-forward — the page a CFO would trust.',
    },
  },
  {
    id: 'preset-bold-startup',
    category: 'Startup',
    label: 'Bold Startup',
    description: 'High-contrast purple and electric accents. Built for ambitious buyers at growth-stage companies who want momentum.',
    bestFor: ['Growth-stage SaaS', 'Sales & Marketing tools', 'Productivity', 'Collaboration'],
    direction: {
      id: 'preset-bold-startup',
      name: 'Bold Startup',
      description: 'Designed for ambitious buyers who move fast and want a tool that matches their energy. Purple-to-indigo gradient with sharp contrasts.',
      palette: {
        primary: '#7C3AED',
        primaryForeground: '#FFFFFF',
        accent: '#F59E0B',
        background: '#FAFAF9',
        foreground: '#1C1917',
        muted: '#F5F3FF',
        mutedForeground: '#6D28D9',
        border: '#DDD6FE',
      },
      typography: { heading: 'Plus Jakarta Sans', body: 'Inter' },
      heroVariant: 'centered',
      mood: 'Energetic and confident — the page a VP Sales would screenshot to their CEO.',
    },
  },
  {
    id: 'preset-minimal-technical',
    category: 'Technical',
    label: 'Minimal Technical',
    description: 'Clean whites with precise mono typography. Appeals to engineering-adjacent buyers who distrust marketing fluff.',
    bestFor: ['Developer tools', 'DevOps & Infrastructure', 'Data & Analytics', 'API platforms'],
    direction: {
      id: 'preset-minimal-technical',
      name: 'Minimal Technical',
      description: 'Precision over decoration. For buyers who\'d rather see a code snippet than a stock photo. Monospace accents signal technical credibility.',
      palette: {
        primary: '#18181B',
        primaryForeground: '#FFFFFF',
        accent: '#10B981',
        background: '#FFFFFF',
        foreground: '#18181B',
        muted: '#F4F4F5',
        mutedForeground: '#52525B',
        border: '#E4E4E7',
      },
      typography: { heading: 'JetBrains Mono', body: 'Inter' },
      heroVariant: 'left-aligned',
      mood: 'Precise and information-dense — the page a senior engineer would take seriously.',
    },
  },
  {
    id: 'preset-dark-modern',
    category: 'Modern',
    label: 'Dark Mode Pro',
    description: 'Dark backgrounds with neon accents. Premium feel for tools that power serious workflows.',
    bestFor: ['AI & ML platforms', 'Data tools', 'Design software', 'Developer productivity'],
    direction: {
      id: 'preset-dark-modern',
      name: 'Dark Mode Pro',
      description: 'Dark-first design with luminous accent colors. Creates an immediate sense of sophistication and technical depth.',
      palette: {
        primary: '#0EA5E9',
        primaryForeground: '#FFFFFF',
        accent: '#A78BFA',
        background: '#0A0A0F',
        foreground: '#F8FAFC',
        muted: '#16161D',
        mutedForeground: '#94A3B8',
        border: '#1E293B',
      },
      typography: { heading: 'Space Grotesk', body: 'Inter' },
      heroVariant: 'centered',
      mood: 'Sophisticated and immersive — the page that makes your product feel premium before they read a word.',
    },
  },
  {
    id: 'preset-warm-saas',
    category: 'Friendly',
    label: 'Warm & Human',
    description: 'Warm creams and coral accents. For products where the human element matters — HR, customer success, coaching.',
    bestFor: ['HR & People ops', 'Customer success', 'EdTech', 'Professional services'],
    direction: {
      id: 'preset-warm-saas',
      name: 'Warm & Human',
      description: 'Warm tones signal approachability in markets where trust and relationship quality drive purchasing decisions.',
      palette: {
        primary: '#D97706',
        primaryForeground: '#FFFFFF',
        accent: '#EF4444',
        background: '#FFFBF0',
        foreground: '#1C1917',
        muted: '#FEF3C7',
        mutedForeground: '#92400E',
        border: '#FDE68A',
      },
      typography: { heading: 'Lora', body: 'Source Sans 3' },
      heroVariant: 'centered',
      mood: 'Approachable and warm — the page that makes buyers feel understood, not sold to.',
    },
  },
  {
    id: 'preset-clean-b2b',
    category: 'Clean',
    label: 'Clean SaaS',
    description: 'Light teal primary with neutral grays. Versatile and professional — works across most B2B categories.',
    bestFor: ['Operations tools', 'Project management', 'CRM & Sales', 'General B2B SaaS'],
    direction: {
      id: 'preset-clean-b2b',
      name: 'Clean SaaS',
      description: 'A reliable, clean foundation that lets the product do the talking. Teal signals innovation without feeling flashy.',
      palette: {
        primary: '#0D9488',
        primaryForeground: '#FFFFFF',
        accent: '#6366F1',
        background: '#F9FAFB',
        foreground: '#111827',
        muted: '#F3F4F6',
        mutedForeground: '#4B5563',
        border: '#E5E7EB',
      },
      typography: { heading: 'DM Sans', body: 'Inter' },
      heroVariant: 'split',
      mood: 'Clean and capable — a design that gets out of the way and lets clarity convert.',
    },
  },
]

export function getPresetById(id: string): DesignPreset | undefined {
  return B2B_DESIGN_PRESETS.find((p) => p.id === id)
}

export function presetToDesignOutput(preset: DesignPreset) {
  return {
    directions: [preset.direction],
    selectedDirectionId: preset.direction.id,
    sectionOrder: DEFAULT_SECTION_ORDER,
    componentPicks: {},
  }
}
