import { BATCH_A } from './batchA'
import { PLANNED_TOPICS, type TopicGuide } from './types'

export { PLANNED_TOPICS } from './types'
export type { GuideProblem, TopicGuide } from './types'

export const TOPIC_GUIDES: readonly TopicGuide[] = [...BATCH_A]

const bySlug = new Map(TOPIC_GUIDES.map((g) => [g.slug, g]))

export function guideBySlug(slug: string): TopicGuide | undefined {
  return bySlug.get(slug)
}

export function problemUrl(slug: string): string {
  return `https://leetcode.com/problems/${slug}/`
}

/** Planned topics in study order, with availability. */
export function handbookIndex(): { slug: string; title: string; batch: string; available: boolean }[] {
  return PLANNED_TOPICS.map((t) => ({ ...t, available: bySlug.has(t.slug) }))
}
