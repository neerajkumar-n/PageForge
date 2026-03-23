import type { SectionProps } from '@/types'

export function PricingSection({ copy, palette, typography, variant = 'two-tier' }: SectionProps) {
  const plans = copy.items ?? []
  return (
    <section style={{ padding: '5rem 1.5rem', background: palette.muted, fontFamily: `'${typography.body}', system-ui, sans-serif` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 3.5rem' }}>
          <h2 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', fontWeight: 700, marginBottom: '1rem', color: palette.foreground }}>
            {copy.headline}
          </h2>
          {copy.subheadline && <p style={{ color: palette.mutedForeground, fontSize: '1.05rem', lineHeight: 1.6 }}>{copy.subheadline}</p>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: variant === 'three-tier' ? 'repeat(auto-fit,minmax(260px,1fr))' : 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem', maxWidth: variant === 'two-tier' ? 800 : 1200, margin: '0 auto' }}>
          {plans.map((plan, i) => {
            const isHighlighted = (variant === 'two-tier' && i === 1) || (variant === 'three-tier' && i === 1)
            return (
              <div key={plan.id} style={{ background: palette.background, border: `${isHighlighted ? 2 : 1}px solid ${isHighlighted ? palette.primary : palette.border}`, borderRadius: 16, padding: '2.25rem', position: 'relative' }}>
                {isHighlighted && (
                  <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: palette.accent, color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 1rem', borderRadius: '0 0 8px 8px', letterSpacing: '0.03em' }}>
                    MOST POPULAR
                  </div>
                )}
                <h3 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: isHighlighted ? palette.primary : palette.foreground }}>
                  {plan.title}
                </h3>
                <p style={{ color: palette.mutedForeground, lineHeight: 1.7, fontSize: '0.9rem', marginBottom: '2rem', whiteSpace: 'pre-line' }}>
                  {plan.description}
                </p>
                <a href="#" style={{ display: 'block', textAlign: 'center', background: isHighlighted ? palette.accent : palette.primary, color: palette.primaryForeground, padding: '0.875rem', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}>
                  {copy.ctaText ?? 'Get started'}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
