import {
  Award,
  Briefcase,
  ClipboardList,
  Code2,
  GitBranch,
  LayoutDashboard,
  ListTodo,
  Flag,
  MessageSquare,
  Settings,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  description: string
  phase: number
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Daily, weekly, and monthly progress at a glance.',
    phase: 2,
  },
  {
    to: '/assignments',
    label: 'Assignments',
    icon: ClipboardList,
    description: 'Generated daily assignments that feed your streak and history.',
    phase: 2,
  },
  {
    to: '/todos',
    label: 'Todos',
    icon: ListTodo,
    description: 'Tasks with priorities, deadlines, tags, and recurrence.',
    phase: 3,
  },
  {
    to: '/challenges',
    label: 'Challenges',
    icon: Flag,
    description: 'Weekly bounty board: low, mid, and high-tier projects to claim.',
    phase: 5,
  },
  {
    to: '/career',
    label: 'Career',
    icon: Briefcase,
    description: 'Checklist, gaps, certs, jobs, scholarships, internships, applications.',
    phase: 12,
  },
  {
    to: '/github',
    label: 'GitHub',
    icon: GitBranch,
    description: 'Activity, repositories, and your contribution graph.',
    phase: 4,
  },
  {
    to: '/leetcode',
    label: 'LeetCode',
    icon: Code2,
    description: 'Solve stats, weak-area analysis, and the topic handbook.',
    phase: 6,
  },
  {
    to: '/interview',
    label: 'Interview Prep',
    icon: MessageSquare,
    description: 'Daily interview-question game with score, streak, and hints.',
    phase: 8,
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: TrendingUp,
    description: 'Productivity graphs, heatmaps, and consistency metrics.',
    phase: 9,
  },
  {
    to: '/achievements',
    label: 'Achievements',
    icon: Award,
    description: 'Milestones unlocked by streaks, projects, and problem counts.',
    phase: 10,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Profile, integrations, theme, and data controls.',
    phase: 4,
  },
]
