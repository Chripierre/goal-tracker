import { describe, expect, it } from 'vitest'
import { PLANNED_TOPICS, TOPIC_GUIDES } from './index'

describe('handbook content integrity', () => {
  it('has unique slugs that all appear in the planned index', () => {
    const planned = new Set(PLANNED_TOPICS.map((t) => t.slug))
    const seen = new Set<string>()
    for (const g of TOPIC_GUIDES) {
      expect(seen.has(g.slug), `duplicate slug ${g.slug}`).toBe(false)
      seen.add(g.slug)
      expect(planned.has(g.slug), `${g.slug} missing from PLANNED_TOPICS`).toBe(true)
    }
  })

  it('every guide is complete', () => {
    for (const g of TOPIC_GUIDES) {
      expect(g.intuition.length, g.slug).toBeGreaterThanOrEqual(1)
      expect(g.patterns.length, g.slug).toBeGreaterThanOrEqual(3)
      expect(g.template.code.length, g.slug).toBeGreaterThan(50)
      expect(g.mistakes.length, g.slug).toBeGreaterThanOrEqual(3)
      expect(g.complexity.length, g.slug).toBeGreaterThanOrEqual(1)
      expect(g.questions.length, g.slug).toBeGreaterThanOrEqual(2)
      expect(g.problems.length, g.slug).toBeGreaterThanOrEqual(4)
    }
  })

  it('progression links point at planned topics', () => {
    const planned = new Set(PLANNED_TOPICS.map((t) => t.slug))
    for (const g of TOPIC_GUIDES) {
      for (const n of g.next) {
        expect(planned.has(n), `${g.slug} -> ${n}`).toBe(true)
      }
    }
  })
})
