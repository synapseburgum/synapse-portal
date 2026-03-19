import { promises as fs } from 'fs'
import path from 'path'

export type BriefLink = {
  title: string
  url: string
}

export type BriefSection = {
  title: string
  summary: string
  details?: string
  links?: BriefLink[]
  tags?: string[]
}

export type BriefSource = {
  title: string
  url: string
}

export type DailyBriefPayload = {
  date: string
  title: string
  summary: string
  sections: BriefSection[]
  sources: BriefSource[]
  generatedAt: string
}

const BRIEFS_DIR = path.join(process.cwd(), 'data', 'briefs')

function isValidDateString(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
}

function briefFilePath(date: string) {
  return path.join(BRIEFS_DIR, `${date}.json`)
}

export function getBriefsDirPath() {
  return BRIEFS_DIR
}

export async function ensureBriefsDir() {
  await fs.mkdir(BRIEFS_DIR, { recursive: true })
}

function parseLinks(input: unknown): BriefLink[] | undefined {
  if (!Array.isArray(input)) return undefined

  const parsed: BriefLink[] = []
  for (const item of input) {
    if (!item || typeof item !== 'object') return undefined
    const obj = item as Record<string, unknown>
    const title = String(obj.title || '').trim()
    const url = String(obj.url || '').trim()
    if (!title || !url) return undefined
    parsed.push({ title, url })
  }

  return parsed.length > 0 ? parsed : undefined
}

function parseTags(input: unknown): string[] | undefined {
  if (!Array.isArray(input)) return undefined
  const tags = input
    .map((item) => String(item || '').trim())
    .filter(Boolean)

  return tags.length > 0 ? tags : undefined
}

export function validateBriefPayload(input: unknown): { ok: true; data: DailyBriefPayload } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Payload must be a JSON object' }

  const obj = input as Record<string, unknown>

  const date = String(obj.date || '')
  const title = String(obj.title || '')
  const summary = String(obj.summary || '')
  const generatedAt = String(obj.generatedAt || '')
  const sections = Array.isArray(obj.sections) ? obj.sections : []
  const sources = Array.isArray(obj.sources) ? obj.sources : []

  if (!isValidDateString(date)) return { ok: false, error: 'date must be YYYY-MM-DD' }
  if (!title.trim()) return { ok: false, error: 'title is required' }
  if (!summary.trim()) return { ok: false, error: 'summary is required' }
  if (!generatedAt || Number.isNaN(new Date(generatedAt).getTime())) {
    return { ok: false, error: 'generatedAt must be an ISO datetime string' }
  }

  const parsedSections: BriefSection[] = []
  for (const section of sections) {
    if (!section || typeof section !== 'object') return { ok: false, error: 'sections must be objects with title/summary' }

    const sectionObj = section as Record<string, unknown>
    const titleValue = String(sectionObj.title || '').trim()

    // Backward compatibility: old payloads use `content`; map to summary.
    const summaryValue = String(sectionObj.summary || sectionObj.content || '').trim()
    const detailsValue = typeof sectionObj.details === 'string' ? sectionObj.details.trim() : ''
    const linksValue = parseLinks(sectionObj.links)
    const tagsValue = parseTags(sectionObj.tags)

    if (!titleValue || !summaryValue) {
      return { ok: false, error: 'each section must include title and summary (or legacy content)' }
    }

    parsedSections.push({
      title: titleValue,
      summary: summaryValue,
      ...(detailsValue ? { details: detailsValue } : {}),
      ...(linksValue ? { links: linksValue } : {}),
      ...(tagsValue ? { tags: tagsValue } : {}),
    })
  }

  const parsedSources: BriefSource[] = []
  for (const source of sources) {
    if (!source || typeof source !== 'object') return { ok: false, error: 'sources must be objects with title/url' }
    const titleValue = String((source as Record<string, unknown>).title || '').trim()
    const urlValue = String((source as Record<string, unknown>).url || '').trim()
    if (!titleValue || !urlValue) return { ok: false, error: 'each source must include title and url' }
    parsedSources.push({ title: titleValue, url: urlValue })
  }

  return {
    ok: true,
    data: {
      date,
      title: title.trim(),
      summary: summary.trim(),
      sections: parsedSections,
      sources: parsedSources,
      generatedAt,
    },
  }
}

export async function saveBrief(brief: DailyBriefPayload) {
  await ensureBriefsDir()
  const filePath = briefFilePath(brief.date)
  await fs.writeFile(filePath, JSON.stringify(brief, null, 2), 'utf8')
  return filePath
}

export async function readBriefByDate(date: string): Promise<DailyBriefPayload | null> {
  if (!isValidDateString(date)) return null

  try {
    const file = await fs.readFile(briefFilePath(date), 'utf8')
    const raw = JSON.parse(file)
    const validated = validateBriefPayload(raw)
    if (!validated.ok) return null
    return validated.data
  } catch {
    return null
  }
}

export async function listBriefFiles() {
  await ensureBriefsDir()
  const files = await fs.readdir(BRIEFS_DIR)

  const dated = files
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.replace(/\.json$/, ''))
    .sort((a, b) => (a < b ? 1 : -1))

  return dated
}

export async function listBriefSummaries() {
  const dates = await listBriefFiles()
  const out: Array<{ date: string; title: string; generatedAt: string }> = []

  for (const date of dates) {
    const brief = await readBriefByDate(date)
    if (!brief) continue
    out.push({ date: brief.date, title: brief.title, generatedAt: brief.generatedAt })
  }

  return out
}

export async function getTodayOrLatestBrief(today = new Date()) {
  const todayDate = today.toISOString().slice(0, 10)
  const exact = await readBriefByDate(todayDate)
  if (exact) return exact

  const dates = await listBriefFiles()
  if (dates.length === 0) return null

  return readBriefByDate(dates[0])
}
