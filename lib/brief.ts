import { prisma } from '@/lib/db'
import { getAgentHealthCounts, getAgentStatuses } from '@/lib/agents'

export type DailyBriefData = {
  generatedAt: string
  summary: {
    unreadNotifications: number
    dueTodayTasks: number
    overdueTasks: number
    offlineAgents: number
  }
  attention: {
    type: 'overdue_tasks' | 'offline_agents' | 'unread_notifications'
    title: string
    detail: string
    href: string
    severity: 'high' | 'medium'
  }[]
  tasks: {
    id: string
    title: string
    dueDate: string
    recurring: string | null
  }[]
  notifications: {
    id: string
    type: string
    title: string
    message: string
    source: string | null
    createdAt: string
  }[]
  watchlist: {
    name: string
    health: 'active' | 'idle' | 'offline'
    lastSeen: string | null
    lastMessage: string | null
  }[]
}

export async function getDailyBriefData(): Promise<DailyBriefData> {
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  const endOfToday = new Date(startOfToday)
  endOfToday.setDate(endOfToday.getDate() + 1)

  const [
    unreadNotifications,
    recentNotifications,
    dueTodayTasks,
    overdueTasks,
    taskList,
    agentStatuses,
  ] = await Promise.all([
    prisma.notification.count({ where: { isRead: false } }),
    prisma.notification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        source: true,
        createdAt: true,
      },
    }),
    prisma.gardenTask.count({
      where: {
        completed: false,
        dueDate: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
    }),
    prisma.gardenTask.count({
      where: {
        completed: false,
        dueDate: {
          lt: startOfToday,
        },
      },
    }),
    prisma.gardenTask.findMany({
      where: {
        completed: false,
        dueDate: {
          lte: endOfToday,
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
      take: 6,
      select: {
        id: true,
        title: true,
        dueDate: true,
        recurring: true,
      },
    }),
    getAgentStatuses(),
  ])

  const agentHealth = getAgentHealthCounts(agentStatuses)

  const attention = [
    overdueTasks > 0
      ? {
          type: 'overdue_tasks' as const,
          title: `${overdueTasks} overdue garden ${overdueTasks === 1 ? 'task' : 'tasks'}`,
          detail: 'Clear overdue items first to keep seasonal work on track.',
          href: '/gardening/tasks',
          severity: 'high' as const,
        }
      : null,
    agentHealth.offline > 0
      ? {
          type: 'offline_agents' as const,
          title: `${agentHealth.offline} ${agentHealth.offline === 1 ? 'agent is' : 'agents are'} offline`,
          detail: 'Check the monitor before morning runs and automations.',
          href: '/agents',
          severity: 'medium' as const,
        }
      : null,
    unreadNotifications > 0
      ? {
          type: 'unread_notifications' as const,
          title: `${unreadNotifications} unread ${unreadNotifications === 1 ? 'notification' : 'notifications'}`,
          detail: 'Triage now to avoid losing high-impact updates.',
          href: '/?panel=notifications',
          severity: 'medium' as const,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item))

  const watchlist = agentStatuses
    .filter((agent) => agent.health !== 'active')
    .sort((a, b) => {
      if (a.health === b.health) return a.name.localeCompare(b.name)
      return a.health === 'offline' ? -1 : 1
    })

  return {
    generatedAt: now.toISOString(),
    summary: {
      unreadNotifications,
      dueTodayTasks,
      overdueTasks,
      offlineAgents: agentHealth.offline,
    },
    attention,
    tasks: taskList.map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate.toISOString(),
      recurring: task.recurring,
    })),
    notifications: recentNotifications.map((notification) => ({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    })),
    watchlist: watchlist.map((agent) => ({
      ...agent,
      lastSeen: agent.lastSeen ? agent.lastSeen.toISOString() : null,
    })),
  }
}
