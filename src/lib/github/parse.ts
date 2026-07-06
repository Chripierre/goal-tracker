import type { GhEvent } from './client'

export type FeedKind = 'push' | 'pr' | 'issue' | 'create' | 'star' | 'fork' | 'release' | 'review'

export interface GhFeedItem {
  id: string
  ts: number
  kind: FeedKind
  text: string
  repo: string
  url: string
}

function repoUrl(repo: string): string {
  return `https://github.com/${repo}`
}

/** Returns null for event types not worth surfacing. */
export function summarizeEvent(event: GhEvent): GhFeedItem | null {
  const repo = event.repo.name
  const base = {
    id: event.id,
    ts: Date.parse(event.created_at),
    repo,
    url: repoUrl(repo),
  }
  const p = event.payload

  switch (event.type) {
    case 'PushEvent': {
      const count =
        (Array.isArray(p.commits) ? p.commits.length : undefined) ??
        (typeof p.size === 'number' ? p.size : 1)
      return {
        ...base,
        kind: 'push',
        text: `Pushed ${count} commit${count === 1 ? '' : 's'} to ${repo}`,
      }
    }
    case 'PullRequestEvent': {
      const pr = p.pull_request as { number?: number; merged?: boolean } | undefined
      const action = p.action as string
      const verb =
        action === 'closed' ? (pr?.merged ? 'Merged' : 'Closed') : action === 'opened' ? 'Opened' : null
      if (!verb) return null
      return { ...base, kind: 'pr', text: `${verb} PR #${pr?.number ?? '?'} in ${repo}` }
    }
    case 'PullRequestReviewEvent':
      return { ...base, kind: 'review', text: `Reviewed a PR in ${repo}` }
    case 'IssuesEvent': {
      const action = p.action as string
      if (action !== 'opened' && action !== 'closed') return null
      const issue = p.issue as { number?: number } | undefined
      return {
        ...base,
        kind: 'issue',
        text: `${action === 'opened' ? 'Opened' : 'Closed'} issue #${issue?.number ?? '?'} in ${repo}`,
      }
    }
    case 'IssueCommentEvent': {
      const issue = p.issue as { number?: number } | undefined
      return { ...base, kind: 'issue', text: `Commented on #${issue?.number ?? '?'} in ${repo}` }
    }
    case 'CreateEvent': {
      const refType = p.ref_type as string
      if (refType === 'repository') return { ...base, kind: 'create', text: `Created repository ${repo}` }
      if (refType === 'branch')
        return { ...base, kind: 'create', text: `Created branch ${String(p.ref)} in ${repo}` }
      return null
    }
    case 'WatchEvent':
      return { ...base, kind: 'star', text: `Starred ${repo}` }
    case 'ForkEvent':
      return { ...base, kind: 'fork', text: `Forked ${repo}` }
    case 'ReleaseEvent': {
      const release = p.release as { tag_name?: string } | undefined
      return {
        ...base,
        kind: 'release',
        text: `Published ${release?.tag_name ?? 'a release'} in ${repo}`,
      }
    }
    default:
      return null
  }
}

export function toFeed(events: GhEvent[]): GhFeedItem[] {
  return events
    .map(summarizeEvent)
    .filter((item): item is GhFeedItem => item !== null)
}
