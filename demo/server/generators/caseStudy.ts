import { chatComplete } from '../llm/openai.js'
import { caseStudyPrompt } from '../llm/prompts.js'
import { config } from '../config.js'
import type { CaseStudyResponse, GenerateRequest } from '../types.js'

export async function generateCaseStudy(
  req: GenerateRequest,
): Promise<CaseStudyResponse> {
  const { system, user } = caseStudyPrompt(req.story, req.options)
  const markdown = await chatComplete({
    system,
    user,
    model: config.models.text,
    temperature: 0.6,
  })
  return { markdown: markdown.trim() }
}
