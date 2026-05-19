import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Handlebars from 'handlebars'
import { chatComplete } from '../llm/openai.js'
import { onePagerPrompt } from '../llm/prompts.js'
import { config } from '../config.js'
import { renderToPdf } from '../pdf/render.js'
import type { GenerateRequest, OnePagerResponse, StoryInput } from '../types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const templatePath = join(__dirname, '..', 'pdf', 'templates', 'one-pager.hbs')

let compiledTemplate: HandlebarsTemplateDelegate | null = null

async function getTemplate(): Promise<HandlebarsTemplateDelegate> {
  if (!compiledTemplate) {
    const source = await readFile(templatePath, 'utf8')
    compiledTemplate = Handlebars.compile(source)
  }
  return compiledTemplate
}

function pickHeadline(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : fallback
}

function markdownBodyToHtml(markdown: string): string {
  const stripped = markdown
    .split('\n')
    .filter((line) => !/^#\s+/.test(line))
    .join('\n')
    .trim()
  return stripped
    .split(/\n{2,}/)
    .map((block) => {
      if (/^>\s+/.test(block)) {
        return ''
      }
      if (/^[-*]\s+/m.test(block)) {
        const items = block
          .split('\n')
          .map((line) => line.replace(/^[-*]\s+/, '').trim())
          .filter(Boolean)
          .map((line) => `<li>${escapeHtml(line)}</li>`)
          .join('')
        return `<ul>${items}</ul>`
      }
      if (/^##\s+/.test(block)) {
        const heading = block.replace(/^##\s+/, '').trim()
        return `<h3>${escapeHtml(heading)}</h3>`
      }
      return `<p>${escapeHtml(block)}</p>`
    })
    .filter(Boolean)
    .join('\n')
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function templateContext(story: StoryInput, markdown: string) {
  const outcomes = story.outcomes.slice(0, 4)
  return {
    companyName: story.companyName,
    industry: story.industry ?? '',
    sizeSegment: story.sizeSegment ?? '',
    useCases: story.useCaseTags?.join(' · ') ?? '',
    headline: pickHeadline(markdown, `${story.companyName} customer story`),
    outcomes,
    metricColumns: Math.max(1, Math.min(outcomes.length, 4)),
    bodyHtml: markdownBodyToHtml(markdown),
    quote: story.quote,
  }
}

export async function generateOnePager(
  req: GenerateRequest,
): Promise<OnePagerResponse> {
  const { system, user } = onePagerPrompt(req.story, req.options)
  const markdown = await chatComplete({
    system,
    user,
    model: config.models.text,
    temperature: 0.6,
  })
  const template = await getTemplate()
  const html = template(templateContext(req.story, markdown))
  const pdf = await renderToPdf(html)
  return { markdown: markdown.trim(), pdfBase64: pdf.toString('base64') }
}
