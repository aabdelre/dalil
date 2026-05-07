# Dalil — MVP Product Spec

**Version:** 0.1  
**Status:** Draft  
**Last updated:** 2026-05-07

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

## MVP Scope

The MVP has three pillars. They ship in order — each unlocks the next.

```
Pillar 1: Ingest         →    Pillar 2: Generate       →    Pillar 3: Activate
(get the data in)              (turn data into stories)       (put stories to work)
```

**In scope for MVP:**
- GTM story library and case study viewer
- Manual data entry form (CSM/AE-facing)
- One CRM connector (HubSpot — ship Salesforce in v1.1)
- Document upload (PDF, DOCX, PPTX)
- OpenAI-powered draft generation pipeline
- Human review + approve flow (internal + customer-facing)
- PDF export of approved case studies
- Auth0 login with role-based access (AE, CSM, GTM admin, reviewer)
- GTM nudge: email prompt to CSM at deal close to capture the win

**Out of scope for MVP:**
- Web scraping / G2 / LinkedIn ingestion
- Audio / video transcription
- Highspot / Zapier sync
- Salesforce connector (v1.1)
- Advanced analytics dashboard
- Full GDPR/CCPA consent flow (stub it, implement post-MVP)
- Multi-language case studies

---

## Pillar 1 — Data Ingestion

**Goal:** Get customer data into Dalil from wherever it already lives.

### 1A. Manual Entry Form (ship first)
A structured form for CSMs and AEs to log a customer win directly.

**Fields:**
- Company name, industry, company size
- Product(s) used, use case
- Challenge before Dalil (free text)
- Outcome / impact (structured: metric type, value, timeframe — e.g. "40% reduction in onboarding time over 3 months")
- Key quote from customer (optional)
- Champion name + title (for attribution)
- Internal notes (not shown to customer)
- Approval status: draft / pending customer review / approved

**Why manual first:** fastest to ship, forces us to define the data model before building connectors.

### 1B. Document Upload
Drag-and-drop upload of existing case study PDFs, DOCX, or PPTX files. The Python/FastAPI service extracts text, runs it through GPT to parse into the structured data model (company, outcome, quote, etc.), and populates a draft story card for review.

**Supported formats:** PDF, DOCX, PPTX  
**Storage:** AWS S3 (raw file) + PostgreSQL (extracted structured fields)

### 1C. HubSpot Connector (MVP CRM)
OAuth connection to a HubSpot account. On connect:
- Pull closed-won deals from the last 12 months
- Map deal fields → Dalil story fields (company, ARR, close date, industry)
- Create draft story cards for each deal, flagged "needs enrichment"
- Sync on a daily schedule (new closed-won deals auto-create drafts)

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

## Pillar 2 — Data Generation Pipeline

**Goal:** Turn raw ingested data into structured insights and polished draft case studies.

### 2A. Extraction & Enrichment
When a new story is created (manual, upload, or CRM sync), the Python service runs a GPT-4o extraction pass:

1. **Impact quantification** — identify any metrics in free text ("saved 10 hours a week" → `{metric: "time_saved", value: 10, unit: "hours/week"}`)
2. **Quote extraction** — surface the best quotable sentence from raw notes
3. **Use case classification** — tag the story (onboarding, retention, expansion, competitive win, etc.)
4. **ICP tagging** — classify company size, vertical, and buyer persona from available fields

Output: an enriched story card with structured fields, ready for draft generation.

### 2B. Draft Generation
Triggered manually by a GTM admin or CSM, or automatically when a story is marked "enrichment complete."

The NestJS backend calls the Python/FastAPI service with:
- The enriched story data
- A template selection (format: full case study / one-pager / quote card)
- Target buyer persona (economic buyer / technical buyer / end user)

The Python service calls GPT-4o with a structured prompt:
- System prompt: Dalil's writing style guide + case study structure
- User prompt: structured story data + template + persona
- Output: Markdown draft with sections (headline, challenge, solution, results, quote, CTA)

