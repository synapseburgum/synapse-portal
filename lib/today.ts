import { prisma } from '@/lib/db'
import { getAgentStatuses } from '@/lib/agents'
import { getWeatherSnapshot } from '@/lib/weather'
import { getOrCreateDailyBrief } from '@/lib/brief'

// Time horizon categories for "Now / Next / Later" IA
export type TimeHorizon = 'now' | 'next' | 'later'

export type TodayPriority = {
  id: string
  title: string
  detail: string
  href: string
  level: 'high' | 'medium'
  /** Why this matters - actionable context */
  whyItMatters: string
  /** Time horizon: now = today/overdue, next = this week, later = beyond */
  horizon: TimeHorizon
  /** Priority score 0-100 (higher = more urgent) */
  score: number
  /** Category for grouping */
  category: 'tasks' | 'agents' | 'notifications' | 'calendar' | 'system'
}

export type TodayTask = {
  id: string
  title: string
  dueDate: Date
  overdue: boolean
  /** Why this task matters */
  whyItMatters?: string
  /** Priority score */
  score: number
  /** Time horizon */
  horizon: TimeHorizon
}

export type TodayEvent = {
  id: string
  type: 'sowing' | 'transplant' | 'harvest' | 'task'
  title: string
  plant?: string
  time?: Date
  /** Why this event matters */
  whyItMatters?: string
}

export type RecentActivity = {
  id: string
  type: 'notification' | 'agent' | 'task'
  title: string
  message?: string | null
  source?: string | null
  timestamp: Date
}

export type TodaySummary = {
  generatedAt: string
  greeting: string
  dateLabel: string
  counts: {
    unreadNotifications: number
    dueToday: number
    overdue: number
    offlineAgents: number
  }
  priorities: TodayPriority[]
  /** Items grouped by horizon for Now/Next/Later sections */
  horizonGroups: {
    now: TodayPriority[]
    next: TodayPriority[]
    later: TodayPriority[]
  }
  urgentTasks: TodayTask[]
  todayEvents: TodayEvent[]
  recentActivity: RecentActivity[]
  weather: {
    condition: string
    temperatureC: number
    recommendation: string
  } | null
  telegramDraft: string
}

/**
 * Calculate priority score (0-100) based on urgency and impact
 * Higher score = more urgent
 */
function calculateScore(params: {
  isOverdue: boolean
  isDueToday: boolean
  isDueTomorrow: boolean
  isDueThisWeek: boolean
  level: 'high' | 'medium'
  count: number
}): number {
  let score = 0

  // Time urgency (0-50 points)
  if (params.isOverdue) score += 50
  else if (params.isDueToday) score += 40
  else if (params.isDueTomorrow) score += 25
  else if (params.isDueThisWeek) score += 15

  // Level multiplier (0-30 points)
  if (params.level === 'high') score += 30
  else score += 15

  // Volume factor (0-20 points) - more items = higher priority
  if (params.count >= 5) score += 20
  else if (params.count >= 3) score += 10
  else if (params.count >= 1) score += 5

  return Math.min(100, score)
}

/** Determine time horizon based on due date */
function getHorizon(dueDate: Date | null, isOverdue: boolean): TimeHorizon {
  if (isOverdue) return 'now'

  if (!dueDate) return 'later'

  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'now'      // Today
  if (diffDays <= 7) return 'next'     // This week
  return 'later'                        // Beyond this week
}

