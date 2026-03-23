'use client'
import { useState } from 'react'
import type { SectionProps } from '@/types'

export function FAQSection({ copy, palette, typography }: SectionProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section style={{ padding: '5rem 1.5rem', background: palette.background, fontFamily: `'${typography.body}', system-ui, sans-serif` }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontFamily: `'${typography.heading}', system-ui, sans-serif`, fontSize: 'clamp(1.75rem,3.5vw,2.5rem)', fontWeight: 700, textAlign: 'center', marginBottom: '3.5rem', color: palette.foreground }}>
          {copy.headline}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(copy.items ?? []).map((item) => {
            const isOpen = openId === item.id
            return (
              <div key={item.id} style={{ border: `1px solid ${isOpen ? palette.primary : palette.border}`, borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.15s' }}>
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  style={{ width: '100%', padding: '1.25rem 1.5rem', textAlign: 'left', background: isOpen ? palette.muted : palette.background, border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
                >
                  <span style={{ fontWeight: 600, color: palette.foreground, fontSize: '0.975rem', lineHeight: 1.4 }}>{item.title}</span>
                  <span style={{ color: palette.primary, fontSize: '1.5rem', lineHeight: 1, flexShrink: 0, fontWeight: 300 }}>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 1.5rem 1.5rem', color: palette.mutedForeground, lineHeight: 1.75, fontSize: '0.95rem' }}>
                    {item.description}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
