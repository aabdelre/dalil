import { chatComplete } from '../llm/openai.js'
import { emailPrompt } from '../llm/prompts.js'
import { config } from '../config.js'
import type { EmailResponse, GenerateRequest } from '../types.js'

export async function generateEmail(
  req: GenerateRequest,
): Promise<EmailResponse> {
  const { system, user } = emailPrompt(req.story, req.options)
  const raw = await chatComplete({
    system,
    user,
    model: config.models.textFast,
    json: true,
    temperature: 0.65,
  })
  const parsed = JSON.parse(raw) as Partial<EmailResponse>
  if (!parsed.subject || !parsed.body) {
    throw new Error('Email generator returned malformed JSON')
  }
  return { subject: parsed.subject.trim(), body: parsed.body.trim() }
}
