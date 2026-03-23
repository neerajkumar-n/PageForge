import type { SectionProps } from '@/types'

const LOGOS = ['Acme Corp', 'Fieldline', 'Vault Systems', 'Lumio', 'Proxima', 'Clearfield']

export function LogoBarSection({ copy, palette, typography }: SectionProps) {
  return (
    <section style={{ background: palette.muted, padding: '2.5rem 1.5rem', borderTop: `1px solid ${palette.border}`, borderBottom: `1px solid ${palette.border}`, fontFamily: `'${typography.body}', system-ui, sans-serif` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: palette.mutedForeground, marginBottom: '1.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          {copy.headline ?? 'Trusted by revenue teams at'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          {LOGOS.map((name) => (
            <span key={name} style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontWeight: 700, fontSize: '1rem', color: palette.mutedForeground, opacity: 0.55, letterSpacing: '-0.02em' }}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
