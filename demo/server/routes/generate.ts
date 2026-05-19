import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { generateCaseStudy } from '../generators/caseStudy.js'
import { generateOnePager } from '../generators/onePager.js'
import { generateEmail } from '../generators/email.js'
import { generateLinkedIn } from '../generators/linkedin.js'
import { generateQuoteCard } from '../generators/quoteCard.js'
import type { CollateralType, GenerateRequest } from '../types.js'

const outcomeSchema = z.object({
  metric: z.string().min(1),
  value: z.string().min(1),
  timeframe: z.string().optional(),
})

const quoteSchema = z.object({
  text: z.string().min(1),
  authorName: z.string().min(1),
  authorTitle: z.string().optional(),
})

const storySchema = z.object({
  companyName: z.string().min(1),
  industry: z.string().optional(),
  sizeSegment: z.enum(['smb', 'midmarket', 'enterprise']).optional(),
  challenge: z.string().min(1),
  outcomes: z.array(outcomeSchema).min(1).max(8),
  quote: quoteSchema.optional(),
  useCaseTags: z.array(z.string()).max(8).optional(),
})

const optionsSchema = z
  .object({
    tone: z.enum(['formal', 'conversational', 'punchy']).optional(),
    persona: z.enum(['cfo', 'cto', 'cmo', 'operator']).optional(),
    length: z.enum(['short', 'medium', 'long']).optional(),
  })
  .optional()

const requestSchema = z.object({
  story: storySchema,
  options: optionsSchema,
})

const generators: Record<
  CollateralType,
  (req: GenerateRequest) => Promise<unknown>
> = {
  'case-study': generateCaseStudy,
  'one-pager': generateOnePager,
  email: generateEmail,
  linkedin: generateLinkedIn,
  'quote-card': generateQuoteCard,
}

function isCollateralType(value: string): value is CollateralType {
  return value in generators
}

export const generateRouter = Router()

generateRouter.post(
  '/:type',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params
      if (!isCollateralType(type)) {
        res.status(404).json({ error: `Unknown collateral type: ${type}` })
        return
      }
      const parsed = requestSchema.safeParse(req.body)
      if (!parsed.success) {
        res
          .status(400)
          .json({ error: 'Invalid request body', issues: parsed.error.issues })
        return
      }
      const result = await generators[type](parsed.data)
      res.json(result)
    } catch (err) {
      next(err)
    }
  },
)
