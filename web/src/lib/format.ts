import { translate, translateCount } from './i18n'

export { numberWithSeparator, shortNumber } from './numbers'

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return ''

  const total = Math.round(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60

  let text = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  if (hours > 0) {
    text = `${String(hours).padStart(2, '0')}:${text}`
  }

  return text.replace(/^0+/, '')
}

async function relativeTime(locale: string, deltaSeconds: number): Promise<string> {
  const days = deltaSeconds / 86_400
  if (days > 365) return translateCount(locale, 'generic_count_years', Math.floor(days / 365))
  if (days > 30) return translateCount(locale, 'generic_count_months', Math.floor(days / 30))
  if (days > 7) return translateCount(locale, 'generic_count_weeks', Math.floor(days / 7))

  const hours = deltaSeconds / 3_600
  if (hours > 24) return translateCount(locale, 'generic_count_days', Math.floor(days))

  const minutes = deltaSeconds / 60
  if (minutes > 60) return translateCount(locale, 'generic_count_hours', Math.floor(hours))
  if (deltaSeconds > 60) return translateCount(locale, 'generic_count_minutes', Math.floor(minutes))

  return translateCount(locale, 'generic_count_seconds', Math.floor(deltaSeconds))
}

export async function formatPublished(
  locale: string,
  publishedUnix: number,
  nowUnix?: number,
): Promise<string> {
  const now = nowUnix ?? Date.now() / 1000
  const x = await relativeTime(locale, now - publishedUnix)
  return translate(locale, 'Shared `x` ago', x)
}

export async function formatPremiere(
  locale: string,
  premiereUnix: number,
  nowUnix?: number,
): Promise<string> {
  const now = nowUnix ?? Date.now() / 1000
  const x = await relativeTime(locale, premiereUnix - now)
  return translate(locale, 'Premieres in `x`', x)
}

export async function formatViewCount(locale: string, count: number): Promise<string> {
  return translateCount(locale, 'generic_views_count', count, 'short')
}
