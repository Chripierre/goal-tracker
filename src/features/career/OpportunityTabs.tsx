import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { CAREER } from '@/data/career'
import {
  ExternalA,
  INTERN_CAT_LABEL,
  JOB_CAT_LABEL,
  PRIORITY_VARIANT,
  StatusSelect,
  TIER_LABEL,
  labelize,
} from './shared'

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string
  onChange: (v: string) => void
  options: [string, string][]
  label: string
}) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
      <option value="all">All</option>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </Select>
  )
}

export function JobsTab() {
  const [cat, setCat] = useState('all')
  const jobs = CAREER.jobs.filter((j) => cat === 'all' || j.cat === cat)
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <FilterSelect value={cat} onChange={setCat} options={Object.entries(JOB_CAT_LABEL)} label="Filter jobs" />
        <span className="text-xs text-text-3">{jobs.length} listings</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {jobs.map((j) => (
          <Card key={j.id} className="p-4">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {j.company} — {j.role}
                </p>
                <p className="text-xs text-text-3">
                  {j.location} · {j.pay}
                  {j.deadline && ` · due ${j.deadline}`}
                </p>
              </div>
              <Badge variant={PRIORITY_VARIANT[j.priority]}>{labelize(j.priority)}</Badge>
            </div>
            <p className="mt-2 text-sm text-text-2">{j.summary}</p>
            {j.align && <p className="mt-1 text-xs text-text-3">Fit: {j.align}</p>}
            <div className="mt-3 flex items-center justify-between gap-2">
              {j.url ? <ExternalA href={j.url}>Posting</ExternalA> : <span />}
              <StatusSelect kind="job" id={j.id} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ScholarshipsTab() {
  const [tier, setTier] = useState('all')
  const rows = CAREER.scholarships.filter((s) => tier === 'all' || s.tier === tier)
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <FilterSelect value={tier} onChange={setTier} options={Object.entries(TIER_LABEL)} label="Filter scholarships" />
        <span className="text-xs text-text-3">{rows.length} of {CAREER.scholarships.length}</span>
      </div>
      <Card className="divide-y divide-border-subtle">
        {rows.map((s) => (
          <div key={s.id} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 flex-1 text-sm font-medium">{s.name}</span>
              <Badge variant={PRIORITY_VARIANT[s.priority]}>{labelize(s.priority)}</Badge>
              <Badge>{TIER_LABEL[s.tier] ?? s.tier}</Badge>
              <StatusSelect kind="scholarship" id={s.id} />
            </div>
            <p className="mt-1 text-xs text-text-3">
              {s.amount} · {s.deadline} · apply {labelize(s.applyWhen)} · {s.type}
            </p>
            {s.eligibility && <p className="mt-1 max-w-3xl text-xs text-text-2">{s.eligibility}</p>}
            {s.notes && <p className="mt-1 max-w-3xl text-xs text-text-3">{s.notes}</p>}
            {s.url && <ExternalA href={s.url}>Details</ExternalA>}
          </div>
        ))}
      </Card>
    </div>
  )
}

export function InternshipsTab() {
  const [cat, setCat] = useState('all')
  const rows = CAREER.internships.filter((i) => cat === 'all' || i.cat === cat)
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <FilterSelect value={cat} onChange={setCat} options={Object.entries(INTERN_CAT_LABEL)} label="Filter internships" />
        <span className="text-xs text-text-3">{rows.length} of {CAREER.internships.length}</span>
      </div>
      <Card className="divide-y divide-border-subtle">
        {rows.map((i) => (
          <div key={i.id} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 flex-1 text-sm font-medium">{i.name}</span>
              <Badge variant={PRIORITY_VARIANT[i.priority]}>{labelize(i.priority)}</Badge>
              <Badge>{INTERN_CAT_LABEL[i.cat] ?? i.cat}</Badge>
              <StatusSelect kind="internship" id={i.id} />
            </div>
            <p className="mt-1 text-xs text-text-3">
              {i.org} · {i.pay} · {i.duration} · {i.deadline} · stage {labelize(i.stage)}
            </p>
            {i.eligibility && <p className="mt-1 max-w-3xl text-xs text-text-2">{i.eligibility}</p>}
            {i.url && <ExternalA href={i.url}>Details</ExternalA>}
          </div>
        ))}
      </Card>
    </div>
  )
}
