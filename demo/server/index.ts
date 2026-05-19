import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from 'express'
import cors from 'cors'
import { config } from './config.js'
import { generateRouter } from './routes/generate.js'

const app = express()

app.use(cors({ origin: config.corsOrigin }))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true })
})

app.use('/generate', generateRouter)

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[server] error:', err)
  const message =
    err instanceof Error ? err.message : 'Internal server error'
  const sanitized = message.replace(/sk-[A-Za-z0-9_-]+/g, 'sk-***')
  res.status(500).json({ error: sanitized })
}
app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`[server] listening on http://localhost:${config.port}`)
})
