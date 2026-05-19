export type BackendCollateralType =
  | 'case-study'
  | 'one-pager'
  | 'email'
  | 'linkedin'
  | 'quote-card'

export type Outcome = {
  metric: string
  value: string
  timeframe?: string
}

export type StoryInput = {
  companyName: string
  industry?: string
  sizeSegment?: 'smb' | 'midmarket' | 'enterprise'
  challenge: string
  outcomes: Outcome[]
  quote?: { text: string; authorName: string; authorTitle?: string }
  useCaseTags?: string[]
}

export type GenerateOptions = {
  tone?: 'formal' | 'conversational' | 'punchy'
  persona?: 'cfo' | 'cto' | 'cmo' | 'operator'
  length?: 'short' | 'medium' | 'long'
}

export type GenerateRequest = {
  story: StoryInput
  options?: GenerateOptions
}

export type CaseStudyResponse = { markdown: string }
export type OnePagerResponse = { markdown: string; pdfBase64: string }
export type EmailResponse = { subject: string; body: string }
export type LinkedInResponse = { text: string }
export type QuoteCardResponse = {
  quote: string
  attribution: string
  imageBase64: string
}

export type GenerateResult =
  | { type: 'case-study'; data: CaseStudyResponse }
  | { type: 'one-pager'; data: OnePagerResponse }
  | { type: 'email'; data: EmailResponse }
  | { type: 'linkedin'; data: LinkedInResponse }
  | { type: 'quote-card'; data: QuoteCardResponse }

export function inferBackendType(input: string): BackendCollateralType {
  const lower = input.toLowerCase()
  if (/\bquote\b|\bquote card\b/.test(lower)) return 'quote-card'
  if (/\blinkedin\b|\bsocial\b|\bpost\b/.test(lower)) return 'linkedin'
  if (/\bemail\b|\boutreach\b|\bsequence\b/.test(lower)) return 'email'
  if (/\bone[- ]?pager\b|\bsales sheet\b/.test(lower)) return 'one-pager'
  return 'case-study'
}

const TYPE_LABEL: Record<BackendCollateralType, string> = {
  'case-study': 'Case study draft',
  'one-pager': 'Sales one-pager',
  email: 'Email outreach',
  linkedin: 'Marketing post',
  'quote-card': 'Quote card',
}

const TYPE_AUDIENCE: Record<BackendCollateralType, string> = {
  'case-study': 'Sales',
  'one-pager': 'Sales',
  email: 'Sales',
  linkedin: 'Marketing',
  'quote-card': 'Marketing',
}

const TYPE_CHANNEL: Record<BackendCollateralType, string> = {
  'case-study': 'Sales deck',
  'one-pager': 'Sales deck',
  email: 'Email',
  linkedin: 'LinkedIn',
  'quote-card': 'Social',
}

export function uiTypeLabel(type: BackendCollateralType): string {
  return TYPE_LABEL[type]
}

export function uiAudience(type: BackendCollateralType): string {
  return TYPE_AUDIENCE[type]
}

export function uiChannel(type: BackendCollateralType): string {
  return TYPE_CHANNEL[type]
}

export async function generateCollateral(
  type: BackendCollateralType,
  request: GenerateRequest,
): Promise<GenerateResult> {
  const res = await fetch(`/api/generate/${type}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
  })
  const text = await res.text()
  if (!res.ok) {
    let message = `Generation failed (${res.status})`
    try {
      const parsed = JSON.parse(text) as { error?: string }
      if (parsed.error) message = parsed.error
    } catch {
      // fall through with default message
    }
    throw new Error(message)
  }
  const data = JSON.parse(text)
  return { type, data } as GenerateResult
}

export function summarizeResult(result: GenerateResult): string {
  switch (result.type) {
    case 'case-study': {
      const firstParagraph = result.data.markdown
        .split('\n')
        .filter((line) => line.trim() && !line.startsWith('#'))
        .slice(0, 2)
        .join(' ')
      return firstParagraph.slice(0, 320)
    }
    case 'one-pager': {
      const firstParagraph = result.data.markdown
        .split('\n')
        .filter((line) => line.trim() && !line.startsWith('#'))
        .slice(0, 2)
        .join(' ')
      return firstParagraph.slice(0, 320)
    }
    case 'email':
      return `${result.data.subject} — ${result.data.body.slice(0, 220)}`
    case 'linkedin':
      return result.data.text.slice(0, 320)
    case 'quote-card':
      return `"${result.data.quote}" — ${result.data.attribution}`
  }
}
