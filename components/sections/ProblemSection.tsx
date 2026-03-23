import type { SectionProps } from '@/types'

const ICONS: Record<string, string> = {
  'database': '🗄️',
  'alert-triangle': '⚠️',
  'clock': '⏱️',
  'default': '●',
}

export function ProblemSection({ copy, palette, typography }: SectionProps) {
  return (
    <section style={{ padding: '5rem 1.5rem', background: palette.background, fontFamily: `'${typography.body}', system-ui, sans-serif` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 3.5rem' }}>
          <h2 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', fontWeight: 700, marginBottom: '1rem', color: palette.foreground }}>
            {copy.headline}
          </h2>
          {copy.subheadline && (
            <p style={{ fontSize: '1.125rem', color: palette.mutedForeground, lineHeight: 1.6 }}>
              {copy.subheadline}
            </p>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {(copy.items ?? []).map((item, i) => (
            <div key={item.id} style={{ background: palette.muted, border: `1px solid ${palette.border}`, borderRadius: 12, padding: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: palette.primary }} />
              <div style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{ICONS[item.icon ?? 'default'] ?? '●'}</div>
              <h3 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: palette.foreground }}>
                {item.title}
              </h3>
              <p style={{ color: palette.mutedForeground, lineHeight: 1.7, fontSize: '0.95rem' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
