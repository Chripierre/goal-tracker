import { describe, expect, it } from 'vitest'
import { mapLegacyState } from './legacy'

describe('mapLegacyState', () => {
  it('rejects non-legacy shapes', () => {
    expect(mapLegacyState(null)).toBeNull()
    expect(mapLegacyState({ totally: 'unrelated' })).toBeNull()
  })

  it('maps checks, namespaces statuses, and converts apps and custom tasks', () => {
    const out = mapLegacyState({
      checks: { t01: true, t02: false },
      certStatus: { c01: 'studying' },
      scholStatus: { s01: 'submitted' },
      jobStatus: { j01: 'applied' },
      apps: [
        { company: 'IDT', role: 'ASE', date: '2026-06-28', status: 'applied', notes: 'n' },
        { company: '', role: '' },
      ],
      custom: [
        { text: 'Fix resume', priority: 'urgent', meta: 'today', done: false },
        { text: 'Old done thing', priority: 'ongoing', done: true },
      ],
    })
    expect(out).not.toBeNull()
    expect(out?.career.checks).toEqual({ t01: true })
    expect(out?.career.statuses).toEqual({
      'cert:c01': 'studying',
      'scholarship:s01': 'submitted',
      'job:j01': 'applied',
    })
    expect(out?.career.applications).toHaveLength(1)
    expect(out?.career.applications[0]).toMatchObject({
      company: 'IDT',
      role: 'ASE',
      appliedOn: '2026-06-28',
      status: 'applied',
    })
    expect(out?.todos).toHaveLength(2)
    expect(out?.todos[0]).toMatchObject({ title: 'Fix resume', priority: 'urgent', category: 'career' })
    expect(out?.todos[1].completedAt).toBeDefined()
    expect(out?.todos[1].priority).toBe('low')
  })
})
