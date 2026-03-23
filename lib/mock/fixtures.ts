// ============================================================
// PageForge — Realistic Mock Fixtures
// Product: Clairo — AI-powered sales forecasting for mid-market revenue teams
// ============================================================

import type {
  BusinessContext,
  MessagingOutput,
  CopyOutput,
  DesignOutput,
  QAOutput,
  SEOOutput,
} from '@/types'

export function mockMessaging(_context: BusinessContext): MessagingOutput {
  return {
    primaryHeadline: 'Know which deals will close — 3 weeks before your reps do',
    headlineAlternatives: [
      'Stop flying blind on revenue. Clairo forecasts with 94% accuracy.',
      'Your CFO wants a number. Clairo gives you one you can actually defend.',
    ],
    subheadline:
      'Clairo analyzes 140+ deal signals across your CRM, email, and calendar to give revenue leaders a forecast they can stake their quarter on — not a gut feeling dressed up in a spreadsheet.',
    valuePropositions: [
      {
        id: 'vp-1',
        headline: 'Forecast accuracy your board will stop questioning',
        description:
          'Clairo\'s signal-weighting model trained on 2.4M closed deals delivers 94% forecast accuracy at 30 days out — compared to the industry average of 67% for manual rollups.',
        proof: 'Validated across 340 mid-market revenue teams, Q1–Q4 2024',
      },
      {
        id: 'vp-2',
        headline: 'Spot the at-risk deals before your reps notice',
        description:
          'Behavioral signals — declining email response times, dropped meeting cadence, executive disengagement — trigger automatic alerts so your managers can intervene while there\'s still time.',
        proof: 'Customers recover an average of 18% of at-risk ARR per quarter',
      },
      {
        id: 'vp-3',
        headline: 'Revenue reporting that takes 4 hours, not 4 days',
        description:
          'Auto-generated forecast packages pull directly from your CRM. No manual data wrangling, no weekend spreadsheet marathons. Your RevOps team gets their Fridays back.',
        proof: 'Average time savings: 14 hours per week per RevOps analyst',
      },
    ],
    primaryCTA: 'See your live forecast accuracy',
    ctaAlternatives: [
      'Run a free forecast audit',
      'Get your Q2 forecast in 60 seconds',
    ],
    emotionalDrivers: [
      'Fear of missing the number and the board consequences',
      'Frustration with CRM data rot and reps not updating',
      'Desire to look competent and data-driven in front of the CFO',
      'Relief from the weekly forecast-call circus',
    ],
    keyObjections: [
      'Our CRM data is too messy for AI to work with',
      'We already have a BI tool — why do we need another one?',
      'Our reps will never trust a number they didn\'t build',
      'We\'re mid-market — is this built for us or for enterprise?',
    ],
    positioningStatement:
      'For VP Sales and RevOps leaders at 100–1000 person B2B companies who are tired of forecast calls that end in argument and spreadsheets that nobody trusts, Clairo is the revenue intelligence platform that gives you a defensible, AI-generated forecast before the quarter slips. Unlike generic BI tools or CRM-native analytics, Clairo is purpose-built for the mid-market revenue motion — with signal detection tuned to the deal cycles and buyer behaviors of your size company.',
  }
}

