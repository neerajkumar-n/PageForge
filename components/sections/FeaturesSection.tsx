import type { SectionProps } from '@/types'

const ICON_MAP: Record<string, string> = {
  'bar-chart-2': '📊', 'bell': '🔔', 'file-text': '📄', 'layers': '🗂️',
  'users': '👥', 'zap': '⚡', 'shield': '🛡️', 'code': '💻', 'default': '◆',
}

export function FeaturesSection({ copy, palette, typography, variant = 'grid' }: SectionProps) {
  if (variant === 'list') {
    return (
      <section style={{ padding: '5rem 1.5rem', background: palette.muted, fontFamily: `'${typography.body}', system-ui, sans-serif` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', fontWeight: 700, marginBottom: '1rem', color: palette.foreground }}>{copy.headline}</h2>
            {copy.subheadline && <p style={{ color: palette.mutedForeground, fontSize: '1.1rem' }}>{copy.subheadline}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {(copy.items ?? []).map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', background: palette.background, border: `1px solid ${palette.border}`, borderRadius: 12, padding: '1.75rem' }}>
                <div style={{ width: 48, height: 48, background: palette.primary, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.25rem' }}>
                  {ICON_MAP[item.icon ?? 'default']}
                </div>
                <div>
                  <h3 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontWeight: 700, marginBottom: '0.5rem', color: palette.foreground }}>{item.title}</h3>
                  <p style={{ color: palette.mutedForeground, lineHeight: 1.6 }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default: grid
  return (
    <section style={{ padding: '5rem 1.5rem', background: palette.muted, fontFamily: `'${typography.body}', system-ui, sans-serif` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 3.5rem' }}>
          <h2 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', fontWeight: 700, marginBottom: '1rem', color: palette.foreground }}>
            {copy.headline}
          </h2>
          {copy.subheadline && <p style={{ color: palette.mutedForeground, fontSize: '1.1rem', lineHeight: 1.6 }}>{copy.subheadline}</p>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {(copy.items ?? []).map((item) => (
            <div key={item.id} style={{ background: palette.background, border: `1px solid ${palette.border}`, borderRadius: 12, padding: '2rem' }}>
              <div style={{ width: 48, height: 48, background: palette.primary, borderRadius: 10, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                {ICON_MAP[item.icon ?? 'default']}
              </div>
              <h3 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontWeight: 700, marginBottom: '0.5rem', color: palette.foreground }}>{item.title}</h3>
              <p style={{ color: palette.mutedForeground, lineHeight: 1.6, fontSize: '0.95rem' }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
