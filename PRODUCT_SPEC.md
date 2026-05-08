# Dalil — MVP Product Spec

**Version:** 0.2  
**Status:** Draft  
**Last updated:** 2026-05-07  
**Build strategy:** Demo-first — full UI skeleton with mock data, then real backend layered in per milestone.

---

## Problem

B2B sales teams have customer wins scattered across CRM notes, Slack threads, CS handoffs, and tribal memory. They either don't use these wins in deals (no awareness) or use them poorly (stale, unquantified, wrong audience). The result: longer sales cycles, smaller deals, and a content team constantly playing catch-up producing case studies nobody asked for at the wrong moment.

---

## Users

| Persona | Role | Core job to be done |
|---|---|---|
| **AE / Account Executive** | Closes deals | Find a relevant customer story fast, in the right format, for the right buyer |
| **CSM / Customer Success** | Owns post-sale | Log wins, capture impact metrics, flag customers worth featuring |
| **GTM / Sales Enablement** | Supports the field | Build and maintain the story library; ensure reps have what they need |
| **Reviewer (Customer)** | External approver | Review, edit, and approve their own case study before it goes live |

---

## Build Strategy: Demo-First

All features are built twice — first as a UI skeleton with mocked data, then with the real backend swapped in. The API contract is defined once (in the mock layer) and never changes shape, so the frontend requires zero rework when real services go live.

```
M0: UI Skeleton + Mocks      →    M1: Backend Foundation    →    M2–M4: Real Ingest / Generate / Activate
(demo-ready, all screens)         (real infra, no UI work)        (replace mocks one pillar at a time)
```

### Mock Layer Design
- **Next.js API routes** (`/app/api/...`) serve as mock endpoints during M0 — they return fixture JSON shaped to the real data model.
- **Fixture files** (`/mock/fixtures/*.json`) hold 10–15 pre-built stories across industries, sizes, and statuses so every screen looks populated.
- **Swap path:** when real NestJS backend is ready, the frontend's `API_BASE_URL` env var switches from local Next.js routes to the NestJS service. No frontend code changes needed.
- **No auth in M0:** a hardcoded mock user context (role switchable via a dev toggle) stands in for Auth0.

---

## MVP Scope

The MVP has three pillars. The UI for all three ships in M0 with mocks. Real implementations follow in M2–M4.

```
Pillar 1: Ingest         →    Pillar 2: Generate       →    Pillar 3: Activate
(get the data in)              (turn data into stories)       (put stories to work)
```

**In scope for MVP (full implementation):**
- GTM story library and case study viewer
- Manual data entry form (CSM/AE-facing)
- One CRM connector (HubSpot — Salesforce in v1.1)
- Document upload (PDF, DOCX, PPTX)
- OpenAI GPT-4o draft generation pipeline
- Human review + approve flow (internal + customer-facing)
- PDF export of approved case studies
- Auth0 login with RBAC (AE, CSM, GTM admin, reviewer)
- GTM nudge: email prompt to CSM at deal close

**Out of scope for MVP:**
- Web scraping / G2 / LinkedIn ingestion
- Audio / video transcription
- Highspot / Zapier sync
- Salesforce connector (v1.1)
- Advanced analytics dashboard
- Full GDPR/CCPA consent flow (stub it, implement post-MVP)
- Multi-language case studies

---

## M0 — UI Skeleton + Mock Layer (Demo Target)

**Goal:** A fully navigable, demo-ready app. Every screen works, every interaction has a response. No real backend required.

### Screens to Build

#### 1. Story Library (`/stories`)
The primary GTM interface — a searchable, filterable grid of story cards.

- Story card: company logo placeholder, company name, industry tag, size badge, headline metric (e.g. "40% faster onboarding"), status badge (Approved / In Review / Draft)
- Filters panel: Industry, Company size, Use case, Deal stage, Status
- Full-text search bar (filters mock data client-side)
- "Log a Win" CTA button → opens form

#### 2. Story Detail (`/stories/[id]`)
Full case study view for a single story.

- Company header, challenge section, solution section, results section (metric cards), pull quote, champion attribution
- Status badge + action button (varies by role: "Generate Draft" / "Send for Review" / "Approve" / "Download PDF")
- Internal notes panel (GTM admin only)
- Mock "Download PDF" → opens a static sample PDF in a new tab

