import 'dotenv/config'

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

export const config = {
  openaiApiKey: required('OPENAI_API_KEY'),
  port: Number(process.env.PORT ?? 8787),
  models: {
    text: process.env.OPENAI_TEXT_MODEL ?? 'gpt-4o',
    textFast: process.env.OPENAI_TEXT_MODEL_FAST ?? 'gpt-4o-mini',
    image: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1',
  },
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
}