export function mockCopy(_context: BusinessContext): CopyOutput {
  return {
    sections: [
      {
        id: 'hero',
        sectionType: 'hero',
        headline: 'Know which deals will close — 3 weeks before your reps do',
        subheadline:
          'Clairo analyzes 140+ deal signals to give revenue leaders a forecast they can stake their quarter on.',
        body: 'Join 340+ mid-market revenue teams who replaced gut-feel forecasting with 94% accuracy.',
        ctaText: 'See your live forecast accuracy',
        approved: false,
        humanEdited: false,
      },
      {
        id: 'logos',
        sectionType: 'logos',
        headline: 'Trusted by revenue teams at',
        approved: false,
        humanEdited: false,
      },
      {
        id: 'problem',
        sectionType: 'problem',
        headline: 'Your forecast is a fiction — and everyone knows it',
        subheadline:
          'Every revenue leader faces the same three problems. Most just accept them as the cost of doing business.',
        items: [
          {
            id: 'p-1',
            title: 'The CRM data problem',
            description:
              'Your reps update Salesforce three hours before the forecast call. The data you\'re forecasting from is 2 weeks stale at best, and you both know it.',
            icon: 'database',
          },
          {
            id: 'p-2',
            title: 'The confidence problem',
            description:
              'You\'ve learned to add 15% buffer to every rep\'s commit. Your CFO has learned to discount your number by the same amount. The whole system is theater.',
            icon: 'alert-triangle',
          },
          {
            id: 'p-3',
            title: 'The intervention problem',
            description:
              'By the time you know a deal is at risk — because the champion stopped replying — it\'s already too late to recover it. You find out at the end of the quarter.',
            icon: 'clock',
          },
        ],
        approved: false,
        humanEdited: false,
      },
      {
        id: 'features',
        sectionType: 'features',
        headline: 'Everything your revenue team needs to stop guessing',
        subheadline:
          'Clairo doesn\'t give you more dashboards. It gives you fewer, better decisions.',
        items: [
          {
            id: 'f-1',
            title: 'Signal-weighted deal scoring',
            description:
              'Every deal is scored across 140+ signals: email velocity, meeting cadence, stakeholder engagement, legal review activity, and 135 more. Updated every 6 hours.',
            icon: 'bar-chart-2',
          },
          {
            id: 'f-2',
            title: 'At-risk deal alerts',
            description:
              'When a deal\'s signals deteriorate, Clairo alerts the rep and manager with the specific reasons and a recommended intervention playbook — before the quarter is over.',
            icon: 'bell',
          },
          {
            id: 'f-3',
            title: 'Forecast package generation',
            description:
              'One-click board-ready forecast packages with confidence ranges, scenario modeling, and historical accuracy tracking. Pulls live from your CRM.',
            icon: 'file-text',
          },
          {
            id: 'f-4',
            title: 'CRM-agnostic data layer',
            description:
              'Clairo enriches your CRM data with signals from email, calendar, LinkedIn, and call recordings — so your forecast reflects what\'s actually happening, not what was logged.',
            icon: 'layers',
          },
          {
            id: 'f-5',
            title: 'Rep adoption dashboard',
            description:
              'Track which reps are engaging with Clairo\'s recommendations and which are ignoring them. Identify coaching opportunities before they become missed numbers.',
            icon: 'users',
          },
        ],
        approved: false,
        humanEdited: false,
      },
      {
        id: 'testimonials',
        sectionType: 'testimonials',
        headline: 'Revenue leaders who stopped flying blind',
        items: [
          {
            id: 't-1',
            title: 'Marcus Chen, VP Sales at Fieldline',
            description:
              '"We were 40% off our Q3 forecast — the kind of miss that ends careers. After Clairo, we came in within 3% of our Q4 number. Our board went from questioning every call to asking when we can forecast 2 quarters out."',
          },
          {
            id: 't-2',
            title: 'Sarah Okonkwo, CRO at Vault Systems',
            description:
              '"I used to spend every Thursday afternoon on a forecast call that made everyone feel bad and produced nothing useful. Clairo cut that meeting from 2 hours to 20 minutes because we actually agree on the number before the call starts."',
          },
          {
            id: 't-3',
            title: 'James Whitfield, RevOps Director at Lumio',
            description:
              '"My team was spending 14 hours a week pulling data, reconciling spreadsheets, and building the forecast deck. That\'s 14 hours we now spend on pipeline generation and process improvement. Clairo paid for itself in week one."',
          },
        ],
        approved: false,
        humanEdited: false,
      },
      {
        id: 'pricing',
        sectionType: 'pricing',
        headline: 'Pricing that scales with your team',
        subheadline: 'No per-seat surprises. No enterprise negotiations. Start with your current team size.',
        items: [
          {
            id: 'plan-1',
            title: 'Growth',
            description: '$1,200/month · Up to 20 reps · CRM integration · Deal scoring · At-risk alerts · Email support',
          },
          {
            id: 'plan-2',
            title: 'Revenue',
            description: '$2,800/month · Up to 75 reps · Everything in Growth · Forecast packages · Scenario modeling · Slack integration · Dedicated CSM',
          },
        ],
        ctaText: 'Start your free 14-day trial',
        approved: false,
        humanEdited: false,
      },
      {
        id: 'faq',
        sectionType: 'faq',
        headline: 'Questions revenue leaders actually ask us',
        items: [
          {
            id: 'faq-1',
            title: 'Our CRM data is a mess. Will Clairo even work?',
            description:
              'Yes — this is the most common concern we hear, and it\'s why we built Clairo the way we did. Clairo doesn\'t rely solely on your CRM data. It enriches it with signals from email, calendar, and calls. A rep who hasn\'t updated Salesforce in two weeks is still sending signals — and Clairo reads them.',
          },
          {
            id: 'faq-2',
            title: 'We have a BI tool already. What does Clairo add?',
            description:
              'BI tools tell you what happened. Clairo tells you what\'s about to happen. Your BI tool can show you last quarter\'s win rate by region. Clairo tells you which deals this quarter are at risk of slipping and why — with time to do something about it.',
          },
          {
            id: 'faq-3',
            title: 'Will my reps trust a number they didn\'t build?',
            description:
              'Clairo doesn\'t replace the rep — it makes them look smarter. Reps who use Clairo\'s deal insights show up to pipeline reviews with more context, not less. After two quarters, most reps won\'t forecast without it. We offer rep onboarding as part of every plan.',
          },
          {
            id: 'faq-4',
            title: 'How long does implementation take?',
            description:
              'For most CRMs (Salesforce, HubSpot, Pipedrive), you\'re live in under 4 hours. We connect your CRM, run a historical model calibration on your past 12 months of deals, and generate your first forecast. No professional services engagement required.',
          },
          {
            id: 'faq-5',
            title: 'Is Clairo built for our size company?',
            description:
              'Clairo is specifically designed for 100–1000 person B2B companies. Enterprise tools like Clari and People.ai are priced and architected for 500+ rep teams. We built Clairo for the revenue leader who has 15–75 reps and can\'t afford to wait 6 months for implementation.',
          },
        ],
        approved: false,
        humanEdited: false,
      },
      {
        id: 'cta',
        sectionType: 'cta',
        headline: 'Your next forecast call doesn\'t have to be a guess',
        subheadline:
          'See exactly how accurate your current forecast is — before the quarter ends.',
        ctaText: 'See your live forecast accuracy',
        body: 'Free 14-day trial · No credit card required · Live in under 4 hours',
        approved: false,
        humanEdited: false,
      },
    ],
  }
}

