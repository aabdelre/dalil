# Dalil — Milestone Tracker

> Maintained by Claude Code. Updated on every task completion.
> Format: `- [x] Feature — shipped YYYY-MM-DD (commit SHA or PR #N)`

---

## M0 — Scaffold
Status: `not started` | Target: Week 1–2

- [ ] Monorepo structure (Next.js frontend, NestJS backend, FastAPI service)
- [ ] Auth0 integration + RBAC roles (ae, csm, gtm_admin, customer_reviewer)
- [ ] PostgreSQL schema (Tenant, User, Story, CaseDraft, CRMConnection)
- [ ] AWS S3 bucket config + upload utility
- [ ] GitHub Actions CI pipeline (lint, type-check, test)
- [ ] Docker Compose for local dev (all services)
- [ ] Environment config + secrets management

---

## M1 — Ingest
Status: `not started` | Target: Week 3–5

- [ ] Manual "Log a Win" entry form (CSM/AE-facing)
- [ ] Story data model + PostgreSQL migrations
- [ ] Document upload (PDF, DOCX, PPTX → S3 + text extraction)
- [ ] Python/FastAPI extraction service (GPT-4o structured parse)
- [ ] HubSpot OAuth connector + closed-won deal sync
- [ ] Daily HubSpot sync job (new closed-won → draft story cards)

---

## M2 — Generate
Status: `not started` | Target: Week 6–8

- [ ] Enrichment pipeline (impact quantification, quote extraction, ICP tagging)
- [ ] Draft generation endpoint (template + persona → GPT-4o → Markdown)
- [ ] Case study templates (full, one-pager)
- [ ] Internal review queue UI (GTM admin)
- [ ] Customer reviewer flow (Auth0-gated email link, approve/reject)
- [ ] Story state machine (draft → internal_review → customer_review → approved)

---

## M3 — Activate
Status: `not started` | Target: Week 9–11

- [ ] Story library UI (grid view, filters, full-text search)
- [ ] Story detail view
- [ ] Handlebars PDF templates (full case study + one-pager)
- [ ] Playwright PDF rendering service
- [ ] PDF download + shareable S3 link
- [ ] Deal-close email nudge (HubSpot webhook → send CSM email with pre-filled form link)

---

## M4 — Harden
Status: `not started` | Target: Week 12

- [ ] RBAC enforcement audit (no cross-tenant data leakage)
- [ ] Customer reviewer isolation (read-only, scoped to their own story)
- [ ] Error handling + retry logic (pipeline failures)
- [ ] Staging environment deploy (AWS ECS or EC2)
- [ ] Smoke test suite
- [ ] GDPR/CCPA consent stub (data retention policy fields)

---

## Shipped

_Nothing shipped yet. First task will appear here._
