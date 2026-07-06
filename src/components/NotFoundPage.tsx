import { Link } from 'react-router'
import { Card } from './ui/Card'

export function NotFoundPage() {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="font-mono text-4xl font-semibold text-text-3">404</p>
      <p className="text-sm text-text-2">This page does not exist.</p>
      <Link
        to="/"
        className="rounded-md px-3 py-1.5 text-sm font-medium text-accent outline-none transition-colors hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent"
      >
        Back to dashboard
      </Link>
    </Card>
  )
}