#### 3. Log a Win Form (`/stories/new`)
Manual entry form for CSMs and AEs.

Fields: company name, industry, company size, product(s) used, use case, challenge (free text), outcomes (repeatable: metric + value + timeframe), key quote, champion name + title, internal notes.

- Submit → mock POST → success toast → redirect to new story detail (pre-populated from form data)

#### 4. Review Queue (`/review`)
GTM admin view of all stories not yet approved.

- List grouped by status: "Needs Draft" / "Internal Review" / "Awaiting Customer"
- Each row: company name, source badge (Manual / HubSpot / Upload), date created, assigned CSM, action button
- Clicking a row → Story Detail view with admin actions visible

#### 5. Draft Viewer (`/stories/[id]/draft`)
Generated case study draft for internal review before customer sees it.

- Rendered Markdown → styled sections (headline, challenge, solution, results, quote, CTA)
- Inline edit mode (textarea per section)
- Action buttons: "Send to Customer" / "Regenerate" / "Save edits"
- Mock regenerate → swaps in a second fixture draft after a 1.5s loading state

#### 6. Customer Reviewer (`/review/[token]`)
Simplified external-facing view (no nav, no internal UI).

- Read-only case study view
- Inline comment input per section
- Approve / Request Changes buttons
- Mock approve → success screen ("Thank you — your story will be published shortly")

#### 7. Integrations / Settings (`/settings/integrations`)
- HubSpot card: "Connect" button → mock OAuth flow (redirect to a mock callback that immediately returns success + shows connected state)
- Salesforce card: "Coming soon" badge
- Upload section: drag-and-drop zone → mock upload → progress bar → success state showing extracted story card

### Mock Data Fixtures (10 stories minimum)

Stories should span:
- Industries: FinTech, HealthTech, SaaS, Logistics, EdTech
- Sizes: SMB, Mid-market, Enterprise
- Statuses: 3 approved, 2 in customer review, 2 in internal review, 3 as drafts
- Sources: manual, HubSpot, upload (mix)

---

## Pillar 1 — Data Ingestion (Real — M2)

**Goal:** Get customer data into Dalil from wherever it already lives.

### 1A. Manual Entry Form
Same form as M0 — swap mock POST for real NestJS endpoint writing to PostgreSQL.

### 1B. Document Upload
Drag-and-drop upload of PDFs, DOCX, PPTX → S3. Python/FastAPI extracts text, GPT-4o parses into structured story fields, populates a draft story card.

**Supported formats:** PDF, DOCX, PPTX  
**Storage:** AWS S3 (raw file) + PostgreSQL (extracted structured fields)

### 1C. HubSpot Connector
OAuth connection. On connect: pull closed-won deals from last 12 months, map fields → story model, create draft story cards. Daily sync job for new closed-won deals.

**Field mapping:**
| HubSpot field | Dalil field |
|---|---|
| Company name | `company.name` |
| Industry | `company.industry` |
| Close date | `story.close_date` |
| Amount | `story.arr` |
| Deal owner | `story.ae_owner` |
| Associated contact | `story.champion` |

---

## Pillar 2 — Data Generation Pipeline (Real — M3)

**Goal:** Turn raw ingested data into structured insights and polished draft case studies.

### 2A. Extraction & Enrichment
Python/FastAPI + GPT-4o extraction pass on every new story:
1. **Impact quantification** — free text metrics → `{metric, value, unit, timeframe}`
2. **Quote extraction** — surface the best quotable sentence
3. **Use case classification** — tag (onboarding, retention, expansion, competitive win)
4. **ICP tagging** — classify size, vertical, buyer persona

### 2B. Draft Generation
NestJS backend → Python/FastAPI → GPT-4o with:
- Enriched story data
- Template (full case study / one-pager)
- Target buyer persona
- Output: Markdown draft (headline, challenge, solution, results, quote, CTA)

### 2C. Human Review Queue (Real)
State machine: `draft → internal_review → customer_review → approved → published`
- GTM admin edits inline, marks "ready for customer"
- Auth0-authenticated email link to customer reviewer view
- Approval triggers PDF generation

---

## Pillar 3 — GTM Activation (Real — M4)

**Goal:** Make approved stories easy to find and use at the right moment in the sales process.

