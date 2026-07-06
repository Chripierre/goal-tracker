import { describe, expect, it } from 'vitest'
import type { GhEvent } from './client'
import { levelFor } from './heatmap'
import { summarizeEvent, toFeed } from './parse'

function ev(type: string, payload: Record<string, unknown>): GhEvent {
  return {
    id: '1',
    type,
    created_at: '2026-07-06T12:00:00Z',
    repo: { name: 'Chripierre/goal-tracker' },
    payload,
  }
}

describe('summarizeEvent', () => {
  it('summarizes pushes with commit counts', () => {
    const item = summarizeEvent(ev('PushEvent', { commits: [{}, {}, {}] }))
    expect(item?.kind).toBe('push')
    expect(item?.text).toBe('Pushed 3 commits to Chripierre/goal-tracker')
  })

  it('uses singular for one commit and falls back to size', () => {
    expect(summarizeEvent(ev('PushEvent', { size: 1 }))?.text).toContain('1 commit ')
  })

  it('distinguishes merged from closed PRs', () => {
    const merged = ev('PullRequestEvent', {
      action: 'closed',
      pull_request: { number: 7, merged: true },
    })
    const closed = ev('PullRequestEvent', {
      action: 'closed',
      pull_request: { number: 8, merged: false },
    })
    expect(summarizeEvent(merged)?.text).toContain('Merged PR #7')
    expect(summarizeEvent(closed)?.text).toContain('Closed PR #8')
  })

  it('summarizes repository and branch creation', () => {
    expect(summarizeEvent(ev('CreateEvent', { ref_type: 'repository' }))?.text).toBe(
      'Created repository Chripierre/goal-tracker',
    )
    expect(summarizeEvent(ev('CreateEvent', { ref_type: 'branch', ref: 'main' }))?.text).toBe(
      'Created branch main in Chripierre/goal-tracker',
    )
  })

  it('drops unknown and uninteresting events', () => {
    expect(summarizeEvent(ev('GollumEvent', {}))).toBeNull()
    expect(summarizeEvent(ev('CreateEvent', { ref_type: 'tag' }))).toBeNull()
    expect(summarizeEvent(ev('PullRequestEvent', { action: 'synchronize' }))).toBeNull()
  })

  it('toFeed filters nulls and keeps order', () => {
    const feed = toFeed([
      ev('WatchEvent', {}),
      ev('GollumEvent', {}),
      ev('ForkEvent', {}),
    ])
    expect(feed.map((f) => f.kind)).toEqual(['star', 'fork'])
  })
})

describe('levelFor', () => {
  it('buckets contribution counts', () => {
    expect(levelFor(0)).toBe(0)
    expect(levelFor(1)).toBe(1)
    expect(levelFor(2)).toBe(1)
    expect(levelFor(3)).toBe(2)
    expect(levelFor(5)).toBe(2)
    expect(levelFor(6)).toBe(3)
    expect(levelFor(9)).toBe(3)
    expect(levelFor(10)).toBe(4)
    expect(levelFor(40)).toBe(4)
  })
})
