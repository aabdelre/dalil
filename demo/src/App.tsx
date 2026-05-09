import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  Bot,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Filter,
  Inbox,
  Layers3,
  Mail,
  MessageSquareText,
  Mic2,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
  X,
} from 'lucide-react'
import './App.css'

type View = 'dashboard' | 'customer' | 'library'
type CustomerStatus = 'Prospect' | 'Closed' | 'Ongoing'
type Approval = 'Internal Only' | 'Customer Approved' | 'Public'
type Stage = 'Discovery' | 'Proposal Sent' | 'Security Review' | 'Negotiation' | 'Closed Won' | 'Expansion'
type InteractionType = 'Email' | 'Meeting' | 'Upload' | 'Note' | 'Transcript'

type Interaction = {
  type: InteractionType
  title: string
  date: string
  summary: string
  proofDetected?: boolean
}

type ProofPoint = {
  id: string
  claim: string
  sourceCustomer: string
  metric: string
  quote: string
  useCase: string
  outcomeType: string
  bestFor: string
  approval: Approval
}

type Collateral = {
  title: string
  type: string
  status: Approval
  summary: string
}

type Customer = {
  id: string
  name: string
  logo: string
  status: CustomerStatus
  stage: Stage
  health: 'Strong' | 'Stable' | 'Needs attention'
  industry: string
  size: string
  website: string
  contacts: string[]
  value: string
  startDate: string
  closeDate: string
  competitor: string
  personas: string[]
  lastActivity: string
  objection: string
  interactions: Interaction[]
  proof: ProofPoint[]
  collateral: Collateral[]
}

