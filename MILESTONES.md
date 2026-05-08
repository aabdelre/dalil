# Dalil — Milestone Tracker

> Maintained by Claude Code. Updated on every task completion.
> Format: `- [x] Feature — shipped YYYY-MM-DD (commit SHA or PR #N)`
> Build strategy: demo-first. M0 is a fully navigable UI with mocks. Real backend layers in from M1 onward.

---

## M0 — UI Skeleton + Mock Layer
Status: `not started` | Target: Week 1

**Goal:** Demo-ready. Every screen navigable, every interaction has a response. No real backend needed.

- [ ] Next.js project scaffold (App Router, TypeScript, Tailwind)
- [ ] Mock API routes (`/app/api/...`) returning fixture JSON
- [ ] Fixture files: 10+ stories across industries, sizes, and statuses (`/mock/fixtures/`)
- [ ] Dev role toggle (switch between ae / csm / gtm_admin / customer_reviewer in UI)
- [ ] Screen: Story Library — grid, filters, search (client-side on mock data)
- [ ] Screen: Story Detail — full case study view, status badge, mock PDF download
- [ ] Screen: Log a Win form — all fields, mock submit → success → redirect
- [ ] Screen: Review Queue — grouped by status, GTM admin view
- [ ] Screen: Draft Viewer — rendered Markdown draft, inline edit, mock regenerate
- [ ] Screen: Customer Reviewer — read-only, approve/reject, mock success state
- [ ] Screen: Settings / Integrations — HubSpot mock OAuth, upload drag-and-drop with mock progress

---

## M1 — Backend Foundation
Status: `not started` | Target: Week 2–3

- [ ] Monorepo structure (Next.js frontend, NestJS backend, FastAPI service)
- [ ] PostgreSQL schema + migrations (Tenant, User, Story, CaseDraft, CRMConnection)
- [ ] Auth0 integration + RBAC roles (ae, csm, gtm_admin, customer_reviewer)
- [ ] AWS S3 bucket config + upload utility
- [ ] FastAPI service scaffold (health check, stub extraction endpoint)
- [ ] Docker Compose for local dev (all services)
- [ ] GitHub Actions CI pipeline (lint, type-check, test)
- [ ] Environment config + secrets management (`.env.example`)

---

## M2 — Real Ingest
Status: `not started` | Target: Week 4–6

- [ ] Manual entry form → real NestJS POST `/stories` → PostgreSQL
- [ ] Document upload → S3 storage + FastAPI text extraction
- [ ] GPT-4o parse: extracted text → structured story fields
- [ ] HubSpot OAuth connector (connect, callback, token storage)
- [ ] HubSpot closed-won deal pull (last 12 months → draft story cards)
- [ ] Daily HubSpot sync job (new closed-won → auto-create drafts)
- [ ] Swap frontend `API_BASE_URL` from mock routes to NestJS

---

## M3 — Real Generate
Status: `not started` | Target: Week 7–9

- [ ] Enrichment pipeline: impact quantification, quote extraction, ICP tagging (GPT-4o)
- [ ] Draft generation endpoint (template + persona → GPT-4o → Markdown)
- [ ] Story state machine enforced in NestJS (draft → internal_review → customer_review → approved)
- [ ] Real review queue: GTM admin inline edit, "send to customer" action
- [ ] Customer reviewer flow: Auth0-gated email link, approve/reject writing to DB
- [ ] Email send on customer review request (transactional email provider TBD)

---

## M4 — Real Activate
Status: `not started` | Target: Week 10–11

- [ ] Handlebars PDF templates (full case study + one-pager)
- [ ] Playwright PDF rendering service
- [ ] PDF stored in S3, shareable download link
- [ ] Story Library + Story Detail wired to real NestJS `/stories` endpoints
- [ ] Deal-close email nudge: HubSpot webhook → closed-won event → CSM email

---

## M5 — Harden
Status: `not started` | Target: Week 12

- [ ] RBAC enforcement audit (no cross-tenant data leakage)
- [ ] Customer reviewer isolation (scoped read-only to their own story)
- [ ] Error handling + retry logic (pipeline failures, GPT timeouts)
- [ ] Staging environment deploy (AWS ECS or EC2)
- [ ] Smoke test suite (critical user flows)
- [ ] GDPR/CCPA consent stub (data retention policy fields on Story model)

---

## Shipped

_Nothing shipped yet. First task will appear here._
