import { createBrowserRouter } from 'react-router'
import { AppShell } from './AppShell'
import { NAV_ITEMS } from './nav'
import { AssignmentsPage } from '@/features/assignments/AssignmentsPage'
import { TodosPage } from '@/features/todos/TodosPage'
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
        ...NAV_ITEMS.filter(
          (item) => !['/', '/assignments', '/todos'].includes(item.to),
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
