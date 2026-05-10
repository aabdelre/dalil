import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  Bot,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
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
  X,
} from 'lucide-react'
import './App.css'

type View = 'dashboard' | 'customerInsights' | 'customerDetail' | 'library' | 'collaterals'
type CustomerSubView = 'insights' | 'proofs'
type CustomerStatus = 'Active Deal' | 'Onboarding' | 'Live' | 'Expanding' | 'At Risk' | 'Closed' | 'Closed Lost'
type Approval = 'Internal Only' | 'Customer Approved' | 'Public'
type Stage = 'Discovery' | 'Proposal Sent' | 'Security Review' | 'Negotiation' | 'Closed Won' | 'Expansion'
type InteractionType = 'Email' | 'Meeting' | 'Upload' | 'Note' | 'Transcript'
type DataTab = 'Emails' | 'Call transcripts' | 'Meeting notes' | 'Uploads' | 'CRM notes' | 'Manual notes'

type Interaction = {
  type: InteractionType
  title: string
  date: string
  summary: string
  proofDetected?: boolean
}

type CustomerDataPoint = {
  type: DataTab
  title: string
  date: string
  source: string
  status: 'Processed' | 'Proof detected' | 'Needs review'
  signal: string
  detail: string
  emailThread?: EmailMessage[]
  rawSections?: RawDataSection[]
}

type EmailMessage = {
  from: string
  to: string
  time: string
  body: string
}

type RawDataSection = {
  title: string
  lines: string[]
}

type UpcomingItem = {
  type: 'Meeting' | 'Email' | 'Issue'
  title: string
  due: string
  source: string
  summary: string
  context: string[]
  recommendedAction: string
}

type ProofAsset = {
  id: string
  type: 'Quote' | 'Metric' | 'Outcome' | 'Objection' | 'Sales snippet'
  text: string
  source: string
  approval: Approval
  parentProof: ProofPoint
}

type DataSource = {
  name: string
  source: string
  status: 'Connected' | 'Configured' | 'Manual'
  detail: string
  cadence: string
}

type CaptureSourceType = 'Email' | 'Calendar' | 'Calls' | 'CRM' | 'Slack' | 'Manual upload'

type CaptureSetupDraft = {
  matchTarget: string
  provider: string
  rule: string
}

type UploadDraft = {
  title: string
  type: DataTab
  note: string
}

type ProofStatus = 'Active' | 'Needs refresh' | 'Retired'

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
  tags: string[]
  industries: string[]
  companySizes: string[]
  personas: string[]
  dealStages: Stage[]
  confidence: number
  dateCaptured: string
  sourceInteraction: string
  usageCount: number
  winRate: number
  formats: string[]
  status: ProofStatus
  counterObjections: string[]
}

type Collateral = {
  title: string
  type: string
  status: Approval
  summary: string
  goal?: string
  focus?: string
  referenceProof?: string
  communicates?: string
  metric?: string
  audience?: string
  channel?: string
}

type CollateralRow = {
  id: string
  asset: Collateral
  customer: Customer | null
  servedCustomer: string
  communicates: string
  metric: string
  audience: string
  channel: string
}

type CollateralDraft = {
  goal: string
  focus: string
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
  journeySummary: string
  interactionCount: number
  proofCount: number
  interactions: Interaction[]
  proof: ProofPoint[]
  collateral: Collateral[]
}

const customerStatuses: CustomerStatus[] = ['Active Deal', 'Onboarding', 'Live', 'Expanding', 'At Risk', 'Closed', 'Closed Lost']
const dataTabs: DataTab[] = ['Emails', 'Call transcripts', 'Meeting notes', 'Uploads', 'CRM notes', 'Manual notes']
const captureSourceOptions: CaptureSourceType[] = ['Email', 'Calendar', 'Calls', 'CRM', 'Slack', 'Manual upload']
const defaultCaptureSetup: CaptureSetupDraft = {
  matchTarget: '',
  provider: '',
  rule: '',
}
const defaultUploadDraft: UploadDraft = {
  title: '',
  type: 'Uploads',
  note: '',
}
const defaultCollateralDraft: CollateralDraft = {
  goal: '',
  focus: '',
}

const initialCustomers: Customer[] = [
  {
    id: 'brightcart',
    name: 'BrightCart',
    logo: 'BC',
    status: 'Live',
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
    journeySummary: 'BrightCart helps ecommerce teams manage customer onboarding at scale. They needed a way to reduce launch prep without pulling engineering into every rollout. So far they like the repeatable workflow and faster handoffs, and they have achieved a 42% reduction in onboarding prep with proof strong enough for approved sales collateral.',
    interactionCount: 46,
    proofCount: 12,
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
        tags: ['onboarding', 'efficiency', 'lean teams'],
        industries: ['Ecommerce SaaS'],
        companySizes: ['80-150 employees'],
        personas: ['VP Operations', 'RevOps'],
        dealStages: ['Negotiation', 'Closed Won'],
        confidence: 0.92,
        dateCaptured: 'May 7, 2026',
        sourceInteraction: 'QBR transcript',
        usageCount: 7,
        winRate: 0.71,
        formats: ['Customer quote', 'Data point'],
        status: 'Active',
        counterObjections: ['Implementation bandwidth', 'Lean team capacity'],
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
        tags: ['sales enablement', 'process maturity'],
        industries: ['Ecommerce SaaS', 'Healthcare SaaS'],
        companySizes: ['80-200 employees'],
        personas: ['Founder', 'RevOps'],
        dealStages: ['Discovery', 'Proposal Sent'],
        confidence: 0.78,
        dateCaptured: 'Apr 26, 2026',
        sourceInteraction: 'Renewal email from Maya',
        usageCount: 3,
        winRate: 0.66,
        formats: ['Customer quote'],
        status: 'Active',
        counterObjections: ['Founder dependency'],
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
        title: 'BrightCart case study: lean onboarding at scale',
        type: 'Case study draft',
        status: 'Internal Only',
        summary: 'Draft case study showing how BrightCart reduced onboarding prep by 42% while keeping a lean post-sales team.',
      },
    ],
  },
  {
    id: 'acme-health',
    name: 'Acme Health',
    logo: 'AH',
    status: 'Active Deal',
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
    journeySummary: 'Acme Health is evaluating Dalil while moving through security review. Their team wants confidence that implementation will not create operational drag during procurement. They are most interested in proof from similar healthcare and lean-operations teams, especially examples that show rollout speed and low internal lift.',
    interactionCount: 18,
    proofCount: 8,
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
    proof: [
      {
        id: 'p-acme-1',
        claim: 'Security-review accounts can adopt Dalil without adding a heavy implementation project.',
        sourceCustomer: 'Acme Health',
        metric: 'Pilot workspace configured in 6 business days',
        quote: 'The team could see the proof workflow without needing a long implementation cycle.',
        useCase: 'Low-lift implementation',
        outcomeType: 'Implementation confidence',
        bestFor: 'Prospects worried about implementation drag during security review',
        approval: 'Internal Only',
        tags: ['implementation', 'security review', 'healthcare'],
        industries: ['Healthcare SaaS'],
        companySizes: ['200-300 employees'],
        personas: ['VP Operations', 'Security Lead'],
        dealStages: ['Security Review', 'Negotiation'],
        confidence: 0.86,
        dateCaptured: 'May 9, 2026',
        sourceInteraction: 'Security questionnaire follow-up',
        usageCount: 2,
        winRate: 0.62,
        formats: ['Metric', 'Sales snippet'],
        status: 'Active',
        counterObjections: ['Implementation drag', 'Security review risk'],
      },
      {
        id: 'p-acme-2',
        claim: 'Acme Health’s team is responding to proof that shows credible rollout with limited internal lift.',
        sourceCustomer: 'Acme Health',
        metric: '3 stakeholder concerns mapped to existing proof',
        quote: 'What we need is confidence this does not become another process for operations.',
        useCase: 'Active deal proof matching',
        outcomeType: 'Objection handling',
        bestFor: 'Healthcare SaaS teams comparing Dalil against larger incumbents',
        approval: 'Internal Only',
        tags: ['objection handling', 'healthcare', 'incumbent'],
        industries: ['Healthcare SaaS'],
        companySizes: ['200-300 employees'],
        personas: ['VP Operations', 'CRO'],
        dealStages: ['Security Review', 'Negotiation'],
        confidence: 0.82,
        dateCaptured: 'May 9, 2026',
        sourceInteraction: 'Discovery call',
        usageCount: 1,
        winRate: 0.58,
        formats: ['Customer quote', 'Objection card'],
        status: 'Active',
        counterObjections: ['Implementation drag', 'Incumbent trust'],
      },
    ],
    collateral: [],
  },
  {
    id: 'greenline',
    name: 'Greenline',
    logo: 'GL',
    status: 'Expanding',
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
    journeySummary: 'Greenline uses Dalil to support expansion and competitive sales motions in fintech. They came in needing stronger proof against a larger incumbent and wanted a repeatable way to arm revenue teams. They like the speed of adoption and have already turned the incumbent displacement story into public proof.',
    interactionCount: 63,
    proofCount: 9,
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
        tags: ['displacement', 'speed-to-value', 'incumbent'],
        industries: ['Fintech'],
        companySizes: ['100-250 employees'],
        personas: ['Head of Revenue', 'COO'],
        dealStages: ['Negotiation', 'Closed Won', 'Expansion'],
        confidence: 0.95,
        dateCaptured: 'May 8, 2026',
        sourceInteraction: 'Expansion planning meeting',
        usageCount: 12,
        winRate: 0.83,
        formats: ['Customer quote', 'Data point', 'Video clip'],
        status: 'Active',
        counterObjections: ['Why not the larger vendor?', 'Implementation drag'],
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
    status: 'Onboarding',
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
    journeySummary: 'MedPilot is a healthcare SaaS team that needed a lightweight rollout path for a small operations group. Their goal was to prove a new workflow could launch without adding process overhead. The main achievement so far is a credible implementation story around a two-person launch team.',
    interactionCount: 24,
    proofCount: 6,
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
        tags: ['lean ops', 'change management'],
        industries: ['Healthcare SaaS'],
        companySizes: ['50-100 employees'],
        personas: ['COO', 'CS Lead'],
        dealStages: ['Discovery', 'Security Review'],
        confidence: 0.81,
        dateCaptured: 'May 1, 2026',
        sourceInteraction: 'Customer interview notes',
        usageCount: 4,
        winRate: 0.75,
        formats: ['Customer quote'],
        status: 'Needs refresh',
        counterObjections: ['Change management overhead'],
      },
    ],
    collateral: [],
  },
  {
    id: 'stacklane',
    name: 'Stacklane',
    logo: 'SL',
    status: 'Live',
    stage: 'Closed Won',
    health: 'Strong',
    industry: 'DevOps tooling',
    size: '145 employees',
    website: 'stacklane.dev',
    contacts: ['Marcus Lee, Head of Engineering', 'Priya Nair, CTO'],
    value: '$52K ARR',
    startDate: 'Jan 22, 2026',
    closeDate: 'Mar 18, 2026',
    competitor: 'CircleCI',
    personas: ['Head of Engineering: reduce pipeline drag', 'CTO: prove ROI quickly'],
    lastActivity: 'Expansion email 4 days ago',
    objection: 'Will engineering teams adopt another workflow?',
    journeySummary: 'Stacklane sells DevOps tooling to engineering teams and needed proof that workflow change would produce real technical ROI. They liked that the rollout connected directly to pipeline speed and developer experience. The relationship has produced strong proof around faster CI cycles and migration away from CircleCI.',
    interactionCount: 38,
    proofCount: 8,
    interactions: [
      {
        type: 'Email',
        title: 'Expansion email from Marcus',
        date: 'May 5',
        summary: 'Customer shared faster pipeline cycles and lower compute spend.',
        proofDetected: true,
      },
      {
        type: 'Transcript',
        title: 'Technical win review',
        date: 'Apr 16',
        summary: 'Engineering team compared rollout speed against CircleCI migration plan.',
        proofDetected: true,
      },
    ],
    proof: [
      {
        id: 'p6',
        claim: 'Cut average CI pipeline time from 18 minutes to 6 minutes.',
        sourceCustomer: 'Stacklane',
        metric: '67% faster pipelines',
        quote: 'Our engineers stopped dreading deployments. That alone is worth it.',
        useCase: 'Engineering productivity',
        outcomeType: 'Performance',
        bestFor: 'DevOps prospects comparing workflow speed and ROI',
        approval: 'Customer Approved',
        tags: ['performance', 'engineering', 'cost reduction'],
        industries: ['DevOps tooling'],
        companySizes: ['100-200 employees'],
        personas: ['Head of Engineering', 'CTO'],
        dealStages: ['Proposal Sent', 'Negotiation'],
        confidence: 0.9,
        dateCaptured: 'May 5, 2026',
        sourceInteraction: 'Expansion email from Marcus',
        usageCount: 8,
        winRate: 0.78,
        formats: ['Customer quote', 'Data point'],
        status: 'Active',
        counterObjections: ['Workflow adoption', 'Migration effort'],
      },
    ],
    collateral: [
      {
        title: 'Engineering productivity proof card',
        type: 'Sales snippet',
        status: 'Customer Approved',
        summary: 'Pipeline speed proof for technical buyers comparing alternatives.',
      },
    ],
  },
  {
    id: 'movo-hr',
    name: 'Movo HR',
    logo: 'MV',
    status: 'Expanding',
    stage: 'Expansion',
    health: 'Stable',
    industry: 'HR Tech',
    size: '95 employees',
    website: 'movohr.com',
    contacts: ['Sophie Turner, Head of People', 'James Park, COO'],
    value: '$31K ARR',
    startDate: 'Feb 8, 2026',
    closeDate: 'Apr 3, 2026',
    competitor: 'BambooHR',
    personas: ['Head of People: faster new-hire ramp', 'COO: less admin burden'],
    lastActivity: 'Slack note yesterday',
    objection: 'Will managers actually use this?',
    journeySummary: 'Movo HR focuses on employee onboarding for growing people teams. They needed help proving manager adoption and faster new-hire productivity. They like that the workflow gives managers a repeatable path, and the strongest outcome so far is a shorter ramp from three weeks to nine days.',
    interactionCount: 41,
    proofCount: 7,
    interactions: [
      {
        type: 'Note',
        title: 'Slack note from Sophie',
        date: 'Yesterday',
        summary: 'People team shared new-hire productivity gains and manager adoption data.',
        proofDetected: true,
      },
    ],
    proof: [
      {
        id: 'p7',
        claim: 'Reduced new-hire time-to-productivity from 3 weeks to 9 days.',
        sourceCustomer: 'Movo HR',
        metric: '57% faster ramp',
        quote: 'Managers finally had a repeatable onboarding path they would actually use.',
        useCase: 'Employee onboarding',
        outcomeType: 'Time-to-value',
        bestFor: 'People teams worried about manager adoption',
        approval: 'Public',
        tags: ['onboarding', 'manager adoption', 'time-to-value'],
        industries: ['HR Tech'],
        companySizes: ['50-150 employees'],
        personas: ['Head of People', 'COO'],
        dealStages: ['Discovery', 'Proposal Sent'],
        confidence: 0.87,
        dateCaptured: 'May 8, 2026',
        sourceInteraction: 'Slack note from Sophie',
        usageCount: 6,
        winRate: 0.69,
        formats: ['Customer quote', 'Data point'],
        status: 'Active',
        counterObjections: ['Manager adoption'],
      },
    ],
    collateral: [],
  },
  {
    id: 'clearpath',
    name: 'Clearpath',
    logo: 'CP',
    status: 'Active Deal',
    stage: 'Proposal Sent',
    health: 'Stable',
    industry: 'Legal Tech',
    size: '70 employees',
    website: 'clearpathlegal.com',
    contacts: ['Anna Reeves, General Counsel'],
    value: '$34K ARR',
    startDate: 'Apr 25, 2026',
    closeDate: 'Jun 14, 2026',
    competitor: 'DocuSign CLM',
    personas: ['General Counsel: shorten contract turnaround', 'CFO: justify switching cost'],
    lastActivity: 'Proposal sent 5 days ago',
    objection: 'We need confidence this beats our current CLM process.',
    journeySummary: 'Clearpath is a legal tech prospect comparing Dalil against their current CLM process. They need help building confidence that switching will reduce contract turnaround without disrupting legal operations. The relationship is still in proposal stage, so the next goal is to activate relevant proof from other ops-heavy customers.',
    interactionCount: 11,
    proofCount: 1,
    interactions: [
      {
        type: 'Meeting',
        title: 'Demo call',
        date: 'May 3',
        summary: 'Strong interest, but buyer asked for proof from another ops-heavy team.',
      },
      {
        type: 'Upload',
        title: 'Proposal package',
        date: 'May 5',
        summary: 'Proposal and security notes added to the relationship profile.',
      },
    ],
    proof: [],
    collateral: [],
  },
  {
    id: 'loopline',
    name: 'Loopline',
    logo: 'LL',
    status: 'Closed',
    stage: 'Closed Won',
    health: 'Strong',
    industry: 'Customer Success',
    size: '160 employees',
    website: 'loopline.io',
    contacts: ['Maya Singh, VP Customer Success', 'Oliver Grant, CEO'],
    value: '$44K ARR',
    startDate: 'Nov 17, 2025',
    closeDate: 'Jan 20, 2026',
    competitor: 'ChurnZero',
    personas: ['VP CS: reduce preventable churn', 'CEO: protect expansion revenue'],
    lastActivity: 'Business review 2 weeks ago',
    objection: 'Can we prove this will save revenue before renewal season?',
    journeySummary: 'Loopline supports customer success teams trying to reduce preventable churn. They needed revenue-protection proof before renewal season and liked the visibility Dalil created around risk signals. The relationship produced a strong churn-reduction story and a customer-approved one-pager.',
    interactionCount: 58,
    proofCount: 10,
    interactions: [
      {
        type: 'Meeting',
        title: 'Six-month business review',
        date: 'Apr 24',
        summary: 'Customer shared churn reduction and revenue saved from earlier risk detection.',
        proofDetected: true,
      },
    ],
    proof: [
      {
        id: 'p8',
        claim: 'Reduced churn rate from 8.2% to 3.1% in six months.',
        sourceCustomer: 'Loopline',
        metric: '$180K ARR saved',
        quote: 'We finally have visibility into why customers leave before it is too late.',
        useCase: 'Churn prevention',
        outcomeType: 'Revenue saved',
        bestFor: 'CS leaders who need revenue-protection proof',
        approval: 'Customer Approved',
        tags: ['churn reduction', 'revenue saved', 'customer success'],
        industries: ['Customer Success'],
        companySizes: ['100-200 employees'],
        personas: ['VP Customer Success', 'CEO'],
        dealStages: ['Negotiation', 'Closed Won'],
        confidence: 0.93,
        dateCaptured: 'Apr 24, 2026',
        sourceInteraction: 'Six-month business review',
        usageCount: 9,
        winRate: 0.74,
        formats: ['Customer quote', 'Data point'],
        status: 'Active',
        counterObjections: ['ROI before renewal season'],
      },
    ],
    collateral: [
      {
        title: 'Churn reduction one-pager',
        type: 'One-pager',
        status: 'Customer Approved',
        summary: 'Revenue-saved proof for CS and CEO conversations.',
      },
    ],
  },
  {
    id: 'northbeam-ai',
    name: 'Northbeam AI',
    logo: 'NB',
    status: 'At Risk',
    stage: 'Negotiation',
    health: 'Needs attention',
    industry: 'AI Infrastructure',
    size: '240 employees',
    website: 'northbeam.ai',
    contacts: ['Rachel Kim, VP Marketing', 'Dev Patel, Head of Data'],
    value: '$82K ARR',
    startDate: 'Apr 4, 2026',
    closeDate: 'May 24, 2026',
    competitor: 'Large cloud incumbent',
    personas: ['Head of Data: reliability proof', 'VP Marketing: faster analytics delivery'],
    lastActivity: 'Negotiation call today',
    objection: 'Why trust a younger vendor for critical infrastructure?',
    journeySummary: 'Northbeam AI is a late-stage active deal in AI infrastructure. They need proof that a younger vendor can be trusted for critical systems, especially against a large cloud incumbent. The current goal is to use reliability and incumbent-displacement stories to get the deal through negotiation.',
    interactionCount: 27,
    proofCount: 3,
    interactions: [
      {
        type: 'Meeting',
        title: 'Negotiation call',
        date: 'Today',
        summary: 'Buyer wants incumbent-displacement proof and references before signature.',
        proofDetected: true,
      },
    ],
    proof: [],
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
  journeySummary: string
}

type ProofDraft = {
  id: string
  claim: string
  sourceCustomer: string
  metric: string
  quote: string
  useCase: string
  outcomeType: string
  bestFor: string
  approval: Approval
  tags: string
  industries: string
  companySizes: string
  personas: string
  dealStages: string
  confidence: string
  dateCaptured: string
  sourceInteraction: string
  usageCount: string
  winRate: string
  formats: string
  status: ProofStatus
  counterObjections: string
}

function proofToDraft(proof: ProofPoint): ProofDraft {
  return {
    id: proof.id,
    claim: proof.claim,
    sourceCustomer: proof.sourceCustomer,
    metric: proof.metric,
    quote: proof.quote,
    useCase: proof.useCase,
    outcomeType: proof.outcomeType,
    bestFor: proof.bestFor,
    approval: proof.approval,
    tags: proof.tags.join(', '),
    industries: proof.industries.join(', '),
    companySizes: proof.companySizes.join(', '),
    personas: proof.personas.join(', '),
    dealStages: proof.dealStages.join(', '),
    confidence: String(Math.round(proof.confidence * 100)),
    dateCaptured: proof.dateCaptured,
    sourceInteraction: proof.sourceInteraction,
    usageCount: String(proof.usageCount),
    winRate: String(Math.round(proof.winRate * 100)),
    formats: proof.formats.join(', '),
    status: proof.status,
    counterObjections: proof.counterObjections.join(', '),
  }
}