Draft stored in PostgreSQL, rendered to the review UI.

### 2C. Human Review Queue
Internal review step before any draft reaches the customer.

**States:** `draft → internal_review → customer_review → approved → published`

- GTM admin reviews draft, edits inline, marks "ready for customer"
- System sends customer reviewer an email (Auth0-authenticated link) to a read-only view with inline comment + approve/reject controls
- On approval: story moves to `approved`, PDF generation is triggered
- On rejection/edits: story returns to `internal_review` with comments

---

## Pillar 3 — GTM Activation

**Goal:** Make approved stories easy to find and use at the right moment in the sales process.

### 3A. Story Library (GTM Interface)
The primary interface for AEs and GTM teams.

**Views:**
- **Grid view** — story cards with company logo, industry tag, headline metric, and status badge
- **Detail view** — full case study with all sections, export options, and approval status

**Filters:**
- Industry / vertical
- Company size (SMB / Mid-market / Enterprise)
- Use case tag
- Product area
- Deal stage relevance (awareness / evaluation / decision)
- Status (approved / pending / draft)

**Search:** full-text search across company name, use case, outcomes, and quotes.

### 3B. PDF Export
Approved case studies render to a polished PDF via Handlebars template + Playwright.

**Templates for MVP:**
- Full case study (2-page PDF)
- One-pager (single page, metric-heavy)

PDFs stored in S3, downloadable from the story detail view with a shareable link.

### 3C. GTM Nudge — Deal Close Trigger
When a deal is marked closed-won in HubSpot, Dalil sends the deal owner's CSM an email:

> "Congrats on closing [Company]. Now's the perfect time to capture their story while it's fresh. [Log their win →]"

The link drops them directly into a pre-filled manual entry form with company + AE info already populated.

**Why email for MVP:** lowest integration surface area. Slack and in-CRM prompts are v1.1.

---

## Data Model (Core Entities)

```
Tenant
  └── Users (roles: ae, csm, gtm_admin, customer_reviewer)

Story
  ├── company_name, industry, size_segment
  ├── challenge (text)
  ├── outcomes[] { metric, value, unit, timeframe }
  ├── quote { text, author_name, author_title }
  ├── use_case_tags[]
  ├── icp_tags[]
  ├── status (draft | internal_review | customer_review | approved | published)
  ├── source (manual | upload | hubspot | salesforce)
  └── Documents[] → S3 references

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
4. Story enters `draft` state, enrichment pipeline runs automatically
5. GTM admin notified → reviews enriched card → generates draft
6. Draft sent to customer for approval
7. Customer approves → PDF generated → story appears in library

### Flow 2: AE finds a story for a live deal
1. AE opens Dalil during deal prep
2. Filters by: industry = FinTech, size = Enterprise, use case = onboarding
3. Finds 2 matching approved stories
4. Downloads one-pager PDF, shares with prospect

### Flow 3: GTM admin ingests existing assets
1. Admin uploads folder of old PDFs from a past content sprint
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
| **M0 — Scaffold** | Repo structure, Auth0, DB schema, S3 config, CI pipeline | Week 1–2 |
| **M1 — Ingest** | Manual entry form, document upload, HubSpot connector | Week 3–5 |
| **M2 — Generate** | Extraction pipeline, draft generation, review queue | Week 6–8 |
| **M3 — Activate** | Story library UI, PDF export, deal-close nudge email | Week 9–11 |
| **M4 — Harden** | Auth RBAC, customer reviewer flow, error handling, staging deploy | Week 12 |

---

## Open Questions

- [ ] Will customers self-serve into Dalil, or is all review done via emailed link?
- [ ] Do we need multi-tenant isolation from day one, or is the first customer a single tenant?
- [ ] Who owns the writing style guide that feeds the GPT system prompt?
- [ ] Is HubSpot the right first CRM, or does the first customer use Salesforce?
- [ ] What does "published" mean — is there a public URL, or just internal + PDF?
