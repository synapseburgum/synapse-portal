export type QuickCaptureIntent = 'garden_task' | 'garden_note' | 'portal_note'

export interface ParsedQuickCapture {
  intent: QuickCaptureIntent
  title: string
  description: string | null
  dueDate: Date
  recurring: string | null
  confidence: 'high' | 'medium'
  reason: string
  tags: string[]
  raw: string
}

function normalizeWhitespace(input: string) {
  return input.replace(/\s+/g, ' ').trim()
}

function parseDateFragment(input: string, now: Date): { dueDate: Date; matched: string | null } {
  const base = new Date(now)
  base.setHours(9, 0, 0, 0)

  const lower = input.toLowerCase()

  if (/(\btoday\b|\btonight\b)/.test(lower)) {
    return { dueDate: base, matched: 'today' }
  }

  if (/\btomorrow\b/.test(lower)) {
    const d = new Date(base)
    d.setDate(d.getDate() + 1)
    return { dueDate: d, matched: 'tomorrow' }
  }

  if (/\bnext week\b/.test(lower)) {
    const d = new Date(base)
    d.setDate(d.getDate() + 7)
    return { dueDate: d, matched: 'next week' }
  }

  const inDays = lower.match(/\bin\s+(\d{1,2})\s+days?\b/)
  if (inDays) {
    const n = Number(inDays[1])
    const d = new Date(base)
    d.setDate(d.getDate() + n)
    return { dueDate: d, matched: inDays[0] }
  }

  const weekdays = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]

  const nextWeekday = lower.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/)
  if (nextWeekday) {
    const target = weekdays.indexOf(nextWeekday[1])
    const d = new Date(base)
    const current = d.getDay()
    let delta = (target - current + 7) % 7
    if (delta === 0) delta = 7
    d.setDate(d.getDate() + delta)
    return { dueDate: d, matched: nextWeekday[0] }
  }

  const bareWeekday = lower.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/)
  if (bareWeekday) {
    const target = weekdays.indexOf(bareWeekday[1])
    const d = new Date(base)
    const current = d.getDay()
    let delta = (target - current + 7) % 7
    if (delta === 0) delta = 7
    d.setDate(d.getDate() + delta)
    return { dueDate: d, matched: bareWeekday[0] }
  }

  return { dueDate: base, matched: null }
}

function parseRecurring(input: string): string | null {
  const lower = input.toLowerCase()

  if (/\bevery day\b|\bdaily\b/.test(lower)) return 'daily'
  if (/\bevery week\b|\bweekly\b/.test(lower)) return 'weekly'
  if (/\bevery month\b|\bmonthly\b/.test(lower)) return 'monthly'
  if (/\beach (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(lower)) return 'weekly'
  if (/\bevery (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(lower)) return 'weekly'

  return null
}

function inferIntent(input: string): { intent: QuickCaptureIntent; confidence: 'high' | 'medium'; reason: string; tags: string[] } {
  const lower = input.toLowerCase()

  const gardenWords = [
    'garden',
    'seed',
    'sow',
    'harvest',
    'plant',
    'watering',
    'water',
    'greenhouse',
    'tomato',
    'pepper',
    'bed',
    'pot',
    'compost',
    'weed',
    'prune',
  ]

  const hasGardenWord = gardenWords.some((word) => lower.includes(word))
  const explicitTaskVerb = /\b(add|remind|todo|to-do|task|remember|schedule|plan)\b/.test(lower)

  if (hasGardenWord || explicitTaskVerb) {
    return {
      intent: 'garden_task',
      confidence: hasGardenWord ? 'high' : 'medium',
      reason: hasGardenWord
        ? 'Detected gardening keywords in quick capture text.'
        : 'Detected reminder/task phrasing and defaulted to task creation.',
      tags: hasGardenWord ? ['gardening'] : ['task'],
    }
  }

  return {
    intent: 'portal_note',
    confidence: 'medium',
    reason: 'No clear gardening/task keywords. Saved as a portal note-style capture.',
    tags: ['note'],
  }
}

function stripCommandPrefix(input: string) {
  return input.replace(/^\s*(add|create|capture|quick add|quick capture)\s*[:\-]?\s*/i, '').trim()
}

export function parseQuickCapture(rawInput: string, now = new Date()): ParsedQuickCapture {
  const raw = normalizeWhitespace(rawInput)
  const stripped = stripCommandPrefix(raw)

  const intentInfo = inferIntent(stripped)
  const recurring = parseRecurring(stripped)
  const { dueDate, matched } = parseDateFragment(stripped, now)

  const titleBase = stripped
    .replace(/\b(today|tonight|tomorrow|next week|in \d{1,2} days?)\b/gi, '')
    .replace(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
    .replace(/\b(every day|daily|every week|weekly|every month|monthly)\b/gi, '')
    .replace(/\b(each|every)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  const title = titleBase.length > 0 ? titleBase : stripped

  const descriptionParts = [
    matched ? `Detected due hint: ${matched}` : 'No explicit due hint detected; defaulted to today at 09:00.',
    recurring ? `Detected recurrence: ${recurring}.` : 'One-off task unless edited.',
    `Intent reason: ${intentInfo.reason}`,
    `Original capture: ${raw}`,
  ]

  return {
    intent: intentInfo.intent,
    title: title.charAt(0).toUpperCase() + title.slice(1),
    description: descriptionParts.join(' '),
    dueDate,
    recurring,
    confidence: intentInfo.confidence,
    reason: intentInfo.reason,
    tags: intentInfo.tags,
    raw,
  }
}
