import { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { CAREER } from '@/data/career'
import { useAppStore } from '@/lib/storage/store'
import { ChecklistTab, CertsTab, GapsTab, ProjectsTab } from './ReferenceTabs'
import { InternshipsTab, JobsTab, ScholarshipsTab } from './OpportunityTabs'
import { ApplicationsTab, NetworkTab } from './TrackingTabs'

const TABS = [
  { id: 'checklist', label: 'Checklist' },
  { id: 'gaps', label: 'Skill gaps' },
  { id: 'certs', label: 'Certs' },
  { id: 'projects', label: 'Projects' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'scholarships', label: 'Scholarships' },
  { id: 'internships', label: 'Internships' },
  { id: 'applications', label: 'Applications' },
  { id: 'network', label: 'Network' },
] as const

type TabId = (typeof TABS)[number]['id']

export function CareerPage() {
  const [tab, setTab] = useState<TabId>('checklist')
  const applications = useAppStore((s) => s.career.applications)

  const counts: Partial<Record<TabId, number>> = {
    checklist: CAREER.tasks.length,
    gaps: CAREER.gaps.length,
    certs: CAREER.certs.length,
    projects: CAREER.projects.length,
    jobs: CAREER.jobs.length,
    scholarships: CAREER.scholarships.length,
    internships: CAREER.internships.length,
    applications: applications.length,
  }

  return (
    <>
      <PageHeader
        title="Career"
        description="Your job-search command center, ported from the original tracker."
      />

      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-border-subtle bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
              tab === t.id ? 'bg-surface-2 font-medium text-text' : 'text-text-2 hover:text-text'
            }`}
          >
            {t.label}
            {counts[t.id] !== undefined && (
              <span className="ml-1.5 font-mono text-xs text-text-3">{counts[t.id]}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'checklist' && <ChecklistTab />}
      {tab === 'gaps' && <GapsTab />}
      {tab === 'certs' && <CertsTab />}
      {tab === 'projects' && <ProjectsTab />}
      {tab === 'jobs' && <JobsTab />}
      {tab === 'scholarships' && <ScholarshipsTab />}
      {tab === 'internships' && <InternshipsTab />}
      {tab === 'applications' && <ApplicationsTab />}
      {tab === 'network' && <NetworkTab />}
    </>
  )
}
