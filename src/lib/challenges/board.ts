import { BOUNTIES, type Bounty, type BountyTier } from '@/data/challengeBounties'
import { addDays, localDayKey } from '../dates'
import { isoWeek } from './challenges'
import type { BadgeVariant } from '@/components/ui/Badge'

export const TIER_META: Record<
  BountyTier,
  { label: string; estimate: string; dueDays: number; variant: BadgeVariant; postings: number }
> = {
  low: { label: 'Low tier', estimate: 'about a week', dueDays: 7, variant: 'success', postings: 2 },
  mid: { label: 'Mid tier', estimate: 'about a month', dueDays: 30, variant: 'warning', postings: 2 },
  high: {
    label: 'High tier',
    estimate: 'multi-month or team-up',
    dueDays: 90,
    variant: 'danger',
    postings: 1,
  },
}

export const TIERS: readonly BountyTier[] = ['low', 'mid', 'high']

export function bountyBySlug(slug: string): Bounty | undefined {
  return BOUNTIES.find((b) => b.slug === slug)
}

/**
 * The week's postings: a deterministic rotation per ISO week over each tier's
 * pool, excluding bounties the owner has ever claimed. Board refreshes Monday.
 */
export function weeklyBoard(
  now: Date,
  excluded: ReadonlySet<string>,
): Record<BountyTier, Bounty[]> {
  const { year, week } = isoWeek(now)
  const seed = year * 53 + week
  const board = {} as Record<BountyTier, Bounty[]>
  for (const tier of TIERS) {
    const pool = BOUNTIES.filter((b) => b.tier === tier && !excluded.has(b.slug))
    const count = Math.min(TIER_META[tier].postings, pool.length)
    const start = pool.length > 0 ? seed % pool.length : 0
    board[tier] = Array.from({ length: count }, (_, i) => pool[(start + i) % pool.length])
  }
  return board
}

export function bountyDueDay(tier: BountyTier, claimDate: Date): string {
  return localDayKey(addDays(claimDate, TIER_META[tier].dueDays))
}

export function bountyRepoName(slug: string): string {
  return `bounty-${slug}`
}
