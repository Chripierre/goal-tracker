import { describe, expect, it } from 'vitest'
import { ASSIGNMENT_TEMPLATES } from '@/data/assignmentTemplates'
import { assignmentDayFromRefId, generateAssignments } from './generate'

describe('generateAssignments', () => {
  it('generates one assignment per template', () => {
    expect(generateAssignments('2026-07-06')).toHaveLength(ASSIGNMENT_TEMPLATES.length)
  })

  it('is deterministic for the same day', () => {
    expect(generateAssignments('2026-07-06')).toEqual(generateAssignments('2026-07-06'))
  })

  it('forms ids as dayKey/templateId and round-trips the day', () => {
    for (const a of generateAssignments('2026-07-06')) {
      expect(a.id).toBe(`2026-07-06/${a.templateId}`)
      expect(assignmentDayFromRefId(a.id)).toBe('2026-07-06')
    }
  })

  it('rotates pooled titles daily and cycles the whole pool', () => {
    const template = ASSIGNMENT_TEMPLATES.find((t) => t.id === 'study-topic')
    if (!template?.pool) throw new Error('study-topic must have a pool')
    const poolLen = template.pool.length
    const titleOn = (day: number) => {
      const key = `2026-07-${String(day).padStart(2, '0')}`
      const a = generateAssignments(key).find((x) => x.templateId === 'study-topic')
      return a?.title
    }
    const seen = new Set<string>()
    for (let d = 1; d <= Math.min(poolLen, 28); d++) seen.add(titleOn(d) as string)
    expect(seen.size).toBe(Math.min(poolLen, 28))
    expect(titleOn(1)).not.toBe(titleOn(2))
  })

  it('keeps static titles for unpooled templates', () => {
    const a = generateAssignments('2026-07-06').find((x) => x.templateId === 'github-commit')
    expect(a?.title).toBe('Push at least one commit')
  })
})
