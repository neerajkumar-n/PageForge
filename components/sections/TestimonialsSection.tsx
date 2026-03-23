import type { SectionProps } from '@/types'

export function TestimonialsSection({ copy, palette, typography, variant = 'cards' }: SectionProps) {
  if (variant === 'single') {
    const item = (copy.items ?? [])[0]
    return (
      <section style={{ padding: '5rem 1.5rem', background: palette.primary, fontFamily: `'${typography.body}', system-ui, sans-serif`, textAlign: 'center' }}>
        <div style={{ maxWidth: 750, margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', color: palette.accent, lineHeight: 1, marginBottom: '1.5rem' }}>&ldquo;</div>
          <blockquote style={{ fontSize: 'clamp(1.25rem,2.5vw,1.75rem)', fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontWeight: 600, color: palette.primaryForeground, lineHeight: 1.5, marginBottom: '2rem' }}>
            {item?.description}
          </blockquote>
          <p style={{ color: palette.primaryForeground, opacity: 0.75, fontWeight: 600 }}>{item?.title}</p>
        </div>
      </section>
    )
  }

  return (
    <section style={{ padding: '5rem 1.5rem', background: palette.background, fontFamily: `'${typography.body}', system-ui, sans-serif` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', fontWeight: 700, textAlign: 'center', marginBottom: '3.5rem', color: palette.foreground }}>
          {copy.headline}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {(copy.items ?? []).map((item) => (
            <div key={item.id} style={{ background: palette.muted, border: `1px solid ${palette.border}`, borderLeft: `4px solid ${palette.accent}`, borderRadius: 12, padding: '2rem' }}>
              <div style={{ fontSize: '2rem', color: palette.accent, marginBottom: '1rem', lineHeight: 1 }}>&ldquo;</div>
              <p style={{ color: palette.foreground, lineHeight: 1.75, marginBottom: '1.5rem', fontStyle: 'italic', fontSize: '0.975rem' }}>
                {item.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, background: palette.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: palette.primaryForeground, fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                  {item.title.charAt(0)}
                </div>
                <p style={{ fontWeight: 600, color: palette.primary, fontSize: '0.875rem', lineHeight: 1.4 }}>{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
