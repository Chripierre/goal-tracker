import { LEVEL_CLASSES, levelFor } from '@/lib/github/heatmap'
import type { ContributionCalendar } from '@/lib/github/client'

export function ContributionHeatmap({ calendar }: { calendar: ContributionCalendar }) {
  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[3px]">
          {calendar.weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.contributionDays.map((day) => (
                <div
                  key={day.date}
                  title={`${day.contributionCount} contribution${day.contributionCount === 1 ? '' : 's'} on ${day.date}`}
                  className={`size-2.5 rounded-[2px] ${LEVEL_CLASSES[levelFor(day.contributionCount)]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-text-3">
        <span>
          {calendar.totalContributions.toLocaleString()} contributions in the last year
        </span>
        <span className="flex items-center gap-1">
          Less
          {([0, 1, 2, 3, 4] as const).map((l) => (
            <span key={l} className={`size-2.5 rounded-[2px] ${LEVEL_CLASSES[l]}`} />
          ))}
          More
        </span>
      </div>
    </div>
  )
}
