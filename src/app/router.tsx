import { createBrowserRouter } from 'react-router'
import { AppShell } from './AppShell'
import { NAV_ITEMS } from './nav'
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage'
import { AssignmentsPage } from '@/features/assignments/AssignmentsPage'
import { ChallengesPage } from '@/features/challenges/ChallengesPage'
import { LeetCodePage } from '@/features/leetcode/LeetCodePage'
import { TodosPage } from '@/features/todos/TodosPage'
import { GithubPage } from '@/features/github/GithubPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { NotFoundPage } from '@/components/NotFoundPage'
import { PlaceholderPage } from '@/components/PlaceholderPage'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'assignments', element: <AssignmentsPage /> },
        { path: 'todos', element: <TodosPage /> },
        { path: 'challenges', element: <ChallengesPage /> },
        { path: 'github', element: <GithubPage /> },
        { path: 'leetcode', element: <LeetCodePage /> },
        { path: 'analytics', element: <AnalyticsPage /> },
        { path: 'settings', element: <SettingsPage /> },
        ...NAV_ITEMS.filter(
          (item) =>
            ![
              '/',
              '/assignments',
              '/todos',
              '/challenges',
              '/github',
              '/leetcode',
              '/analytics',
              '/settings',
            ].includes(item.to),
        ).map((item) => ({
          path: item.to.slice(1),
          element: <PlaceholderPage item={item} />,
        })),
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename },
)
