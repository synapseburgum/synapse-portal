import { prisma } from '@/lib/db'
import { getAgentStatuses } from '@/lib/agents'
import { getWeatherSnapshot } from '@/lib/weather'
import { getOrCreateDailyBrief } from '@/lib/brief'

export type TodayPriority = {
  id: string
  title: string
  detail: string
  href: string
  level: 'high' | 'medium'
}

export type TodaySummary = {
  generatedAt: string
  counts: {
    unreadNotifications: number
    dueToday: number
    overdue: number
    offlineAgents: number
  }
  priorities: TodayPriority[]
  weather: {
    condition: string
    temperatureC: number
    recommendation: string
  } | null
  telegramDraft: string
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

export async function getTodaySummary(): Promise<TodaySummary> {
  const now = new Date()
  const dayStart = startOfDay(now)
  const dayEnd = endOfDay(now)

  const [unreadNotifications, dueToday, overdue, agentStatuses, weather, brief] = await Promise.all([
    prisma.notification.count({ where: { isRead: false } }),
    prisma.gardenTask.count({ where: { completed: false, dueDate: { gte: dayStart, lt: dayEnd } } }),
    prisma.gardenTask.count({ where: { completed: false, dueDate: { lt: dayStart } } }),
    getAgentStatuses(),
    getWeatherSnapshot(),
    getOrCreateDailyBrief(now),
  ])

  const offlineAgents = agentStatuses.filter((agent) => agent.health === 'offline').length

  const priorities: TodayPriority[] = []

  if (overdue > 0) {
    priorities.push({
      id: 'overdue-tasks',
      title: `${overdue} overdue garden task${overdue === 1 ? '' : 's'}`,
      detail: 'Clear overdue tasks first to reduce carry-over and missed watering cycles.',
      href: '/gardening/tasks',
      level: 'high',
    })
  }

  if (offlineAgents > 0) {
    priorities.push({
      id: 'offline-agents',
      title: `${offlineAgents} offline agent${offlineAgents === 1 ? '' : 's'}`,
      detail: 'Check agent monitor for stalled workflows and restart if needed.',
      href: '/agents',
      level: 'high',
    })
  }

  if (unreadNotifications > 0) {
    priorities.push({
      id: 'notifications',
      title: `${unreadNotifications} unread notification${unreadNotifications === 1 ? '' : 's'}`,
      detail: 'Review new updates and triage what needs action today.',
      href: '/',
      level: 'medium',
    })
  }

  if (dueToday > 0) {
    priorities.push({
      id: 'due-today',
      title: `${dueToday} garden task${dueToday === 1 ? '' : 's'} due today`,
      detail: 'Prioritize quick wins to keep momentum and protect plant health.',
      href: '/gardening/tasks',
      level: 'medium',
    })
  }

  if (priorities.length === 0) {
    priorities.push({
      id: 'clear',
      title: 'No urgent blockers',
      detail: 'Use this window for planning, brief review, or maintenance tasks.',
      href: '/brief',
      level: 'medium',
    })
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
    counts: {
      unreadNotifications,
      dueToday,
      overdue,
      offlineAgents,
    },
    priorities,
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
