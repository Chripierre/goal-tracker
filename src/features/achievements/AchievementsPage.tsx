import { Award, Lock } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ACHIEVEMENTS } from '@/lib/achievements/achievements'
import { useAppStore } from '@/lib/storage/store'

export function AchievementsPage() {
  const unlocked = useAppStore((s) => s.achievements)
  const byId = new Map(unlocked.map((u) => [u.id, u]))
  const sorted = [...ACHIEVEMENTS].sort((a, b) => {
    const ua = byId.get(a.id)
    const ub = byId.get(b.id)
    if (!!ua !== !!ub) return ua ? -1 : 1
    return (ub?.unlockedAt ?? 0) - (ua?.unlockedAt ?? 0)
  })

  return (
    <>
      <PageHeader
        title="Achievements"
        description={`${unlocked.length} of ${ACHIEVEMENTS.length} unlocked`}
      >
        <ProgressBar value={unlocked.length} max={ACHIEVEMENTS.length} className="w-40" />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((a) => {
          const u = byId.get(a.id)
          return (
            <Card
              key={a.id}
              className={`p-5 ${u ? 'border-warning/25' : 'opacity-60'}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
                    u ? 'bg-warning/15 text-warning' : 'bg-surface-2 text-text-3'
                  }`}
                >
                  {u ? <Award className="size-4.5" aria-hidden /> : <Lock className="size-4" aria-hidden />}
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{a.title}</p>
                  <p className="mt-0.5 text-sm text-text-2">{a.description}</p>
                  {u && (
                    <p className="mt-1.5 text-xs text-text-3">
                      Unlocked{' '}
                      {new Date(u.unlockedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
