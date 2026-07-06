import raw from './career.json'

export interface CareerTask {
  id: string
  priority: 'urgent' | 'high' | 'ongoing'
  text: string
  meta: string
}

export interface CareerProject {
  id: string
  name: string
  tech: string
  timeline: string
  description: string
  notes: string
  satisfies: string
  github: string
}

export interface CareerCert {
  id: string
  name: string
  issuer: string
  cost: string
  timeline: string
  recommended: 'yes' | 'later' | 'no' | 'verify'
  lane: string
  notes: string
}

export interface CareerJob {
  id: string
  cat: 'dod' | 'pipeline' | 'backend' | 'analytics'
  priority: 'high' | 'medium'
  company: string
  role: string
  location: string
  pay: string
  deadline: string
  url: string
  summary: string
  reqs: string
  align: string
}

export interface CareerGap {
  id: string
  name: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  idt: string
  howToClose: string
}

export interface CareerScholarship {
  id: string
  tier: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  stage: string
  name: string
  type: string
  amount: string
  deadline: string
  applyWhen: string
  url: string
  eligibility: string
  notes: string
}

export interface CareerInternship {
  id: string
  cat: string
  stage: string
  priority: 'critical' | 'high' | 'medium'
  name: string
  org: string
  pay: string
  duration: string
  deadline: string
  applyWhen: string
  url: string
  eligibility: string
  notes: string
}

export interface CareerData {
  tasks: CareerTask[]
  projects: CareerProject[]
  certs: CareerCert[]
  jobs: CareerJob[]
  gaps: CareerGap[]
  scholarships: CareerScholarship[]
  internships: CareerInternship[]
}

/** Extracted verbatim from legacy/tracker.js by scripts/extract-career.mjs. */
export const CAREER = raw as unknown as CareerData
