import OpenAI from 'openai'
import { config } from '../config.js'

const client = new OpenAI({ apiKey: config.openaiApiKey })

export type ChatArgs = {
  system: string
  user: string
  model?: string
  json?: boolean
  temperature?: number
}

export async function chatComplete({
  system,
  user,
  model,
  json = false,
  temperature = 0.7,
}: ChatArgs): Promise<string> {
  const completion = await client.chat.completions.create({
    model: model ?? config.models.text,
    temperature,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    ...(json ? { response_format: { type: 'json_object' as const } } : {}),
  })
  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI returned empty completion')
  }
  return content
}

export type ImageArgs = {
  prompt: string
  size?: '1024x1024' | '1024x1536' | '1536x1024'
}

export async function generateImage({
  prompt,
  size = '1024x1024',
}: ImageArgs): Promise<string> {
  const response = await client.images.generate({
    model: config.models.image,
    prompt,
    size,
    n: 1,
  })
  const b64 = response.data?.[0]?.b64_json
  if (!b64) {
    throw new Error('OpenAI image API returned no image data')
  }
  return b64
}
