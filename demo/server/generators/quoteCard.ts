import { chatComplete, generateImage } from '../llm/openai.js'
import { quoteCardTextPrompt } from '../llm/prompts.js'
import { config } from '../config.js'
import type { GenerateRequest, QuoteCardResponse } from '../types.js'

type PickedQuote = {
  quote: string
  attribution: string
  imagePrompt: string
}

export async function generateQuoteCard(
  req: GenerateRequest,
): Promise<QuoteCardResponse> {
  const { system, user } = quoteCardTextPrompt(req.story)
  const raw = await chatComplete({
    system,
    user,
    model: config.models.textFast,
    json: true,
    temperature: 0.5,
  })
  const picked = JSON.parse(raw) as Partial<PickedQuote>
  if (!picked.quote || !picked.attribution || !picked.imagePrompt) {
    throw new Error('Quote card text step returned malformed JSON')
  }
  const imageBase64 = await generateImage({
    prompt: `${picked.imagePrompt}. Minimal, modern, brand-safe abstract background. No people. No legible text. Soft gradients. Square composition.`,
    size: '1024x1024',
  })
  return {
    quote: picked.quote.trim(),
    attribution: picked.attribution.trim(),
    imageBase64,
  }
}
