import { chatComplete } from '../llm/openai.js'
import { linkedinPrompt } from '../llm/prompts.js'
import { config } from '../config.js'
import type { GenerateRequest, LinkedInResponse } from '../types.js'

export async function generateLinkedIn(
  req: GenerateRequest,
): Promise<LinkedInResponse> {
  const { system, user } = linkedinPrompt(req.story, req.options)
  const text = await chatComplete({
    system,
    user,
    model: config.models.text,
    temperature: 0.75,
  })
  return { text: text.trim() }
}
