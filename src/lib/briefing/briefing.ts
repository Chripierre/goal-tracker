import { EXPLORE_TOPICS, QUOTES, TIPS, type BriefingQuote, type BriefingTopic } from '@/data/briefing'
import { dayNumber } from '../assignments/generate'

export interface DailyBriefing {
  quote: BriefingQuote
  tip: string
  explore: BriefingTopic
}

/** Deterministic per day; pool lengths are co-prime enough to keep combos fresh. */
export function dailyBriefing(dayKey: string): DailyBriefing {
  const n = dayNumber(dayKey)
  return {
    quote: QUOTES[n % QUOTES.length],
    tip: TIPS[(n * 5 + 2) % TIPS.length],
    explore: EXPLORE_TOPICS[(n * 3 + 1) % EXPLORE_TOPICS.length],
  }
}
