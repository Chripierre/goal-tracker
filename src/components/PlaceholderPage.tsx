import type { NavItem } from '@/app/nav'
import { PageHeader } from './PageHeader'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'

export function PlaceholderPage({ item }: { item: NavItem }) {
  return (
    <>
      <PageHeader title={item.label} description={item.description} />
      <Card className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-lg bg-surface-2 text-text-3">
          <item.icon className="size-6" aria-hidden />
        </div>
        <div className="max-w-md space-y-1">
          <p className="font-medium">Not built yet</p>
          <p className="text-sm text-text-2">
            This module is on the roadmap and will land in a coming phase.
          </p>
        </div>
        <Badge variant="accent">Planned — Phase {item.phase}</Badge>
      </Card>
    </>
  )
}