export function mockDesign(_context: BusinessContext): DesignOutput {
  return {
    directions: [
      {
        id: 'dir-enterprise',
        name: 'Executive Trust',
        description:
          'Clean, authoritative, and data-forward. Designed to resonate with CFOs and VPs who have seen every SaaS pitch deck and are allergic to hype. Deep navy communicates stability; the bright teal accent is a controlled burst of modernity.',
        palette: {
          primary: '#0F2D5C',
          primaryForeground: '#FFFFFF',
          accent: '#00C2A8',
          background: '#FAFAFA',
          foreground: '#111827',
          muted: '#F3F4F6',
          mutedForeground: '#6B7280',
          border: '#E5E7EB',
        },
        typography: {
          heading: 'DM Sans',
          body: 'Inter',
        },
        heroVariant: 'left-aligned',
        mood: 'Boardroom-ready. The aesthetic of a company that has earned trust through results, not vibes.',
      },
      {
        id: 'dir-startup',
        name: 'Revenue Engine',
        description:
          'Bold, energetic, and modern. Built for the ambitious VP Sales at a Series B company who wants to signal they\'re building for the future. Electric violet with a warm coral accent creates urgency without feeling desperate.',
        palette: {
          primary: '#5B21B6',
          primaryForeground: '#FFFFFF',
          accent: '#F97316',
          background: '#FFFFFF',
          foreground: '#0F172A',
          muted: '#F8F7FF',
          mutedForeground: '#64748B',
          border: '#E2E8F0',
        },
        typography: {
          heading: 'Sora',
          body: 'DM Sans',
        },
        heroVariant: 'centered',
        mood: 'Built different. The aesthetic of a company that moves fast and makes the competition nervous.',
      },
      {
        id: 'dir-technical',
        name: 'Signal & Data',
        description:
          'Minimal, precise, and information-dense. Built for the RevOps director who thinks in data models and wants to see that Clairo does too. Dark mode primary with surgical use of green signals precision and trust in numbers.',
        palette: {
          primary: '#18181B',
          primaryForeground: '#FFFFFF',
          accent: '#22C55E',
          background: '#FAFAF9',
          foreground: '#1C1917',
          muted: '#F5F5F4',
          mutedForeground: '#78716C',
          border: '#E7E5E4',
        },
        typography: {
          heading: 'JetBrains Mono',
          body: 'Inter',
        },
        heroVariant: 'split',
        mood: 'Precision tooling. The aesthetic of a product built by people who obsess over accuracy.',
      },
    ],
    selectedDirectionId: 'dir-enterprise',
    sectionOrder: [
      'hero',
      'logos',
      'problem',
      'features',
      'testimonials',
      'pricing',
      'faq',
      'cta',
    ],
    componentPicks: {
      hero: 'left-aligned',
      features: 'grid',
      testimonials: 'cards',
      pricing: 'two-tier',
    },
  }
}

