import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.API_KEY_INTERNAL || 'synapse-internal-key-change-in-production'

export interface AuthResult {
  authorized: boolean
  error?: string
}

/**
 * Validate API key for agent/internal access
 * Usage: const auth = await validateApiKey(request)
 * if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })
 */
export function validateApiKey(request: NextRequest): AuthResult {
  const authHeader = request.headers.get('authorization')
  const apiKey = request.headers.get('x-api-key')
  
  // Check Authorization: Bearer <key>
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    if (token === API_KEY) {
      return { authorized: true }
    }
  }
  
  // Check X-API-Key header
  if (apiKey === API_KEY) {
    return { authorized: true }
  }
  
  return { authorized: false, error: 'Invalid or missing API key' }
}

/**
 * Middleware wrapper for API routes
 */
export function withAuth(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    const auth = validateApiKey(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }
    return handler(request, context)
  }
}
