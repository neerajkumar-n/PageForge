import type { CopyOutput, DesignOutput, SEOOutput, ColorPalette } from '@/types'

function paletteToCSS(palette: ColorPalette): string {
  return `
    --color-primary: ${palette.primary};
    --color-primary-fg: ${palette.primaryForeground};
    --color-accent: ${palette.accent};
    --color-bg: ${palette.background};
    --color-fg: ${palette.foreground};
    --color-muted: ${palette.muted};
    --color-muted-fg: ${palette.mutedForeground};
    --color-border: ${palette.border};
  `.trim()
}

export function exportToHTML(
  copy: CopyOutput,
  design: DesignOutput,
  seo: SEOOutput
): string {
  const dir = design.directions.find((d) => d.id === design.selectedDirectionId)
  if (!dir) throw new Error('No selected design direction')

  const sections = design.sectionOrder
    .map((type) => copy.sections.find((s) => s.sectionType === type))
    .filter(Boolean) as CopyOutput['sections']

  const sectionsHTML = sections.map((s) => renderSectionHTML(s, dir.palette)).join('\n\n')

  const schemaOrgLD = seo.schemaMarkup
    ? JSON.stringify(seo.schemaMarkup)
    : JSON.stringify({
        '@context': 'https://schema.org',
        '@type': seo.schemaType,
        name: seo.pageTitle,
        description: seo.metaDescription,
        keywords: seo.keywords.join(', '),
      })

  const ogTitle = seo.ogTitle || seo.pageTitle
  const ogDescription = seo.ogDescription || seo.metaDescription

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHTML(seo.pageTitle)}</title>
  <meta name="description" content="${escapeHTML(seo.metaDescription)}" />
  <meta name="keywords" content="${escapeHTML(seo.keywords.join(', '))}" />

  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHTML(ogTitle)}" />
  <meta property="og:description" content="${escapeHTML(ogDescription)}" />
  <meta property="og:type" content="website" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHTML(ogTitle)}" />
  <meta name="twitter:description" content="${escapeHTML(ogDescription)}" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(dir.typography.heading)}:wght@400;600;700&family=${encodeURIComponent(dir.typography.body)}:wght@400;500&display=swap" rel="stylesheet" />

  <!-- Schema.org -->
  <script type="application/ld+json">${schemaOrgLD}</script>

  <style>
    :root {
      ${paletteToCSS(dir.palette)}
      --font-heading: '${dir.typography.heading}', system-ui, sans-serif;
      --font-body: '${dir.typography.body}', system-ui, sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; scroll-behavior: smooth; }
    body {
      font-family: var(--font-body);
      background-color: var(--color-bg);
      color: var(--color-fg);
      line-height: 1.6;
    }
    h1, h2, h3, h4 { font-family: var(--font-heading); line-height: 1.2; }
    h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 700; }
    h2 { font-size: clamp(1.5rem, 3.5vw, 2.5rem); font-weight: 700; }
    h3 { font-size: 1.25rem; font-weight: 600; }
    p { max-width: 65ch; }
    a { color: inherit; text-decoration: none; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    .btn {
      display: inline-block;
      background: var(--color-primary);
      color: var(--color-primary-fg);
      padding: 0.875rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      border: none;
      transition: opacity 0.15s;
    }
    .btn:hover { opacity: 0.9; }
    .btn-accent {
      background: var(--color-accent);
    }
    section { padding: 5rem 0; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
    .card {
      background: var(--color-muted);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 2rem;
    }
    @media (max-width: 768px) {
      section { padding: 3rem 0; }
      h1 { font-size: 2rem; }
      h2 { font-size: 1.75rem; }
    }
  </style>
</head>
<body>

${sectionsHTML}

</body>
</html>`
}

function renderSectionHTML(
  section: CopyOutput['sections'][0],
  palette: ColorPalette
): string {
  switch (section.sectionType) {
    case 'hero':
      return `<section id="hero" style="background:${palette.primary};color:${palette.primaryForeground};padding:6rem 0;">
  <div class="container" style="max-width:800px;margin:0 auto;padding:0 1.5rem;text-align:center;">
    <h1 style="color:${palette.primaryForeground};margin-bottom:1.5rem;">${escapeHTML(section.headline ?? '')}</h1>
    <p style="font-size:1.25rem;margin:0 auto 2rem;color:${palette.primaryForeground};opacity:0.9;">${escapeHTML(section.subheadline ?? '')}</p>
    ${section.body ? `<p style="margin-bottom:2rem;opacity:0.75;">${escapeHTML(section.body)}</p>` : ''}
    ${section.ctaText ? `<a href="#" class="btn btn-accent" style="font-size:1.1rem;">${escapeHTML(section.ctaText)}</a>` : ''}
  </div>
</section>`

    case 'logos':
      return `<section id="logos" style="background:${palette.muted};padding:3rem 0;border-top:1px solid ${palette.border};border-bottom:1px solid ${palette.border};">
  <div class="container">
    <p style="text-align:center;color:${palette.mutedForeground};margin-bottom:2rem;font-size:0.875rem;text-transform:uppercase;letter-spacing:0.05em;">${escapeHTML(section.headline ?? '')}</p>
    <div style="display:flex;justify-content:center;align-items:center;gap:3rem;flex-wrap:wrap;opacity:0.6;">
      ${['Acme Corp', 'Fieldline', 'Vault Systems', 'Lumio', 'Proxima'].map((name) => `<span style="font-weight:700;font-size:1.1rem;color:${palette.mutedForeground};">${name}</span>`).join('')}
    </div>
  </div>
</section>`

    case 'problem':
      return `<section id="problem">
  <div class="container">
    <div style="text-align:center;max-width:700px;margin:0 auto 3rem;">
      <h2 style="margin-bottom:1rem;">${escapeHTML(section.headline ?? '')}</h2>
      ${section.subheadline ? `<p style="font-size:1.125rem;color:${palette.mutedForeground};">${escapeHTML(section.subheadline)}</p>` : ''}
    </div>
    <div class="grid-3">
      ${(section.items ?? []).map((item) => `<div class="card">
        <h3 style="margin-bottom:0.75rem;color:${palette.primary};">${escapeHTML(item.title)}</h3>
        <p style="color:${palette.mutedForeground};">${escapeHTML(item.description)}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`

    case 'features':
      return `<section id="features" style="background:${palette.muted};">
  <div class="container">
    <div style="text-align:center;max-width:700px;margin:0 auto 3rem;">
      <h2 style="margin-bottom:1rem;">${escapeHTML(section.headline ?? '')}</h2>
      ${section.subheadline ? `<p style="font-size:1.125rem;color:${palette.mutedForeground};">${escapeHTML(section.subheadline)}</p>` : ''}
    </div>
    <div class="grid-3">
      ${(section.items ?? []).map((item) => `<div class="card">
        <div style="width:48px;height:48px;background:${palette.primary};border-radius:10px;margin-bottom:1rem;display:flex;align-items:center;justify-content:center;">
          <span style="color:${palette.primaryForeground};font-size:1.25rem;">◆</span>
        </div>
        <h3 style="margin-bottom:0.5rem;">${escapeHTML(item.title)}</h3>
        <p style="color:${palette.mutedForeground};">${escapeHTML(item.description)}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`

    case 'testimonials':
      return `<section id="testimonials">
  <div class="container">
    <h2 style="text-align:center;margin-bottom:3rem;">${escapeHTML(section.headline ?? '')}</h2>
    <div class="grid-3">
      ${(section.items ?? []).map((item) => `<div class="card" style="border-left:4px solid ${palette.accent};">
        <p style="font-size:1rem;line-height:1.7;color:${palette.foreground};margin-bottom:1.5rem;font-style:italic;">${escapeHTML(item.description)}</p>
        <p style="font-weight:600;color:${palette.primary};font-size:0.9rem;">${escapeHTML(item.title)}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`

    case 'pricing':
      return `<section id="pricing" style="background:${palette.muted};">
  <div class="container">
    <div style="text-align:center;max-width:600px;margin:0 auto 3rem;">
      <h2 style="margin-bottom:1rem;">${escapeHTML(section.headline ?? '')}</h2>
      ${section.subheadline ? `<p style="color:${palette.mutedForeground};">${escapeHTML(section.subheadline)}</p>` : ''}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem;max-width:800px;margin:0 auto;">
      ${(section.items ?? []).map((item, i) => `<div class="card" style="${i === 1 ? `border-color:${palette.primary};border-width:2px;` : ''}">
        <h3 style="margin-bottom:1rem;color:${palette.primary};">${escapeHTML(item.title)}</h3>
        <p style="color:${palette.mutedForeground};white-space:pre-line;">${escapeHTML(item.description)}</p>
        ${section.ctaText && i === 0 ? `<a href="#" class="btn" style="margin-top:1.5rem;display:block;text-align:center;">${escapeHTML(section.ctaText)}</a>` : ''}
        ${section.ctaText && i === 1 ? `<a href="#" class="btn btn-accent" style="margin-top:1.5rem;display:block;text-align:center;">${escapeHTML(section.ctaText)}</a>` : ''}
      </div>`).join('')}
    </div>
  </div>
</section>`

    case 'faq':
      return `<section id="faq">
  <div class="container" style="max-width:800px;margin:0 auto;">
    <h2 style="text-align:center;margin-bottom:3rem;">${escapeHTML(section.headline ?? '')}</h2>
    <div style="display:flex;flex-direction:column;gap:1rem;">
      ${(section.items ?? []).map((item) => `<details style="border:1px solid ${palette.border};border-radius:8px;padding:1.5rem;">
        <summary style="font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;">
          ${escapeHTML(item.title)}
          <span style="color:${palette.primary};font-size:1.25rem;">+</span>
        </summary>
        <p style="margin-top:1rem;color:${palette.mutedForeground};line-height:1.7;">${escapeHTML(item.description)}</p>
      </details>`).join('')}
    </div>
  </div>
</section>`

    case 'cta':
      return `<section id="cta" style="background:${palette.primary};color:${palette.primaryForeground};text-align:center;">
  <div class="container" style="max-width:700px;margin:0 auto;">
    <h2 style="color:${palette.primaryForeground};margin-bottom:1rem;">${escapeHTML(section.headline ?? '')}</h2>
    ${section.subheadline ? `<p style="font-size:1.125rem;opacity:0.9;margin:0 auto 2rem;">${escapeHTML(section.subheadline)}</p>` : ''}
    ${section.ctaText ? `<a href="#" class="btn btn-accent" style="font-size:1.1rem;">${escapeHTML(section.ctaText)}</a>` : ''}
    ${section.body ? `<p style="margin-top:1.5rem;opacity:0.7;font-size:0.875rem;">${escapeHTML(section.body)}</p>` : ''}
  </div>
</section>`

    default:
      return `<!-- Section: ${section.sectionType} -->`
  }
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