export function mockQA(_context: BusinessContext): QAOutput {
  return {
    score: 88,
    issues: [
      {
        severity: 'warning',
        section: 'hero',
        message:
          'Primary headline is 10 words — at the mobile limit. Consider a shorter variant for small screens.',
        autoFixed: false,
      },
      {
        severity: 'warning',
        section: 'pricing',
        message:
          'No social proof near the pricing section. Adding a short testimonial or logo bar above pricing typically increases conversion by 12–18%.',
        autoFixed: false,
      },
      {
        severity: 'info',
        section: 'features',
        message:
          'Feature section has 5 items. Consider grouping into 3 primary + 2 secondary to reduce cognitive load.',
        autoFixed: false,
      },
      {
        severity: 'info',
        section: 'cta',
        message:
          'Bottom CTA mirrors hero CTA exactly. A different framing (e.g., addressing the hesitant reader) typically outperforms an identical repeat.',
        autoFixed: false,
      },
    ],
    suggestions: [
      'Add a data point or stat to the hero subheadline (e.g., "used by 340+ teams") for immediate social proof',
      'The problem section is strong — consider promoting it above the logo bar for emotional resonance before credibility',
      'Add a "How it works" section between Problem and Features to reduce perceived complexity',
      'Test a video testimonial or demo embed in the testimonials section',
    ],
    approved: true,
  }
}

export function mockSEO(context: BusinessContext): SEOOutput {
  return {
    pageTitle: `${context.productName} — AI Sales Forecasting for Mid-Market Revenue Teams`,
    metaDescription:
      'Clairo gives VP Sales and RevOps leaders 94% accurate sales forecasts — 3 weeks before close. Replace spreadsheet chaos with signal-based intelligence. Free trial.',
    h1: 'Know which deals will close — 3 weeks before your reps do',
    keywords: [
      'sales forecasting software',
      'revenue intelligence platform',
      'AI sales forecast',
      'deal risk detection',
      'CRM forecasting tool',
      'RevOps software',
      'pipeline management',
      'sales prediction AI',
    ],
    schemaType: 'SoftwareApplication',
    ogTitle: 'Know which deals will close — 3 weeks before your reps do | Clairo',
    ogDescription:
      'Clairo analyzes 140+ deal signals to give revenue leaders a forecast they can stake their quarter on. Join 340+ mid-market revenue teams.',
    focusKeyword: 'sales forecasting software',
    secondaryKeywords: [
      'AI revenue intelligence',
      'RevOps forecasting tool',
      'deal risk detection software',
      'sales pipeline analytics',
    ],
    schemaMarkup: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: context.productName,
      applicationCategory: 'BusinessApplication',
      description: 'AI-powered sales forecasting platform for mid-market revenue teams',
      url: context.ctaUrl,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'PriceSpecification',
          description: 'Contact for pricing',
        },
      },
      publisher: {
        '@type': 'Organization',
        name: context.companyName,
      },
    },
  }
}