### 3A. Story Library (Real data, same UI)
Swap mock API → real NestJS `/stories` endpoint with PostgreSQL queries, real filters, real search.

### 3B. PDF Export
Handlebars templates + Playwright PDF rendering. PDFs stored in S3, downloadable with shareable link.

**Templates:**
- Full case study (2-page)
- One-pager (single page, metric-heavy)

### 3C. Deal-Close Email Nudge
HubSpot webhook → closed-won event → email to CSM:
> "Congrats on closing [Company]. Now's the perfect time to capture their story while it's fresh. [Log their win →]"
Pre-filled form link with company + AE info populated.

---

## Data Model (Core Entities)

Defined once, used by both mock fixtures and real database.

```
Tenant
  └── Users (roles: ae, csm, gtm_admin, customer_reviewer)

Story
  ├── id, tenant_id
  ├── company_name, industry, size_segment
  ├── challenge (text)
  ├── outcomes[] { metric, value, unit, timeframe }
  ├── quote { text, author_name, author_title }
  ├── use_case_tags[]
  ├── icp_tags[]
  ├── status (draft | internal_review | customer_review | approved | published)
  ├── source (manual | upload | hubspot | salesforce)
  └── documents[] → S3 references

CaseDraft
  ├── story_id (FK)
  ├── template (full | one_pager | quote_card)
  ├── target_persona
  ├── content_markdown
  ├── version
  └── review_comments[]

CRMConnection
  ├── tenant_id
  ├── provider (hubspot | salesforce)
  ├── oauth_token (encrypted)
  └── last_sync_at
```

---

## User Flows

### Flow 1: CSM logs a win manually
1. CSM receives deal-close email nudge
2. Clicks link → lands on pre-filled "Log a Win" form
3. Fills in challenge, outcomes, quote → submits
4. Story enters `draft` state, enrichment pipeline runs
5. GTM admin notified → reviews enriched card → generates draft
6. Draft sent to customer for approval
7. Customer approves → PDF generated → story appears in library

### Flow 2: AE finds a story for a live deal
1. AE opens Dalil during deal prep
2. Filters: industry = FinTech, size = Enterprise, use case = onboarding
3. Finds 2 matching approved stories
4. Downloads one-pager PDF, shares with prospect

### Flow 3: GTM admin ingests existing assets
1. Admin uploads folder of old PDFs
2. Python service extracts + structures each file
3. Admin reviews extracted story cards, corrects fields, marks "enrichment complete"
4. Triggers draft generation for top 5 stories
5. Stories enter review queue

---

## Success Metrics (MVP)

| Metric | Target at 60 days post-launch |
|---|---|
| Stories created (any source) | ≥ 50 |
| Stories reaching `approved` state | ≥ 20 |
| AE story library sessions/week | ≥ 3 per active AE |
| Deal-close nudge → form completion rate | ≥ 30% |
| Time from story creation to approved PDF | < 48 hours |

---

## Milestones & Build Order

| Milestone | Scope | Target |
|---|---|---|
| **M0 — UI Skeleton + Mocks** | Full Next.js app, all 7 screens, fixture data, mock API routes, dev role toggle | Week 1 |
| **M1 — Backend Foundation** | NestJS scaffold, PostgreSQL schema + migrations, Auth0, FastAPI scaffold, Docker Compose, GitHub Actions CI | Week 2–3 |
| **M2 — Real Ingest** | Manual form → real DB, document upload → S3 + extraction, HubSpot connector + sync job | Week 4–6 |
| **M3 — Real Generate** | Enrichment pipeline, GPT-4o draft generation, real review queue + customer approval flow | Week 7–9 |
| **M4 — Real Activate** | Handlebars + Playwright PDF, S3 shareable links, deal-close email nudge | Week 10–11 |
| **M5 — Harden** | RBAC audit, error handling + retries, staging deploy (AWS ECS), GDPR stub | Week 12 |

---

## Open Questions

- [ ] Will customers self-serve into Dalil, or is all review done via emailed link?
- [ ] Do we need multi-tenant isolation from day one, or is the first customer a single tenant?
- [ ] Who owns the writing style guide that feeds the GPT system prompt?
- [ ] Is HubSpot the right first CRM, or does the first customer use Salesforce?
- [ ] What does "published" mean — is there a public URL, or just internal + PDF?