function draftToProof(draft: ProofDraft): ProofPoint {
  const splitCsv = (value: string) => value.split(',').map((entry) => entry.trim()).filter(Boolean)
  const clamp01 = (value: string) => Math.max(0, Math.min(100, parseInt(value, 10) || 0)) / 100
  return {
    id: draft.id,
    claim: draft.claim,
    sourceCustomer: draft.sourceCustomer,
    metric: draft.metric,
    quote: draft.quote,
    useCase: draft.useCase,
    outcomeType: draft.outcomeType,
    bestFor: draft.bestFor,
    approval: draft.approval,
    tags: splitCsv(draft.tags),
    industries: splitCsv(draft.industries),
    companySizes: splitCsv(draft.companySizes),
    personas: splitCsv(draft.personas),
    dealStages: splitCsv(draft.dealStages) as Stage[],
    confidence: clamp01(draft.confidence),
    dateCaptured: draft.dateCaptured,
    sourceInteraction: draft.sourceInteraction,
    usageCount: Math.max(0, parseInt(draft.usageCount, 10) || 0),
    winRate: clamp01(draft.winRate),
    formats: splitCsv(draft.formats),
    status: draft.status,
    counterObjections: splitCsv(draft.counterObjections),
  }
}

type ChatMessage = { role: 'agent' | 'user'; text: string }