const initialCustomers: Customer[] = [
  {
    id: 'brightcart',
    name: 'BrightCart',
    logo: 'BC',
    status: 'Closed',
    stage: 'Closed Won',
    health: 'Strong',
    industry: 'Ecommerce SaaS',
    size: '120 employees',
    website: 'brightcart.io',
    contacts: ['Maya Patel, VP Ops', 'Jon Bell, RevOps'],
    value: '$48K ARR',
    startDate: 'Jan 12, 2026',
    closeDate: 'Mar 4, 2026',
    competitor: 'Internal workflow + incumbent services vendor',
    personas: ['VP Operations: reduce launch drag', 'RevOps: repeatable proof for sales', 'Founder: compete with larger vendors'],
    lastActivity: 'QBR transcript 2 days ago',
    objection: 'Implementation bandwidth',
    interactions: [
      {
        type: 'Transcript',
        title: 'QBR transcript',
        date: 'May 7',
        summary: 'Customer described faster onboarding and fewer engineering escalations.',
        proofDetected: true,
      },
      {
        type: 'Email',
        title: 'Renewal email from Maya',
        date: 'Apr 26',
        summary: 'Confirmed onboarding prep dropped after the rollout.',
        proofDetected: true,
      },
      {
        type: 'Upload',
        title: 'Founder notes import',
        date: 'Apr 10',
        summary: 'Historical notes from sales and implementation calls.',
      },
    ],
    proof: [
      {
        id: 'p1',
        claim: 'Reduced onboarding prep time by 42% for a lean post-sales team.',
        sourceCustomer: 'BrightCart',
        metric: '42% less onboarding prep',
        quote: 'We got customers live without waiting on engineering every time.',
        useCase: 'Lean team scaling',
        outcomeType: 'Operational efficiency',
        bestFor: 'Prospects worried about implementation bandwidth',
        approval: 'Customer Approved',
      },
      {
        id: 'p2',
        claim: 'Moved from founder-led customer proof to a repeatable sales asset library.',
        sourceCustomer: 'BrightCart',
        metric: '11 reusable proof snippets',
        quote: 'Sales finally had examples without asking the founder every time.',
        useCase: 'Sales enablement',
        outcomeType: 'Credibility',
        bestFor: 'Founder-led startups formalizing sales',
        approval: 'Internal Only',
      },
    ],
    collateral: [
      {
        title: 'BrightCart sales proof card',
        type: 'Sales snippet',
        status: 'Customer Approved',
        summary: 'Use when a prospect says implementation will require too much internal bandwidth.',
      },
      {
        title: 'Lean team onboarding story',
        type: 'Case study draft',
        status: 'Internal Only',
        summary: 'Narrative draft from founder notes, transcript, and renewal email.',
      },
    ],
  },
  {
    id: 'acme-health',
    name: 'Acme Health',
    logo: 'AH',
    status: 'Prospect',
    stage: 'Security Review',
    health: 'Stable',
    industry: 'Healthcare SaaS',
    size: '210 employees',
    website: 'acmehealth.com',
    contacts: ['Sarah Kim, VP Operations', 'Leo Grant, Security Lead'],
    value: '$64K ARR',
    startDate: 'Apr 18, 2026',
    closeDate: 'May 29, 2026',
    competitor: 'Large incumbent platform',
    personas: ['VP Operations: scale without process drag', 'Security Lead: low-risk rollout', 'CRO: credible proof before procurement'],
    lastActivity: 'Email received today',
    objection: 'Can this scale without implementation drag?',
    interactions: [
      {
        type: 'Meeting',
        title: 'Discovery call',
        date: 'May 6',
        summary: 'Buyer wants proof from teams with similar operations constraints.',
      },
      {
        type: 'Email',
        title: 'Security questionnaire follow-up',
        date: 'Today',
        summary: 'Asked for implementation proof before procurement review.',
        proofDetected: true,
      },
    ],
    proof: [],
    collateral: [],
  },
  {
    id: 'greenline',
    name: 'Greenline',
    logo: 'GL',
    status: 'Ongoing',
    stage: 'Expansion',
    health: 'Strong',
    industry: 'Fintech',
    size: '180 employees',
    website: 'greenline.co',
    contacts: ['Nora Saleh, Head of Revenue', 'Will Hart, COO'],
    value: '$72K ARR',
    startDate: 'Feb 2, 2026',
    closeDate: 'Apr 11, 2026',
    competitor: 'Incumbent analytics suite',
    personas: ['Head of Revenue: faster proof in late-stage deals', 'COO: repeatable process', 'Founder: incumbent displacement'],
    lastActivity: 'Meeting yesterday',
    objection: 'Why not use the larger vendor?',
    interactions: [
      {
        type: 'Meeting',
        title: 'Expansion planning',
        date: 'Yesterday',
        summary: 'Customer cited incumbent replacement and adoption speed as the core value.',
        proofDetected: true,
      },
    ],
    proof: [
      {
        id: 'p3',
        claim: 'Replaced an incumbent after slow implementation cycles blocked growth.',
        sourceCustomer: 'Greenline',
        metric: '3 teams activated in 45 days',
        quote: 'The proof was not just the product. It was how quickly the team adopted it.',
        useCase: 'Competitive displacement',
        outcomeType: 'Adoption speed',
        bestFor: 'Prospects comparing against larger incumbents',
        approval: 'Public',
      },
    ],
    collateral: [
      {
        title: 'Incumbent displacement one-pager',
        type: 'One-pager',
        status: 'Public',
        summary: 'Short external asset for competitive late-stage evaluations.',
      },
    ],
  },
  {
    id: 'medpilot',
    name: 'MedPilot',
    logo: 'MP',
    status: 'Closed',
    stage: 'Closed Won',
    health: 'Stable',
    industry: 'Healthcare SaaS',
    size: '85 employees',
    website: 'medpilot.ai',
    contacts: ['Ari Cohen, COO', 'Priya Das, CS Lead'],
    value: '$38K ARR',
    startDate: 'Dec 9, 2025',
    closeDate: 'Feb 14, 2026',
    competitor: 'Manual process',
    personas: ['COO: rollout confidence', 'CS Lead: less manual follow-up'],
    lastActivity: 'Note updated last week',
    objection: 'This may create too much change management.',
    interactions: [
      {
        type: 'Note',
        title: 'Customer interview notes',
        date: 'May 1',
        summary: 'Launched with only two operators and avoided extra process overhead.',
        proofDetected: true,
      },
    ],
    proof: [
      {
        id: 'p4',
        claim: 'Launched a new workflow with a two-person operations team.',
        sourceCustomer: 'MedPilot',
        metric: '2-person launch team',
        quote: 'The rollout felt lighter than the incumbent process we replaced.',
        useCase: 'Change management',
        outcomeType: 'Implementation',
        bestFor: 'Prospects with lean ops or low implementation capacity',
        approval: 'Internal Only',
      },
    ],
    collateral: [],
  },
]

type CustomerDraft = {
  name: string
  logo: string
  industry: string
  size: string
  website: string
  contacts: string
  status: CustomerStatus
  stage: Stage
  health: 'Strong' | 'Stable' | 'Needs attention'
  value: string
  startDate: string
  closeDate: string
  competitor: string
  personas: string
  objection: string
}

type ChatMessage = { role: 'agent' | 'user'; text: string }

const chatStarters: Record<string, string> = {
  'Generate website proof block': "Got it — let's draft a proof block for the website. Which segment should I anchor it to: Series A-B operational SaaS, lean post-sales teams, or incumbent displacement?",
  'Generate LinkedIn post': "Sure — what's the angle? A founder POV, a customer win story, or an industry insight grounded in your closed customers?",
  'Generate investor snippet': "Let's tighten this for investors. Are we showing traction (closed ARR, win rate), proof of repeatability (segments), or differentiation (incumbent displacement)?",
  'Generate one-pager': "On it. Should the one-pager be ICP-first, customer-story-first, or competitor-displacement-first? I'll pull from BrightCart, Greenline, and MedPilot for proof.",
}

