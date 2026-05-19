import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type {
  CaseStudyResponse,
  CollateralType,
  EmailResponse,
  GenerateRequest,
  LinkedInResponse,
  OnePagerResponse,
  QuoteCardResponse,
} from '../server/types.js'

const PORT = process.env.PORT ?? '8787'
const BASE_URL = `http://localhost:${PORT}`

const FIXTURE: GenerateRequest = {
  story: {
    companyName: 'Acme Logistics',
    industry: 'Logistics',
    sizeSegment: 'enterprise',
    challenge:
      'Onboarding new freight customers took 11 weeks on average, gated by manual KYC reviews and contract redlines that bounced between legal, ops, and the customer.',
    outcomes: [
      {
        metric: 'Onboarding time',
        value: '11 weeks → 3 weeks',
        timeframe: '6 months after rollout',
      },
      { metric: 'KYC review backlog', value: '-82%', timeframe: 'Q2 2026' },
      { metric: 'Annual customers onboarded', value: '+140', timeframe: 'YoY' },
    ],
    quote: {
      text: "We compressed an 11-week ordeal into a 3-week handoff without adding headcount.",
      authorName: 'Priya Shah',
      authorTitle: 'VP Customer Ops',
    },
    useCaseTags: ['onboarding', 'kyc', 'enterprise'],
  },
  options: {
    tone: 'punchy',
    persona: 'operator',
    length: 'medium',
  },
}

const VALID_TYPES: CollateralType[] = [
  'case-study',
  'one-pager',
  'email',
  'linkedin',
  'quote-card',
]

function isType(value: string): value is CollateralType {
  return (VALID_TYPES as string[]).includes(value)
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${path}: ${text}`)
  }
  return JSON.parse(text) as T
}

async function run(type: CollateralType) {
  console.log(`\n=== ${type} ===`)
  const start = Date.now()
  switch (type) {
    case 'case-study': {
      const result = await postJson<CaseStudyResponse>(
        '/generate/case-study',
        FIXTURE,
      )
      console.log(result.markdown)
      break
    }
    case 'one-pager': {
      const result = await postJson<OnePagerResponse>(
        '/generate/one-pager',
        FIXTURE,
      )
      console.log('--- markdown ---')
      console.log(result.markdown)
      const outPath = join(tmpdir(), 'one-pager.pdf')
      await writeFile(outPath, Buffer.from(result.pdfBase64, 'base64'))
      console.log(`\nPDF saved to ${outPath}`)
      break
    }
    case 'email': {
      const result = await postJson<EmailResponse>('/generate/email', FIXTURE)
      console.log(`Subject: ${result.subject}\n\n${result.body}`)
      break
    }
    case 'linkedin': {
      const result = await postJson<LinkedInResponse>(
        '/generate/linkedin',
        FIXTURE,
      )
      console.log(result.text)
      break
    }
    case 'quote-card': {
      const result = await postJson<QuoteCardResponse>(
        '/generate/quote-card',
        FIXTURE,
      )
      console.log(`"${result.quote}"\n— ${result.attribution}`)
      const outPath = join(tmpdir(), 'quote-card.png')
      await writeFile(outPath, Buffer.from(result.imageBase64, 'base64'))
      console.log(`\nImage saved to ${outPath}`)
      break
    }
  }
  console.log(`\n(${type} took ${((Date.now() - start) / 1000).toFixed(1)}s)`)
}

async function main() {
  const arg = process.argv[2]
  if (!arg) {
    console.error(
      `Usage: npm run test:cli -- <type|all>\nTypes: ${VALID_TYPES.join(', ')}`,
    )
    process.exit(1)
  }
  const types: CollateralType[] = arg === 'all' ? VALID_TYPES : isType(arg) ? [arg] : []
  if (types.length === 0) {
    console.error(`Unknown type: ${arg}. Valid: ${VALID_TYPES.join(', ')}`)
    process.exit(1)
  }
  for (const t of types) {
    await run(t)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
