import { useState } from 'react'
import { Check, ExternalLink, Users } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TextInput } from '@/components/ui/TextInput'
import { milestonePct, newRepoUrl, rubricScore } from '@/lib/challenges/challenges'
import {
  TIERS,
  TIER_META,
  bountyBySlug,
  bountyDueDay,
  bountyRepoName,
  weeklyBoard,
} from '@/lib/challenges/board'
import { createRepo } from '@/lib/github/client'
import { useGithubToken } from '@/lib/github/token'
import { useAppStore } from '@/lib/storage/store'
import type { Bounty } from '@/data/challengeBounties'
import type { ChallengeRecord } from '@/lib/storage/schema'

const KIND_LABEL: Record<string, string> = {
  week: 'Weekly',
  month: 'Monthly',
  low: 'Low tier',
  mid: 'Mid tier',
  high: 'High tier',
}

const KIND_VARIANT: Record<string, BadgeVariant> = {
  week: 'accent',
  month: 'accent',
  low: 'success',
  mid: 'warning',
  high: 'danger',
}

function scoreVariant(score: number): BadgeVariant {
  if (score >= 75) return 'success'
  if (score >= 50) return 'warning'
  return 'neutral'
}

function CheckRow({
  checked,
  label,
  sub,
  onToggle,
}: {
  checked: boolean
  label: string
  sub?: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onToggle}
      className="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left outline-none transition-colors hover:bg-surface-2/40 focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span
        className={`flex size-4.5 shrink-0 items-center justify-center rounded-full border transition-colors ${
          checked
            ? 'border-success bg-success/20 text-success'
            : 'border-border text-transparent group-hover:border-text-3'
        }`}
      >
        <Check className="size-3" aria-hidden />
      </span>
      <span className={`flex-1 text-sm ${checked ? 'text-text-3 line-through' : ''}`}>{label}</span>
      {sub && <span className="shrink-0 text-xs text-text-3">{sub}</span>}
    </button>
  )
}

