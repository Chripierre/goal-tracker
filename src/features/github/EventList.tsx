import {
  CircleDot,
  Eye,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  GitPullRequest,
  Star,
  Tag,
  type LucideIcon,
} from 'lucide-react'
import { formatRelative } from '@/lib/dates'
import type { FeedKind, GhFeedItem } from '@/lib/github/parse'

const kindIcon: Record<FeedKind, LucideIcon> = {
  push: GitCommitHorizontal,
  pr: GitPullRequest,
  review: Eye,
  issue: CircleDot,
  create: GitBranch,
  star: Star,
  fork: GitFork,
  release: Tag,
}

export function EventList({ items, limit }: { items: GhFeedItem[]; limit?: number }) {
  const visible = limit ? items.slice(0, limit) : items
  return (
    <div className="p-2">
      {visible.map((item) => {
        const Icon = kindIcon[item.kind]
        return (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 rounded-md px-2 py-2 outline-none transition-colors hover:bg-surface-2/40 focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Icon className="size-4 shrink-0 text-text-3" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-sm">{item.text}</span>
            <span className="shrink-0 text-xs text-text-3">{formatRelative(item.ts)}</span>
          </a>
        )
      })}
    </div>
  )
}
