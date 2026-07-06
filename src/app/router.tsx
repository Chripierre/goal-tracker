import { createBrowserRouter } from 'react-router'
import { AppShell } from './AppShell'
import { AchievementsPage } from '@/features/achievements/AchievementsPage'
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage'
import { AssignmentsPage } from '@/features/assignments/AssignmentsPage'
import { ChallengesPage } from '@/features/challenges/ChallengesPage'
import { LeetCodePage } from '@/features/leetcode/LeetCodePage'
import { TodosPage } from '@/features/todos/TodosPage'
import { GithubPage } from '@/features/github/GithubPage'
import { InterviewPage } from '@/features/interview/InterviewPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { NotFoundPage } from '@/components/NotFoundPage'

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
        { path: 'interview', element: <InterviewPage /> },
        { path: 'analytics', element: <AnalyticsPage /> },
        { path: 'achievements', element: <AchievementsPage /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename },
)
