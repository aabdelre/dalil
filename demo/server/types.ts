export type SizeSegment = 'smb' | 'midmarket' | 'enterprise'

export type Tone = 'formal' | 'conversational' | 'punchy'
export type Persona = 'cfo' | 'cto' | 'cmo' | 'operator'
export type Length = 'short' | 'medium' | 'long'

export type Outcome = {
  metric: string
  value: string
  timeframe?: string
}

export type QuoteSource = {
  text: string
  authorName: string
  authorTitle?: string
}

export type StoryInput = {
  companyName: string
  industry?: string
  sizeSegment?: SizeSegment
  challenge: string
  outcomes: Outcome[]
  quote?: QuoteSource
  useCaseTags?: string[]
}

export type GenerateOptions = {
  tone?: Tone
  persona?: Persona
  length?: Length
}

export type GenerateRequest = {
  story: StoryInput
  options?: GenerateOptions
}

export type CollateralType =
  | 'case-study'
  | 'one-pager'
  | 'email'
  | 'linkedin'
  | 'quote-card'

export type CaseStudyResponse = { markdown: string }
export type OnePagerResponse = { markdown: string; pdfBase64: string }
export type EmailResponse = { subject: string; body: string }
export type LinkedInResponse = { text: string }
export type QuoteCardResponse = {
  quote: string
  attribution: string
  imageBase64: string
}

export type GenerateResponse =
  | CaseStudyResponse
  | OnePagerResponse
  | EmailResponse
  | LinkedInResponse
  | QuoteCardResponse
