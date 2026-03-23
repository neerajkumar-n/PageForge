import type { SectionProps } from '@/types'

export function CTASection({ copy, palette, typography, variant = 'centered' }: SectionProps) {
  if (variant === 'split') {
    return (
      <section style={{ padding: '5rem 1.5rem', background: palette.muted, fontFamily: `'${typography.body}', system-ui, sans-serif` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontSize: 'clamp(1.75rem,3.5vw,2.25rem)', fontWeight: 700, marginBottom: '1rem', color: palette.foreground }}>{copy.headline}</h2>
            {copy.subheadline && <p style={{ color: palette.mutedForeground, lineHeight: 1.6 }}>{copy.subheadline}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="email" placeholder="Enter your work email" style={{ padding: '0.875rem 1rem', borderRadius: 8, border: `1px solid ${palette.border}`, width: '100%', fontSize: '1rem' }} />
            <button style={{ background: palette.primary, color: palette.primaryForeground, padding: '0.875rem', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
              {copy.ctaText ?? 'Get access'}
            </button>
            {copy.body && <p style={{ fontSize: '0.8rem', color: palette.mutedForeground, textAlign: 'center' }}>{copy.body}</p>}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section style={{ padding: '6rem 1.5rem', background: palette.primary, color: palette.primaryForeground, textAlign: 'center', fontFamily: `'${typography.body}', system-ui, sans-serif` }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', fontWeight: 700, marginBottom: '1rem', color: palette.primaryForeground }}>
          {copy.headline}
        </h2>
        {copy.subheadline && (
          <p style={{ fontSize: '1.15rem', opacity: 0.9, marginBottom: '2rem', lineHeight: 1.6 }}>
            {copy.subheadline}
          </p>
        )}
        {copy.ctaText && (
          <a href="#" style={{ display: 'inline-block', background: palette.accent, color: '#fff', padding: '0.9rem 2.5rem', borderRadius: 8, fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none' }}>
            {copy.ctaText}
          </a>
        )}
        {copy.body && (
          <p style={{ marginTop: '1.5rem', opacity: 0.65, fontSize: '0.875rem' }}>{copy.body}</p>
        )}
      </div>
    </section>
  )
}