const chatStarters: Record<string, string> = {
  'Generate website proof block': "Got it — let's draft a proof block for the website. Which segment should I anchor it to: Series A-B operational SaaS, lean post-sales teams, or incumbent displacement?",
  'Generate LinkedIn post': "Sure — what's the angle? A founder POV, a customer win story, or an industry insight grounded in your closed customers?",
  'Generate investor snippet': "Let's tighten this for investors. Are we showing traction (closed ARR, win rate), proof of repeatability (segments), or differentiation (incumbent displacement)?",
  'Generate one-pager': "On it. Should the one-pager be ICP-first, customer-story-first, or competitor-displacement-first? I'll pull from BrightCart, Greenline, and MedPilot for proof.",
  'What proof is relevant to their main objection?': "Looking at this customer's main objection. Want me to surface the strongest exact match, or pull a few proof points covering different angles of the objection?",
  'Draft a follow-up email addressing implementation risk': "Got it — drafting a follow-up that addresses implementation risk. Should I lead with a customer story (BrightCart's lean rollout) or with concrete numbers (12-day implementation, 42% less prep)?",
  "Prepare tomorrow's meeting brief": "On it. For the brief, should I focus on what to cover (talking points), what to ask (discovery questions), or what to show (proof to bring)?",
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
  status: 'Active Deal',
  stage: 'Discovery',
  health: 'Stable',
  value: '',
  startDate: '',
  closeDate: '',
  competitor: '',
  personas: '',
  objection: '',
  journeySummary: '',
}

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [customers, setCustomers] = useState(initialCustomers)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [customerSubView, setCustomerSubView] = useState<CustomerSubView>('insights')
  const [customerListOpen, setCustomerListOpen] = useState(true)
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [draft, setDraft] = useState<CustomerDraft>(emptyDraft)
  const [chatTask, setChatTask] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatThinking, setChatThinking] = useState(false)
  const [chatComplete, setChatComplete] = useState(false)
  const chatBodyRef = useRef<HTMLDivElement>(null)
  const [selectedProof, setSelectedProof] = useState<ProofPoint | null>(null)
  const [selectedCustomerProof, setSelectedCustomerProof] = useState<ProofAsset | null>(null)
  const [selectedCustomerProofCustomer, setSelectedCustomerProofCustomer] = useState<Customer | null>(null)
  const [selectedCollateral, setSelectedCollateral] = useState<Collateral | null>(null)
  const [selectedCollateralCustomer, setSelectedCollateralCustomer] = useState<Customer | null>(null)
  const [editingProof, setEditingProof] = useState(false)
  const [proofDraft, setProofDraft] = useState<ProofDraft | null>(null)
  const [dashboardStatus, setDashboardStatus] = useState<CustomerStatus | 'All'>('All')
  const [libraryProofFilter, setLibraryProofFilter] = useState<ProofAsset['type'] | 'All'>('All')
  const [collateralCustomerFilter, setCollateralCustomerFilter] = useState('All')
  const [collateralCommunicationFilter, setCollateralCommunicationFilter] = useState('All')
  const [collateralMetricFilter, setCollateralMetricFilter] = useState('All')
  const [collateralStatusFilter, setCollateralStatusFilter] = useState<Approval | 'All'>('All')
  const [collateralTypeFilter, setCollateralTypeFilter] = useState('All')
  const [generalAgentInput, setGeneralAgentInput] = useState('')
  const [generalAgentMessages, setGeneralAgentMessages] = useState<ChatMessage[]>([])
  const [generalAgentHistory, setGeneralAgentHistory] = useState<string[]>([])
  const [generalAgentView, setGeneralAgentView] = useState<'current' | 'history'>('current')
  const [generalAgentThinking, setGeneralAgentThinking] = useState(false)
  const [customerAgentInput, setCustomerAgentInput] = useState('')
  const [customerAgentMessages, setCustomerAgentMessages] = useState<ChatMessage[]>([])
  const [customerAgentHistory, setCustomerAgentHistory] = useState<string[]>([])
  const [customerAgentView, setCustomerAgentView] = useState<'current' | 'history'>('current')
  const [customerAgentThinking, setCustomerAgentThinking] = useState(false)
  const [collateralAgentInput, setCollateralAgentInput] = useState('')
  const [collateralAgentMessages, setCollateralAgentMessages] = useState<ChatMessage[]>([])
  const [collateralAgentThinking, setCollateralAgentThinking] = useState(false)
  const [customGeneralCollaterals, setCustomGeneralCollaterals] = useState<Collateral[]>([])
  const [timelineView, setTimelineView] = useState<'condensed' | 'comprehensive'>('condensed')
  const [dataTab, setDataTab] = useState<DataTab>('Emails')
  const [selectedDataPoint, setSelectedDataPoint] = useState<CustomerDataPoint | null>(null)
  const [selectedUpcomingItem, setSelectedUpcomingItem] = useState<UpcomingItem | null>(null)
  const [showSourceSetup, setShowSourceSetup] = useState(false)
  const [showCustomerUpload, setShowCustomerUpload] = useState(false)
  const [uploadDraft, setUploadDraft] = useState<UploadDraft>(defaultUploadDraft)
  const [uploadFileNames, setUploadFileNames] = useState<string[]>([])
  const [uploadParsing, setUploadParsing] = useState(false)
  const [showCollateralSetup, setShowCollateralSetup] = useState(false)
  const [collateralDraft, setCollateralDraft] = useState<CollateralDraft>(defaultCollateralDraft)
  const [uploadedDataPoints, setUploadedDataPoints] = useState<Record<string, CustomerDataPoint[]>>({})
  const [customUpcomingItems, setCustomUpcomingItems] = useState<Record<string, UpcomingItem[]>>({})
  const [incomingEmailParsing, setIncomingEmailParsing] = useState(false)
  const [calendarNoticeParsing, setCalendarNoticeParsing] = useState(false)
  const [collateralGenerating, setCollateralGenerating] = useState(false)
  const [captureSourceType, setCaptureSourceType] = useState<CaptureSourceType>('Email')
  const [captureSetupDraft, setCaptureSetupDraft] = useState<CaptureSetupDraft>(defaultCaptureSetup)
  const [configuredSourceAdds, setConfiguredSourceAdds] = useState<Record<string, DataSource[]>>({})
  const [hiddenConfiguredSources, setHiddenConfiguredSources] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [chatMessages, chatThinking, chatComplete])

  const selected = selectedId ? customers.find((customer) => customer.id === selectedId) ?? null : null
  const selectedInteractions = selected ? buildInteractionHistory(selected) : []
  const selectedTimelineItems = timelineView === 'condensed' ? keyInteractions(selectedInteractions) : selectedInteractions
  const selectedDataPoints = selected ? [...(uploadedDataPoints[selected.id] ?? []), ...buildCustomerDataPoints(selected)] : []
  const selectedDataItems = selectedDataPoints.filter((item) => item.type === dataTab)
  const selectedDataRows = chunkItems(selectedDataItems, 2)
  const selectedDataSources = selected ? [...buildDataSources(selected), ...(configuredSourceAdds[selected.id] ?? [])].filter((source) => !(hiddenConfiguredSources[selected.id] ?? []).includes(source.name)) : []
  const selectedUpcomingItems = selected ? [...(customUpcomingItems[selected.id] ?? []), ...buildUpcomingItems(selected)] : []
  const selectedProofAssets = selected ? buildProofAssets(selected) : []
  const libraryProofAssets = customers.flatMap(buildProofAssets)
  const visibleLibraryProofAssets = libraryProofFilter === 'All' ? libraryProofAssets : libraryProofAssets.filter((asset) => asset.type === libraryProofFilter)
  const libraryCustomerCollaterals = customers.flatMap((customer) => customer.collateral.map((asset) => ({ customer, asset })))
  const libraryGeneralCollaterals = [...customGeneralCollaterals, ...buildGeneralCollaterals(customers)]
  const libraryProofGroups = buildLibraryProofGroups(libraryProofAssets, customers)
  const collateralRows = buildCollateralRows(customers, libraryGeneralCollaterals)
  const collateralFilterOptions = buildCollateralFilterOptions(collateralRows)
  const visibleCollateralRows = collateralRows.filter((row) =>
    (collateralCustomerFilter === 'All' || row.servedCustomer === collateralCustomerFilter) &&
    (collateralCommunicationFilter === 'All' || row.communicates === collateralCommunicationFilter) &&
    (collateralMetricFilter === 'All' || row.metric === collateralMetricFilter) &&
    (collateralStatusFilter === 'All' || row.asset.status === collateralStatusFilter) &&
    (collateralTypeFilter === 'All' || row.asset.type === collateralTypeFilter)
  )
  const stats = useMemo(
    () => ({
      customers: customers.length,
      interactions: customers.reduce((sum, customer) => sum + buildInteractionHistory(customer).length, 0),
      proof: 64,
      assets: 21,
    }),
    [customers],
  )
  const statusCounts = useMemo(
    () => customerStatuses.map((status) => ({ status, count: customers.filter((customer) => customer.status === status).length })),
    [customers],
  )
  const dashboardCustomers = dashboardStatus === 'All' ? customers : customers.filter((customer) => customer.status === dashboardStatus)

  const overview = useMemo(() => {
    const parseValueK = (value: string) => {
      const match = value.match(/\$(\d+(?:\.\d+)?)K/i)
      return match ? parseFloat(match[1]) : 0
    }
    const activePipeline = customers.filter((customer) => ['Active Deal', 'At Risk'].includes(customer.status)).reduce((sum, customer) => sum + parseValueK(customer.value), 0)
    const closedArr = customers.filter((customer) => ['Onboarding', 'Live', 'Expanding', 'Closed'].includes(customer.status)).reduce((sum, customer) => sum + parseValueK(customer.value), 0)
    const closedWithDates = customers.filter((customer) => ['Onboarding', 'Live', 'Expanding', 'Closed'].includes(customer.status) && customer.startDate && customer.closeDate)
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
    const byStatus: { status: CustomerStatus; count: number }[] = (['Active Deal', 'Onboarding', 'Live', 'Expanding', 'At Risk', 'Closed', 'Closed Lost'] as CustomerStatus[]).map((status) => ({
      status,
      count: customers.filter((customer) => customer.status === status).length,
    }))
    const recentSignals = customers
      .filter((customer) => customer.interactions.length > 0)
      .map((customer) => ({ customerId: customer.id, customerName: customer.name, ...customer.interactions[0] }))
      .slice(0, 6)
    const coverageGaps = customers.filter((customer) => ['Active Deal', 'At Risk'].includes(customer.status) && customer.proof.length === 0)
    const objections = customers
      .filter((customer) => customer.objection)
      .map((customer) => ({ id: customer.id, customer: customer.name, status: customer.status, objection: customer.objection }))
    const customersByIndustry = byIndustry.map(([industry]) => ({
      industry,
      customers: customers.filter((customer) => customer.industry === industry),
    }))
    const proofOpportunities = customers
      .filter((customer) => customer.proofCount >= 5)
      .sort((a, b) => b.proofCount - a.proofCount)
      .slice(0, 4)
      .map((customer) => ({
        id: customer.id,
        title: `${customer.name} has ${customer.proofCount} proof points ready to package`,
        detail: `${customer.industry} · strongest for ${customer.objection.toLowerCase()} conversations.`,
      }))
    const segmentInsights = byIndustry.slice(0, 3).map(([industry, count]) => {
      const segmentCustomers = customers.filter((customer) => customer.industry === industry)
      const proofTotal = segmentCustomers.reduce((sum, customer) => sum + customer.proofCount, 0)
      return {
        industry,
        count,
        proofTotal,
        detail: `${proofTotal} proof points across ${count} ${count === 1 ? 'customer' : 'customers'}.`,
      }
    })
    const activationPlays = customers
      .filter((customer) => ['Active Deal', 'At Risk'].includes(customer.status))
      .slice(0, 4)
      .map((customer) => ({
        id: customer.id,
        title: `Use proof for ${customer.name}`,
        detail: `${customer.stage} · address "${customer.objection}" before the next touchpoint.`,
      }))
    return { activePipeline, closedArr, avgCycle, byStage, maxStage, byIndustry, byStatus, recentSignals, coverageGaps, objections, customersByIndustry, proofOpportunities, segmentInsights, activationPlays }
  }, [customers])

  const activeCount = customers.filter((customer) => ['Active Deal', 'At Risk'].includes(customer.status)).length
  const closedCount = customers.length - activeCount

  function openNewCustomer() {
    setDraft(emptyDraft)
    setShowNewCustomer(true)
  }

  function openCustomer(id: string) {
    setSelectedId(id)
    setCustomerSubView('insights')
    setView('customerDetail')
  }

  function createCustomer(event: React.FormEvent) {
    event.preventDefault()
    const baseId = draft.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `customer-${Date.now()}`
    const existingIds = new Set(customers.map((customer) => customer.id))
    let id = baseId
    let suffix = 2
    while (existingIds.has(id)) {
      id = `${baseId}-${suffix}`
      suffix += 1
    }
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
      journeySummary: draft.journeySummary || 'This customer was just added. Add notes, transcripts, emails, and proof points to build a useful relationship summary.',
      interactionCount: 0,
      proofCount: 0,
      interactions: [],
      proof: [],
      collateral: [],
    }
    setCustomers((current) => [customer, ...current])
    setUploadedDataPoints((current) => ({ ...current, [id]: [] }))
    setCustomUpcomingItems((current) => ({ ...current, [id]: [] }))
    setConfiguredSourceAdds((current) => ({ ...current, [id]: [] }))
    setHiddenConfiguredSources((current) => ({ ...current, [id]: [] }))
    setDraft(emptyDraft)
    setSelectedId(id)
    setCustomerSubView('insights')
    setView('customerDetail')
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

  function submitGeneralAgent() {
    const text = generalAgentInput.trim()
    if (!text || generalAgentThinking) return
    setGeneralAgentInput('')
    const activeDeals = customers.filter((customer) => ['Active Deal', 'At Risk'].includes(customer.status))
    const topSegment = overview.byIndustry[0]?.[0] ?? 'your strongest segment'
    const strongestProof = customers.slice().sort((a, b) => b.proofCount - a.proofCount)[0]
    const turn = generalAgentMessages.filter((message) => message.role === 'user').length
    setGeneralAgentMessages((current) => [...current, { role: 'user', text }])
    setGeneralAgentThinking(true)
    window.setTimeout(() => {
      setGeneralAgentThinking(false)
      setGeneralAgentMessages((current) => [
        ...current,
        {
          role: 'agent',
          text: buildGeneralAgentReply(turn, {
            customers: customers.length,
            interactions: stats.interactions,
            proof: stats.proof,
            activeDeals: activeDeals.length,
            topSegment,
            strongestCustomer: strongestProof?.name ?? 'the strongest closed customer',
          }),
        },
      ])
    }, 1100 + turn * 250)
  }

  function startNewGeneralChat() {
    if (generalAgentMessages.length > 0) {
      const firstUserMessage = generalAgentMessages.find((message) => message.role === 'user')?.text
      setGeneralAgentHistory((current) => [firstUserMessage || 'Untitled chat', ...current].slice(0, 6))
    }
    setGeneralAgentMessages([])
    setGeneralAgentInput('')
    setGeneralAgentThinking(false)
    setGeneralAgentView('current')
  }

  function submitCustomerAgent() {
    const text = customerAgentInput.trim()
    if (!text || !selected || customerAgentThinking) return
    askCustomerAgent(text)
    setCustomerAgentInput('')
  }

  function askCustomerAgent(text: string) {
    if (!selected || customerAgentThinking) return
    setCustomerAgentView('current')
    const customerDataCount = selectedDataPoints.length
    const timelineCount = selectedInteractions.length
    const proofAssetCount = selectedProofAssets.length
    const turn = customerAgentMessages.filter((message) => message.role === 'user').length
    const customerContext = {
      name: selected.name,
      stage: selected.stage,
      objection: selected.objection,
      dataCount: customerDataCount,
      timelineCount,
      proofAssetCount,
      upcomingCount: selectedUpcomingItems.length,
    }
    setCustomerAgentMessages((current) => [...current, { role: 'user', text }])
    setCustomerAgentThinking(true)
    window.setTimeout(() => {
      setCustomerAgentThinking(false)
      setCustomerAgentMessages((current) => [
        ...current,
        {
          role: 'agent',
          text: buildCustomerAgentReply(turn, customerContext),
        },
      ])
    }, 1200 + turn * 250)
  }

  function startNewCustomerAgentChat() {
    if (customerAgentMessages.length > 0) {
      const firstUserMessage = customerAgentMessages.find((message) => message.role === 'user')?.text
      setCustomerAgentHistory((current) => [firstUserMessage || 'Untitled chat', ...current].slice(0, 6))
    }
    setCustomerAgentMessages([])
    setCustomerAgentInput('')
    setCustomerAgentThinking(false)
    setCustomerAgentView('current')
  }

  function submitCollateralAgent() {
    const text = collateralAgentInput.trim()
    if (!text || collateralAgentThinking) return
    const turn = collateralAgentMessages.filter((message) => message.role === 'user').length
    setCollateralAgentInput('')
    setCollateralAgentMessages((current) => [...current, { role: 'user', text }])
    setCollateralAgentThinking(true)
    window.setTimeout(() => {
      const created = turn > 0 || /create|generate|draft|case|one-pager|website|battlecard/i.test(text)
      if (created) {
        const newCollateral = buildAgentCollateral(text, customers, customGeneralCollaterals.length)
        setCustomGeneralCollaterals((current) => [newCollateral, ...current])
      }
      setCollateralAgentMessages((current) => [
        ...current,
        {
          role: 'agent',
          text: created
            ? 'I created a new collateral draft and added it to the table. It is tagged as a general asset until you attach it to a specific customer.'
            : 'I can create a collateral draft from a goal, audience, proof angle, and channel. Tell me what you want to communicate and whether it should be customer-specific or general.',
        },
      ])
      setCollateralAgentThinking(false)
    }, 1100 + turn * 250)
  }

  function closeProof() {
    setSelectedProof(null)
    setSelectedCustomerProof(null)
    setSelectedCustomerProofCustomer(null)
    setSelectedCollateral(null)
    setSelectedCollateralCustomer(null)
    setEditingProof(false)
    setProofDraft(null)
  }

  function closeDataPoint() {
    setSelectedDataPoint(null)
  }

  function addCaptureSource() {
    if (!selected) return
    const source = buildConfiguredCaptureSource(selected, captureSourceType, captureSetupDraft)
    setConfiguredSourceAdds((current) => ({
      ...current,
      [selected.id]: [...(current[selected.id] ?? []).filter((item) => item.name !== source.name), source],
    }))
    setHiddenConfiguredSources((current) => ({
      ...current,
      [selected.id]: (current[selected.id] ?? []).filter((name) => name !== source.name),
    }))
    setCaptureSetupDraft(defaultCaptureSetup)
    setShowSourceSetup(false)
  }

  function removeCaptureSource(name: string) {
    if (!selected) return
    setConfiguredSourceAdds((current) => ({
      ...current,
      [selected.id]: (current[selected.id] ?? []).filter((source) => source.name !== name),
    }))
    setHiddenConfiguredSources((current) => ({
      ...current,
      [selected.id]: [...new Set([...(current[selected.id] ?? []), name])],
    }))
  }

  function uploadCustomerData(event: React.FormEvent) {
    event.preventDefault()
    if (!selected) return
    const selectedFiles = uploadFileNames.length ? uploadFileNames : ['customer-proof-pack.zip']
    const title = uploadDraft.title.trim() || `${selected.name} ${selectedFiles.length > 1 ? 'customer data pack' : selectedFiles[0]}`
    const note = uploadDraft.note.trim() || 'Uploaded source material for AI parsing and customer-profile enrichment.'
    setUploadParsing(true)
    window.setTimeout(() => {
      const uploadedPoints = buildUploadedDataPoints(selected, selectedFiles, note)
      const uploadInteractions = buildUploadInteractions(selected, selectedFiles)
      setUploadedDataPoints((current) => ({
        ...current,
        [selected.id]: [...uploadedPoints, ...(current[selected.id] ?? [])],
      }))
      const uploadedUpcoming = buildUploadUpcomingItems(selected, title, note)
      setCustomUpcomingItems((current) => ({
        ...current,
        [selected.id]: [...uploadedUpcoming, ...(current[selected.id] ?? [])],
      }))
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === selected.id
            ? {
                ...customer,
                lastActivity: 'Upload parsed just now',
                journeySummary: buildUploadedJourneySummary(customer, selectedFiles, note),
                interactionCount: customer.interactionCount + uploadInteractions.length,
                proofCount: customer.proofCount + 10,
                interactions: [...uploadInteractions, ...customer.interactions],
                proof: [
                  makeDemoProof(customer, {
                    id: `upload-outcome-${customer.id}-${Date.now()}`,
                    claim: `${customer.name} can now show a clearer before-and-after story from uploaded customer evidence.`,
                    metric: '3 data sources linked into one proof profile',
                    quote: 'This gives us a much clearer customer story to use in the next sales cycle.',
                    sourceInteraction: selectedFiles[0] ?? title,
                    bestFor: `prospects asking about ${customer.objection.toLowerCase()}`,
                  }),
                  makeDemoProof(customer, {
                    id: `upload-metric-${customer.id}-${Date.now()}`,
                    claim: `${customer.name} reduced manual proof preparation after Dalil organized the raw customer data.`,
                    metric: '38% faster proof preparation',
                    quote: 'We can answer proof requests without rebuilding the story from scratch.',
                    sourceInteraction: selectedFiles.find((file) => inferDataTypeFromFilename(file) === 'CRM notes') ?? title,
                    bestFor: 'sales teams that need faster response cycles',
                  }),
                  ...customer.proof,
                ],
              }
            : customer,
        ),
      )
      setDataTab(uploadedPoints[0]?.type ?? uploadDraft.type)
      setUploadParsing(false)
      setShowCustomerUpload(false)
      setUploadDraft(defaultUploadDraft)
      setUploadFileNames([])
    }, 900)
  }

  function simulateIncomingEmail() {
    if (!selected || incomingEmailParsing) return
    setIncomingEmailParsing(true)
    window.setTimeout(() => {
      const contact = selected.contacts[0]?.split(',')[0] ?? 'Main contact'
      const domain = customerDomain(selected)
      const emailPoint: CustomerDataPoint = {
        type: 'Emails',
        title: `New email from ${contact}`,
        date: 'Just now',
        source: `Email capture · ${domain}`,
        status: 'Proof detected',
        signal: `Matched sender domain to ${domain}, checked relevance, and routed the email into ${selected.name}.`,
        detail: `${contact} asked for proof related to ${selected.objection.toLowerCase()} and shared language that can be used in follow-up.`,
        emailThread: buildEmailThread(selected, 'proof-request'),
      }
      const emailUpcoming: UpcomingItem = {
        type: 'Email',
        title: `Respond to ${contact}`,
        due: 'Due today',
        source: 'Email capture',
        summary: `A relevant email from ${domain} was captured and needs a response using proof from this customer and the broader library.`,
        context: [
          `Sender domain matched ${domain}.`,
          `Email mentions ${selected.objection.toLowerCase()} and asks for a credible customer example.`,
          'Dalil parsed the thread, added it to Data, and created this follow-up task.',
        ],
        recommendedAction: `Draft a reply to ${contact} using proof that addresses ${selected.objection}.`,
      }
      setUploadedDataPoints((current) => ({
        ...current,
        [selected.id]: [emailPoint, ...(current[selected.id] ?? [])],
      }))
      setCustomUpcomingItems((current) => ({
        ...current,
        [selected.id]: [emailUpcoming, ...(current[selected.id] ?? [])],
      }))
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === selected.id
            ? {
                ...customer,
                lastActivity: 'Email captured just now',
                interactionCount: customer.interactionCount + 1,
                proofCount: customer.proofCount + 5,
                interactions: [
                  {
                    type: 'Email',
                    title: `Email captured from ${customerDomain(customer)}`,
                    date: 'Just now',
                    summary: `Relevant message from ${contact} was matched by domain, parsed, and routed into the customer profile.`,
                    proofDetected: true,
                  },
                  ...customer.interactions,
                ],
                proof: [
                  makeDemoProof(customer, {
                    id: `email-${customer.id}-${Date.now()}`,
                    claim: `${customer.name} has a fresh proof request tied to ${customer.objection.toLowerCase()}.`,
                    metric: '1 relevant thread captured',
                    quote: 'Can you send a customer example that shows this will not slow the team down?',
                    sourceInteraction: `New email from ${contact}`,
                    bestFor: `follow-up emails about ${customer.objection.toLowerCase()}`,
                  }),
                  ...customer.proof,
                ],
              }
            : customer,
        ),
      )
      setDataTab('Emails')
      setIncomingEmailParsing(false)
    }, 850)
  }

  function simulateCalendarNotice() {
    if (!selected || calendarNoticeParsing) return
    setCalendarNoticeParsing(true)
    window.setTimeout(() => {
      const contact = selected.contacts[0]?.split(',')[0] ?? 'Main contact'
      const notice: UpcomingItem = {
        type: 'Meeting',
        title: `${contact} meeting brief ready`,
        due: 'In 30 minutes',
        source: 'Calendar connection',
        summary: `Dalil detected an upcoming meeting with ${selected.name} and prepared the context the team should use before joining.`,
        context: [
          `Calendar attendees include ${contact} and match ${selected.website}.`,
          `Current stage: ${selected.stage}.`,
          `Main concern to address: ${selected.objection}.`,
          `Recommended proof: use the strongest similar customer story before discussing next steps.`,
        ],
        recommendedAction: `Open a pre-meeting brief for ${selected.name} focused on ${selected.objection}.`,
      }
      setCustomUpcomingItems((current) => ({
        ...current,
        [selected.id]: [notice, ...(current[selected.id] ?? [])],
      }))
      setSelectedUpcomingItem(notice)
      setCalendarNoticeParsing(false)
    }, 700)
  }

  function openCollateralSetup() {
    setCollateralDraft(defaultCollateralDraft)
    setShowCollateralSetup(true)
  }

  function generateCustomerCollateral(event?: React.FormEvent) {
    event?.preventDefault()
    if (!selected || collateralGenerating) return
    const goal = collateralDraft.goal.trim() || 'Help the sales team build trust with a prospect using customer proof.'
    const focus = collateralDraft.focus.trim() || selected.objection || 'implementation confidence'
    setCollateralGenerating(true)
    window.setTimeout(() => {
      const referenceCustomer = customers.find((customer) => customer.id !== selected.id && customer.proof.length > 0)
      const newCollateral: Collateral = {
        title: `${selected.name} ${focus} case study`,
        type: 'Case study draft',
        status: 'Internal Only',
        summary: `Goal: ${goal} Focus: ${focus}. Drafted from ${selected.name}'s proof profile and strengthened with similar proof from ${referenceCustomer?.name ?? 'previous customers'} around ${selected.objection.toLowerCase()}.`,
        goal,
        focus,
        referenceProof: referenceCustomer ? `${referenceCustomer.name}: ${referenceCustomer.proof[0]?.metric ?? 'relevant proof point'}` : 'Previous customer proof library',
        communicates: inferCommunication(`${focus} ${selected.objection}`, selected),
        metric: inferMetric(`${focus} ${selected.proof[0]?.metric ?? ''}`, inferCommunication(`${focus} ${selected.objection}`, selected)),
        audience: 'Sales',
        channel: 'Sales deck',
      }
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === selected.id
            ? {
                ...customer,
                collateral: [newCollateral, ...customer.collateral],
              }
            : customer,
        ),
      )
      setSelectedCollateral(newCollateral)
      setSelectedCollateralCustomer(selected)
      setCollateralGenerating(false)
      setShowCollateralSetup(false)
      setCollateralDraft(defaultCollateralDraft)
    }, 900)
  }

  function startEditProof() {
    if (!selectedProof) return
    setProofDraft(proofToDraft(selectedProof))
    setEditingProof(true)
  }

  function saveProof() {
    if (!proofDraft) return
    const updated = draftToProof(proofDraft)
    setCustomers((current) =>
      current.map((customer) => ({
        ...customer,
        proof: customer.proof.map((point) => (point.id === updated.id ? updated : point)),
      })),
    )
    setSelectedProof(updated)
    setEditingProof(false)
    setProofDraft(null)
  }

  function viewProofCustomer(proof: ProofPoint) {
    const owner = customers.find((customer) => customer.name === proof.sourceCustomer)
    closeProof()
    if (owner) {
      openCustomer(owner.id)
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">د</div>
          <div className="brand-text">
            <strong>Dalil</strong>
          </div>
        </div>
        <nav>
          <NavButton active={view === 'dashboard'} icon={<Building2 size={18} />} label="Dashboard" onClick={() => setView('dashboard')} />
          <NavButton active={view === 'customerInsights'} icon={<Layers3 size={18} />} label="Customer Insights" onClick={() => { setSelectedId(null); setView('customerInsights') }} />
          <button className="sidebar-collapse" onClick={() => setCustomerListOpen((open) => !open)}>
            <ChevronDown className={customerListOpen ? 'open' : ''} size={14} />
            Customers
            <span>{customers.length}</span>
          </button>
          {customerListOpen && (
            <div className="sidebar-subnav">
              {customers.map((customer) => (
                <button className={view === 'customerDetail' && selectedId === customer.id ? 'active' : ''} key={customer.id} onClick={() => openCustomer(customer.id)}>
                  {customer.name}
                </button>
              ))}
            </div>
          )}
          <NavButton active={view === 'library'} icon={<ShieldCheck size={18} />} label="Proof Library" onClick={() => setView('library')} />
          <NavButton active={view === 'collaterals'} icon={<FileText size={18} />} label="Collaterals" onClick={() => setView('collaterals')} />
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>{view === 'dashboard' ? 'Customer Portfolio' : view === 'customerInsights' ? 'Customer Insights' : view === 'customerDetail' ? selected?.name ?? 'Customer' : view === 'collaterals' ? 'Collaterals' : 'Company Proof Memory'}</h1>
          </div>
          <div className="topbar-actions">
            {view !== 'dashboard' && <button className="search-button"><Search size={17} /> Search proof</button>}
            <button className="primary" onClick={openNewCustomer}><Plus size={18} /> New customer</button>
          </div>
        </header>

        <section className={`page ${view === 'dashboard' ? 'dashboard-page' : ''}`}>
          {view === 'dashboard' && (
            <div className="dashboard-content">
              <section className="dashboard-main">
                <div className="summary-strip">
                  <Stat label="Total customers" value={stats.customers} icon={<Building2 size={18} />} />
                  <Stat label="Proof points" value={stats.proof} icon={<Sparkles size={18} />} />
                  <Stat label="Sales collateral" value={stats.assets} icon={<FileText size={18} />} />
                </div>

                  <div className="section-head">
                    <h2>All customers</h2>
                  </div>
                  <div className="status-filters" aria-label="Filter customers by status">
                    <button className={dashboardStatus === 'All' ? 'active' : ''} onClick={() => setDashboardStatus('All')}>
                      All <span>{customers.length}</span>
                    </button>
                    {statusCounts.map(({ status, count }) => (
                      <button key={status} className={dashboardStatus === status ? 'active' : ''} onClick={() => setDashboardStatus(status)}>
                        {status} <span>{count}</span>
                      </button>
                    ))}
                  </div>
                  <div className="customer-grid">
                    {dashboardCustomers.map((customer) => (
                      <button className="customer-card" key={customer.id} onClick={() => openCustomer(customer.id)}>
                        <div className="card-top">
                          <div className="logo">{customer.logo}</div>
                          <span className={`badge ${statusClass(customer.status)}`}>{customer.status}</span>
                        </div>
                        <div>
                          <h3>{customer.name}</h3>
                          <p>{customer.industry}</p>
                        </div>
                        <div className="card-meta">
                          <span>{['Active Deal', 'At Risk'].includes(customer.status) ? customer.stage : `${customer.health} health`}</span>
                          <div className="card-stats">
                            <span>{buildInteractionHistory(customer).length} interactions</span>
                            <span>{customer.proofCount} proof</span>
                          </div>
                        </div>
                        <div className="last-activity"><Clock3 size={15} /> {customer.lastActivity}</div>
                      </button>
                    ))}
                  </div>
              </section>

              <aside className="dashboard-agent">
                  <div className="agent-topbar">
                    <button type="button" className={generalAgentView === 'current' ? 'active' : ''} onClick={() => setGeneralAgentView('current')}>
                      <strong>Current</strong>
                      <span>{generalAgentMessages.length ? `${generalAgentMessages.length} messages` : 'No active chat'}</span>
                    </button>
                    <button type="button" className={generalAgentView === 'history' ? 'active' : ''} onClick={() => setGeneralAgentView('history')}>
                      History
                    </button>
                    <button type="button" className="secondary" onClick={startNewGeneralChat}>
                      <Plus size={15} /> New chat
                    </button>
                  </div>

                  <div className="dashboard-agent-chat">
                    {generalAgentView === 'history' ? (
                      generalAgentHistory.length === 0 ? (
                        <p className="empty-chat">No saved chats yet.</p>
                      ) : (
                        <div className="agent-history-list">
                          {generalAgentHistory.map((item, index) => (
                            <button type="button" key={`${item}-${index}`}>{item}</button>
                          ))}
                        </div>
                      )
                    ) : generalAgentMessages.length === 0 ? (
                      <p className="empty-chat">Ask Dalil about proof gaps, active deals, or what customer story to use next.</p>
                    ) : (
                      <>
                        {generalAgentMessages.map((message, index) => (
                          <div className={`dashboard-agent-msg ${message.role}`} key={index}>
                            <p>{message.text}</p>
                          </div>
                        ))}
                        {generalAgentThinking && <AgentThinking />}
                      </>
                    )}
                  </div>

                  <form className="dashboard-agent-input" onSubmit={(event) => { event.preventDefault(); submitGeneralAgent() }}>
                    <input value={generalAgentInput} onChange={(event) => setGeneralAgentInput(event.target.value)} placeholder="Ask Dalil..." disabled={generalAgentThinking} />
                    <button type="submit" aria-label="Send message" disabled={generalAgentThinking || !generalAgentInput.trim()}><Send size={15} /></button>
                  </form>
              </aside>
            </div>
          )}

          {view === 'customerInsights' && (
            <>
              <div className="insights-main">
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
                        <div className={`breakdown-row status-${statusClass(status)}`} key={status}>
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

              <Section title="Portfolio intelligence" action={<Sparkles size={18} />}>
                <div className="portfolio-intelligence-grid">
                  <div className="insight-stack">
                    <h3>Strongest segments</h3>
                    {overview.segmentInsights.map((segment) => (
                      <article className="portfolio-insight-card" key={segment.industry}>
                        <strong>{segment.industry}</strong>
                        <p>{segment.detail}</p>
                        <em>{segment.count} accounts</em>
                      </article>
                    ))}
                  </div>
                  <div className="insight-stack">
                    <h3>Proof packaging opportunities</h3>
                    {overview.proofOpportunities.map((item) => (
                      <button className="portfolio-insight-card clickable" key={item.id} onClick={() => openCustomer(item.id)}>
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                        <em>Package into collateral</em>
                      </button>
                    ))}
                  </div>
                  <div className="insight-stack">
                    <h3>Activation plays</h3>
                    {overview.activationPlays.map((item) => (
                      <button className="portfolio-insight-card clickable" key={item.id} onClick={() => openCustomer(item.id)}>
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                        <em>Prep proof for deal</em>
                      </button>
                    ))}
                  </div>
                </div>
              </Section>
              </div>
            </>
          )}

          {view === 'customerDetail' && selected && (
            <div className="customer-layout">
              <button className="back-link customer-back-link" onClick={() => { setSelectedId(null); setView('customerInsights') }}>
                <ChevronLeft size={16} /> Customer Insights
              </button>
              <div className="customer-tabs" aria-label="Customer sections">
                <button className={customerSubView === 'insights' ? 'active' : ''} onClick={() => setCustomerSubView('insights')}>Customer Insights</button>
                <button className={customerSubView === 'proofs' ? 'active' : ''} onClick={() => setCustomerSubView('proofs')}>Proofs & Collaterals</button>
              </div>
              <div className="main-column">
                {customerSubView === 'insights' ? (
                  <>
                    <Section title="Summary">
                      <p className="journey-summary">{customerJourneySummary(selected)}</p>
                    </Section>

                    <Section title="Overview" action={<span className={`badge ${statusClass(selected.status)}`}>{selected.status}</span>}>
                      <div className="overview-grid">
                        <Info label="Industry" value={selected.industry} />
                        <Info label="Size" value={selected.size} />
                        <Info label="Website" value={selected.website} />
                        <Info label="Main contacts" value={selected.contacts.join(' · ')} />
                        <Info label="Stage" value={selected.stage} />
                        <Info label="Value" value={selected.value} />
                        <Info label="Start date" value={selected.startDate} />
                      </div>
                    </Section>

                    <Section
                  title="Data Sources"
                  action={
                    <div className="inline-actions">
                      <button className="secondary" onClick={simulateIncomingEmail} disabled={incomingEmailParsing}>
                        <Mail size={16} /> {incomingEmailParsing ? 'Parsing...' : 'Simulate email'}
                      </button>
                      <button className="secondary" onClick={() => setShowSourceSetup(true)}><Plus size={16} /> Add source</button>
                    </div>
                  }
                    >
                  <div className="capture-source-list">
                    {selectedDataSources.map((source) => (
                      <article className="capture-source-card" key={source.name}>
                        <div className="capture-source-main">
                          <span className={`source-dot source-${source.status.toLowerCase()}`} />
                          <div>
                            <strong>{source.name}</strong>
                            <span>{source.source}</span>
                          </div>
                        </div>
                        <p>{source.detail}</p>
                        <footer>
                          <em>{source.status}</em>
                          <span>{source.cadence}</span>
                          <button type="button" onClick={() => removeCaptureSource(source.name)}>Remove</button>
                        </footer>
                      </article>
                    ))}
                  </div>
                  <div className="coming-soon-integrations">
                    <strong>Coming soon</strong>
                    <span>Integrations with Apollo and Dripify for outbound sequence context, prospect activity, and automated capture into the right customer profile.</span>
                  </div>
                    </Section>

                    <Section
                  title="Interactions Timeline"
                  action={
                    <div className="segmented-control" aria-label="Timeline view">
                      <button className={timelineView === 'condensed' ? 'active' : ''} onClick={() => setTimelineView('condensed')}>Condensed</button>
                      <button className={timelineView === 'comprehensive' ? 'active' : ''} onClick={() => setTimelineView('comprehensive')}>Comprehensive</button>
                    </div>
                  }
                    >
                  <div className={`timeline timeline-${timelineView}`}>
                    {selectedTimelineItems.map((item) => (
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

                    <Section title="Data" action={<button className="secondary" onClick={() => setShowCustomerUpload(true)}><Upload size={16} /> Upload</button>}>
                  <div className="data-tabs" aria-label="Customer data types">
                    {dataTabs.map((tab) => (
                      <button className={dataTab === tab ? 'active' : ''} key={tab} onClick={() => setDataTab(tab)}>
                        {tab}
                        <span>{selectedDataPoints.filter((item) => item.type === tab).length}</span>
                      </button>
                    ))}
                  </div>
                  <div className="data-list">
                    {selectedDataRows.length === 0 ? (
                      <div className="empty-state">
                        <Upload size={22} />
                        <p>No {dataTab.toLowerCase()} have been added for this customer yet.</p>
                      </div>
                    ) : selectedDataRows.map((row, rowIndex) => (
                      <div className="data-row" key={`${dataTab}-${rowIndex}`}>
                        {row.map((item) => {
                          const itemKey = `${selected.id}-${item.type}-${item.title}`
                          return (
                            <button className="data-point" key={itemKey} onClick={() => setSelectedDataPoint(item)}>
                              <span className="data-point-head">
                                <strong>{item.title}</strong>
                                <em className={item.status === 'Proof detected' ? 'detected' : ''}>{item.status}</em>
                              </span>
                              <span className="data-point-meta">{item.date} · Source: {item.source}</span>
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                    </Section>
                  </>
                ) : (
                  <div className="customer-proof-page">
                    <Section title="Proof Points">
                      <div className="customer-proof-list">
                        {selectedProofAssets.length === 0 ? (
                          <div className="empty-state">
                            <Sparkles size={22} />
                            <p>No customer-specific proof points have been extracted yet.</p>
                          </div>
                        ) : selectedProofAssets.map((asset) => (
                          <button className="proof-asset-row" key={asset.id} onClick={() => { setSelectedCustomerProof(asset); setSelectedCustomerProofCustomer(selected) }}>
                            <span>{asset.type}</span>
                            <strong>{asset.text}</strong>
                            <p>{asset.source}</p>
                          </button>
                        ))}
                      </div>
                    </Section>

                    <Section
                      title="Collaterals"
                      action={
                        <button className="secondary" onClick={openCollateralSetup} disabled={collateralGenerating}>
                          <Sparkles size={16} /> {collateralGenerating ? 'Generating...' : 'Generate collateral'}
                        </button>
                      }
                    >
                      <div className="customer-proof-list">
                        {selected.collateral.length === 0 ? (
                          <div className="empty-state">
                            <FileText size={22} />
                            <p>No collateral has been generated for this customer yet.</p>
                          </div>
                        ) : selected.collateral.map((asset) => (
                          <button className="collateral-card" key={asset.title} onClick={() => { setSelectedCollateral(asset); setSelectedCollateralCustomer(selected) }}>
                            <div><strong>{asset.title}</strong><span>{asset.type} · {asset.status}</span></div>
                            <p>{asset.summary}</p>
                          </button>
                        ))}
                      </div>
                    </Section>
                  </div>
                )}
              </div>

              <aside className="right-column customer-right-column">
                <Section
                  title="Upcoming"
                  action={
                    <button className="secondary" onClick={simulateCalendarNotice} disabled={calendarNoticeParsing}>
                      <Clock3 size={16} /> {calendarNoticeParsing ? 'Detecting...' : 'Simulate meeting'}
                    </button>
                  }
                >
                  <div className="upcoming-list">
                    {selectedUpcomingItems.length === 0 ? (
                      <div className="empty-state">
                        <Clock3 size={22} />
                        <p>No upcoming customer actions yet.</p>
                      </div>
                    ) : selectedUpcomingItems.map((item) => (
                      <button className="upcoming-item" key={`${item.type}-${item.title}`} onClick={() => setSelectedUpcomingItem(item)}>
                        <div className="upcoming-type">{iconForUpcoming(item.type)}</div>
                        <div>
                          <strong>{item.title}</strong>
                          <span>{item.due} · Source: {item.source}</span>
                          <p>{item.summary}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </Section>

                <section className="panel customer-agent-panel">
                  <div className="agent-topbar">
                    <button type="button" className={customerAgentView === 'current' ? 'active' : ''} onClick={() => setCustomerAgentView('current')}>
                      Current
                      <span>{customerAgentMessages.length ? `${customerAgentMessages.length} messages` : 'No active chat'}</span>
                    </button>
                    <button type="button" className={customerAgentView === 'history' ? 'active' : ''} onClick={() => setCustomerAgentView('history')}>
                      History
                    </button>
                    <button type="button" className="secondary" onClick={startNewCustomerAgentChat}>New chat</button>
                  </div>
                  <div className="dashboard-agent-chat customer-agent-chat">
                    <div className="customer-agent-context">
                      <strong>Fine-tuned on {selected.name}</strong>
                      <span>Uses this customer’s data sources, timeline, upcoming work, deal context, objections, and proof history.</span>
                    </div>
                    {customerAgentView === 'history' ? (
                      customerAgentHistory.length === 0 ? (
                        <p className="empty-chat">No archived customer chats yet.</p>
                      ) : (
                        <div className="agent-history-list">
                          {customerAgentHistory.map((item, index) => (
                            <button key={`${item}-${index}`} onClick={() => setCustomerAgentView('current')}>{item}</button>
                          ))}
                        </div>
                      )
                    ) : customerAgentMessages.length === 0 ? (
                      <p className="empty-chat">Ask about this customer, upcoming work, source data, or proof to use next.</p>
                    ) : (
                      <>
                        {customerAgentMessages.map((message, index) => (
                          <div className={`dashboard-agent-msg ${message.role}`} key={index}>
                            <p>{message.text}</p>
                          </div>
                        ))}
                        {customerAgentThinking && <AgentThinking />}
                      </>
                    )}
                  </div>
                  <form className="dashboard-agent-input customer-agent-input" onSubmit={(event) => { event.preventDefault(); submitCustomerAgent() }}>
                    <input value={customerAgentInput} onChange={(event) => setCustomerAgentInput(event.target.value)} placeholder={`Ask about ${selected.name}...`} disabled={customerAgentThinking} />
                    <button type="submit" aria-label="Send" disabled={customerAgentThinking || !customerAgentInput.trim()}><Send size={16} /></button>
                  </form>
                </section>
              </aside>
            </div>
          )}

          {view === 'library' && (
            <div className="library-memory">
              <Section title="Proof Groups" action={<Sparkles size={18} />}>
                <div className="library-group-grid">
                  {libraryProofGroups.map((group) => (
                    <article className="library-group-card" key={group.title}>
                      <div>
                        <strong>{group.title}</strong>
                        <span>{group.count} items</span>
                      </div>
                      <p>{group.detail}</p>
                    </article>
                  ))}
                </div>
              </Section>

              <div className="library-layout">
                <main className="main-column">
                  <Section title="All Proof Points">
                    <div className="filter-bar">
                      {(['All', 'Quote', 'Metric', 'Outcome', 'Objection', 'Sales snippet'] as const).map((filter) => (
                        <button className={libraryProofFilter === filter ? 'active' : ''} key={filter} onClick={() => setLibraryProofFilter(filter)}>
                          {filter === 'All' ? 'All' : filter === 'Quote' ? 'Quotes' : filter === 'Metric' ? 'Metrics' : filter === 'Outcome' ? 'Outcomes' : filter === 'Objection' ? 'Objections' : 'Sales snippets'}
                        </button>
                      ))}
                    </div>
                    <div className="proof-list library-proof-list">
                      {visibleLibraryProofAssets.map((asset) => (
                        <button className="proof-asset-row" key={`${asset.parentProof.sourceCustomer}-${asset.id}`} onClick={() => { setSelectedCustomerProof(asset); setSelectedCustomerProofCustomer(customers.find((customer) => customer.name === asset.parentProof.sourceCustomer) ?? null) }}>
                          <span>{asset.type}</span>
                          <strong>{asset.text}</strong>
                          <p>{asset.parentProof.sourceCustomer} · {asset.source}</p>
                        </button>
                      ))}
                    </div>
                  </Section>

                  <Section title="Customer Collaterals">
                    <div className="library-collateral-grid">
                      {libraryCustomerCollaterals.map(({ customer, asset }) => (
                        <button className="collateral-card" key={`${customer.id}-${asset.title}`} onClick={() => { setSelectedCollateral(asset); setSelectedCollateralCustomer(customer) }}>
                          <div><strong>{asset.title}</strong><span>{customer.name} · {asset.type} · {asset.status}</span></div>
                          <p>{asset.summary}</p>
                        </button>
                      ))}
                    </div>
                  </Section>
                </main>

                <aside className="right-column">
                  <Section title="General Collaterals" action={<FileText size={18} />}>
                    <div className="library-general-grid">
                      {libraryGeneralCollaterals.map((asset) => (
                        <button className="general-collateral-card" key={asset.title} onClick={() => openChat(`Generate ${asset.title}`)}>
                          <strong>{asset.title}</strong>
                          <span>{asset.type} · {asset.status}</span>
                          <p>{asset.summary}</p>
                        </button>
                      ))}
                    </div>
                  </Section>

                  <Section title="What Dalil is seeing" action={<Sparkles size={18} />}>
                    <div className="insight-list">
                      <Insight title="What you are good at" detail="Implementation speed, lean-team rollout, and turning founder-led proof into repeatable sales assets." />
                      <Insight title="What prospects ask often" detail="Implementation bandwidth, trust against incumbents, security review, and proof from similar teams." />
                      <Insight title="Strongest proof formats" detail="Quotes and metrics are strongest today; customer-approved case studies are still limited." />
                    </div>
                  </Section>
                </aside>
              </div>
            </div>
          )}

          {view === 'collaterals' && (
            <div className="collaterals-page">
              <main className="main-column">
                <Section title="All Collaterals" action={<span className="table-count">{visibleCollateralRows.length} shown</span>}>
                  <div className="collateral-filter-grid">
                    <label>
                      <span>Customer served</span>
                      <select value={collateralCustomerFilter} onChange={(event) => setCollateralCustomerFilter(event.target.value)}>
                        {collateralFilterOptions.customers.map((value) => <option key={value} value={value}>{value}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>Communicates</span>
                      <select value={collateralCommunicationFilter} onChange={(event) => setCollateralCommunicationFilter(event.target.value)}>
                        {collateralFilterOptions.communicates.map((value) => <option key={value} value={value}>{value}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>Improvement metric</span>
                      <select value={collateralMetricFilter} onChange={(event) => setCollateralMetricFilter(event.target.value)}>
                        {collateralFilterOptions.metrics.map((value) => <option key={value} value={value}>{value}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>Status</span>
                      <select value={collateralStatusFilter} onChange={(event) => setCollateralStatusFilter(event.target.value as Approval | 'All')}>
                        {(['All', 'Internal Only', 'Customer Approved', 'Public'] as const).map((value) => <option key={value} value={value}>{value}</option>)}
                      </select>
                    </label>
                    <label>
                      <span>Type</span>
                      <select value={collateralTypeFilter} onChange={(event) => setCollateralTypeFilter(event.target.value)}>
                        {collateralFilterOptions.types.map((value) => <option key={value} value={value}>{value}</option>)}
                      </select>
                    </label>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        setCollateralCustomerFilter('All')
                        setCollateralCommunicationFilter('All')
                        setCollateralMetricFilter('All')
                        setCollateralStatusFilter('All')
                        setCollateralTypeFilter('All')
                      }}
                    >
                      Clear
                    </button>
                  </div>

                  <div className="collateral-table-wrap">
                    <table className="collateral-table">
                      <thead>
                        <tr>
                          <th>Collateral</th>
                          <th>Customer</th>
                          <th>Communicates</th>
                          <th>Metric</th>
                          <th>Audience</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleCollateralRows.map((row) => (
                          <tr key={row.id} onClick={() => { setSelectedCollateral(row.asset); setSelectedCollateralCustomer(row.customer) }}>
                            <td>
                              <strong>{row.asset.title}</strong>
                              <span>{row.asset.type} · {row.channel}</span>
                            </td>
                            <td>{row.servedCustomer}</td>
                            <td>{row.communicates}</td>
                            <td>{row.metric}</td>
                            <td>{row.audience}</td>
                            <td><span className={`badge ${row.asset.status === 'Internal Only' ? 'prospect' : row.asset.status === 'Public' ? 'closed' : 'ongoing'}`}>{row.asset.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>
              </main>

              <aside className="right-column collateral-agent-column">
                <section className="panel customer-agent-panel">
                  <div className="agent-topbar">
                    <button type="button" className="active">
                      Collateral AI
                      <span>{collateralAgentMessages.length ? `${collateralAgentMessages.length} messages` : 'Ready to draft'}</span>
                    </button>
                  </div>
                  <div className="dashboard-agent-chat customer-agent-chat">
                    <div className="customer-agent-context">
                      <strong>Creates proof-backed collateral</strong>
                      <span>Uses customer proof, general proof library patterns, audience, channel, and approval status.</span>
                    </div>
                    {collateralAgentMessages.length === 0 ? (
                      <p className="empty-chat">Describe the asset you want: audience, goal, proof angle, and channel.</p>
                    ) : (
                      <>
                        {collateralAgentMessages.map((message, index) => (
                          <div className={`dashboard-agent-msg ${message.role}`} key={index}>
                            <p>{message.text}</p>
                          </div>
                        ))}
                        {collateralAgentThinking && <AgentThinking />}
                      </>
                    )}
                  </div>
                  <form className="dashboard-agent-input customer-agent-input" onSubmit={(event) => { event.preventDefault(); submitCollateralAgent() }}>
                    <input value={collateralAgentInput} onChange={(event) => setCollateralAgentInput(event.target.value)} placeholder="Create a case study for..." disabled={collateralAgentThinking} />
                    <button type="submit" aria-label="Send" disabled={collateralAgentThinking || !collateralAgentInput.trim()}><Send size={16} /></button>
                  </form>
                </section>
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
                    <option value="Active Deal">Active Deal</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Live">Live</option>
                    <option value="Expanding">Expanding</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Closed">Closed</option>
                    <option value="Closed Lost">Closed Lost</option>
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
                <Field label="Journey summary" wide>
                  <textarea rows={3} value={draft.journeySummary} onChange={(event) => setDraft({ ...draft, journeySummary: event.target.value })} placeholder="What they do, what they need, what they like, and what has been achieved so far." />
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

      {selectedProof && !editingProof && (
        <div className="modal-backdrop" onClick={closeProof}>
          <div className="modal proof-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">Proof point · {selectedProof.sourceCustomer}</span>
                <h2>{selectedProof.claim}</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeProof} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="proof-body">
              <div className="proof-badges">
                <span className={`badge ${selectedProof.approval === 'Internal Only' ? 'prospect' : 'closed'}`}>{selectedProof.approval}</span>
                <span className={`badge proof-status-${selectedProof.status.toLowerCase().replace(/\s+/g, '-')}`}>{selectedProof.status}</span>
              </div>
              <blockquote className="proof-quote">"{selectedProof.quote}"</blockquote>
              <div className="proof-stats">
                <div className="proof-stat"><span>Headline metric</span><strong>{selectedProof.metric}</strong></div>
                <div className="proof-stat"><span>Outcome type</span><strong>{selectedProof.outcomeType}</strong></div>
                <div className="proof-stat"><span>Confidence</span><strong>{Math.round(selectedProof.confidence * 100)}%</strong></div>
                <div className="proof-stat"><span>Used in deals</span><strong>{selectedProof.usageCount}×</strong></div>
                <div className="proof-stat"><span>Win rate when used</span><strong>{Math.round(selectedProof.winRate * 100)}%</strong></div>
                <div className="proof-stat"><span>Captured</span><strong>{selectedProof.dateCaptured}</strong></div>
              </div>
              <section className="proof-section">
                <h3>Where it lands</h3>
                <div className="proof-fields">
                  <Info label="Use case" value={selectedProof.useCase} />
                  <Info label="Best for" value={selectedProof.bestFor} wide />
                </div>
                <ChipRow label="Industries" items={selectedProof.industries} />
                <ChipRow label="Company sizes" items={selectedProof.companySizes} />
                <ChipRow label="Personas" items={selectedProof.personas} />
                <ChipRow label="Deal stages" items={selectedProof.dealStages} />
                <ChipRow label="Counter-objections" items={selectedProof.counterObjections} />
              </section>
              <section className="proof-section">
                <h3>Source & metadata</h3>
                <div className="proof-fields">
                  <Info label="Source customer" value={selectedProof.sourceCustomer} />
                  <Info label="Source interaction" value={selectedProof.sourceInteraction} />
                </div>
                <ChipRow label="Available formats" items={selectedProof.formats} />
                <ChipRow label="Tags" items={selectedProof.tags} />
              </section>
            </div>
            <footer className="modal-foot">
              <button type="button" className="secondary" onClick={() => viewProofCustomer(selectedProof)}>View customer</button>
              <button type="button" className="primary" onClick={startEditProof}>Edit</button>
            </footer>
          </div>
        </div>
      )}

      {selectedCustomerProof && selectedCustomerProofCustomer && (
        <div className="modal-backdrop" onClick={closeProof}>
          <div className="modal proof-modal customer-proof-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">{selectedCustomerProof.type} · {selectedCustomerProofCustomer.name}</span>
                <h2>{selectedCustomerProof.text}</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeProof} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="proof-body">
              <div className="proof-badges">
                <span className={`badge ${selectedCustomerProof.approval === 'Internal Only' ? 'prospect' : 'closed'}`}>{selectedCustomerProof.approval}</span>
                <span className="badge ongoing">{selectedCustomerProof.type}</span>
              </div>
              <section className="proof-section customer-proof-summary">
                <h3>Reusable proof asset</h3>
                <p className="data-modal-copy">{selectedCustomerProof.text}</p>
              </section>
              <div className="proof-stats data-stats">
                <div className="proof-stat"><span>Type</span><strong>{selectedCustomerProof.type}</strong></div>
                <div className="proof-stat"><span>Source</span><strong>{selectedCustomerProof.source}</strong></div>
                <div className="proof-stat"><span>Captured</span><strong>{selectedCustomerProof.parentProof.dateCaptured}</strong></div>
              </div>
              <section className="proof-section">
                <h3>Parent proof</h3>
                <p className="data-modal-copy">{selectedCustomerProof.parentProof.claim}</p>
              </section>
              <section className="proof-section">
                <h3>Why Dalil extracted it</h3>
                <p className="data-modal-copy">This was pulled from {selectedCustomerProof.source} because it is a small reusable asset sales or marketing can use when the account context involves {selectedCustomerProofCustomer.objection.toLowerCase()}.</p>
              </section>
            </div>
            <footer className="modal-foot">
              <button type="button" className="secondary" onClick={closeProof}>Close</button>
              <button type="button" className="primary" onClick={() => { view === 'customerDetail' ? askCustomerAgent(`Help me use this proof asset: ${selectedCustomerProof.text}`) : openChat(`Help me use this proof asset: ${selectedCustomerProof.text}`); closeProof() }}>Use in agent</button>
            </footer>
          </div>
        </div>
      )}

      {selectedCollateral && (
        <div className="modal-backdrop" onClick={closeProof}>
          <div className="modal proof-modal collateral-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">{selectedCollateral.type} · {selectedCollateralCustomer?.name ?? 'General'}</span>
                <h2>{selectedCollateral.title}</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeProof} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="proof-body">
              <div className="proof-badges">
                <span className={`badge ${selectedCollateral.status === 'Internal Only' ? 'prospect' : 'closed'}`}>{selectedCollateral.status}</span>
                <span className="badge ongoing">{selectedCollateral.type}</span>
              </div>
              <section className="proof-section">
                <h3>Collateral</h3>
                <div className="collateral-document">
                  {buildCollateralDocument(selectedCollateralCustomer ?? buildCompanyCustomer(customers), selectedCollateral).map((section) => (
                    <article key={section.title}>
                      <h4>{section.title}</h4>
                      {section.lines.map((line) => <p key={line}>{line}</p>)}
                    </article>
                  ))}
                </div>
              </section>
              <section className="proof-section">
                <h3>Context</h3>
                <div className="raw-data-preview">
                  <article className="raw-data-section">
                    <ul>
                      {buildCollateralContext(selectedCollateralCustomer ?? buildCompanyCustomer(customers), selectedCollateral).map((line) => <li key={line}>{line}</li>)}
                    </ul>
                  </article>
                </div>
              </section>
            </div>
            <footer className="modal-foot">
              <button type="button" className="secondary" onClick={closeProof}>Close</button>
              <button type="button" className="primary" onClick={() => { openChat(`Help me refine this collateral: ${selectedCollateral.title}`); closeProof() }}>Use in agent</button>
            </footer>
          </div>
        </div>
      )}

      {selectedDataPoint && selected && (
        <div className="modal-backdrop" onClick={closeDataPoint}>
          <div className="modal proof-modal data-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">Customer data · {selected.name}</span>
                <h2>{selectedDataPoint.title}</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeDataPoint} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="proof-body">
              <div className="proof-badges">
                <span className="badge prospect">{selectedDataPoint.type}</span>
                <span className={`badge ${selectedDataPoint.status === 'Proof detected' ? 'closed' : 'ongoing'}`}>{selectedDataPoint.status}</span>
              </div>
              <div className="proof-stats data-stats">
                <div className="proof-stat"><span>Source</span><strong>{selectedDataPoint.source}</strong></div>
                <div className="proof-stat"><span>Date</span><strong>{selectedDataPoint.date}</strong></div>
                <div className="proof-stat"><span>Customer</span><strong>{selected.name}</strong></div>
              </div>
              <section className="proof-section">
                <h3>{selectedDataPoint.emailThread ? 'Email thread' : 'Source content'}</h3>
                {selectedDataPoint.emailThread ? (
                  <div className="email-thread">
                    {selectedDataPoint.emailThread.map((email) => (
                      <article className="email-message" key={`${email.from}-${email.time}`}>
                        <header>
                          <div>
                            <strong>{email.from}</strong>
                            <span>To: {email.to}</span>
                          </div>
                          <time>{email.time}</time>
                        </header>
                        <p>{email.body}</p>
                      </article>
                    ))}
                  </div>
                ) : selectedDataPoint.rawSections ? (
                  <div className="raw-data-preview">
                    {selectedDataPoint.rawSections.map((section) => (
                      <article className="raw-data-section" key={section.title}>
                        <h4>{section.title}</h4>
                        <ul>
                          {section.lines.map((line) => <li key={line}>{line}</li>)}
                        </ul>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="data-modal-copy">{selectedDataPoint.detail}</p>
                )}
              </section>
              <section className="proof-section">
                <h3>Dalil signal</h3>
                <p className="data-modal-copy">{selectedDataPoint.signal}</p>
              </section>
            </div>
            <footer className="modal-foot">
              <button type="button" className="secondary" onClick={closeDataPoint}>Close</button>
            </footer>
          </div>
        </div>
      )}

      {showCollateralSetup && selected && (
        <div className="modal-backdrop" onClick={() => !collateralGenerating && setShowCollateralSetup(false)}>
          <div className="modal proof-modal capture-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">Collateral · {selected.name}</span>
                <h2>Generate sales collateral</h2>
              </div>
              <button type="button" className="modal-close" disabled={collateralGenerating} onClick={() => setShowCollateralSetup(false)} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <form className="modal-form" onSubmit={generateCustomerCollateral}>
              <div className="form-grid">
                <Field label="What are we trying to achieve?" wide required hint="Example: help a late-stage prospect trust that implementation will not create extra work.">
                  <textarea
                    rows={3}
                    required
                    value={collateralDraft.goal}
                    onChange={(event) => setCollateralDraft({ ...collateralDraft, goal: event.target.value })}
                    placeholder="Create a customer story we can use in a sales follow-up to build confidence before the next meeting."
                  />
                </Field>
                <Field label="What should the collateral focus on?" wide required hint="Example: implementation bandwidth, incumbent displacement, fast proof retrieval, ROI.">
                  <textarea
                    rows={3}
                    required
                    value={collateralDraft.focus}
                    onChange={(event) => setCollateralDraft({ ...collateralDraft, focus: event.target.value })}
                    placeholder={`Focus on ${selected.objection.toLowerCase()} and show how a lean team can use proof without adding process overhead.`}
                  />
                </Field>
                <div className="upload-parser-note wide-field">
                  <Sparkles size={18} />
                  <div>
                    <strong>Generation context</strong>
                    <p>Dalil will use this customer’s extracted proof, similar proof from previous customers, and your goal/focus to draft the collateral.</p>
                  </div>
                </div>
              </div>
              <footer className="modal-foot">
                <button type="button" className="secondary" disabled={collateralGenerating} onClick={() => setShowCollateralSetup(false)}>Cancel</button>
                <button type="submit" className="primary" disabled={collateralGenerating}>{collateralGenerating ? 'Generating...' : 'Generate draft'}</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {showSourceSetup && selected && (
        <div className="modal-backdrop" onClick={() => setShowSourceSetup(false)}>
          <div className="modal proof-modal capture-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">Data source · {selected.name}</span>
                <h2>Configure a new capture method</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setShowSourceSetup(false)} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="proof-body">
              <section className="proof-section capture-modal-section">
                <h3>Capture type</h3>
                <div className="capture-options">
                  {captureSourceOptions.map((option) => (
                    <button className={captureSourceType === option ? 'active' : ''} key={option} onClick={() => { setCaptureSourceType(option); setCaptureSetupDraft(defaultCaptureSetup) }}>
                      {option}
                    </button>
                  ))}
                </div>
              </section>
              <section className="proof-section capture-modal-section">
                <h3>Setup details</h3>
                <CaptureSetupFields
                  customer={selected}
                  draft={captureSetupDraft}
                  setDraft={setCaptureSetupDraft}
                  type={captureSourceType}
                />
              </section>
              <section className="proof-section capture-modal-section">
                <h3>Preview</h3>
                <p className="data-modal-copy">{captureSourcePreview(selected, captureSourceType, captureSetupDraft)}</p>
              </section>
            </div>
            <footer className="modal-foot">
              <button type="button" className="secondary" onClick={() => setShowSourceSetup(false)}>Cancel</button>
              <button type="button" className="primary" onClick={addCaptureSource}>Configure</button>
            </footer>
          </div>
        </div>
      )}

      {showCustomerUpload && selected && (
        <div className="modal-backdrop" onClick={() => { if (!uploadParsing) { setShowCustomerUpload(false); setUploadFileNames([]) } }}>
          <div className="modal proof-modal upload-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">Upload · {selected.name}</span>
                <h2>Add customer data</h2>
              </div>
              <button type="button" className="modal-close" disabled={uploadParsing} onClick={() => { setShowCustomerUpload(false); setUploadFileNames([]) }} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <form className="modal-form" onSubmit={uploadCustomerData}>
              <div className="form-grid">
                <Field label="Source name" wide>
                  <input value={uploadDraft.title} onChange={(event) => setUploadDraft({ ...uploadDraft, title: event.target.value })} placeholder="QBR transcript, renewal email export, founder notes, usage metrics.csv" />
                </Field>
                <Field label="Data type">
                  <select value={uploadDraft.type} onChange={(event) => setUploadDraft({ ...uploadDraft, type: event.target.value as DataTab })}>
                    {dataTabs.map((tab) => <option key={tab} value={tab}>{tab}</option>)}
                  </select>
                </Field>
                <Field label="Accepted formats">
                  <input value="PDF, DOCX, TXT, CSV, email export, transcript, screenshot" readOnly />
                </Field>
                <Field label="Choose files" wide hint="For the demo, select the files in demo_upload_pack. Dalil will simulate parsing them as one customer data pack.">
                  <input
                    type="file"
                    multiple
                    onChange={(event) => {
                      const names = Array.from(event.target.files ?? []).map((file) => file.name)
                      setUploadFileNames(names)
                    }}
                  />
                </Field>
                {uploadFileNames.length > 0 && (
                  <div className="selected-upload-files wide-field">
                    {uploadFileNames.map((fileName) => <span key={fileName}>{fileName}</span>)}
                  </div>
                )}
                <Field label="What is being uploaded?" wide hint="Optional context helps the AI route and summarize the source correctly.">
                  <textarea rows={4} value={uploadDraft.note} onChange={(event) => setUploadDraft({ ...uploadDraft, note: event.target.value })} placeholder="This is a QBR transcript where the customer discusses onboarding speed, engineering escalations, and a quote we may want to reuse." />
                </Field>
                <div className="upload-parser-note wide-field">
                  <Sparkles size={18} />
                  <div>
                    <strong>AI parsing</strong>
                    <p>Dalil will classify the upload, add it to Data, create a Timeline event, and flag potential proof for review.</p>
                  </div>
                </div>
              </div>
              <footer className="modal-foot">
                <button type="button" className="secondary" disabled={uploadParsing} onClick={() => { setShowCustomerUpload(false); setUploadFileNames([]) }}>Cancel</button>
                <button type="submit" className="primary" disabled={uploadParsing}>{uploadParsing ? 'Parsing...' : 'Upload & parse'}</button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {selectedUpcomingItem && selected && (
        <div className="modal-backdrop" onClick={() => setSelectedUpcomingItem(null)}>
          <div className="modal proof-modal upcoming-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">Upcoming · {selected.name}</span>
                <h2>{selectedUpcomingItem.title}</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setSelectedUpcomingItem(null)} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <div className="proof-body">
              <div className="proof-badges">
                <span className="badge prospect">{selectedUpcomingItem.type}</span>
                <span className="badge ongoing">{selectedUpcomingItem.due}</span>
              </div>
              <div className="proof-stats data-stats">
                <div className="proof-stat"><span>Source</span><strong>{selectedUpcomingItem.source}</strong></div>
                <div className="proof-stat"><span>Customer</span><strong>{selected.name}</strong></div>
                <div className="proof-stat"><span>Stage</span><strong>{selected.stage}</strong></div>
              </div>
              <section className="proof-section">
                <h3>Why this is upcoming</h3>
                <p className="data-modal-copy">{selectedUpcomingItem.summary}</p>
              </section>
              <section className="proof-section">
                <h3>Context</h3>
                <div className="raw-data-preview">
                  <article className="raw-data-section">
                    <ul>
                      {selectedUpcomingItem.context.map((line) => <li key={line}>{line}</li>)}
                    </ul>
                  </article>
                </div>
              </section>
              <section className="proof-section">
                <h3>Recommended action</h3>
                <p className="data-modal-copy">{selectedUpcomingItem.recommendedAction}</p>
              </section>
            </div>
            <footer className="modal-foot">
              <button type="button" className="secondary" onClick={() => setSelectedUpcomingItem(null)}>Close</button>
              <button type="button" className="primary" onClick={() => { askCustomerAgent(selectedUpcomingItem.recommendedAction); setSelectedUpcomingItem(null) }}>Open in agent</button>
            </footer>
          </div>
        </div>
      )}

      {selectedProof && editingProof && proofDraft && (
        <div className="modal-backdrop" onClick={closeProof}>
          <div className="modal proof-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header className="modal-head">
              <div>
                <span className="eyebrow">Editing proof point</span>
                <h2>{selectedProof.claim}</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeProof} aria-label="Close">
                <X size={18} />
              </button>
            </header>
            <form className="modal-form" onSubmit={(event) => { event.preventDefault(); saveProof() }}>
              <div className="form-grid">
                <Field label="Headline claim" wide required>
                  <textarea rows={2} value={proofDraft.claim} onChange={(event) => setProofDraft({ ...proofDraft, claim: event.target.value })} required />
                </Field>
                <Field label="Customer quote" wide>
                  <textarea rows={2} value={proofDraft.quote} onChange={(event) => setProofDraft({ ...proofDraft, quote: event.target.value })} />
                </Field>
                <Field label="Headline metric">
                  <input value={proofDraft.metric} onChange={(event) => setProofDraft({ ...proofDraft, metric: event.target.value })} />
                </Field>
                <Field label="Outcome type">
                  <input value={proofDraft.outcomeType} onChange={(event) => setProofDraft({ ...proofDraft, outcomeType: event.target.value })} />
                </Field>
                <Field label="Use case" wide>
                  <input value={proofDraft.useCase} onChange={(event) => setProofDraft({ ...proofDraft, useCase: event.target.value })} />
                </Field>
                <Field label="Best for" wide>
                  <input value={proofDraft.bestFor} onChange={(event) => setProofDraft({ ...proofDraft, bestFor: event.target.value })} />
                </Field>
                <Field label="Source customer">
                  <input value={proofDraft.sourceCustomer} onChange={(event) => setProofDraft({ ...proofDraft, sourceCustomer: event.target.value })} />
                </Field>
                <Field label="Source interaction">
                  <input value={proofDraft.sourceInteraction} onChange={(event) => setProofDraft({ ...proofDraft, sourceInteraction: event.target.value })} />
                </Field>
                <Field label="Date captured">
                  <input value={proofDraft.dateCaptured} onChange={(event) => setProofDraft({ ...proofDraft, dateCaptured: event.target.value })} />
                </Field>
                <Field label="Confidence (%)">
                  <input type="number" min={0} max={100} value={proofDraft.confidence} onChange={(event) => setProofDraft({ ...proofDraft, confidence: event.target.value })} />
                </Field>
                <Field label="Times used">
                  <input type="number" min={0} value={proofDraft.usageCount} onChange={(event) => setProofDraft({ ...proofDraft, usageCount: event.target.value })} />
                </Field>
                <Field label="Win rate (%)">
                  <input type="number" min={0} max={100} value={proofDraft.winRate} onChange={(event) => setProofDraft({ ...proofDraft, winRate: event.target.value })} />
                </Field>
                <Field label="Approval">
                  <select value={proofDraft.approval} onChange={(event) => setProofDraft({ ...proofDraft, approval: event.target.value as Approval })}>
                    <option value="Internal Only">Internal Only</option>
                    <option value="Customer Approved">Customer Approved</option>
                    <option value="Public">Public</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select value={proofDraft.status} onChange={(event) => setProofDraft({ ...proofDraft, status: event.target.value as ProofStatus })}>
                    <option value="Active">Active</option>
                    <option value="Needs refresh">Needs refresh</option>
                    <option value="Retired">Retired</option>
                  </select>
                </Field>
                <Field label="Industries" wide hint="Comma-separated">
                  <input value={proofDraft.industries} onChange={(event) => setProofDraft({ ...proofDraft, industries: event.target.value })} />
                </Field>
                <Field label="Company sizes" wide hint="Comma-separated">
                  <input value={proofDraft.companySizes} onChange={(event) => setProofDraft({ ...proofDraft, companySizes: event.target.value })} />
                </Field>
                <Field label="Personas" wide hint="Comma-separated">
                  <input value={proofDraft.personas} onChange={(event) => setProofDraft({ ...proofDraft, personas: event.target.value })} />
                </Field>
                <Field label="Deal stages" wide hint="Comma-separated (Discovery, Negotiation, Closed Won, …)">
                  <input value={proofDraft.dealStages} onChange={(event) => setProofDraft({ ...proofDraft, dealStages: event.target.value })} />
                </Field>
                <Field label="Counter-objections" wide hint="Comma-separated">
                  <textarea rows={2} value={proofDraft.counterObjections} onChange={(event) => setProofDraft({ ...proofDraft, counterObjections: event.target.value })} />
                </Field>
                <Field label="Available formats" wide hint="Comma-separated (Customer quote, Data point, Video clip, …)">
                  <input value={proofDraft.formats} onChange={(event) => setProofDraft({ ...proofDraft, formats: event.target.value })} />
                </Field>
                <Field label="Tags" wide hint="Comma-separated">
                  <input value={proofDraft.tags} onChange={(event) => setProofDraft({ ...proofDraft, tags: event.target.value })} />
                </Field>
              </div>
              <footer className="modal-foot">
                <button type="button" className="secondary" onClick={() => { setEditingProof(false); setProofDraft(null) }}>Cancel</button>
                <button type="submit" className="primary">Save changes</button>
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

function statusClass(status: CustomerStatus) {
  return status.toLowerCase().replace(/\s+/g, '-')
}

function customerJourneySummary(customer: Customer) {
  return customer.journeySummary || `${customer.name} is a ${customer.industry} account currently at ${customer.stage}. They need help turning scattered relationship context into proof they can use in sales conversations, with the main concern centered on ${customer.objection || 'credibility and implementation confidence'}. So far Dalil has captured ${customer.interactionCount} interactions and surfaced ${customer.proofCount} proof points, giving the team a clearer view of what this customer cares about, what has been discussed, and which evidence can be reused in future deals.`
}

function buildInteractionHistory(customer: Customer): Interaction[] {
  const templates: Interaction[] = [
    {
      type: 'Email',
      title: 'Initial outreach',
      date: 'Week 1',
      summary: `${customer.contacts[0] ?? 'Main contact'} engaged after outreach and shared the first version of the problem: ${customer.objection}.`,
    },
    {
      type: 'Meeting',
      title: 'Discovery call',
      date: 'Week 1',
      summary: `Discovery focused on ${customer.industry}, current process gaps, buying priorities, and what proof would make the team confident moving forward.`,
    },
    {
      type: 'Note',
      title: 'Founder context added',
      date: 'Week 2',
      summary: `Internal notes captured how this account fits the target segment, why the deal matters, and what success should look like.`,
    },
    {
      type: 'Transcript',
      title: 'Product demo transcript',
      date: 'Week 2',
      summary: `Demo conversation captured buyer reactions, requested proof, and the features most relevant to ${customer.name}.`,
      proofDetected: customer.proofCount > 0,
    },
    {
      type: 'Email',
      title: 'Follow-up with proof request',
      date: 'Week 3',
      summary: `Buyer asked for examples from similar companies and evidence related to ${customer.objection}.`,
      proofDetected: ['Active Deal', 'At Risk'].includes(customer.status),
    },
    {
      type: 'Meeting',
      title: 'Stakeholder review',
      date: 'Week 4',
      summary: `Additional stakeholders reviewed goals, rollout concerns, and the business case for moving forward.`,
    },
    {
      type: 'Upload',
      title: 'Source documents added',
      date: 'Week 4',
      summary: `Notes, emails, and supporting materials were added to the customer profile for extraction and future retrieval.`,
    },
    {
      type: 'Meeting',
      title: 'Decision call',
      date: 'Week 5',
      summary: `The team reviewed fit, risks, and next steps. The most important objection remained ${customer.objection}.`,
    },
    {
      type: 'Transcript',
      title: 'Outcome review',
      date: 'Post-sale',
      summary: `Customer discussed early outcomes, what improved, and which story could become reusable proof.`,
      proofDetected: customer.proofCount > 2,
    },
    {
      type: 'Email',
      title: 'Customer quote captured',
      date: 'Post-sale',
      summary: `A usable quote was captured and routed into the proof review workflow.`,
      proofDetected: customer.proofCount > 4,
    },
  ]

  const generated = [...customer.interactions]
  const timelineDates = [
    'Jan 12',
    'Jan 18',
    'Jan 26',
    'Feb 3',
    'Feb 11',
    'Feb 19',
    'Mar 2',
    'Mar 14',
    'Mar 28',
    'Apr 9',
    'Apr 18',
    'Apr 26',
    'May 1',
    'May 7',
    'May 9',
  ]
  let index = 0
  while (generated.length < customer.interactionCount) {
    const template = templates[index % templates.length]
    const date = timelineDates[(generated.length + index) % timelineDates.length]
    generated.push({
      ...template,
      title: template.title,
      date,
      proofDetected: template.proofDetected || (customer.proofCount > 0 && index % 7 === 0),
    })
    index += 1
  }

  return generated.slice(0, customer.interactionCount)
}

function keyInteractions(interactions: Interaction[]) {
  const keyItems = interactions.filter((interaction) => interaction.proofDetected || ['Discovery call', 'Decision call', 'Outcome review'].some((title) => interaction.title.includes(title)))
  return (keyItems.length ? keyItems : interactions).slice(0, 8)
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

function inferDataTypeFromFilename(fileName: string): DataTab {
  const normalized = fileName.toLowerCase()
  if (normalized.includes('email') || normalized.endsWith('.eml')) return 'Emails'
  if (normalized.includes('transcript') || normalized.includes('call')) return 'Call transcripts'
  if (normalized.includes('meeting') || normalized.includes('qbr')) return 'Meeting notes'
  if (normalized.includes('crm') || normalized.includes('opportunity')) return 'CRM notes'
  if (normalized.includes('note') || normalized.includes('founder')) return 'Manual notes'
  return 'Uploads'
}

function customerDomain(customer: Customer) {
  const cleaned = customer.website.trim()
  if (cleaned) return cleaned.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
  const slug = customer.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '').replace(/^$/, customer.id)
  return `${slug || 'customer'}.com`
}

function stripTrailingPunctuation(value: string) {
  return value.trim().replace(/[.?!]+$/, '')
}

function sentenceCase(value: string) {
  const cleaned = stripTrailingPunctuation(value)
  return cleaned ? `${cleaned[0].toUpperCase()}${cleaned.slice(1)}` : cleaned
}

function buildGeneralAgentReply(
  turn: number,
  context: { customers: number; interactions: number; proof: number; activeDeals: number; topSegment: string; strongestCustomer: string },
) {
  const replies = [
    `Company-wide, Dalil is tracking ${context.customers} customer profiles, ${context.interactions} interactions, and ${context.proof} proof points. The strongest segment right now is ${context.topSegment}, with ${context.activeDeals} active deals that need proof support. I would package ${context.strongestCustomer} first, then use that proof in active conversations where the concern is implementation risk, incumbent trust, or ROI.`,
    `The biggest gap is activation. There is enough proof in the library, but the team needs to turn it into sharper deal support: one proof card for implementation bandwidth, one proof card for incumbent displacement, and one short metric-backed follow-up email template.`,
    `For the next demo step, I would open the most urgent active account, show the upcoming meeting, and ask the customer agent for a pre-meeting brief. That connects the company-wide proof memory to an actual sales moment.`,
  ]
  return replies[turn % replies.length]
}

function buildCustomerAgentReply(
  turn: number,
  context: { name: string; stage: Stage; objection: string; dataCount: number; timelineCount: number; proofAssetCount: number; upcomingCount: number },
) {
  const replies = [
    `For ${context.name}, I have context from ${context.dataCount} data items, ${context.timelineCount} timeline interactions, ${context.proofAssetCount} proof assets, and ${context.upcomingCount} upcoming actions. The current stage is ${context.stage}, and the main thread is ${context.objection}.`,
    `I would focus the next touchpoint on one question: does the team believe Dalil reduces work, or do they still see it as another process? Use the strongest metric proof first, then the uploaded quote about proof already existing but not being organized.`,
    `Suggested response: "Based on your concern around ${context.objection.toLowerCase()}, I pulled one relevant customer example and one metric. The pattern is that teams already had the proof, but Dalil reduced the effort of finding and using it during active deals."`,
  ]
  return replies[turn % replies.length]
}

function buildAgentCollateral(input: string, customers: Customer[], index: number): Collateral {
  const lower = input.toLowerCase()
  const type = lower.includes('battlecard') ? 'Battlecard' : lower.includes('website') ? 'Website copy' : lower.includes('linkedin') ? 'Marketing post' : lower.includes('one-pager') ? 'Sales one-pager' : 'Case study draft'
  const communicates = lower.includes('regulation') || lower.includes('compliance') || lower.includes('security')
    ? 'Handling regulation'
    : lower.includes('roi') || lower.includes('revenue')
      ? 'ROI'
      : lower.includes('implementation') || lower.includes('rollout')
        ? 'Implementation confidence'
        : lower.includes('incumbent') || lower.includes('trust')
          ? 'Incumbent trust'
          : 'Proof activation'
  const metric = communicates === 'ROI' ? 'ROI' : communicates === 'Implementation confidence' ? 'Time saved' : communicates === 'Handling regulation' ? 'Risk reduction' : 'Credibility'
  const referenceCustomer = customers.find((customer) => customer.proof.length > 0)
  return {
    title: `AI draft ${index + 1}: ${type}`,
    type,
    status: 'Internal Only',
    summary: `Generated from collateral AI request: "${input}". Uses ${referenceCustomer?.name ?? 'the proof library'} as supporting proof.`,
    goal: input,
    focus: communicates,
    referenceProof: referenceCustomer ? `${referenceCustomer.name}: ${referenceCustomer.proof[0]?.metric ?? 'relevant proof'}` : 'General proof library',
    communicates,
    metric,
    audience: lower.includes('website') || lower.includes('linkedin') ? 'Marketing' : 'Sales',
    channel: lower.includes('website') ? 'Website' : lower.includes('linkedin') ? 'LinkedIn' : lower.includes('email') ? 'Email' : 'Sales deck',
  }
}

function buildCollateralRows(customers: Customer[], generalCollaterals: Collateral[]): CollateralRow[] {
  const customerRows = customers.flatMap((customer) =>
    customer.collateral.map((asset, index) => normalizeCollateralRow(asset, customer, `${customer.id}-${index}`)),
  )
  const generalRows = generalCollaterals.map((asset, index) => normalizeCollateralRow(asset, null, `general-${index}`))
  return [...customerRows, ...generalRows]
}

function buildCompanyCustomer(customers: Customer[]): Customer {
  const proofCount = customers.reduce((sum, customer) => sum + customer.proofCount, 0)
  const interactionCount = customers.reduce((sum, customer) => sum + customer.interactionCount, 0)
  return {
    id: 'company',
    name: 'Company-wide proof library',
    logo: 'D',
    status: 'Live',
    stage: 'Expansion',
    health: 'Stable',
    industry: 'B2B SaaS',
    size: `${customers.length} customer profiles`,
    website: 'dalil.ai',
    contacts: ['Sales and marketing teams'],
    value: '',
    startDate: '',
    closeDate: '',
    competitor: '',
    personas: ['Sales: activate proof', 'Marketing: publish credibility assets'],
    lastActivity: '',
    objection: 'Credibility and proof activation',
    journeySummary: 'Company-wide proof memory assembled from customer data, proof points, and generated collateral.',
    interactionCount,
    proofCount,
    interactions: [],
    proof: [],
    collateral: [],
  }
}

function normalizeCollateralRow(asset: Collateral, customer: Customer | null, id: string): CollateralRow {
  const text = `${asset.title} ${asset.type} ${asset.summary} ${asset.focus ?? ''}`.toLowerCase()
  const communicates = asset.communicates ?? inferCommunication(text, customer)
  return {
    id,
    asset: {
      ...asset,
      communicates,
      metric: asset.metric ?? inferMetric(text, communicates),
      audience: asset.audience ?? inferAudience(text, asset.type),
      channel: asset.channel ?? inferChannel(text, asset.type),
    },
    customer,
    servedCustomer: customer?.name ?? 'None',
    communicates,
    metric: asset.metric ?? inferMetric(text, communicates),
    audience: asset.audience ?? inferAudience(text, asset.type),
    channel: asset.channel ?? inferChannel(text, asset.type),
  }
}

function inferCommunication(text: string, customer: Customer | null) {
  if (text.includes('security') || text.includes('compliance') || text.includes('regulation')) return 'Handling regulation'
  if (text.includes('implementation') || text.includes('rollout') || text.includes('onboarding')) return 'Implementation confidence'
  if (text.includes('incumbent') || text.includes('larger vendor') || customer?.objection.toLowerCase().includes('larger vendor')) return 'Incumbent trust'
  if (text.includes('roi') || text.includes('revenue') || text.includes('arr')) return 'ROI'
  if (text.includes('proof') || text.includes('credibility')) return 'Credibility'
  return 'Proof activation'
}

function inferMetric(text: string, communication: string) {
  if (text.includes('%') || text.includes('faster') || text.includes('time')) return 'Time saved'
  if (text.includes('revenue') || text.includes('arr') || communication === 'ROI') return 'ROI'
  if (text.includes('risk') || communication === 'Handling regulation') return 'Risk reduction'
  if (text.includes('quote')) return 'Qualitative proof'
  return 'Credibility'
}

function inferAudience(text: string, type: string) {
  if (text.includes('investor')) return 'Investors'
  if (text.includes('website') || text.includes('linkedin') || type.toLowerCase().includes('marketing')) return 'Marketing'
  if (text.includes('security') || text.includes('procurement')) return 'Security / Procurement'
  return 'Sales'
}

function inferChannel(text: string, type: string) {
  if (text.includes('website') || type.toLowerCase().includes('website')) return 'Website'
  if (text.includes('linkedin')) return 'LinkedIn'
  if (text.includes('email')) return 'Email'
  if (text.includes('one-pager') || type.toLowerCase().includes('one-pager')) return 'One-pager'
  if (text.includes('battlecard') || type.toLowerCase().includes('battlecard')) return 'Battlecard'
  return 'Sales deck'
}

function buildCollateralFilterOptions(rows: CollateralRow[]) {
  const options = (values: string[]) => ['All', ...Array.from(new Set(values)).sort()]
  return {
    customers: options(rows.map((row) => row.servedCustomer)),
    communicates: options(rows.map((row) => row.communicates)),
    metrics: options(rows.map((row) => row.metric)),
    types: options(rows.map((row) => row.asset.type)),
  }
}

function buildUploadedDataPoints(customer: Customer, fileNames: string[], note: string): CustomerDataPoint[] {
  const byType = dataTabs.reduce<Record<DataTab, string[]>>((accumulator, tab) => {
    accumulator[tab] = fileNames.filter((fileName) => inferDataTypeFromFilename(fileName) === tab)
    return accumulator
  }, {
    Emails: [],
    'Call transcripts': [],
    'Meeting notes': [],
    Uploads: [],
    'CRM notes': [],
    'Manual notes': [],
  })
  const fallback = fileNames[0] ?? 'customer-proof-pack.zip'
  const emailFile = byType.Emails[0] ?? fallback
  const transcriptFile = byType['Call transcripts'][0] ?? fallback
  const meetingFile = byType['Meeting notes'][0] ?? fallback
  const uploadFile = byType.Uploads[0] ?? fileNames.find((fileName) => fileName.toLowerCase().includes('metric')) ?? fallback
  const crmFile = byType['CRM notes'][0] ?? fallback
  const noteFile = byType['Manual notes'][0] ?? fallback

  return [
    buildUploadedEmailDataPoint(customer, emailFile, 'Proof request email thread', 'Just now', note, 'proof-request'),
    buildUploadedEmailDataPoint(customer, emailFile, 'Internal forwarding thread', 'Parsed 2 files ago', note, 'buyer-context'),
    buildUploadedEmailDataPoint(customer, emailFile, 'Customer approval thread', 'Parsed 3 files ago', note, 'renewal'),
    buildUploadedTranscriptDataPoint(customer, transcriptFile, 'Discovery call transcript', 'Parsed 4 files ago', note),
    buildUploadedTranscriptDataPoint(customer, transcriptFile, 'Product demo transcript excerpt', 'Parsed 5 files ago', note),
    buildUploadedTranscriptDataPoint(customer, transcriptFile, 'Proof review call transcript', 'Parsed 6 files ago', note),
    buildUploadedMeetingDataPoint(customer, meetingFile, 'QBR meeting notes', 'Parsed 7 files ago', note),
    buildUploadedMeetingDataPoint(customer, meetingFile, 'Stakeholder review notes', 'Parsed 8 files ago', note),
    buildUploadedUploadDataPoint(customer, uploadFile, 'Usage metrics import', 'Parsed 9 files ago', note),
    buildUploadedUploadDataPoint(customer, uploadFile, 'Proof asset inventory', 'Parsed 10 files ago', note),
    buildUploadedCrmDataPoint(customer, crmFile, 'Opportunity close plan', 'Parsed 11 files ago', note),
    buildUploadedCrmDataPoint(customer, crmFile, 'Objection history export', 'Parsed 12 files ago', note),
    buildUploadedManualNoteDataPoint(customer, noteFile, 'Founder context notes', 'Parsed 13 files ago', note),
    buildUploadedManualNoteDataPoint(customer, noteFile, 'Customer story angle', 'Parsed 14 files ago', note),
  ]
}

function buildUploadedEmailDataPoint(customer: Customer, fileName: string, title: string, date: string, note: string, kind: 'buyer-context' | 'renewal' | 'proof-request'): CustomerDataPoint {
  return {
    type: 'Emails',
    title,
    date,
    source: `Manual upload · ${fileName}`,
    status: 'Proof detected',
    signal: `Dalil recognized a complete email thread, matched it to ${customer.website || customer.name}, and extracted the proof request plus next-response context.`,
    detail: `${customer.contacts[0]?.split(',')[0] ?? 'The customer'} asked for proof related to ${customer.objection.toLowerCase()}. Upload note: ${note}`,
    emailThread: buildEmailThread(customer, kind),
  }
}

function buildUploadedTranscriptDataPoint(customer: Customer, fileName: string, title: string, date: string, note: string): CustomerDataPoint {
  return {
    type: 'Call transcripts',
    title,
    date,
    source: `Manual upload · ${fileName}`,
    status: 'Proof detected',
    signal: `Dalil detected speaker turns, buyer priorities, objection language, and proof-worthy quotes in this transcript.`,
    detail: `Transcript parsed from ${fileName}. Upload note: ${note}`,
    rawSections: [
      {
        title: 'Transcript excerpt',
        lines: [
          `Nora: What triggered the search for a proof workflow now?`,
          `${customer.contacts[0]?.split(',')[0] ?? 'Customer'}: We have happy customers, but the proof is scattered across calls, notes, and emails.`,
          `Nora: Where does that slow the team down most?`,
          `${customer.contacts[0]?.split(',')[0] ?? 'Customer'}: When a prospect asks for a similar customer story, it takes too long to find the right example.`,
          `Nora: What would make this successful?`,
          `${customer.contacts[0]?.split(',')[0] ?? 'Customer'}: Sales should be able to answer proof requests without asking the founder every time.`,
        ],
      },
      {
        title: 'Detected proof candidates',
        lines: [
          `"The useful proof was already there. It just was not organized."`,
          `Objection mentioned: ${customer.objection}.`,
          'Use case: turning scattered success data into a sales-ready proof profile.',
        ],
      },
    ],
  }
}

function buildUploadedMeetingDataPoint(customer: Customer, fileName: string, title: string, date: string, note: string): CustomerDataPoint {
  return {
    type: 'Meeting notes',
    title,
    date,
    source: `Manual upload · ${fileName}`,
    status: 'Proof detected',
    signal: `Dalil found stakeholder priorities, proof review next steps, and upcoming moments where the team needs customer evidence.`,
    detail: `Meeting notes parsed from ${fileName}. Upload note: ${note}`,
    rawSections: [
      {
        title: 'Meeting goals',
        lines: [
          'Centralize customer proof across emails, calls, notes, and CRM context.',
          'Give sales a faster way to answer proof requests.',
          'Prepare approved customer stories for upcoming evaluations.',
        ],
      },
      {
        title: 'Customer reaction',
        lines: [
          'Team liked that the profile makes the customer journey easier to understand.',
          'They want approval status clearly separated between internal and public use.',
          `Open concern remains ${customer.objection.toLowerCase()}.`,
        ],
      },
      {
        title: 'Next steps',
        lines: [
          'Review extracted proof assets.',
          'Draft one internal case study.',
          'Prepare a short proof brief before the next meeting.',
        ],
      },
    ],
  }
}

function buildUploadedUploadDataPoint(customer: Customer, fileName: string, title: string, date: string, note: string): CustomerDataPoint {
  return {
    type: 'Uploads',
    title,
    date,
    source: `Manual upload · ${fileName}`,
    status: 'Proof detected',
    signal: `Dalil parsed structured metrics and mapped them to outcomes that can support customer collateral.`,
    detail: `Structured import parsed from ${fileName}. Upload note: ${note}`,
    rawSections: [
      {
        title: 'Imported metrics',
        lines: [
          'Time to find relevant customer story: 4.5 hours to 18 minutes.',
          'Manual proof preparation per deal: 2.1 hours to 47 minutes.',
          'Approved proof assets: 0 to 14.',
          'Founder requests for customer examples: down 67%.',
        ],
      },
      {
        title: 'Proof interpretation',
        lines: [
          'Strong metric for proof retrieval speed.',
          'Strong operational proof for lean sales teams.',
          `Best used when the objection is ${customer.objection.toLowerCase()}.`,
        ],
      },
    ],
  }
}

function buildUploadedCrmDataPoint(customer: Customer, fileName: string, title: string, date: string, note: string): CustomerDataPoint {
  return {
    type: 'CRM notes',
    title,
    date,
    source: `Manual upload · ${fileName}`,
    status: 'Processed',
    signal: `Dalil mapped CRM stage, value, buyer, close-plan risk, and proof needs into the activation context.`,
    detail: `CRM context parsed from ${fileName}. Upload note: ${note}`,
    rawSections: [
      {
        title: 'Opportunity context',
        lines: [
          `Stage: ${customer.stage}.`,
          `Value: ${customer.value || '$52K ARR'}.`,
          `Primary buyer: ${customer.contacts[0] ?? 'VP Operations'}.`,
          `Main objection: ${customer.objection}.`,
        ],
      },
      {
        title: 'Close plan',
        lines: [
          'Send short proof-backed example before procurement review.',
          'Show approval controls for internal versus public proof.',
          'Prepare talk track around implementation effort for lean teams.',
        ],
      },
    ],
  }
}

function buildUploadedManualNoteDataPoint(customer: Customer, fileName: string, title: string, date: string, note: string): CustomerDataPoint {
  return {
    type: 'Manual notes',
    title,
    date,
    source: `Manual upload · ${fileName}`,
    status: 'Processed',
    signal: `Dalil used founder/customer context to improve the account summary and identify the strongest story angle.`,
    detail: `Manual note parsed from ${fileName}. Upload note: ${note}`,
    rawSections: [
      {
        title: 'Founder context',
        lines: [
          `${customer.name} already has useful customer success data, but it is fragmented.`,
          'The team is not asking Dalil to invent proof; they want the proof organized and activated.',
          'The first valuable asset is likely an internal proof card or case study draft.',
        ],
      },
      {
        title: 'Story angle',
        lines: [
          `A ${customer.industry} team turned scattered customer evidence into a living proof library.`,
          'Sales can now answer proof requests without rebuilding the story from memory.',
          `Relevant concern to address: ${customer.objection}.`,
        ],
      },
    ],
  }
}

function buildUploadInteractions(customer: Customer, fileNames: string[]): Interaction[] {
  const filesByType = dataTabs
    .map((tab) => ({ tab, count: fileNames.filter((fileName) => inferDataTypeFromFilename(fileName) === tab).length }))
    .filter((row) => row.count > 0)
    .map((row) => `${row.count} ${row.tab.toLowerCase()}`)
    .join(', ')

  return [
    {
      type: 'Upload',
      title: 'Historical data pack uploaded',
      date: 'Just now',
      summary: `AI parsed ${fileNames.length} files for ${customer.name}: ${filesByType || 'mixed customer data'}.`,
      proofDetected: true,
    },
    {
      type: 'Email',
      title: 'Email thread imported',
      date: 'Just now',
      summary: `Dalil found a customer proof request and routed the full thread into Data.`,
      proofDetected: true,
    },
    {
      type: 'Transcript',
      title: 'Discovery call parsed',
      date: 'Just now',
      summary: `Buyer explained that proof exists but is scattered across calls, notes, and emails.`,
      proofDetected: true,
    },
    {
      type: 'Transcript',
      title: 'Reusable quote detected',
      date: 'Just now',
      summary: `Transcript included customer language about proof being useful but unorganized.`,
      proofDetected: true,
    },
    {
      type: 'Meeting',
      title: 'QBR notes parsed',
      date: 'Just now',
      summary: `Meeting notes captured goals, concerns, approval requirements, and next steps.`,
      proofDetected: true,
    },
    {
      type: 'Upload',
      title: 'Usage metrics imported',
      date: 'Just now',
      summary: `Structured metrics show faster proof retrieval and lower manual prep time.`,
      proofDetected: true,
    },
    {
      type: 'Note',
      title: 'CRM close plan linked',
      date: 'Just now',
      summary: `CRM context tied ${customer.stage} stage, deal value, and ${customer.objection.toLowerCase()} risk to the profile.`,
    },
    {
      type: 'Note',
      title: 'Founder context added',
      date: 'Just now',
      summary: `Founder notes clarified why ${customer.name} is a strong fit and what story angle matters.`,
    },
    {
      type: 'Note',
      title: 'Proof profile assembled',
      date: 'Just now',
      summary: `Customer summary, proof assets, and follow-up actions were created from the uploaded pack.`,
      proofDetected: true,
    },
    {
      type: 'Email',
      title: 'Follow-up task created',
      date: 'Just now',
      summary: `Dalil created a reply task using the uploaded email thread and matching proof.`,
    },
    {
      type: 'Meeting',
      title: 'Pre-meeting brief queued',
      date: 'Just now',
      summary: `A proof review brief was queued for the next customer conversation.`,
    },
    {
      type: 'Note',
      title: 'Approval review required',
      date: 'Just now',
      summary: `Extracted claims are marked internal until the team approves what can be used externally.`,
      proofDetected: true,
    },
  ]
}

function buildUploadUpcomingItems(customer: Customer, title: string, note: string): UpcomingItem[] {
  const contact = customer.contacts[0]?.split(',')[0] ?? 'Main contact'
  return [
    {
      type: 'Issue',
      title: 'Approve extracted proof',
      due: 'Needs review',
      source: 'AI upload parser',
      summary: `Dalil found reusable proof language in "${title}" and added it to ${customer.name}'s workspace for review.`,
      context: [
        `Parser note: ${note}`,
        'Three proof themes were extracted: outcome, metric, and customer language.',
        'Approval is needed before any claim is used externally.',
      ],
      recommendedAction: `Review the uploaded proof candidates and decide what can be used for ${customer.name}.`,
    },
    {
      type: 'Email',
      title: `Draft follow-up to ${contact}`,
      due: 'Due today',
      source: 'Uploaded email thread',
      summary: `A customer email in the upload asks for a short proof-backed follow-up.`,
      context: [
        `Matched to ${customer.website}.`,
        `The thread mentions ${customer.objection.toLowerCase()}.`,
        'Dalil can draft a response using this customer and similar customer proof.',
      ],
      recommendedAction: `Draft a reply to ${contact} using the strongest proof around ${customer.objection}.`,
    },
    {
      type: 'Meeting',
      title: 'Prepare proof review brief',
      due: 'Tomorrow, 10:00 AM',
      source: 'Meeting notes + calendar context',
      summary: `The uploaded notes mention a follow-up conversation where the team will need a concise customer story.`,
      context: [
        `Customer stage: ${customer.stage}.`,
        `Relevant proof themes: ${customer.objection}, credibility, and sales readiness.`,
        'Brief should include one metric, one quote, and one suggested talk track.',
      ],
      recommendedAction: `Prepare a brief for ${customer.name} that summarizes the proof now available from the uploaded data.`,
    },
  ]
}

function buildUploadedJourneySummary(customer: Customer, fileNames: string[], note: string) {
  const sourceTypes = [...new Set(fileNames.map(inferDataTypeFromFilename))]
  return `${customer.name} is a ${customer.industry} account at the ${customer.stage} stage. Dalil has just backfilled ${fileNames.length} source files across ${sourceTypes.join(', ').toLowerCase()}, giving the workspace enough context to understand what they do, what they need help with, and why ${customer.objection.toLowerCase()} is the central concern. The uploaded pack shows that the team wants faster access to credible proof, likes having customer evidence organized instead of reconstructed from memory, and now has extracted proof assets ready for review. Note from upload: ${note}`
}

function isBackfilledDemoCustomer(customer: Customer) {
  return customer.interactionCount >= 10
}

function buildCustomerDataPoints(customer: Customer): CustomerDataPoint[] {
  if (!isBackfilledDemoCustomer(customer)) {
    return []
  }

  const primaryContact = customer.contacts[0]?.split(',')[0] ?? 'Main contact'
  const items: CustomerDataPoint[] = [
    {
      type: 'Emails',
      title: `Thread with ${primaryContact}`,
      date: 'May 8',
      source: 'Gmail',
      status: customer.status === 'Active Deal' ? 'Proof detected' : 'Processed',
      signal: `Captured buying context, latest objection around ${customer.objection}, and follow-up language for the account team.`,
      detail: `Dalil matched this email to ${customer.name} through the sender domain and linked it to the current customer profile. The useful data is the objection language, buyer priority, and suggested next response.`,
      emailThread: buildEmailThread(customer, 'buyer-context'),
    },
    {
      type: 'Emails',
      title: 'Renewal and expansion notes',
      date: 'Apr 26',
      source: 'Gmail',
      status: customer.proofCount > 4 ? 'Proof detected' : 'Processed',
      signal: 'Customer language indicates what improved after rollout and which claims should be reviewed for reusable proof.',
      detail: 'This thread contains customer language that can become an internal proof card after review. It is tagged for expansion, outcome language, and customer-approved quote follow-up.',
      emailThread: buildEmailThread(customer, 'renewal'),
    },
    {
      type: 'Emails',
      title: 'Pricing concern reply',
      date: 'Apr 19',
      source: 'Gmail',
      status: 'Processed',
      signal: `Captured how ${customer.name} framed budget, urgency, and the business case needed to continue.`,
      detail: 'Useful for deal context and objection handling. The email gives the agent a grounded way to draft follow-ups without inventing the buyer concern.',
      emailThread: buildEmailThread(customer, 'pricing'),
    },
    {
      type: 'Emails',
      title: 'Stakeholder intro thread',
      date: 'Apr 12',
      source: 'Gmail',
      status: 'Processed',
      signal: 'Identified additional stakeholders and mapped who cares about adoption, reporting, and risk.',
      detail: 'The thread is primarily relationship data, not proof. Dalil keeps it available so the customer agent understands the buying committee.',
      emailThread: buildEmailThread(customer, 'stakeholders'),
    },
    {
      type: 'Emails',
      title: 'Proof request from buyer',
      date: 'Mar 28',
      source: 'Gmail',
      status: 'Proof detected',
      signal: `Buyer asked for examples from similar ${customer.industry} companies and teams at ${customer.size}.`,
      detail: 'This is activation data. It explains which proof should be retrieved from the library when similar objections appear in future deals.',
      emailThread: buildEmailThread(customer, 'proof-request'),
    },
    {
      type: 'Emails',
      title: 'Implementation follow-up',
      date: 'Mar 21',
      source: 'Gmail',
      status: 'Needs review',
      signal: `Mentions ${customer.objection} but needs human review before turning into a proof point.`,
      detail: 'The language is promising, but the claim is not specific enough yet. Dalil flags it for review instead of treating it as verified evidence.',
      emailThread: buildEmailThread(customer, 'implementation'),
    },
    {
      type: 'Call transcripts',
      title: `${customer.name} QBR transcript`,
      date: 'May 7',
      source: 'Zoom transcript',
      status: 'Proof detected',
      signal: `Outcome language, buyer priorities, and ${customer.proofCount} proof candidates were extracted for review.`,
      detail: 'The transcript includes measurable outcomes, qualitative customer language, and a clear description of what changed after rollout.',
    },
    {
      type: 'Call transcripts',
      title: 'Product demo transcript',
      date: 'Week 2',
      source: 'Gong',
      status: 'Processed',
      signal: `Recorded stakeholder reactions, competitor comparison, and evidence requested before moving to ${customer.stage}.`,
      detail: 'Useful for understanding evaluation criteria. It is attached to the timeline but stored as raw data because the transcript can be searched later.',
    },
    {
      type: 'Call transcripts',
      title: 'Security review call',
      date: 'Apr 30',
      source: 'Gong',
      status: customer.stage === 'Security Review' ? 'Needs review' : 'Processed',
      signal: 'Captured implementation, security, and procurement concerns from the technical review.',
      detail: 'This helps the agent prepare future security conversations and retrieve proof from customers that passed similar reviews.',
    },
    {
      type: 'Call transcripts',
      title: 'Champion sync recording',
      date: 'Apr 16',
      source: 'Zoom transcript',
      status: 'Processed',
      signal: 'Captured the internal business case the champion planned to bring to leadership.',
      detail: 'Champion language is retained because it often becomes the best phrasing for follow-up emails and late-stage proof activation.',
    },
    {
      type: 'Call transcripts',
      title: 'Implementation kickoff',
      date: 'Mar 11',
      source: 'Google Meet',
      status: 'Processed',
      signal: 'Recorded rollout goals, owner responsibilities, and expected success criteria.',
      detail: 'The kickoff transcript creates the baseline Dalil uses when later detecting whether the customer achieved their original goals.',
    },
    {
      type: 'Call transcripts',
      title: 'Customer interview',
      date: 'Feb 22',
      source: 'Uploaded transcript',
      status: 'Proof detected',
      signal: 'Contains customer quote candidates and before/after story details.',
      detail: 'This is high-value production data. It can support a case study draft, proof card, quote bank, and website proof block after approval.',
    },
    {
      type: 'Meeting notes',
      title: 'Discovery notes',
      date: 'Week 1',
      source: 'Calendar note',
      status: 'Processed',
      signal: `Summarized customer goals, target persona, and what ${customer.name} needs help proving internally.`,
      detail: 'These notes give the customer agent baseline context: why the customer engaged, which pains matter, and how success should be described.',
    },
    {
      type: 'Meeting notes',
      title: 'Demo follow-up notes',
      date: 'Week 2',
      source: 'Sales note',
      status: 'Processed',
      signal: 'Captured the reactions, feature interests, and unresolved questions after the product walkthrough.',
      detail: 'Useful for the journey summary and for explaining why certain proof assets are relevant to this customer.',
    },
    {
      type: 'Meeting notes',
      title: 'Procurement prep',
      date: 'Apr 7',
      source: 'RevOps note',
      status: 'Needs review',
      signal: 'Summarized budget owner, approval path, and possible friction points.',
      detail: 'This is mostly activation context. It helps the agent prepare talk tracks and follow-ups for similar late-stage deals.',
    },
    {
      type: 'Meeting notes',
      title: 'Post-sale check-in',
      date: 'Apr 24',
      source: 'CS note',
      status: 'Proof detected',
      signal: 'Customer described what improved after adoption and where the team still wants more support.',
      detail: 'The positive language is routed to proof review. The open needs stay in the customer profile so recommendations remain honest.',
    },
    {
      type: 'Meeting notes',
      title: 'Leadership review',
      date: 'May 1',
      source: 'Founder note',
      status: 'Processed',
      signal: 'Captured executive priorities and the story leadership wants to tell internally.',
      detail: 'This helps separate sales narrative from verified proof. It also gives Dalil the language to use in internal-facing collateral.',
    },
    {
      type: 'Uploads',
      title: 'Founder notes import',
      date: 'Apr 10',
      source: 'Manual upload',
      status: 'Processed',
      signal: 'Historical context from founder-led sales was added to the customer profile for backfill.',
      detail: 'Backfill data is important for early-stage companies because much of the customer history lives in founder memory or old docs.',
    },
    {
      type: 'Uploads',
      title: 'Usage metrics export',
      date: 'Apr 18',
      source: 'CSV upload',
      status: customer.proofCount > 0 ? 'Proof detected' : 'Needs review',
      signal: `Metric candidates were matched against existing claims for ${customer.industry}.`,
      detail: 'Metrics are treated as stronger proof than qualitative claims. Dalil flags the rows that appear to support a customer outcome.',
    },
    {
      type: 'Uploads',
      title: 'Sales deck snippets',
      date: 'Apr 9',
      source: 'PDF upload',
      status: 'Processed',
      signal: 'Imported prior messaging, logo usage, and claims already used by the team.',
      detail: 'This helps Dalil avoid generating collateral that conflicts with current positioning or unapproved customer language.',
    },
    {
      type: 'Uploads',
      title: 'Slack screenshot pack',
      date: 'Mar 31',
      source: 'Image upload',
      status: 'Needs review',
      signal: 'Contains possible praise and internal customer context, but needs review before extraction.',
      detail: 'Screenshots can include sensitive context. Dalil keeps them separate and requires review before converting anything into proof.',
    },
    {
      type: 'Uploads',
      title: 'Implementation checklist',
      date: 'Mar 14',
      source: 'Doc upload',
      status: 'Processed',
      signal: 'Captured rollout steps, dependencies, and responsibilities from the implementation plan.',
      detail: 'Useful for comparing expected rollout effort to actual outcomes in later proof generation.',
    },
    {
      type: 'Uploads',
      title: 'Customer testimonial draft',
      date: 'Feb 27',
      source: 'Doc upload',
      status: 'Proof detected',
      signal: 'Contains quote candidates and a narrative arc for a future customer story.',
      detail: 'This is production-ready input, but approval status still matters before anything is used externally.',
    },
    {
      type: 'CRM notes',
      title: `${customer.stage} opportunity notes`,
      date: 'May 3',
      source: 'HubSpot',
      status: 'Processed',
      signal: `Deal stage, value, stakeholders, and close-plan context were synced into the account profile.`,
      detail: 'CRM data gives the profile commercial context and keeps the customer agent aware of stage, value, and ownership.',
    },
    {
      type: 'CRM notes',
      title: 'MEDDICC fields',
      date: 'Apr 27',
      source: 'HubSpot',
      status: 'Processed',
      signal: 'Synced decision criteria, economic buyer, pain, and champion notes.',
      detail: 'These fields help proof activation because Dalil can match proof to the buyer’s stated decision criteria.',
    },
    {
      type: 'CRM notes',
      title: 'Objection history',
      date: 'Apr 21',
      source: 'Salesforce import',
      status: 'Proof detected',
      signal: `Linked historical objections to ${customer.objection} and similar proof used in prior deals.`,
      detail: 'This supports the recommendation layer by showing which proof was used against comparable objections.',
    },
    {
      type: 'CRM notes',
      title: 'Close plan update',
      date: 'Apr 14',
      source: 'HubSpot',
      status: 'Processed',
      signal: 'Captured next steps, owner, timeline, and open approval risks.',
      detail: 'Close-plan data is kept as activation context, not proof. It informs what the agent recommends before upcoming meetings.',
    },
    {
      type: 'CRM notes',
      title: 'Lost or delayed reason',
      date: 'Mar 29',
      source: 'CRM note',
      status: customer.status === 'Closed Lost' ? 'Needs review' : 'Processed',
      signal: 'Captured friction that may inform future positioning and objection handling.',
      detail: 'Even when it is not positive proof, this data helps Dalil understand why deals slow down and which proof might reduce risk next time.',
    },
    {
      type: 'Manual notes',
      title: 'Internal proof review',
      date: 'May 5',
      source: 'Dalil note',
      status: 'Needs review',
      signal: 'Team notes identify which claims can stay internal and which may need customer approval before external use.',
      detail: 'This is the human approval layer. It prevents rough customer evidence from being treated as externally approved collateral.',
    },
    {
      type: 'Manual notes',
      title: 'Founder memory dump',
      date: 'Apr 20',
      source: 'Manual input',
      status: 'Processed',
      signal: `Captured why ${customer.name} bought, what alternatives they considered, and what made the story memorable.`,
      detail: 'Founder memory is valuable but unstructured. Dalil turns it into searchable context while keeping claims separate from verified proof.',
    },
    {
      type: 'Manual notes',
      title: 'Approval checklist',
      date: 'Apr 15',
      source: 'Dalil note',
      status: 'Processed',
      signal: 'Tracked which assets are internal only, customer approved, or public.',
      detail: 'Approval metadata matters because the same proof can be useful internally before it is safe to publish publicly.',
    },
    {
      type: 'Manual notes',
      title: 'Sales-use guidance',
      date: 'Apr 6',
      source: 'Manual input',
      status: 'Proof detected',
      signal: 'Captured where this story is strongest and which prospect objections it should answer.',
      detail: 'This turns raw proof into activation guidance so sales teams know when to use the customer story.',
    },
    {
      type: 'Manual notes',
      title: 'Customer story angle',
      date: 'Mar 25',
      source: 'Content note',
      status: 'Processed',
      signal: 'Defined the best narrative angle for future collateral based on industry, persona, and outcome.',
      detail: 'This helps generated assets stay focused instead of becoming generic case-study copy.',
    },
  ]

  return varyCustomerData(customer, items).map((item) => item.emailThread ? item : { ...item, rawSections: buildRawDataSections(customer, item) })
}

function varyCustomerData(customer: Customer, items: CustomerDataPoint[]) {
  const limits: Record<DataTab, number> = {
    Emails: 3 + (customer.status === 'Active Deal' || customer.status === 'At Risk' ? 2 : 0) + (customer.id.length % 2),
    'Call transcripts': 2 + (customer.proofCount > 6 ? 2 : 0) + (customer.stage === 'Security Review' ? 1 : 0),
    'Meeting notes': 3 + (customer.status === 'Live' || customer.status === 'Expanding' ? 1 : 0) + (customer.id.charCodeAt(0) % 2),
    Uploads: 2 + (customer.proofCount > 4 ? 2 : 0) + (customer.status === 'Closed Lost' ? 0 : 1),
    'CRM notes': 2 + (customer.status === 'Active Deal' || customer.status === 'Closed Lost' ? 2 : 1),
    'Manual notes': 2 + (customer.status === 'Closed' || customer.status === 'Live' ? 2 : 0) + (customer.id.charCodeAt(customer.id.length - 1) % 2),
  }

  const priorityTitles = new Set([
    `Thread with ${customer.contacts[0]?.split(',')[0] ?? 'Main contact'}`,
    `${customer.name} QBR transcript`,
    `${customer.stage} opportunity notes`,
    'Discovery notes',
    'Founder notes import',
    'Internal proof review',
  ])

  return dataTabs.flatMap((tab) => {
    const tabItems = items.filter((item) => item.type === tab)
    const prioritized = tabItems.filter((item) => priorityTitles.has(item.title))
    const variable = tabItems.filter((item) => !priorityTitles.has(item.title))
    const offset = customer.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % Math.max(variable.length, 1)
    const rotated = variable.slice(offset).concat(variable.slice(0, offset))
    return [...prioritized, ...rotated].slice(0, Math.min(limits[tab], tabItems.length))
  })
}

function buildDataSources(customer: Customer): DataSource[] {
  if (!isBackfilledDemoCustomer(customer)) {
    return []
  }

  return [
    {
      name: 'Email capture',
      source: `${customer.website} domain`,
      status: 'Connected',
      detail: `Matches relevant messages from approved contacts at ${customer.website} and routes them to this profile.`,
      cadence: 'Live capture',
    },
    {
      name: 'Call transcripts',
      source: 'Zoom + Gong',
      status: 'Configured',
      detail: 'Adds transcripts when meeting attendees match customer contacts or the deal calendar event.',
      cadence: 'After meetings',
    },
    {
      name: 'Calendar connection',
      source: 'Google Calendar',
      status: 'Connected',
      detail: 'Detects upcoming meetings with this customer and triggers pre-meeting briefs, proof recommendations, and follow-up preparation.',
      cadence: 'Live schedule',
    },
    {
      name: 'CRM context',
      source: 'HubSpot',
      status: 'Connected',
      detail: 'Syncs stage, value, owner notes, close-plan updates, and objection fields.',
      cadence: 'Every 2 hours',
    },
  ]
}

function makeDemoProof(
  customer: Customer,
  input: {
    id: string
    claim: string
    metric: string
    quote: string
    sourceInteraction: string
    bestFor: string
  },
): ProofPoint {
  return {
    id: input.id,
    claim: input.claim,
    sourceCustomer: customer.name,
    metric: input.metric,
    quote: input.quote,
    useCase: customer.objection,
    outcomeType: 'Demo extraction',
    bestFor: input.bestFor,
    approval: 'Internal Only',
    tags: ['demo', 'ai extracted', customer.industry.toLowerCase()],
    industries: [customer.industry],
    companySizes: [customer.size],
    personas: customer.contacts.slice(0, 2),
    dealStages: [customer.stage],
    confidence: 0.84,
    dateCaptured: 'Just now',
    sourceInteraction: input.sourceInteraction,
    usageCount: 0,
    winRate: 0.64,
    formats: ['Quote', 'Metric', 'Sales snippet'],
    status: 'Active',
    counterObjections: [customer.objection],
  }
}

function buildProofAssets(customer: Customer): ProofAsset[] {
  return customer.proof.flatMap((proof) => {
    const assets: ProofAsset[] = [
      {
        id: `${proof.id}-quote`,
        type: 'Quote',
        text: `"${proof.quote}"`,
        source: proof.sourceInteraction,
        approval: proof.approval,
        parentProof: proof,
      },
      {
        id: `${proof.id}-metric`,
        type: 'Metric',
        text: proof.metric,
        source: proof.sourceInteraction,
        approval: proof.approval,
        parentProof: proof,
      },
      {
        id: `${proof.id}-outcome`,
        type: 'Outcome',
        text: proof.claim,
        source: proof.sourceInteraction,
        approval: proof.approval,
        parentProof: proof,
      },
      {
        id: `${proof.id}-objection`,
        type: 'Objection',
        text: `Use when the concern is ${proof.counterObjections[0] ?? proof.bestFor}.`,
        source: proof.sourceInteraction,
        approval: proof.approval,
        parentProof: proof,
      },
      {
        id: `${proof.id}-snippet`,
        type: 'Sales snippet',
        text: `${customer.name} is a useful example for ${proof.bestFor.toLowerCase()}.`,
        source: proof.sourceInteraction,
        approval: proof.approval,
        parentProof: proof,
      },
    ]

    return assets.filter((asset) => asset.text.trim() && !asset.text.includes('""'))
  })
}

function buildCollateralDocument(customer: Customer, asset: Collateral): RawDataSection[] {
  const primaryProof = customer.proof[0]
  const quote = primaryProof?.quote ?? 'Customer proof is available for internal review.'
  const metric = primaryProof?.metric ?? `${customer.proofCount} proof points extracted`
  const objection = customer.objection || 'credibility risk'

  if (customer.id === 'brightcart' && asset.type.toLowerCase().includes('case')) {
    return [
      {
        title: 'Case study draft',
        lines: [
          'BrightCart helps ecommerce teams manage customer onboarding at scale. As the company moved upmarket, its post-sales team was spending too much time preparing each launch manually and pulling engineering into repeat customer questions.',
          'The team did not lack customer success. The problem was that every successful rollout created useful proof, but that proof lived across call transcripts, renewal emails, founder notes, and internal handoff docs.',
        ],
      },
      {
        title: 'Challenge',
        lines: [
          'BrightCart needed to show prospects that a lean post-sales team could support more launches without slowing down implementation.',
          'Sales also needed credible examples without asking the founder or CS team to reconstruct the customer story before every deal.',
        ],
      },
      {
        title: 'How Dalil helped',
        lines: [
          'Dalil backfilled BrightCart customer data from founder notes, a QBR transcript, and a renewal email from Maya Patel, VP Ops.',
          'The platform extracted reusable proof points: a 42% reduction in onboarding prep, a customer-approved quote, and objection-handling snippets around implementation bandwidth.',
          'Those proof points were turned into a sales proof card and a case study draft that could be reviewed before external use.',
        ],
      },
      {
        title: 'Results',
        lines: [
          'Reduced onboarding prep time by 42%.',
          'Created 11 reusable proof assets from existing customer data.',
          'Gave sales a customer-backed example to use when prospects worry implementation will require too much internal bandwidth.',
        ],
      },
      {
        title: 'Customer quote',
        lines: [
          '"We got customers live without waiting on engineering every time."',
        ],
      },
      {
        title: 'Sales use',
        lines: [
          'Use this case study when a prospect says implementation will require too much internal bandwidth.',
          'Best fit: lean post-sales teams, ecommerce SaaS companies, and founder-led startups trying to compete with larger vendors on credibility.',
        ],
      },
    ]
  }

  if (asset.type.toLowerCase().includes('case')) {
    const focus = sentenceCase(stripTrailingPunctuation(asset.focus ?? objection))
    const goal = stripTrailingPunctuation(asset.goal ?? 'give the sales team a credible customer story for the next conversation')
    const reference = asset.referenceProof ?? metric
    return [
      {
        title: 'Case study draft',
        lines: [
          `${customer.name} is a ${customer.industry} company evaluating Dalil during ${customer.stage.toLowerCase()}. The team already has useful customer evidence, but needs a more reliable way to organize it, approve it, and use it during active sales conversations.`,
          `For this story, the emphasis is ${focus.toLowerCase()}. The draft is intended to ${goal.toLowerCase()}.`,
        ],
      },
      {
        title: 'Challenge',
        lines: [
          `${customer.name} is trying to build trust without creating extra work for the team responsible for implementation and security review.`,
          `The main concern is ${objection.toLowerCase()}, especially because the team is comparing Dalil against more established alternatives.`,
          'Before Dalil, the relevant proof lived across emails, meeting notes, security follow-ups, and stakeholder conversations, making it hard to turn evidence into a concise sales asset.',
        ],
      },
      {
        title: 'How Dalil helps',
        lines: [
          `Dalil organizes ${customer.name}'s customer context into a proof profile that separates raw data, timeline events, proof points, and collateral drafts.`,
          `The agent can then retrieve the most relevant proof for the current objection instead of forcing the team to rebuild the story manually.`,
          `To strengthen the draft, Dalil also references similar library proof such as ${reference}.`,
        ],
      },
      {
        title: 'Results',
        lines: [
          metric,
          'Relevant proof points are now available as short reusable assets for email follow-up, meeting prep, and internal review.',
          `The story gives sales a clearer way to address ${objection.toLowerCase()} before the next stakeholder conversation.`,
        ],
      },
      {
        title: 'Customer quote',
        lines: [
          `"${quote}"`,
        ],
      },
      {
        title: 'Recommended use',
        lines: [
          `Use this case study when a prospect is worried about ${focus.toLowerCase()}.`,
          `Lead with ${customer.name}'s implementation context, then support it with ${reference}.`,
          `Keep it internal until ${customer.name} approves external use.`,
        ],
      },
    ]
  }

  return [
    {
      title: asset.title,
      lines: [
        asset.summary,
        `${customer.name} provides a reusable proof example for conversations around ${objection.toLowerCase()}.`,
      ],
    },
    {
      title: 'Sales-ready copy',
      lines: [
        `${customer.name} used Dalil to convert customer context into reusable proof assets, giving the team clearer evidence to use in active deals.`,
        `Relevant proof: ${metric}.`,
        `Customer language: "${quote}"`,
      ],
    },
  ]
}

function buildCollateralContext(customer: Customer, asset: Collateral) {
  return [
    `Generated from ${customer.name} proof points, collateral status, and source interactions.`,
    ...(asset.goal ? [`Generation goal: ${stripTrailingPunctuation(asset.goal)}.`] : []),
    ...(asset.focus ? [`Narrative focus: ${stripTrailingPunctuation(asset.focus)}.`] : []),
    ...(asset.referenceProof ? [`Library proof used: ${asset.referenceProof}.`] : []),
    `Primary source: ${customer.proof[0]?.sourceInteraction ?? 'customer data profile'}.`,
    `Approval status: ${asset.status}.`,
    `Recommended use: ${asset.type.toLowerCase().includes('case') ? 'send as a customer story or use in a sales deck.' : 'reuse in emails, proof cards, or deal prep.'}`,
    `Main objection this helps address: ${customer.objection}.`,
  ]
}

function buildGeneralCollaterals(customers: Customer[]): Collateral[] {
  const proofTotal = customers.reduce((sum, customer) => sum + customer.proofCount, 0)
  return [
    {
      title: 'Homepage proof block',
      type: 'Website copy',
      status: 'Internal Only',
      summary: `Company-wide proof section using ${proofTotal} proof points across customer outcomes, quotes, and metrics.`,
    },
    {
      title: 'LinkedIn customer proof post',
      type: 'Marketing post',
      status: 'Internal Only',
      summary: 'Founder-style post about turning scattered customer wins into sales-ready proof.',
    },
    {
      title: 'Investor traction snippet',
      type: 'Investor update',
      status: 'Internal Only',
      summary: 'Short investor-facing proof summary covering customer outcomes, repeatability, and strongest segments.',
    },
    {
      title: 'Implementation objection battlecard',
      type: 'Sales enablement',
      status: 'Internal Only',
      summary: 'Reusable talk tracks and proof assets for prospects worried about implementation bandwidth.',
    },
  ]
}

function buildLibraryProofGroups(assets: ProofAsset[], customers: Customer[]) {
  const count = (type: ProofAsset['type']) => assets.filter((asset) => asset.type === type).length
  const frequentObjections = [...new Set(customers.map((customer) => customer.objection).filter(Boolean))].slice(0, 3)
  return [
    { title: 'Quotes', count: count('Quote'), detail: 'Customer language that can be used in proof cards, emails, and website copy.' },
    { title: 'Metrics', count: count('Metric'), detail: 'Quantified outcomes such as faster onboarding, reduced prep, or improved team capacity.' },
    { title: 'Outcomes achieved', count: count('Outcome'), detail: 'Before-and-after claims that explain what changed for customers.' },
    { title: 'Objections overcome', count: count('Objection'), detail: frequentObjections.length ? frequentObjections.join(', ') : 'Implementation risk, incumbent trust, and ROI.' },
    { title: 'Sales snippets', count: count('Sales snippet'), detail: 'Short reusable lines for follow-up emails, meeting prep, and active deal support.' },
    { title: 'Proof gaps', count: customers.filter((customer) => customer.proofCount < 3).length, detail: 'Customers or segments that still need stronger evidence before they can support sales.' },
  ]
}

function buildUpcomingItems(customer: Customer): UpcomingItem[] {
  if (!isBackfilledDemoCustomer(customer)) {
    return []
  }

  const contact = customer.contacts[0]?.split(',')[0] ?? 'Main contact'
  const items: UpcomingItem[] = [
    {
      type: 'Meeting',
      title: `${customer.stage === 'Closed Won' ? 'QBR' : customer.stage} prep`,
      due: 'Tomorrow, 2:00 PM',
      source: 'Calendar connection',
      summary: `Upcoming meeting detected with ${contact}. Dalil should prepare a short brief with the current objection and proof to mention.`,
      context: [
        `Calendar event includes ${contact} and is linked to ${customer.name}.`,
        `Current stage is ${customer.stage}; main objection is ${customer.objection}.`,
        `Relevant data sources: calendar connection, CRM context, recent emails, and proof library.`,
      ],
      recommendedAction: `Prepare a pre-meeting brief for ${customer.name} focused on ${customer.objection}.`,
    },
    {
      type: 'Email',
      title: 'Follow-up email needs response',
      due: 'Due today',
      source: 'Gmail capture',
      summary: `${contact} asked for a concise example from a similar customer and has not received a final response yet.`,
      context: [
        `Email was matched to ${customer.website} and routed into this customer profile.`,
        `The request asks for proof relevant to ${customer.industry} and ${customer.size}.`,
        `Best response should include one proof point, one metric, and a short explanation of fit.`,
      ],
      recommendedAction: `Draft a follow-up email to ${contact} using the strongest proof for ${customer.objection}.`,
    },
    {
      type: 'Issue',
      title: `${customer.objection} still unresolved`,
      due: customer.status === 'At Risk' ? 'High priority' : 'Before next meeting',
      source: customer.status === 'At Risk' ? 'CS note + CRM' : 'CRM objection history',
      summary: `The account still has an open concern around ${customer.objection.toLowerCase()}, which should be addressed before the next customer touchpoint.`,
      context: [
        `CRM notes list ${customer.objection} as the primary risk.`,
        `Timeline includes proof requests and stakeholder review activity.`,
        `Dalil can retrieve similar customer stories and turn them into objection-handling language.`,
      ],
      recommendedAction: `Find proof that addresses ${customer.objection} and create a short talk track for the next touchpoint.`,
    },
  ]

  if (customer.status === 'Live' || customer.status === 'Expanding') {
    return items
  }

  if (customer.status === 'Closed Lost') {
    return items.filter((item) => item.type !== 'Meeting')
  }

  return items.slice(0, 2 + (customer.status === 'At Risk' ? 1 : 0))
}

function iconForUpcoming(type: UpcomingItem['type']) {
  if (type === 'Meeting') return <Clock3 size={16} />
  if (type === 'Email') return <Mail size={16} />
  return <Activity size={16} />
}

function buildConfiguredCaptureSource(customer: Customer, type: CaptureSourceType, draft: CaptureSetupDraft): DataSource {
  const matchTarget = draft.matchTarget.trim()
  const provider = draft.provider.trim()
  const rule = draft.rule.trim()
  const sources: Record<CaptureSourceType, DataSource> = {
    Email: {
      name: `Email rule: ${matchTarget || customer.website}`,
      source: matchTarget || customer.website,
      status: 'Connected',
      detail: rule || 'Captures relevant emails from the customer domain and selected internal aliases.',
      cadence: 'Live capture',
    },
    Calendar: {
      name: `Calendar rule: ${matchTarget || customer.name}`,
      source: provider || 'Google Calendar',
      status: 'Connected',
      detail: rule || 'Detects upcoming customer meetings and prepares briefs with relevant proof, objections, and suggested follow-ups.',
      cadence: 'Live schedule',
    },
    Calls: {
      name: `Transcript rule: ${provider || 'Zoom/Gong'}`,
      source: provider || 'Calendar + Zoom',
      status: 'Configured',
      detail: rule || 'Pulls transcripts when a calendar event includes this customer or related deal contacts.',
      cadence: 'After meetings',
    },
    CRM: {
      name: `CRM sync: ${provider || 'HubSpot'}`,
      source: provider || 'HubSpot pipeline fields',
      status: 'Connected',
      detail: rule || 'Maps opportunity fields, notes, objection history, and stage movement into this customer profile.',
      cadence: 'Every 2 hours',
    },
    Slack: {
      name: `Slack scan: ${matchTarget || 'approved channels'}`,
      source: matchTarget || '#sales-wins, #customer-success',
      status: 'Configured',
      detail: rule || 'Watches approved channels for customer mentions, praise, outcomes, and proof candidates.',
      cadence: 'Daily scan',
    },
    'Manual upload': {
      name: `Upload inbox: ${matchTarget || customer.name}`,
      source: matchTarget || 'Uploads, pasted notes, forwarded files',
      status: 'Manual',
      detail: rule || 'Lets the team backfill old customer data or add one-off source material directly.',
      cadence: 'On demand',
    },
  }

  return sources[type]
}

function captureSourcePreview(customer: Customer, type: CaptureSourceType, draft: CaptureSetupDraft) {
  const matchTarget = draft.matchTarget.trim()
  const provider = draft.provider.trim()
  const previews: Record<CaptureSourceType, string> = {
    Email: `Watch ${matchTarget || customer.website} for relevant customer emails.`,
    Calendar: `Watch ${provider || 'Google Calendar'} for meetings matching ${matchTarget || customer.name} and trigger pre-meeting briefs.`,
    Calls: `Pull transcripts from ${provider || 'Zoom/Gong'} when meetings match this customer.`,
    CRM: `Sync ${provider || 'HubSpot'} fields for ${customer.name}: stage, value, notes, objections, and close plan.`,
    Slack: `Scan ${matchTarget || 'selected Slack channels'} for proof mentions and outcome language.`,
    'Manual upload': `Create a backfill inbox for ${matchTarget || customer.name} source material.`,
  }

  return previews[type]
}

function buildRawDataSections(customer: Customer, item: CustomerDataPoint): RawDataSection[] {
  if (item.type === 'Call transcripts') {
    return [
      {
        title: 'Transcript excerpt',
        lines: [
          `${customer.contacts[0]?.split(',')[0] ?? 'Customer'}: The challenge is not that we lack happy customers. The challenge is that the proof is scattered across calls, emails, and old notes.`,
          `Dalil: When a prospect asks for evidence, what happens today?`,
          `${customer.contacts[0]?.split(',')[0] ?? 'Customer'}: Someone usually asks the founder or searches through old folders. It works, but it does not scale.`,
          `Dalil: So the useful output is not just a case study. It is a reusable proof profile tied to objections like ${customer.objection.toLowerCase()}.`,
          `${customer.contacts[0]?.split(',')[0] ?? 'Customer'}: Exactly. If sales can pull the right example before a meeting, that is the real value.`,
        ],
      },
      {
        title: 'Transcript markers',
        lines: [
          `00:04:18 - Buyer describes current workflow and proof gaps.`,
          `00:11:42 - Mention of ${customer.objection.toLowerCase()} as a decision risk.`,
          `00:24:06 - Customer gives a quote candidate for internal review.`,
          `00:31:33 - Next step: generate proof card and follow-up email draft.`,
        ],
      },
    ]
  }

  if (item.type === 'Meeting notes') {
    return [
      {
        title: 'Meeting notes',
        lines: [
          `Customer goal: create a reliable way to use existing customer wins while selling to new ${customer.industry} prospects.`,
          `Current pain: proof exists, but it is trapped in founder memory, calls, emails, CRM notes, and scattered documents.`,
          `Primary concern: ${customer.objection}.`,
          `What they like so far: customer-specific profile, proof extraction, and deal-specific recommendations.`,
          `Open question: which proof can be used internally immediately versus which proof needs approval.`,
        ],
      },
      {
        title: 'Action items',
        lines: [
          `Upload strongest historical customer notes for backfill.`,
          `Generate an internal proof card before the next stakeholder review.`,
          `Tag proof candidates by persona, objection, and approval status.`,
          `Prepare a short follow-up that references one similar customer story.`,
        ],
      },
    ]
  }

  if (item.type === 'Uploads') {
    return [
      {
        title: 'File preview',
        lines: [
          `File name: ${item.title.replace(/\s+/g, '-').toLowerCase()}.${item.source.includes('CSV') ? 'csv' : item.source.includes('PDF') ? 'pdf' : 'docx'}`,
          `Imported from: ${item.source}`,
          `Customer: ${customer.name}`,
          `Detected pages/rows: ${item.source.includes('CSV') ? '128 rows' : '7 pages'}`,
          `Processing result: ${item.status}`,
        ],
      },
      {
        title: 'Extracted raw content',
        lines: [
          `Before: the team relied on scattered notes and repeated founder context to answer proof requests.`,
          `Need: reusable evidence that helps sales respond to objections around ${customer.objection.toLowerCase()}.`,
          `Observed outcome: proof candidates were found across metrics, customer quotes, and implementation notes.`,
          `Review note: keep external claims gated until customer approval is explicit.`,
        ],
      },
    ]
  }

  if (item.type === 'CRM notes') {
    return [
      {
        title: 'CRM fields',
        lines: [
          `Account: ${customer.name}`,
          `Stage: ${customer.stage}`,
          `Value: ${customer.value}`,
          `Primary contact: ${customer.contacts[0] ?? 'Not captured'}`,
          `Main objection: ${customer.objection}`,
          `Health: ${customer.health}`,
        ],
      },
      {
        title: 'Rep notes',
        lines: [
          `Prospect needs proof that a lean team can adopt this without creating more process.`,
          `Best next step is a concise proof card, not a long-form case study.`,
          `Similar proof should come from customers in ${customer.industry} or adjacent operational SaaS segments.`,
          `Flag for activation: prepare meeting brief with one metric, one quote, and one objection-handling bullet.`,
        ],
      },
    ]
  }

  return [
    {
      title: 'Manual note',
      lines: [
        `${customer.name} is useful as a proof profile because the relationship captures both buying context and customer outcome language.`,
        `The strongest story angle is tied to ${customer.objection.toLowerCase()} and the need to compete with more established vendors.`,
        `Keep the raw note available for the customer agent, but only promote specific claims after review.`,
        `Potential use: internal sales enablement, follow-up email draft, and customer story outline.`,
      ],
    },
    {
      title: 'Reviewer comments',
      lines: [
        `Good candidate for internal proof.`,
        `Needs approval before public website copy.`,
        `Tie any generated collateral back to source data and approval status.`,
      ],
    },
  ]
}

function buildEmailThread(customer: Customer, kind: 'buyer-context' | 'renewal' | 'pricing' | 'stakeholders' | 'proof-request' | 'implementation'): EmailMessage[] {
  const contact = customer.contacts[0]?.split(',')[0] ?? 'Customer contact'
  const firstName = contact.split(' ')[0] || 'there'
  const domain = customerDomain(customer)
  const customerEmail = `${firstName.toLowerCase()}@${domain}`
  const rep = 'Nora from Dalil'

  const threads: Record<typeof kind, EmailMessage[]> = {
    'buyer-context': [
      {
        from: contact,
        to: rep,
        time: 'May 8, 9:14 AM',
        body: `Thanks for the recap. The main thing we are trying to solve is still ${customer.objection.toLowerCase()}. We have good customer conversations, but when leadership asks for proof from a similar company, it takes us too long to find the right example.`,
      },
      {
        from: rep,
        to: customerEmail,
        time: 'May 8, 10:02 AM',
        body: `That makes sense. I pulled the notes from the demo and the QBR transcript into the ${customer.name} profile. I am going to tag the objection and look for proof from similar ${customer.industry} teams so the follow-up is grounded in an existing customer story.`,
      },
      {
        from: contact,
        to: rep,
        time: 'May 8, 11:36 AM',
        body: 'Perfect. If you can show the team one strong example plus a short email draft, that would help us keep the evaluation moving without creating another custom deck.',
      },
    ],
    renewal: [
      {
        from: contact,
        to: rep,
        time: 'Apr 26, 2:18 PM',
        body: `We are happy with the progress so far. The biggest change is that our team does not have to reconstruct the customer story from memory every time a prospect asks for proof.`,
      },
      {
        from: rep,
        to: customerEmail,
        time: 'Apr 26, 2:44 PM',
        body: 'That is useful context. Would you be comfortable with us turning that into an internal proof card for your account team first, then separately reviewing anything before it becomes public collateral?',
      },
      {
        from: contact,
        to: rep,
        time: 'Apr 26, 3:11 PM',
        body: 'Yes, internal is fine. For anything public, send us the exact language first. The strongest angle is probably faster handoffs and fewer repeated questions from sales.',
      },
    ],
    pricing: [
      {
        from: contact,
        to: rep,
        time: 'Apr 19, 8:57 AM',
        body: `The price is workable if we can show this helps the team close the credibility gap with larger vendors. The question from our founder is whether this becomes another system to maintain.`,
      },
      {
        from: rep,
        to: customerEmail,
        time: 'Apr 19, 9:32 AM',
        body: `Understood. I would frame this around reuse: the same proof profile should support sales snippets, case-study drafts, and deal-specific recommendations. I can also send examples from teams using Dalil as a light proof layer instead of a heavy content process.`,
      },
      {
        from: contact,
        to: rep,
        time: 'Apr 19, 10:05 AM',
        body: 'That would help. Please keep it focused on practical sales use. We do not need a broad content platform pitch.',
      },
    ],
    stakeholders: [
      {
        from: contact,
        to: rep,
        time: 'Apr 12, 1:20 PM',
        body: 'Looping in Sam from RevOps and Leila from Customer Success. Sam cares about how this fits our sales workflow. Leila has the best context on where the customer outcome data lives today.',
      },
      {
        from: 'Sam Rivera',
        to: rep,
        time: 'Apr 12, 2:04 PM',
        body: 'My main question is whether reps can find the right proof without asking marketing or the founder. If this takes more than a minute during deal prep, adoption will be hard.',
      },
      {
        from: 'Leila Haddad',
        to: rep,
        time: 'Apr 12, 2:31 PM',
        body: 'Most of our good proof is in QBR notes, renewal emails, and Slack threads. We can upload a few examples, but long term we need the system to catch new proof as it appears.',
      },
    ],
    'proof-request': [
      {
        from: contact,
        to: rep,
        time: 'Mar 28, 4:22 PM',
        body: `Do you have an example from another ${customer.industry} company around ${customer.objection.toLowerCase()}? The product looks useful, but our team will ask whether companies like us have actually made this work.`,
      },
      {
        from: rep,
        to: customerEmail,
        time: 'Mar 28, 5:01 PM',
        body: `Yes. I found a customer story with a similar team size and concern. The strongest proof is a measurable operational improvement plus a quote about making the process repeatable without relying on founder memory.`,
      },
      {
        from: contact,
        to: rep,
        time: 'Mar 29, 8:17 AM',
        body: 'Send that over. A concise proof card is better than a full case study for now. We need something the team can evaluate quickly before the next call.',
      },
    ],
    implementation: [
      {
        from: contact,
        to: rep,
        time: 'Mar 21, 3:08 PM',
        body: `Implementation is the one thing we need to be careful about. We have the raw customer data, but it is spread across calls, email, notes, and old decks. We cannot afford a long cleanup project.`,
      },
      {
        from: rep,
        to: customerEmail,
        time: 'Mar 21, 3:47 PM',
        body: 'The first pass can be a backfill: upload the most useful historical customer data, let Dalil structure it into proof profiles, then review what is strong enough to use. The always-on capture can come after that.',
      },
      {
        from: contact,
        to: rep,
        time: 'Mar 21, 4:19 PM',
        body: 'That sequence makes sense. We should start with our strongest happy customers and prove the library is useful before connecting more sources.',
      },
    ],
  }

  return threads[kind]
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

function AgentThinking() {
  return (
    <div className="dashboard-agent-msg agent thinking-msg" aria-label="Dalil is thinking">
      <p><span /> <span /> <span /></p>
    </div>
  )
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

function CaptureSetupFields({ customer, draft, setDraft, type }: { customer: Customer; draft: CaptureSetupDraft; setDraft: (draft: CaptureSetupDraft) => void; type: CaptureSourceType }) {
  const copy: Record<CaptureSourceType, { first: string; firstPlaceholder: string; second: string; secondPlaceholder: string; rule: string; rulePlaceholder: string }> = {
    Email: {
      first: 'Email/domain to match',
      firstPlaceholder: customer.website,
      second: 'Provider',
      secondPlaceholder: 'Gmail',
      rule: 'Relevance rule',
      rulePlaceholder: 'Capture customer-domain emails that mention outcomes, objections, renewals, or proof requests.',
    },
    Calendar: {
      first: 'Meeting match rule',
      firstPlaceholder: `${customer.name}, ${customer.website}, or customer attendees`,
      second: 'Calendar provider',
      secondPlaceholder: 'Google Calendar',
      rule: 'Brief trigger',
      rulePlaceholder: 'Trigger a pre-meeting brief when an upcoming meeting includes customer contacts, open objections, or active deal context.',
    },
    Calls: {
      first: 'Meeting match rule',
      firstPlaceholder: `${customer.website} attendees or ${customer.name} calendar title`,
      second: 'Transcript source',
      secondPlaceholder: 'Zoom, Gong, Google Meet',
      rule: 'Capture rule',
      rulePlaceholder: 'Import transcript when customer contacts attend and the meeting is sales, CS, QBR, or implementation related.',
    },
    CRM: {
      first: 'Opportunity/account match',
      firstPlaceholder: customer.name,
      second: 'CRM source',
      secondPlaceholder: 'HubSpot',
      rule: 'Fields to sync',
      rulePlaceholder: 'Stage, owner notes, value, objections, competitors, next steps, close plan.',
    },
    Slack: {
      first: 'Channels to scan',
      firstPlaceholder: '#sales-wins, #customer-success',
      second: 'Workspace',
      secondPlaceholder: 'Company Slack',
      rule: 'Mention rule',
      rulePlaceholder: `Capture messages mentioning ${customer.name}, customer outcomes, praise, metrics, or objections overcome.`,
    },
    'Manual upload': {
      first: 'Inbox name',
      firstPlaceholder: `${customer.name} backfill`,
      second: 'Accepted formats',
      secondPlaceholder: 'PDF, DOCX, CSV, TXT, screenshots',
      rule: 'Processing instruction',
      rulePlaceholder: 'Extract outcomes, quotes, metrics, objections, personas, and approval status.',
    },
  }
  const fields = copy[type]

  return (
    <div className="capture-form">
      <label>
        <span>{fields.first}</span>
        <input value={draft.matchTarget} onChange={(event) => setDraft({ ...draft, matchTarget: event.target.value })} placeholder={fields.firstPlaceholder} />
      </label>
      <label>
        <span>{fields.second}</span>
        <input value={draft.provider} onChange={(event) => setDraft({ ...draft, provider: event.target.value })} placeholder={fields.secondPlaceholder} />
      </label>
      <label className="wide-field">
        <span>{fields.rule}</span>
        <textarea rows={2} value={draft.rule} onChange={(event) => setDraft({ ...draft, rule: event.target.value })} placeholder={fields.rulePlaceholder} />
      </label>
    </div>
  )
}

function iconFor(type: InteractionType) {
  if (type === 'Email') return <Mail size={16} />
  if (type === 'Meeting') return <MessageSquareText size={16} />
  if (type === 'Transcript') return <Mic2 size={16} />
  if (type === 'Upload') return <Upload size={16} />
  return <FileText size={16} />
}

function ChipRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="chip-block">
      <span className="chip-label">{label}</span>
      {items.length === 0 ? <em className="chip-empty">None</em> : (
        <div className="chip-row">
          {items.map((item) => <span key={item}>{item}</span>)}
        </div>
      )}
    </div>
  )
}

function Insight({ title, detail }: { title: string; detail: string }) {
  return <article className="insight"><CheckCircle2 size={18} /><div><strong>{title}</strong><p>{detail}</p></div></article>
}

export default App
