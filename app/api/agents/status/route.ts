import { NextRequest, NextResponse } from 'next/server'
import { getAgentHealthCounts, getAgentStatuses } from '@/lib/agents'

// GET /api/agents/status - Agent monitor data for dashboard/mobile clients
export async function GET(_request: NextRequest) {
  try {
    const agentStatuses = await getAgentStatuses()
    const summary = getAgentHealthCounts(agentStatuses)

    return NextResponse.json({
      ok: true,
      data: {
        summary,
        agents: agentStatuses,
      },
    })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch agent statuses',
      },
      { status: 500 }
    )
  }
}
