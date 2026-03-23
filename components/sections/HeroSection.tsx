'use client'
import type { SectionProps } from '@/types'

export function HeroSection({ copy, palette, typography, variant = 'centered' }: SectionProps) {
  const style = {
    '--c-primary': palette.primary,
    '--c-pfg': palette.primaryForeground,
    '--c-accent': palette.accent,
    '--font-heading': `'${typography.heading}', system-ui, sans-serif`,
    '--font-body': `'${typography.body}', system-ui, sans-serif`,
  } as React.CSSProperties

  if (variant === 'left-aligned') {
    return (
      <section style={{ ...style, background: palette.primary, color: palette.primaryForeground, padding: '6rem 1.5rem', fontFamily: `'${typography.body}', system-ui, sans-serif` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontSize: 'clamp(2rem,4vw,3.25rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: '1.5rem', color: palette.primaryForeground }}>
              {copy.headline}
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {copy.subheadline}
            </p>
            {copy.body && <p style={{ opacity: 0.75, marginBottom: '2rem', fontSize: '0.95rem' }}>{copy.body}</p>}
            {copy.ctaText && (
              <a href="#" style={{ display: 'inline-block', background: palette.accent, color: palette.primaryForeground, padding: '0.875rem 2.25rem', borderRadius: 8, fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}>
                {copy.ctaText}
              </a>
            )}
          </div>
          <div style={{ background: `${palette.primaryForeground}15`, borderRadius: 16, aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ opacity: 0.4, fontSize: '4rem' }}>📊</span>
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'split') {
    return (
      <section style={{ ...style, background: palette.background, color: palette.foreground, padding: '6rem 1.5rem', fontFamily: `'${typography.body}', system-ui, sans-serif` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontSize: 'clamp(2rem,4vw,3.25rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: '1.5rem', color: palette.foreground }}>
              {copy.headline}
            </h1>
            <p style={{ fontSize: '1.15rem', color: palette.mutedForeground, marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {copy.subheadline}
            </p>
            {copy.body && <p style={{ color: palette.mutedForeground, marginBottom: '2rem', fontSize: '0.95rem' }}>{copy.body}</p>}
          </div>
          <div style={{ background: palette.muted, border: `1px solid ${palette.border}`, borderRadius: 16, padding: '2.5rem' }}>
            <h3 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, marginBottom: '1.5rem', color: palette.foreground, fontWeight: 700 }}>Get started free</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input placeholder="Work email" style={{ padding: '0.75rem 1rem', borderRadius: 8, border: `1px solid ${palette.border}`, width: '100%', fontSize: '0.95rem' }} />
              <input placeholder="Company name" style={{ padding: '0.75rem 1rem', borderRadius: 8, border: `1px solid ${palette.border}`, width: '100%', fontSize: '0.95rem' }} />
              <button style={{ background: palette.primary, color: palette.primaryForeground, padding: '0.875rem', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', width: '100%' }}>
                {copy.ctaText ?? 'Get access'}
              </button>
              <p style={{ fontSize: '0.8rem', color: palette.mutedForeground, textAlign: 'center' }}>No credit card required</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Default: centered
  return (
    <section style={{ ...style, background: palette.primary, color: palette.primaryForeground, padding: '7rem 1.5rem', fontFamily: `'${typography.body}', system-ui, sans-serif`, textAlign: 'center' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: `${palette.accent}25`, border: `1px solid ${palette.accent}50`, borderRadius: 100, padding: '0.4rem 1rem', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600, color: palette.accent }}>
          AI-Powered Landing Pages
        </div>
        <h1 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontSize: 'clamp(2.25rem,5vw,3.75rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem', color: palette.primaryForeground }}>
          {copy.headline}
        </h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: 620, margin: '0 auto 1.5rem' }}>
          {copy.subheadline}
        </p>
        {copy.body && <p style={{ opacity: 0.7, marginBottom: '2.5rem', fontSize: '0.95rem' }}>{copy.body}</p>}
        {copy.ctaText && (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#" style={{ display: 'inline-block', background: palette.accent, color: '#fff', padding: '0.9rem 2.25rem', borderRadius: 8, fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none' }}>
              {copy.ctaText}
            </a>
            <a href="#" style={{ display: 'inline-block', background: 'transparent', border: `2px solid ${palette.primaryForeground}50`, color: palette.primaryForeground, padding: '0.9rem 2.25rem', borderRadius: 8, fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none' }}>
              See how it works
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
