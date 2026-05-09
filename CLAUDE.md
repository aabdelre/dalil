# Dalil — Claude Code Project Guide

## Project Overview

**Dalil** (Arabic: دليل, "guide") is an AI-native B2B tool that gathers product insights, measures customer impact, and drafts customer case studies — enabling sales teams to target more and larger enterprise accounts with evidence-backed stories.

Core value loop:
1. **Ingest** — pull signals from customer conversations, product usage, support tickets, CRM notes
2. **Analyze** — surface insights, quantify impact (time saved, revenue influenced, churn prevented)
3. **Narrate** — auto-draft case studies, one-pagers, and win stories tuned to ICP segments
4. **Activate** — package assets for sales reps to deploy at the right deal stage

---

## Tech Stack

> Update this section once confirmed. Claude will use whatever is defined here.

| Layer | Technology |
|---|---|
| Frontend | React + Next.js (SSR) |
| Backend API | TypeScript / NestJS (Node.js) |
| AI Processing | Python / FastAPI — heavy NLP jobs, OpenAI GPT APIs |
| AI/LLM | OpenAI GPT-4o (narratives, summaries, quotes) |
| Database | PostgreSQL (structured data) + AWS S3 (PDFs, images, video) |
| Document Gen | Handlebars (templates) + Playwright (PDF rendering) |
| Auth | Auth0 (RBAC, SSO for B2B tenants) |
| CRM Integrations | Salesforce, HubSpot, Highspot (via direct connectors or Zapier) |
| Infra | AWS (Docker containers) |
| CI/CD | GitHub Actions |

---

## Features Roadmap

> Populate with your confirmed feature set. Use the milestone format below.

### Milestone 1 — Foundation
- [ ] Project scaffolding and repo structure
- [ ] Auth (SSO/OAuth for B2B tenants)
- [ ] Data ingestion pipeline (first source)
- [ ] Basic dashboard shell

### Milestone 2 — Insight Engine
- [ ] Customer signal aggregation
- [ ] Impact quantification model
- [ ] Insight card UI

### Milestone 3 — Case Study Drafting
- [ ] Claude-powered draft generation
- [ ] Template library (industry/persona/deal-stage)
- [ ] Human-in-the-loop review + edit flow

### Milestone 4 — Sales Activation
- [ ] CRM integration (Salesforce / HubSpot)
- [ ] Asset delivery to reps (Slack, email, in-app)
- [ ] Usage analytics (what's working in deals)

---

## Autonomous Operation Rules

Claude Code operates autonomously on this project. These rules govern all work sessions:

### Task Management
- Use `TaskCreate` at the start of every session to break assigned work into concrete steps.
- Use `TaskUpdate` to mark tasks `in_progress` when starting and `completed` when done.
- If a task spawns unexpected sub-work, create child tasks immediately rather than silently expanding scope.
- Never leave a session with tasks in `in_progress` state — either complete or re-queue them.

### Milestone Tracking
- Maintain `MILESTONES.md` at the repo root. Update it whenever a milestone item is completed.
- Format: `- [x] Feature name — shipped YYYY-MM-DD (PR #N or commit SHA)`
- At the start of a new feature area, update the milestone to mark it `in_progress`.

### Code Discipline
- No comments unless the WHY is non-obvious (a hidden constraint, a workaround, a subtle invariant).
- No premature abstractions — three similar lines beats a helper nobody asked for.
- No defensive error handling for impossible scenarios. Validate only at system boundaries.
- No half-implementations — ship complete or don't merge.
- Security: never introduce SQL injection, XSS, command injection, or hardcoded secrets.

---

## Git Workflow

**Claude must NOT commit or push on its own.** Only run `git commit` or `git push` when the user explicitly asks ("commit this", "push it", etc.). Read-only git commands (`status`, `diff`, `log`) are fine anytime.

When a task is done: summarize what changed, suggest a commit message if useful, and stop. Let the user trigger the commit.

### Commit Format (when asked)
Use [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>(<scope>): <short imperative description>

<optional body: why, not what>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Types:** `feat` · `fix` · `chore` · `refactor` · `test` · `docs` · `ci`

### Per-Task Git Protocol (when explicitly requested)
```bash
git add <specific files>          # never git add -A blindly
git commit -m "feat(scope): ..."  # conventional commit
git push origin main              # only if the user asked to push
```

### Branch Strategy
- `main` — always deployable, protected
- `feat/<name>` — feature branches for milestones with >3 files changed
- Merge feature branches to main via PR when milestone is complete

### Never Commit
- `.env` files or any file containing API keys, tokens, or secrets
- `node_modules/`, build artifacts, or binary files >1MB
- Files not directly related to the task at hand

---

## Development Commands

> Update these as the stack is confirmed.

```bash
# Install dependencies
# TBD

# Run dev server
# TBD

# Run tests
# TBD

# Lint / type-check
# TBD

# Build for production
# TBD
```

---

## Claude API Usage

Use the Anthropic SDK with prompt caching enabled. Default model selection:

| Use case | Model |
|---|---|
| Fast drafts, summarization, extraction | `claude-sonnet-4-6` |
| Complex case study generation, strategy | `claude-opus-4-7` |
| Lightweight classification, routing | `claude-haiku-4-5-20251001` |

Always enable `cache_control` on large system prompts and static context blocks to minimize cost on repeated calls.

---

## Security Rules

- Never store customer data in plaintext — encrypt at rest.
- API keys and secrets go in environment variables only; reference `.env.example` for shape, never actual values.
- Sanitize all user inputs before passing to database queries or LLM prompts.
- B2B multi-tenancy: always scope database queries by `tenant_id`. No cross-tenant data leakage.

---

## GitHub Setup

Remote: `https://github.com/aabdelre/dalil.git`  
Branch: `main`

⚠️ A Stop hook at `.claude/hooks/auto-commit.sh` (wired up in `.claude/settings.json`) auto-commits and pushes uncommitted changes at the end of every Claude turn. This **conflicts with the "no auto-commit" rule above** — it's harness automation, not Claude's choice. To honor the rule fully, disable it by removing the `Stop` block from `.claude/settings.json` (and optionally deleting the script).

To verify GitHub CLI is authenticated:
```bash
gh auth status
```

If not authenticated:
```bash
gh auth login
```
