/**
 * Server-side utility for fetching competitor URLs and extracting readable text.
 * Used by the Research Agent API route to provide live page context.
 */

const URL_REGEX = /https?:\/\/[^\s"'<>)\]]+/gi
const MAX_CHARS_PER_PAGE = 8000
const FETCH_TIMEOUT_MS = 10000

/** Extract all http/https URLs from a string */
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) ?? []
  // Deduplicate and remove trailing punctuation
  return [...new Set(matches.map((u) => u.replace(/[.,;:!?]+$/, '')))]
}

/** Strip HTML tags and collapse whitespace to extract readable text */
function stripHtml(html: string): string {
  return html
    // Remove script and style blocks entirely
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    // Remove all remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

export interface FetchedPage {
  url: string
  title: string
  content: string
  error?: string
}

/** Fetch a URL and return its text content (server-side only) */
export async function fetchPageContent(url: string): Promise<FetchedPage> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PageForge/1.0; +https://pageforge.ai)',
        Accept: 'text/html,application/xhtml+xml',
      },
    })
    clearTimeout(timer)

    if (!response.ok) {
      return { url, title: url, content: '', error: `HTTP ${response.status}` }
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return { url, title: url, content: '', error: 'Non-HTML content type' }
    }

    const html = await response.text()
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : url

    const text = stripHtml(html).slice(0, MAX_CHARS_PER_PAGE)

    return { url, title, content: text }
  } catch (err) {
    clearTimeout(timer)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { url, title: url, content: '', error: message }
  }
}

/** Fetch multiple URLs in parallel and return results */
export async function fetchPages(urls: string[]): Promise<FetchedPage[]> {
  return Promise.all(urls.map(fetchPageContent))
}

/** Format fetched pages into a string block for LLM context */
export function formatPagesForPrompt(pages: FetchedPage[]): string {
  const successful = pages.filter((p) => p.content && !p.error)
  if (successful.length === 0) return ''

  const blocks = successful.map((p) =>
    `=== ${p.title} (${p.url}) ===\n${p.content}`
  )

  return `## Live Competitor Page Content\n\n${blocks.join('\n\n')}`
}
