import { prisma } from '@/lib/db'

export type AgentHealth = 'active' | 'idle' | 'offline'

export type AgentStatus = {
  name: string
  health: AgentHealth
  lastSeen: Date | null
  lastMessage: string | null
}

export const KNOWN_AGENTS = ['main', 'clark', 'scout', 'marketing', 'dev', 'ops', 'reviewer', 'workspace', 'terminal']

export async function getAgentStatuses(): Promise<AgentStatus[]> {
  const now = new Date()
  const lookback = new Date(now)
  lookback.setDate(lookback.getDate() - 7)

  const recent = await prisma.notification.findMany({
    where: {
      source: { in: KNOWN_AGENTS },
      createdAt: { gte: lookback },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      source: true,
      message: true,
      createdAt: true,
    },
  })

  const latestByAgent = new Map<string, { createdAt: Date; message: string | null }>()
  for (const item of recent) {
    if (!item.source || latestByAgent.has(item.source)) continue
    latestByAgent.set(item.source, { createdAt: item.createdAt, message: item.message })
  }

  return KNOWN_AGENTS.map((name) => {
    const latest = latestByAgent.get(name)
    if (!latest) {
      return {
        name,
        health: 'offline',
        lastSeen: null,
        lastMessage: null,
      }
    }

    const minutesAgo = (now.getTime() - latest.createdAt.getTime()) / 60000
    const health: AgentHealth = minutesAgo <= 20 ? 'active' : minutesAgo <= 180 ? 'idle' : 'offline'

    return {
      name,
      health,
      lastSeen: latest.createdAt,
      lastMessage: latest.message,
    }
  })
}

export function getAgentHealthCounts(agentStatuses: AgentStatus[]) {
  return {
    active: agentStatuses.filter((agent) => agent.health === 'active').length,
    idle: agentStatuses.filter((agent) => agent.health === 'idle').length,
    offline: agentStatuses.filter((agent) => agent.health === 'offline').length,
  }
}
