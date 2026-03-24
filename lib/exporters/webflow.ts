import type { CopyOutput, DesignOutput, WebflowSection } from '@/types'

export function exportToWebflow(
  copy: CopyOutput,
  design: DesignOutput
): WebflowSection[] {
  const dir = design.directions.find((d) => d.id === design.selectedDirectionId)
  if (!dir) throw new Error('No selected design direction')

  const sections = design.sectionOrder
    .map((type) => copy.sections.find((s) => s.sectionType === type))
    .filter(Boolean) as CopyOutput['sections']

  return sections.map((section) => ({
    type: section.sectionType,
    slug: `${section.sectionType}-section`,
    variant: 'default',
    content: buildContent(section),
    styles: {
      backgroundColor: getSectionBackground(section.sectionType, dir.palette),
      textColor: dir.palette.foreground,
      accentColor: dir.palette.accent,
      primaryColor: dir.palette.primary,
      mutedColor: dir.palette.muted,
      borderColor: dir.palette.border,
      headingFont: dir.typography.heading,
      bodyFont: dir.typography.body,
    },
  }))
}

function buildContent(
  section: CopyOutput['sections'][0]
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    sectionType: section.sectionType,
  }

  if (section.headline) base.headline = section.headline
  if (section.subheadline) base.subheadline = section.subheadline
  if (section.body) base.body = section.body
  if (section.ctaText) base.ctaText = section.ctaText

  if (section.items && section.items.length > 0) {
    base.items = section.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      ...(item.icon ? { icon: item.icon } : {}),
    }))
  }

  return base
}

function getSectionBackground(
  sectionType: string,
  palette: { background: string; muted: string; primary: string }
): string {
  const mutedSections = ['logos', 'features', 'pricing']
  const primarySections = ['hero', 'cta']
  if (primarySections.includes(sectionType)) return palette.primary
  if (mutedSections.includes(sectionType)) return palette.muted
  return palette.background
}