function startOfDay(input: Date) {
  const d = new Date(input)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(input: Date) {
  const d = startOfDay(input)
  d.setDate(d.getDate() + 1)
  return d
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'Good early morning'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

function formatDateLabel(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return date.toLocaleDateString('en-GB', options)
}

export async function getTodaySummary(): Promise<TodaySummary> {
  const now = new Date()
  const dayStart = startOfDay(now)
  const dayEnd = endOfDay(now)

  const [
    unreadNotifications,
    dueToday,
    overdue,
    agentStatuses,
    weather,
    brief,
    urgentTasks,
    todayPlantings,
    todayTasks,
    recentNotifications,
    recentAgentActivity
  ] = await Promise.all([
    prisma.notification.count({ where: { isRead: false } }),
    prisma.gardenTask.count({ where: { completed: false, dueDate: { gte: dayStart, lt: dayEnd } } }),
    prisma.gardenTask.count({ where: { completed: false, dueDate: { lt: dayStart } } }),
    getAgentStatuses(),
    getWeatherSnapshot(),
    getOrCreateDailyBrief(now),
    // Get top 5 most urgent tasks (overdue + due today)
    prisma.gardenTask.findMany({
      where: {
        completed: false,
        dueDate: { lt: dayEnd }
      },
      orderBy: [
        { dueDate: 'asc' }
      ],
      take: 5,
    }),
    // Get today's planting events (transplant, harvest)
    prisma.gardenPlanting.findMany({
      where: {
        OR: [
          { transplantDate: { gte: dayStart, lt: dayEnd } },
          { expectedHarvestDate: { gte: dayStart, lt: dayEnd } },
        ],
      },
      include: { plant: true },
    }),
    // Get today's tasks
    prisma.gardenTask.findMany({
      where: {
        completed: false,
        dueDate: { gte: dayStart, lt: dayEnd }
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),
    // Recent notifications
    prisma.notification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    // Recent agent activity (from notifications with agent sources)
    prisma.notification.findMany({
      where: {
        source: { in: ['main', 'clark', 'scout', 'marketing', 'dev', 'ops', 'reviewer', 'workspace', 'terminal'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const offlineAgents = agentStatuses.filter((agent) => agent.health === 'offline').length

  // Build urgent tasks list with scoring and horizons
  const urgentTasksList: TodayTask[] = urgentTasks.map(task => {
    const taskOverdue = task.dueDate < dayStart
    const horizon = getHorizon(task.dueDate, taskOverdue)
    const score = calculateScore({
      isOverdue: taskOverdue,
      isDueToday: !taskOverdue && task.dueDate >= dayStart && task.dueDate < dayEnd,
      isDueTomorrow: false,
      isDueThisWeek: horizon === 'next',
      level: taskOverdue ? 'high' : 'medium',
      count: 1,
    })

    return {
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      overdue: taskOverdue,
      whyItMatters: taskOverdue
        ? 'Overdue tasks can cascade and affect plant health'
        : 'Completing today maintains your garden schedule',
      score,
      horizon,
    }
  })

  // Build today's events with context
  const todayEvents: TodayEvent[] = [
    ...todayPlantings.map(p => {
      const isTransplant = p.transplantDate && p.transplantDate >= dayStart && p.transplantDate < dayEnd
      return {
        id: p.id,
        type: isTransplant ? 'transplant' as const : 'harvest' as const,
        title: isTransplant
          ? `Transplant ${p.plant.name}`
          : `Harvest ${p.plant.name}`,
        plant: p.plant.name,
        time: p.transplantDate || p.expectedHarvestDate || undefined,
        whyItMatters: isTransplant
          ? 'Timely transplanting improves plant establishment'
          : 'Harvest at peak ripeness for best flavour',
      }
    }),
    ...todayTasks.map(t => ({
      id: t.id,
      type: 'task' as const,
      title: t.title,
      time: t.dueDate,
      whyItMatters: 'Scheduled garden maintenance task',
    })),
  ].slice(0, 6)

  // Build recent activity
  const recentActivity: RecentActivity[] = [
    ...recentNotifications.map(n => ({
      id: n.id,
      type: 'notification' as const,
      title: n.title,
      message: n.message,
      timestamp: n.createdAt,
    })),
    ...recentAgentActivity.map(a => ({
      id: `agent-${a.id}`,
      type: 'agent' as const,
      title: a.source || 'Agent',
      message: a.message,
      source: a.source,
      timestamp: a.createdAt,
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 8)

  // Build priorities with scoring and horizons
  const priorities: TodayPriority[] = []

  // Overdue tasks - always NOW, high priority
  if (overdue > 0) {
    priorities.push({
      id: 'overdue-tasks',
      title: `${overdue} overdue garden task${overdue === 1 ? '' : 's'}`,
      detail: 'Clear overdue tasks first to reduce carry-over and missed watering cycles.',
      href: '/gardening/tasks',
      level: 'high',
      whyItMatters: 'Overdue tasks can cascade, affecting plant health and creating backlog',
      horizon: 'now',
      score: calculateScore({
        isOverdue: true,
        isDueToday: false,
        isDueTomorrow: false,
        isDueThisWeek: false,
        level: 'high',
        count: overdue,
      }),
      category: 'tasks',
    })
  }

  // Offline agents - NOW, high priority
  if (offlineAgents > 0) {
    priorities.push({
      id: 'offline-agents',
      title: `${offlineAgents} offline agent${offlineAgents === 1 ? '' : 's'}`,
      detail: 'Check agent monitor for stalled workflows and restart if needed.',
      href: '/agents',
      level: 'high',
      whyItMatters: 'Offline agents may have stalled workflows that need attention',
      horizon: 'now',
      score: calculateScore({
        isOverdue: false,
        isDueToday: true,
        isDueTomorrow: false,
        isDueThisWeek: false,
        level: 'high',
        count: offlineAgents,
      }),
      category: 'agents',
    })
  }

  // Unread notifications - NOW or NEXT depending on volume
  if (unreadNotifications > 0) {
    const notifHorizon = unreadNotifications >= 3 ? 'now' : 'next'
    priorities.push({
      id: 'notifications',
      title: `${unreadNotifications} unread notification${unreadNotifications === 1 ? '' : 's'}`,
      detail: 'Review new updates and triage what needs action today.',
      href: '/',
      level: 'medium',
      whyItMatters: unreadNotifications >= 3
        ? 'Multiple unread items may contain time-sensitive information'
        : 'Stay on top of incoming updates',
      horizon: notifHorizon,
      score: calculateScore({
        isOverdue: false,
        isDueToday: notifHorizon === 'now',
        isDueTomorrow: notifHorizon === 'next',
        isDueThisWeek: false,
        level: 'medium',
        count: unreadNotifications,
      }),
      category: 'notifications',
    })
  }

  // Due today tasks - NOW
  if (dueToday > 0) {
    priorities.push({
      id: 'due-today',
      title: `${dueToday} garden task${dueToday === 1 ? '' : 's'} due today`,
      detail: 'Prioritize quick wins to keep momentum and protect plant health.',
      href: '/gardening/tasks',
      level: 'medium',
      whyItMatters: 'Today\'s tasks maintain your garden schedule and plant health',
      horizon: 'now',
      score: calculateScore({
        isOverdue: false,
        isDueToday: true,
        isDueTomorrow: false,
        isDueThisWeek: false,
        level: 'medium',
        count: dueToday,
      }),
      category: 'tasks',
    })
  }

  // If no priorities, show a calm state
  if (priorities.length === 0) {
    priorities.push({
      id: 'clear',
      title: 'No urgent blockers',
      detail: 'Use this window for planning, brief review, or maintenance tasks.',
      href: '/brief',
      level: 'medium',
      whyItMatters: 'A clear queue is an opportunity to get ahead',
      horizon: 'later',
      score: 10,
      category: 'system',
    })
  }

  // Group priorities by horizon for Now/Next/Later sections
  const horizonGroups = {
    now: priorities.filter(p => p.horizon === 'now').sort((a, b) => b.score - a.score),
    next: priorities.filter(p => p.horizon === 'next').sort((a, b) => b.score - a.score),
    later: priorities.filter(p => p.horizon === 'later').sort((a, b) => b.score - a.score),
  }

  const telegramDraftLines = [
    `Morning snapshot (${now.toLocaleDateString('en-GB')})`,
    `• Overdue tasks: ${overdue}`,
    `• Due today: ${dueToday}`,
    `• Offline agents: ${offlineAgents}`,
    `• Unread notifications: ${unreadNotifications}`,
    weather
      ? `• Weather: ${Math.round(weather.current.temperatureC)}°C, ${weather.current.condition.toLowerCase()} — ${weather.recommendation.text}`
      : '• Weather: unavailable right now',
    '',
    `TL;DR: ${brief.tldr}`,
  ]

  return {
    generatedAt: new Date().toISOString(),
    greeting: getTimeBasedGreeting(),
    dateLabel: formatDateLabel(now),
    counts: {
      unreadNotifications,
      dueToday,
      overdue,
      offlineAgents,
    },
    priorities,
    horizonGroups,
    urgentTasks: urgentTasksList,
    todayEvents,
    recentActivity,
    weather: weather
      ? {
          condition: weather.current.condition,
          temperatureC: weather.current.temperatureC,
          recommendation: weather.recommendation.text,
        }
      : null,
    telegramDraft: telegramDraftLines.join('\n'),
  }
}
