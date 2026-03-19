import { NextResponse } from 'next/server'
import { getAgentHealthCounts, getAgentStatuses } from '@/lib/agents'

export const revalidate = 0

// GET /api/agents/status - current health snapshot for known agents
export async function GET() {
  try {
    const agents = await getAgentStatuses()
    const counts = getAgentHealthCounts(agents)

    return NextResponse.json({
      ok: true,
      data: {
        generatedAt: new Date().toISOString(),
        counts,
        agents,
      },
    })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch agent status',
      },
      { status: 500 }
    )
  }
}
