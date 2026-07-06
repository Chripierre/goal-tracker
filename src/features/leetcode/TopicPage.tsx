import { Link, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { NotFoundPage } from '@/components/NotFoundPage'
import { PLANNED_TOPICS, guideBySlug, problemUrl } from '@/data/guides'

const difficultyVariant: Record<string, BadgeVariant> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-text-3">
      {children}
    </h2>
  )
}

export function TopicPage() {
  const { slug } = useParams()
  const guide = slug ? guideBySlug(slug) : undefined
  if (!guide) return <NotFoundPage />

  const titleOf = (s: string) => PLANNED_TOPICS.find((t) => t.slug === s)?.title ?? s
  const nextAvailable = guide.next.filter((s) => guideBySlug(s))

  return (
    <>
      <Link
        to="/leetcode"
        className="mb-4 inline-flex items-center gap-1 rounded-md text-sm text-text-2 outline-none transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Resource Center
      </Link>
      <PageHeader title={guide.title} description={guide.tagline} />

      <Card className="p-5">
        <SectionTitle>Intuition</SectionTitle>
        {guide.intuition.map((p, i) => (
          <p key={i} className="mb-2 max-w-3xl text-sm leading-relaxed text-text-2">
            {p}
          </p>
        ))}

        <SectionTitle>Common patterns</SectionTitle>
        <div className="space-y-1.5">
          {guide.patterns.map((p) => (
            <div key={p.name} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <span className="w-56 shrink-0 text-sm font-medium">{p.name}</span>
              <span className="text-sm text-text-2">{p.when}</span>
            </div>
          ))}
        </div>

        <SectionTitle>Template</SectionTitle>
        <pre className="overflow-x-auto rounded-md border border-border-subtle bg-bg p-4 text-xs leading-relaxed">
          <code className="font-mono">{guide.template.code}</code>
        </pre>
        <p className="mt-2 text-sm text-text-2">{guide.template.note}</p>

        <SectionTitle>Common mistakes</SectionTitle>
        <ul className="list-inside list-disc space-y-1 text-sm text-text-2">
          {guide.mistakes.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>

        <SectionTitle>Complexity</SectionTitle>
        <ul className="space-y-1 font-mono text-sm text-text-2">
          {guide.complexity.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>

        <SectionTitle>Interview questions to rehearse</SectionTitle>
        <ul className="list-inside list-disc space-y-1 text-sm text-text-2">
          {guide.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>

        <SectionTitle>Practice problems</SectionTitle>
        <div className="flex flex-col gap-1">
          {guide.problems.map((p) => (
            <a
              key={p.slug}
              href={problemUrl(p.slug)}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-surface-2/40 focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="text-sm font-medium text-accent group-hover:text-accent-hover">
                {p.name}
              </span>
              <Badge variant={difficultyVariant[p.difficulty]}>{p.difficulty}</Badge>
              <ExternalLink className="size-3 text-text-3" aria-hidden />
            </a>
          ))}
        </div>

        {nextAvailable.length > 0 && (
          <>
            <SectionTitle>Study next</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {nextAvailable.map((s) => (
                <Link
                  key={s}
                  to={`/leetcode/${s}`}
                  className="flex items-center gap-1 rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1.5 text-sm font-medium text-accent outline-none transition-colors hover:bg-accent/20 focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {titleOf(s)}
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              ))}
            </div>
          </>
        )}
      </Card>
    </>
  )
}