const stockReplies = [
  'Pulling the relevant proof points now…',
  'Here is a first draft based on BrightCart, Greenline, and MedPilot:\n\n"Lean teams ship faster when their proof travels with them. Across operational SaaS, our customers reduced onboarding prep by 42%, replaced incumbents in 45 days, and launched new workflows with a two-person team — without extra hiring or process."\n\nWant me to tighten the lead, or pivot to a different angle?',
  'Updated. The new version emphasizes implementation speed and reads cleaner. Anything else to refine?',
  'Saved as a draft to your proof library. You can keep iterating or mark this task complete whenever you are ready.',
]

const emptyDraft: CustomerDraft = {
  name: '',
  logo: '',
  industry: '',
  size: '',
  website: '',
  contacts: '',
  status: 'Prospect',
  stage: 'Discovery',
  health: 'Stable',
  value: '',
  startDate: '',
  closeDate: '',
  competitor: '',
  personas: '',
  objection: '',
}

const uploadedProof: ProofPoint = {
  id: 'p5',
  claim: 'Kept implementation under two weeks while sales stayed focused on active pipeline.',
  sourceCustomer: 'BrightCart',
  metric: '12-day implementation',
  quote: 'The team did not have to pause selling to make the rollout work.',
  useCase: 'Implementation risk',
  outcomeType: 'Sales capacity',
  bestFor: 'Security reviews and procurement calls where bandwidth is the main concern',
  approval: 'Internal Only',
}

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [customers, setCustomers] = useState(initialCustomers)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [uploadState, setUploadState] = useState<'idle' | 'reading' | 'extracting' | 'done'>('idle')
  const [autoCapture, setAutoCapture] = useState(false)
  const [assetState, setAssetState] = useState<'idle' | 'generating' | 'done'>('idle')
  const [agentState, setAgentState] = useState<'idle' | 'thinking' | 'done'>('idle')
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [draft, setDraft] = useState<CustomerDraft>(emptyDraft)
  const [chatTask, setChatTask] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatThinking, setChatThinking] = useState(false)
  const [chatComplete, setChatComplete] = useState(false)
  const chatBodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [chatMessages, chatThinking, chatComplete])

  const selected = customers.find((customer) => customer.id === selectedId) ?? customers[0]
  const proofPoints = customers.flatMap((customer) => customer.proof)
  const stats = useMemo(
    () => ({
      customers: customers.length,
      interactions: customers.reduce((sum, customer) => sum + customer.interactions.length, 0),
      proof: proofPoints.length,
      assets: customers.reduce((sum, customer) => sum + customer.collateral.length, 0),
    }),
    [customers, proofPoints.length],
  )

  const overview = useMemo(() => {
    const parseValueK = (value: string) => {
      const match = value.match(/\$(\d+(?:\.\d+)?)K/i)
      return match ? parseFloat(match[1]) : 0
    }
    const activePipeline = customers.filter((customer) => customer.status !== 'Closed').reduce((sum, customer) => sum + parseValueK(customer.value), 0)
    const closedArr = customers.filter((customer) => customer.status === 'Closed').reduce((sum, customer) => sum + parseValueK(customer.value), 0)
    const closedWithDates = customers.filter((customer) => customer.status === 'Closed' && customer.startDate && customer.closeDate)
    const avgCycle = closedWithDates.length
      ? Math.round(
          closedWithDates.reduce((sum, customer) => sum + (Date.parse(customer.closeDate) - Date.parse(customer.startDate)) / 86_400_000, 0) /
            closedWithDates.length,
        )
      : 0
    const stages: Stage[] = ['Discovery', 'Proposal Sent', 'Security Review', 'Negotiation', 'Closed Won', 'Expansion']
    const byStage = stages.map((stage) => ({ stage, count: customers.filter((customer) => customer.stage === stage).length }))
    const maxStage = Math.max(1, ...byStage.map((row) => row.count))
    const industryCounts = customers.reduce<Record<string, number>>((accumulator, customer) => {
      accumulator[customer.industry] = (accumulator[customer.industry] ?? 0) + 1
      return accumulator
    }, {})
    const byIndustry = Object.entries(industryCounts).sort((a, b) => b[1] - a[1])
    const byStatus: { status: CustomerStatus; count: number }[] = (['Prospect', 'Ongoing', 'Closed'] as CustomerStatus[]).map((status) => ({
      status,
      count: customers.filter((customer) => customer.status === status).length,
    }))
    const recentSignals = customers
      .filter((customer) => customer.interactions.length > 0)
      .map((customer) => ({ customerId: customer.id, customerName: customer.name, ...customer.interactions[0] }))
      .slice(0, 6)
    const coverageGaps = customers.filter((customer) => customer.status === 'Prospect' && customer.proof.length === 0)
    const objections = customers
      .filter((customer) => customer.objection)
      .map((customer) => ({ id: customer.id, customer: customer.name, status: customer.status, objection: customer.objection }))
    return { activePipeline, closedArr, avgCycle, byStage, maxStage, byIndustry, byStatus, recentSignals, coverageGaps, objections }
  }, [customers])

  const activeCount = customers.filter((customer) => customer.status !== 'Closed').length
  const closedCount = customers.length - activeCount

  function openCustomer(id: string) {
    setSelectedId(id)
    setView('customer')
  }

  function runUpload() {
    setUploadState('reading')
    window.setTimeout(() => setUploadState('extracting'), 900)
    window.setTimeout(() => {
      setUploadState('done')
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === selected.id
            ? {
                ...customer,
                lastActivity: 'Transcript uploaded just now',
                interactions: [
                  {
                    type: 'Upload',
                    title: 'Historical customer source pack',
                    date: 'Just now',
                    summary: 'Imported transcript, founder notes, renewal email, and usage metrics.',
                    proofDetected: true,
                  },
                  ...customer.interactions,
                ],
                proof: customer.proof.some((proof) => proof.id === uploadedProof.id)
                  ? customer.proof
                  : [uploadedProof, ...customer.proof],
              }
            : customer,
        ),
      )
    }, 1900)
  }

  function runAutoCapture() {
    setAutoCapture(true)
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === 'acme-health'
          ? {
              ...customer,
              lastActivity: 'Email auto-captured just now',
              interactions: [
                {
                  type: 'Email',
                  title: 'Auto-captured email from sarah@acmehealth.com',
                  date: 'Just now',
                  summary: 'Matched sender domain to Acme Health and flagged a live implementation objection.',
                  proofDetected: true,
                },
                ...customer.interactions,
              ],
            }
          : customer,
      ),
    )
  }

  function generateAsset() {
    setAssetState('generating')
    window.setTimeout(() => setAssetState('done'), 1100)
  }

  function askAgent() {
    setAgentState('thinking')
    window.setTimeout(() => setAgentState('done'), 1100)
  }

  function createCustomer(event: React.FormEvent) {
    event.preventDefault()
    const id = draft.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `customer-${Date.now()}`
    const customer: Customer = {
      id,
      name: draft.name.trim(),
      logo: (draft.logo.trim() || draft.name.trim().slice(0, 2)).toUpperCase(),
      status: draft.status,
      stage: draft.stage,
      health: draft.health,
      industry: draft.industry,
      size: draft.size,
      website: draft.website,
      contacts: draft.contacts.split(/[\n,]/).map((value) => value.trim()).filter(Boolean),
      value: draft.value,
      startDate: draft.startDate,
      closeDate: draft.closeDate,
      competitor: draft.competitor,
      personas: draft.personas.split('\n').map((value) => value.trim()).filter(Boolean),
      lastActivity: 'Just added',
      objection: draft.objection,
      interactions: [],
      proof: [],
      collateral: [],
    }
    setCustomers((current) => [customer, ...current])
    setDraft(emptyDraft)
    setShowNewCustomer(false)
  }

  function closeNewCustomer() {
    setDraft(emptyDraft)
    setShowNewCustomer(false)
  }

  function openChat(task: string) {
    setChatTask(task)
    setChatMessages([{ role: 'agent', text: chatStarters[task] ?? "Got it — let's get started. What angle should I take?" }])
    setChatInput('')
    setChatThinking(false)
    setChatComplete(false)
  }

  function closeChat() {
    setChatTask(null)
    setChatMessages([])
    setChatInput('')
    setChatThinking(false)
    setChatComplete(false)
  }

  function submitChat() {
    const text = chatInput.trim()
    if (!text || chatThinking || chatComplete) return
    const userTurn = chatMessages.filter((message) => message.role === 'user').length
    setChatMessages((current) => [...current, { role: 'user', text }])
    setChatInput('')
    setChatThinking(true)
    window.setTimeout(() => {
      setChatThinking(false)
      setChatMessages((current) => [...current, { role: 'agent', text: stockReplies[userTurn % stockReplies.length] }])
    }, 900)
  }

  function completeChat() {
    setChatThinking(false)
    setChatComplete(true)
    setChatMessages((current) => [...current, { role: 'agent', text: `Marked "${chatTask}" complete. The asset is saved to your proof library.` }])
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">د</div>
          <div className="brand-text">
            <strong>Dalil</strong>
            <span>Proof memory for B2B startups</span>
          </div>
        </div>
        <nav>
          <NavButton active={view === 'dashboard'} icon={<Building2 size={18} />} label="Dashboard" onClick={() => setView('dashboard')} />
          <NavButton active={view === 'customer'} icon={<Layers3 size={18} />} label="Customer Page" onClick={() => { setSelectedId(null); setView('customer') }} />
          <NavButton active={view === 'library'} icon={<ShieldCheck size={18} />} label="Proof Library" onClick={() => setView('library')} />
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>{view === 'dashboard' ? 'Customer Portfolio' : view === 'customer' ? (selectedId ? selected.name : 'All customers') : 'Company Proof Memory'}</h1>
          </div>
          <div className="topbar-actions">
            {view !== 'dashboard' && <button className="search-button"><Search size={17} /> Search proof</button>}
            <button className="primary" onClick={() => setShowNewCustomer(true)}><Plus size={18} /> New customer</button>
          </div>
        </header>

        <section className="page">
          {view === 'dashboard' && (
            <>
              <section className="dashboard-hero">
                <div>
                  <span className="eyebrow">Capture → Structure → Activate</span>
                  <h2>Every customer gets a proof profile and an agent with full relationship context.</h2>
                  <p>Use the dashboard to see closed customers, ongoing relationships, and active prospects that need the right proof to move forward.</p>
                </div>

                <div className="source-pills">
                  <span><Upload size={15} /> Uploads</span>
                  <span><Mail size={15} /> Email</span>
                  <span><Mic2 size={15} /> Transcripts</span>
                  <span><CalendarClock size={15} /> Calendar</span>
                </div>
              </section>

              <div className="summary-strip">
                <Stat label="Customers tracked" value={stats.customers} icon={<Building2 size={18} />} />
                <Stat label="Interactions logged" value={stats.interactions} icon={<Activity size={18} />} />
                <Stat label="Proof points" value={stats.proof} icon={<Sparkles size={18} />} />
                <Stat label="Collateral assets" value={stats.assets} icon={<FileText size={18} />} />
              </div>

              <div className="section-head">
                <h2>Customer Cards</h2>
                <button className="secondary"><Filter size={16} /> Filter</button>
              </div>
              <div className="customer-grid">
                {customers.map((customer) => (
                  <button className="customer-card" key={customer.id} onClick={() => openCustomer(customer.id)}>
                    <div className="card-top">
                      <div className="logo">{customer.logo}</div>
                      <span className={`badge ${customer.status.toLowerCase()}`}>{customer.status}</span>
                    </div>
                    <div>
                      <h3>{customer.name}</h3>
                      <p>{customer.industry} · {customer.size}</p>
                    </div>
                    <div className="card-meta">
                      <span>{customer.status === 'Prospect' ? customer.stage : `${customer.health} health`}</span>
                      <span>{customer.interactions.length} interactions</span>
                      <span>{customer.proof.length} proof points</span>
                    </div>
                    <div className="last-activity"><Clock3 size={15} /> {customer.lastActivity}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {view === 'customer' && !selectedId && (
            <>
              <section className="dashboard-hero">
                <div>
                  <span className="eyebrow">Customer pulse</span>
                  <h2>Where your portfolio stands today.</h2>
                  <p>Aggregate signals across every customer relationship — pipeline, momentum, gaps, and objections in one place. Click any row to drill into a customer.</p>
                </div>
                <div className="overview-kpis">
                  <article className="kpi">
                    <span>Active pipeline</span>
                    <strong>${overview.activePipeline}K</strong>
                    <em>across {activeCount} {activeCount === 1 ? 'account' : 'accounts'}</em>
                  </article>
                  <article className="kpi">
                    <span>Closed ARR</span>
                    <strong>${overview.closedArr}K</strong>
                    <em>{closedCount} {closedCount === 1 ? 'win' : 'wins'}</em>
                  </article>
                  <article className="kpi">
                    <span>Avg deal cycle</span>
                    <strong>{overview.avgCycle} days</strong>
                    <em>start → close</em>
                  </article>
                </div>
              </section>

              <Section title="Pipeline by stage">
                <div className="funnel">
                  {overview.byStage.map(({ stage, count }) => (
                    <div className="funnel-row" key={stage}>
                      <span>{stage}</span>
                      <div className="funnel-bar"><span style={{ width: `${(count / overview.maxStage) * 100}%` }} /></div>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </Section>

              <div className="overview-row">
                <Section title="Industry mix">
                  <div className="breakdown">
                    {overview.byIndustry.map(([industry, count]) => (
                      <div className="breakdown-row" key={industry}>
                        <span>{industry}</span>
                        <div className="breakdown-bar"><span style={{ width: `${(count / customers.length) * 100}%` }} /></div>
                        <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Status mix">
                  <div className="breakdown">
                    {overview.byStatus.map(({ status, count }) => (
                      <div className={`breakdown-row status-${status.toLowerCase()}`} key={status}>
                        <span>{status}</span>
                        <div className="breakdown-bar"><span style={{ width: `${(count / Math.max(1, customers.length)) * 100}%` }} /></div>
                        <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>

              <Section title="Recent customer signals" action={<Activity size={18} />}>
                {overview.recentSignals.length === 0 ? (
                  <div className="empty-state"><Sparkles size={22} /><p>No interactions logged yet. Add customers and capture signals to see them here.</p></div>
                ) : (
                  <div className="signal-list">
                    {overview.recentSignals.map((signal) => (
                      <button className="signal-item" key={signal.customerId + signal.title} onClick={() => openCustomer(signal.customerId)}>
                        <div className="timeline-icon">{iconFor(signal.type)}</div>
                        <div>
                          <strong>{signal.customerName}</strong>
                          <span>{signal.title} · {signal.type} · {signal.date}</span>
                          <p>{signal.summary}</p>
                        </div>
                        {signal.proofDetected && <em>Proof detected</em>}
                      </button>
                    ))}
                  </div>
                )}
              </Section>

              <div className="overview-row">
                <Section title="Coverage gaps" action={<ShieldCheck size={18} />}>
                  {overview.coverageGaps.length === 0 ? (
                    <div className="empty-state"><CheckCircle2 size={22} /><p>Every active prospect has at least one proof point attached.</p></div>
                  ) : (
                    <div className="gap-list">
                      {overview.coverageGaps.map((customer) => (
                        <button className="gap-row" key={customer.id} onClick={() => openCustomer(customer.id)}>
                          <div>
                            <strong>{customer.name}</strong>
                            <span>{customer.stage} · {customer.industry}</span>
                          </div>
                          <em>{customer.objection || 'No objection captured'}</em>
                          <ChevronRight size={16} />
                        </button>
                      ))}
                    </div>
                  )}
                </Section>

                <Section title="Objections you're hearing" action={<MessageSquareText size={18} />}>
                  <div className="objection-list">
                    {overview.objections.map((row) => (
                      <button className="objection-row" key={row.id} onClick={() => openCustomer(row.id)}>
                        <strong>"{row.objection}"</strong>
                        <span>{row.customer} · {row.status}</span>
                      </button>
                    ))}
                  </div>
                </Section>
              </div>
            </>
          )}

          {view === 'customer' && selectedId && (
            <div className="customer-layout">
              <div className="main-column">
                <button className="back-link" onClick={() => setSelectedId(null)}>
                  <ChevronLeft size={16} /> All customers
                </button>
                <Section title="Overview" action={<span className={`badge ${selected.status.toLowerCase()}`}>{selected.status}</span>}>
                  <div className="overview-grid">
                    <Info label="Industry" value={selected.industry} />
                    <Info label="Size" value={selected.size} />
                    <Info label="Website" value={selected.website} />
                    <Info label="Main contacts" value={selected.contacts.join(' · ')} />
                    <Info label="Stage" value={selected.stage} />
                    <Info label="Value" value={selected.value} />
                    <Info label="Start date" value={selected.startDate} />
                    <Info label="Expected close" value={selected.closeDate} />
                    <Info label="Competitor displaced" value={selected.competitor} wide />
                  </div>
                  <div className="persona-row">
                    {selected.personas.map((persona) => <span key={persona}>{persona}</span>)}
                  </div>
                </Section>

                <Section
                  title="Data & Interactions"
                  action={<div className="inline-actions"><button className="secondary" onClick={runUpload}><Upload size={16} /> Upload</button><button className="secondary" onClick={runAutoCapture}><Inbox size={16} /> Simulate email</button></div>}
                >
                  {uploadState !== 'idle' && <Process state={uploadState} />}
                  {autoCapture && (
                    <div className="notice">
                      <Inbox size={18} />
                      <div>
                        <strong>Automatic data detected</strong>
                        <p>Email from `sarah@acmehealth.com` was matched to Acme Health and flagged as relevant to the active deal.</p>
                      </div>
                    </div>
                  )}
                  <div className="timeline">
                    {selected.interactions.map((item) => (
                      <article className="timeline-item" key={`${item.title}-${item.date}`}>
                        <div className="timeline-icon">{iconFor(item.type)}</div>
                        <div>
                          <strong>{item.title}</strong>
                          <span>{item.type} · {item.date}</span>
                          <p>{item.summary}</p>
                        </div>
                        {item.proofDetected && <em>Potential proof detected</em>}
                      </article>
                    ))}
                  </div>
                </Section>
              </div>

              <aside className="right-column">
                <Section title="Proof & Collateral" action={<button className="secondary" onClick={generateAsset}><Wand2 size={16} /> Generate</button>}>
                  {selected.proof.length === 0 ? (
                    <div className="empty-state">
                      <Sparkles size={22} />
                      <p>No proof extracted from this prospect yet. Use the agent to retrieve relevant proof from closed customers.</p>
                    </div>
                  ) : selected.proof.map((proof) => <ProofCard proof={proof} key={proof.id} />)}
                  {selected.collateral.map((asset) => <AssetCard asset={asset} key={asset.title} />)}
                  {assetState === 'generating' && <div className="run-result">Generating case study, proof card, and sales snippet...</div>}
                  {assetState === 'done' && <AssetCard asset={{ title: 'Implementation risk proof pack', type: 'Generated collateral', status: 'Internal Only', summary: 'Case study draft, quote card, and email-ready snippet created from selected proof.' }} />}
                </Section>

                <Section title="Agent" action={<Bot size={18} />}>
                  <div className="agent-box">
                    <p>This agent knows the customer profile, interactions, proof points, deal stage, personas, objection, and upcoming meetings.</p>
                    <button onClick={askAgent}>What proof is relevant to their main objection?</button>
                    <button onClick={askAgent}>Draft a follow-up email addressing implementation risk</button>
                    <button onClick={askAgent}>Prepare tomorrow's meeting brief</button>
                    {agentState === 'thinking' && <div className="typing">Reviewing customer context and proof library...</div>}
                    {agentState === 'done' && (
                      <div className="agent-answer">
                        <strong>Recommended proof</strong>
                        <p>Use BrightCart for implementation bandwidth and MedPilot for lean-team rollout. Both map to the current objection: {selected.objection}</p>
                        <button className="primary"><Send size={16} /> Insert into follow-up</button>
                      </div>
                    )}
                  </div>
                </Section>
              </aside>
            </div>
          )}

          {view === 'library' && (
            <div className="library-layout">
              <main className="main-column">
                <Section title="Proof Points" action={<button className="secondary"><Filter size={16} /> Filters</button>}>
                  <div className="filter-bar">
                    <span>Industry</span>
                    <span>Company size</span>
                    <span>Use case</span>
                    <span>Outcome type</span>
                    <span>Deal stage</span>
                  </div>
                  <div className="proof-list">
                    {proofPoints.map((proof) => (
                      <button className="proof-row" key={proof.id} onClick={() => openCustomer(customers.find((customer) => customer.name === proof.sourceCustomer)?.id ?? 'brightcart')}>
                        <div>
                          <strong>{proof.claim}</strong>
                          <p>{proof.sourceCustomer} · {proof.metric}</p>
                        </div>
                        <span>{proof.bestFor}</span>
                        <ChevronRight size={18} />
                      </button>
                    ))}
                  </div>
                </Section>
              </main>

              <aside className="right-column">
                <Section title="Strengths & Insights" action={<Sparkles size={18} />}>
                  <div className="insight-list">
                    <Insight title="You consistently win on implementation speed" detail="BrightCart, MedPilot, and Greenline all mention fast rollout or reduced process drag." />
                    <Insight title="Strongest segment: Series A-B operational SaaS" detail="The highest-confidence proof comes from teams with 80-220 employees and lean operations teams." />
                    <Insight title="Common objection overcome: incumbent trust" detail="Greenline and BrightCart show how younger vendors win when proof is specific to the prospect's situation." />
                  </div>
                  <div className="general-assets">
                    <button onClick={() => openChat('Generate website proof block')}>Generate website proof block</button>
                    <button onClick={() => openChat('Generate LinkedIn post')}>Generate LinkedIn post</button>
                    <button onClick={() => openChat('Generate investor snippet')}>Generate investor snippet</button>
                    <button onClick={() => openChat('Generate one-pager')}>Generate one-pager</button>
                  </div>
                </Section>
              </aside>
            </div>
          )}
        </section>
      </section>

      {showNewCustomer && (
        <div className="modal-backdrop" onClick={closeNewCustomer}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">Customer</span>
                <h2>New customer</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeNewCustomer} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <form className="modal-form" onSubmit={createCustomer}>
              <div className="form-grid">
                <Field label="Customer name" required>
                  <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required placeholder="BrightCart" />
                </Field>
                <Field label="Logo (initials)" hint="Auto from name if blank">
                  <input value={draft.logo} onChange={(event) => setDraft({ ...draft, logo: event.target.value })} maxLength={3} placeholder="BC" />
                </Field>
                <Field label="Industry">
                  <input value={draft.industry} onChange={(event) => setDraft({ ...draft, industry: event.target.value })} placeholder="Healthcare SaaS" />
                </Field>
                <Field label="Size">
                  <input value={draft.size} onChange={(event) => setDraft({ ...draft, size: event.target.value })} placeholder="120 employees" />
                </Field>
                <Field label="Website" wide>
                  <input value={draft.website} onChange={(event) => setDraft({ ...draft, website: event.target.value })} placeholder="brightcart.io" />
                </Field>
                <Field label="Status">
                  <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as CustomerStatus })}>
                    <option value="Prospect">Prospect</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Closed">Closed</option>
                  </select>
                </Field>
                <Field label="Stage">
                  <select value={draft.stage} onChange={(event) => setDraft({ ...draft, stage: event.target.value as Stage })}>
                    <option value="Discovery">Discovery</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Security Review">Security Review</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Expansion">Expansion</option>
                  </select>
                </Field>
                <Field label="Health">
                  <select value={draft.health} onChange={(event) => setDraft({ ...draft, health: event.target.value as 'Strong' | 'Stable' | 'Needs attention' })}>
                    <option value="Strong">Strong</option>
                    <option value="Stable">Stable</option>
                    <option value="Needs attention">Needs attention</option>
                  </select>
                </Field>
                <Field label="Deal value">
                  <input value={draft.value} onChange={(event) => setDraft({ ...draft, value: event.target.value })} placeholder="$48K ARR" />
                </Field>
                <Field label="Start date">
                  <input value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} placeholder="Jan 12, 2026" />
                </Field>
                <Field label="Expected close">
                  <input value={draft.closeDate} onChange={(event) => setDraft({ ...draft, closeDate: event.target.value })} placeholder="Mar 4, 2026" />
                </Field>
                <Field label="Competitor displaced" wide>
                  <input value={draft.competitor} onChange={(event) => setDraft({ ...draft, competitor: event.target.value })} placeholder="Incumbent or internal process" />
                </Field>
                <Field label="Main contacts" wide hint="One per line or comma-separated">
                  <textarea rows={2} value={draft.contacts} onChange={(event) => setDraft({ ...draft, contacts: event.target.value })} placeholder="Maya Patel, VP Ops" />
                </Field>
                <Field label="Personas" wide hint="One per line">
                  <textarea rows={3} value={draft.personas} onChange={(event) => setDraft({ ...draft, personas: event.target.value })} placeholder="VP Operations: reduce launch drag" />
                </Field>
                <Field label="Main objection" wide>
                  <input value={draft.objection} onChange={(event) => setDraft({ ...draft, objection: event.target.value })} placeholder="Implementation bandwidth" />
                </Field>
              </div>
              <footer className="modal-foot">
                <button type="button" className="secondary" onClick={closeNewCustomer}>Cancel</button>
                <button type="submit" className="primary">Create customer</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {chatTask && (
        <div className="modal-backdrop" onClick={closeChat}>
          <div className="modal chat-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">Agent</span>
                <h2>{chatTask}</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeChat} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="chat-body" ref={chatBodyRef}>
              {chatMessages.map((message, index) => (
                <div className={`chat-msg ${message.role}`} key={index}>
                  {message.role === 'agent' && <div className="chat-avatar"><Bot size={16} /></div>}
                  <p>{message.text}</p>
                </div>
              ))}
              {chatThinking && (
                <div className="chat-msg agent">
                  <div className="chat-avatar"><Bot size={16} /></div>
                  <p className="chat-typing">Thinking…</p>
                </div>
              )}
              {chatComplete && <div className="chat-complete"><CheckCircle2 size={16} /> Task complete</div>}
            </div>
            <form
              className="chat-foot"
              onSubmit={(event) => { event.preventDefault(); submitChat() }}
            >
              <textarea
                rows={1}
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder={chatComplete ? 'Task complete — close to start a new one' : 'Reply to the agent…'}
                disabled={chatComplete}
                onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submitChat() } }}
              />
              <div className="chat-actions">
                <button type="button" className="secondary" onClick={completeChat} disabled={chatComplete}>Mark complete</button>
                <button type="submit" className="primary" disabled={chatComplete || !chatInput.trim() || chatThinking}><Send size={16} /> Send</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return <button className={active ? 'active' : ''} onClick={onClick}>{icon}<span className="nav-label">{label}</span></button>
}

function Stat({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return <article className="stat-card">{icon}<span>{label}</span><strong>{value}</strong></article>
}

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <section className="panel"><div className="section-head"><h2>{title}</h2>{action}</div>{children}</section>
}

function Info({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={`info ${wide ? 'wide-info' : ''}`}><span>{label}</span><strong>{value}</strong></div>
}

function Field({ label, children, wide = false, required = false, hint }: { label: string; children: ReactNode; wide?: boolean; required?: boolean; hint?: string }) {
  return (
    <label className={`field ${wide ? 'wide-field' : ''}`}>
      <span>{label}{required && <em>*</em>}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  )
}

function Process({ state }: { state: 'reading' | 'extracting' | 'done' }) {
  const steps = ['Reading sources', 'Extracting proof', 'Adding profile data']
  return <div className="process">{steps.map((step, index) => <span className={state === 'done' || index <= (state === 'reading' ? 0 : 1) ? 'active' : ''} key={step}><CheckCircle2 size={15} /> {step}</span>)}</div>
}

function iconFor(type: InteractionType) {
  if (type === 'Email') return <Mail size={16} />
  if (type === 'Meeting') return <MessageSquareText size={16} />
  if (type === 'Transcript') return <Mic2 size={16} />
  if (type === 'Upload') return <Upload size={16} />
  return <FileText size={16} />
}

function ProofCard({ proof }: { proof: ProofPoint }) {
  return (
    <article className="proof-card">
      <div className="proof-head"><span>{proof.sourceCustomer}</span><em>{proof.approval}</em></div>
      <strong>{proof.claim}</strong>
      <p>{proof.metric} · {proof.outcomeType}</p>
      <blockquote>"{proof.quote}"</blockquote>
    </article>
  )
}

function AssetCard({ asset }: { asset: Collateral }) {
  return <article className="asset-card"><div><strong>{asset.title}</strong><span>{asset.type} · {asset.status}</span></div><p>{asset.summary}</p></article>
}

function Insight({ title, detail }: { title: string; detail: string }) {
  return <article className="insight"><CheckCircle2 size={18} /><div><strong>{title}</strong><p>{detail}</p></div></article>
}

export default App