function ActiveBountyCard({ record }: { record: ChallengeRecord }) {
  const toggleItem = useAppStore((s) => s.toggleChallengeItem)
  const setRepo = useAppStore((s) => s.setChallengeRepo)
  const completeChallenge = useAppStore((s) => s.completeChallenge)
  const token = useGithubToken((s) => s.token)
  const [repoInput, setRepoInput] = useState('')
  const [repoStatus, setRepoStatus] = useState('')

  const bounty = bountyBySlug(record.templateSlug)
  if (!bounty) return null
  const repoName = bountyRepoName(bounty.slug)
  const pct = milestonePct(record, bounty)
  const score = rubricScore(record, bounty)
  const dueText = new Date(`${record.dueDay}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

  function handleCreateRepo() {
    setRepoStatus('Creating repository…')
    createRepo(repoName, bounty?.summary ?? '', token)
      .then((r) => {
        setRepo(record.id, r.html_url)
        setRepoStatus('')
      })
      .catch((e: unknown) =>
        setRepoStatus(e instanceof Error ? `Could not create repo: ${e.message}` : 'Could not create repo.'),
      )
  }

  function handleComplete() {
    if (!bounty) return
    if (
      !window.confirm(
        `Archive "${bounty.title}" with a rubric score of ${score}% and ${pct}% of milestones done?`,
      )
    )
      return
    completeChallenge(record.id, {
      score,
      completionPct: pct,
      label: `${bounty.title} (${TIER_META[bounty.tier].label})`,
    })
  }

  return (
    <Card className="pb-5">
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
        <Badge variant={KIND_VARIANT[record.kind]}>{KIND_LABEL[record.kind]}</Badge>
        {bounty.collab && (
          <Badge variant="accent">
            <span className="flex items-center gap-1">
              <Users className="size-3" aria-hidden />
              Team-up
            </span>
          </Badge>
        )}
        <span className="ml-auto text-xs text-text-3">Target {dueText}</span>
      </div>
      <div className="px-5 pt-3">
        <h3 className="font-medium">{bounty.title}</h3>
        <p className="mt-1 text-sm text-text-2">{bounty.summary}</p>

        <div className="mt-4 flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-3">Milestones</p>
          <ProgressBar value={pct} max={100} className="w-24" />
          <span className="font-mono text-xs tabular-nums text-text-3">{pct}%</span>
        </div>
        <div className="mt-1">
          {bounty.milestones.map((m) => (
            <CheckRow
              key={m.id}
              checked={record.milestonesDone.includes(m.id)}
              label={m.label}
              onToggle={() => toggleItem(record.id, 'milestonesDone', m.id)}
            />
          ))}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-3">Repository</p>
        {record.repoUrl ? (
          <a
            href={record.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-sm text-accent outline-none transition-colors hover:text-accent-hover focus-visible:ring-2 focus-visible:ring-accent"
          >
            {record.repoUrl.replace('https://github.com/', '')}
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        ) : (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {token ? (
              <Button onClick={handleCreateRepo}>Create {repoName}</Button>
            ) : (
              <a
                href={newRepoUrl(repoName, bounty.summary)}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white outline-none transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent"
              >
                Create {repoName} on GitHub
              </a>
            )}
            <TextInput
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="…or paste the repo URL"
              aria-label="Repository URL"
              className="min-w-52 flex-1"
            />
            <Button
              variant="ghost"
              disabled={!repoInput.trim()}
              onClick={() => {
                setRepo(record.id, repoInput.trim())
                setRepoInput('')
              }}
            >
              Save
            </Button>
          </div>
        )}
        {repoStatus && <p className="mt-1 text-xs text-text-2">{repoStatus}</p>}

        <div className="mt-4 flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-3">
            Rubric (self-score)
          </p>
          <span className="font-mono text-xs tabular-nums text-text-3">{score}%</span>
        </div>
        <div className="mt-1">
          {bounty.rubric.map((r) => (
            <CheckRow
              key={r.id}
              checked={record.rubricChecked.includes(r.id)}
              label={r.label}
              sub={`${r.points} pts`}
              onToggle={() => toggleItem(record.id, 'rubricChecked', r.id)}
            />
          ))}
        </div>

        <Button className="mt-4" onClick={handleComplete}>
          Complete and archive
        </Button>
      </div>
    </Card>
  )
}

function BountyPosting({ bounty, onClaim }: { bounty: Bounty; onClaim: (b: Bounty) => void }) {
  return (
    <Card className="flex flex-col p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={TIER_META[bounty.tier].variant}>{TIER_META[bounty.tier].label}</Badge>
        <span className="text-xs text-text-3">{bounty.estimate}</span>
        {bounty.collab && (
          <Badge variant="accent">
            <span className="flex items-center gap-1">
              <Users className="size-3" aria-hidden />
              Team-up
            </span>
          </Badge>
        )}
      </div>
      <h3 className="mt-2 font-medium">{bounty.title}</h3>
      <p className="mt-1 text-sm text-text-2">{bounty.summary}</p>
      <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-text-3">
        {bounty.requirements.slice(0, 3).map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-1 items-end justify-between gap-2">
        {bounty.source ? (
          <a
            href={bounty.source}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-text-3 outline-none transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-accent"
          >
            idea source
            <ExternalLink className="size-3" aria-hidden />
          </a>
        ) : (
          <span />
        )}
        <Button onClick={() => onClaim(bounty)}>Claim bounty</Button>
      </div>
    </Card>
  )
}

export function ChallengesPage() {
  const challenges = useAppStore((s) => s.challenges)
  const startChallenge = useAppStore((s) => s.startChallenge)

  const active = challenges.filter((c) => c.status === 'active')
  const claimedSlugs = new Set(challenges.map((c) => c.templateSlug))
  const board = weeklyBoard(new Date(), claimedSlugs)
  const history = challenges
    .filter((c) => c.status === 'completed')
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))

  function claim(bounty: Bounty) {
    startChallenge({
      id: bounty.slug,
      kind: bounty.tier,
      templateSlug: bounty.slug,
      dueDay: bountyDueDay(bounty.tier, new Date()),
    })
  }

  return (
    <>
      <PageHeader
        title="Challenges"
        description="The bounty board — fresh postings every Monday. Claim, build, score, archive."
      />

      {active.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-text-2">
            Claimed ({active.length})
          </h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {active.map((r) => (
              <ActiveBountyCard key={r.id} record={r} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text-2">This week's board</h2>
        <div className="flex flex-col gap-4">
          {TIERS.map((tier) => {
            const postings = board[tier]
            return (
              <div key={tier}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-3">
                  {TIER_META[tier].label} — {TIER_META[tier].estimate}
                </p>
                {postings.length === 0 ? (
                  <Card className="px-4 py-6 text-center">
                    <p className="text-sm text-text-3">
                      Tier cleared — you have claimed everything here. More bounties land
                      in future updates.
                    </p>
                  </Card>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {postings.map((b) => (
                      <BountyPosting key={b.slug} bounty={b} onClaim={claim} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-text-2">History</h2>
        {history.length === 0 ? (
          <Card className="px-6 py-10 text-center">
            <p className="text-sm text-text-2">
              Completed bounties are archived here with their scores.
            </p>
          </Card>
        ) : (
          <Card className="divide-y divide-border-subtle">
            {history.map((c) => {
              const t = bountyBySlug(c.templateSlug)
              return (
                <div key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Badge variant={KIND_VARIANT[c.kind] ?? 'accent'}>
                    {KIND_LABEL[c.kind] ?? c.kind}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {t?.title ?? c.templateSlug}
                  </span>
                  <span className="font-mono text-xs text-text-3">{c.id}</span>
                  <Badge variant={scoreVariant(c.score ?? 0)}>Score {c.score}%</Badge>
                  <span className="text-xs text-text-3">{c.completionPct}% milestones</span>
                  {c.repoUrl && (
                    <a
                      href={c.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Open repository"
                      className="rounded-md p-1 text-text-3 outline-none transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <ExternalLink className="size-4" aria-hidden />
                    </a>
                  )}
                </div>
              )
            })}
          </Card>
        )}
      </section>
    </>
  )
}
