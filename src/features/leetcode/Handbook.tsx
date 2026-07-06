import { Link } from 'react-router'
import { BookOpen, Lock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { handbookIndex } from '@/data/guides'

const BATCH_LABEL: Record<string, string> = {
  A: 'Fundamentals',
  B: 'Linear structures & core',
  C: 'Graphs, DP & beyond',
}

export function Handbook() {
  const index = handbookIndex()
  const batches = ['A', 'B', 'C'] as const
  const available = index.filter((t) => t.available).length

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-2">Resource Center</h2>
        <span className="text-xs text-text-3">
          {available} of {index.length} topic guides written
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {batches.map((b) => {
          const topics = index.filter((t) => t.batch === b)
          return (
            <Card key={b} className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-3">
                {BATCH_LABEL[b]}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {topics.map((t) =>
                  t.available ? (
                    <Link
                      key={t.slug}
                      to={`/leetcode/${t.slug}`}
                      className="flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-2.5 py-1.5 text-sm font-medium text-accent outline-none transition-colors hover:bg-accent/20 focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <BookOpen className="size-3.5" aria-hidden />
                      {t.title}
                    </Link>
                  ) : (
                    <span
                      key={t.slug}
                      title="Guide coming in a later content batch"
                      className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-2/40 px-2.5 py-1.5 text-sm text-text-3"
                    >
                      <Lock className="size-3" aria-hidden />
                      {t.title}
                    </span>
                  ),
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
