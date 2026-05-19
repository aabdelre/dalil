import type { GenerateOptions, StoryInput } from '../types.js'

const STYLE_GUIDE = `You write B2B sales collateral for Dalil. Rules:
- Lead with evidence. Every claim must reference a metric, quote, or outcome from the story.
- No marketing fluff. Avoid "revolutionize", "synergy", "unlock", "best-in-class".
- Use plain, concrete language. Active voice. Short sentences.
- Never invent metrics, quotes, or facts not present in the input story.
- Match the requested tone, persona, and length precisely.`

function storyBlock(story: StoryInput, options?: GenerateOptions): string {
  const lines = [
    `Company: ${story.companyName}`,
    story.industry ? `Industry: ${story.industry}` : null,
    story.sizeSegment ? `Segment: ${story.sizeSegment}` : null,
    `Challenge: ${story.challenge}`,
    'Outcomes:',
    ...story.outcomes.map(
      (outcome) =>
        `  - ${outcome.metric}: ${outcome.value}${outcome.timeframe ? ` (${outcome.timeframe})` : ''}`,
    ),
  ]
  if (story.quote) {
    lines.push(
      `Customer quote: "${story.quote.text}" — ${story.quote.authorName}${
        story.quote.authorTitle ? `, ${story.quote.authorTitle}` : ''
      }`,
    )
  }
  if (story.useCaseTags?.length) {
    lines.push(`Use case tags: ${story.useCaseTags.join(', ')}`)
  }
  if (options?.tone) lines.push(`Tone: ${options.tone}`)
  if (options?.persona) lines.push(`Target persona: ${options.persona}`)
  if (options?.length) lines.push(`Length: ${options.length}`)
  return lines.filter(Boolean).join('\n')
}

export function caseStudyPrompt(story: StoryInput, options?: GenerateOptions) {
  return {
    system: `${STYLE_GUIDE}\n\nProduce a full case study in Markdown with these sections in order: # Headline, ## Challenge, ## Solution, ## Results (with a metric list), ## Customer Quote, ## Why It Matters.`,
    user: `Draft a full case study from this story:\n\n${storyBlock(story, options)}`,
  }
}

export function onePagerPrompt(story: StoryInput, options?: GenerateOptions) {
  return {
    system: `${STYLE_GUIDE}\n\nProduce a one-pager in Markdown. Required structure:\n# <Headline>\n## At a glance\n- Industry, segment, use case (one line)\n## The challenge\n<2-3 sentences>\n## The outcome\n<3-5 bullet points pairing metric and result>\n## In their words\n> <pull quote with attribution>\n## Why they chose us\n<1 short paragraph>`,
    user: `Draft a one-pager for ${story.companyName} from this story:\n\n${storyBlock(story, options)}`,
  }
}

export function emailPrompt(story: StoryInput, options?: GenerateOptions) {
  return {
    system: `${STYLE_GUIDE}\n\nProduce a short sales outreach email that references the customer story. Output strict JSON: {"subject": string, "body": string}. Body must be 4-6 lines, plain text, no signature.`,
    user: `Draft an outreach email referencing this story:\n\n${storyBlock(story, options)}`,
  }
}

export function linkedinPrompt(story: StoryInput, options?: GenerateOptions) {
  return {
    system: `${STYLE_GUIDE}\n\nProduce a LinkedIn post (200-350 words). Start with a hook line. End with a concrete takeaway. Output plain text only, no Markdown headers, no hashtags spam (max 3 hashtags).`,
    user: `Draft a LinkedIn post about this customer win:\n\n${storyBlock(story, options)}`,
  }
}

export function quoteCardTextPrompt(story: StoryInput) {
  return {
    system: `${STYLE_GUIDE}\n\nGiven a story, pick the single strongest quotable sentence and a 1-line visual prompt for a quote card. Output strict JSON: {"quote": string, "attribution": string, "imagePrompt": string}. The quote must come from the story's customer quote (if present); otherwise synthesize a faithful paraphrase grounded in the outcomes. The imagePrompt is a short description of a clean, modern, brand-safe abstract background suitable for the quote card (no people, no text in the image).`,
    user: `Pick a quote and image prompt for:\n\n${storyBlock(story)}`,
  }
}
