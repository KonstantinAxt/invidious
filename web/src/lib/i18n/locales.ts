import { OVERRIDES } from './overrides'

const modules = import.meta.glob('../../../locales/*.json', { import: 'default' })

const LOCALE_RE = /\/locales\/(.+)\.json$/

export const DEFAULT_LOCALE = 'en-US'

export const AVAILABLE_LOCALES: string[] = Object.keys(modules)
  .map((path) => LOCALE_RE.exec(path)?.[1])
  .filter((locale): locale is string => locale !== undefined)
  .sort((a, b) => (a === DEFAULT_LOCALE ? -1 : b === DEFAULT_LOCALE ? 1 : a.localeCompare(b)))

const RTL_LOCALES = new Set(['ar', 'fa', 'he'])

export function isRtl(locale: string): boolean {
  return RTL_LOCALES.has(locale.split('-')[0] ?? '')
}

const cache = new Map<string, Promise<Record<string, string>>>()

export function loadMessages(locale: string): Promise<Record<string, string>> {
  const existing = cache.get(locale)
  if (existing) return existing

  const promise = (async () => {
    const loader = modules[`../../../locales/${locale}.json`]
    if (!loader) return {}
    return { ...((await loader()) as Record<string, string>), ...OVERRIDES }
  })()

  cache.set(locale, promise)
  return promise
}

export function detectLocale(acceptLanguage: string | null | undefined): string {
  if (!acceptLanguage) return DEFAULT_LOCALE

  for (const part of acceptLanguage.split(',')) {
    const tag = (part.split(';')[0] ?? '').trim().toLowerCase()
    if (!tag || tag === '*') continue

    const exact = AVAILABLE_LOCALES.find((locale) => locale.toLowerCase() === tag)
    if (exact) return exact

    const base = tag.split('-')[0] ?? ''
    const baseMatch = AVAILABLE_LOCALES.find((locale) => locale.toLowerCase() === base)
    if (baseMatch) return baseMatch

    const variant = AVAILABLE_LOCALES.find((locale) => locale.toLowerCase().startsWith(`${base}-`))
    if (variant) return variant
  }

  return DEFAULT_LOCALE
}

/** YouTube trending region code for a BCP 47 locale tag ("de" → "DE",
    "en-US" → "US"); language-only tags fall back to a matching country. */
export function regionFromLocale(locale: string): string {
  const parts = locale.split('-')
  const country = parts[1]
  if (country) return country.toUpperCase()

  const language = (parts[0] ?? '').toLowerCase()
  const languageRegions: Record<string, string> = {
    ar: 'SA',
    de: 'DE',
    en: 'US',
    es: 'ES',
    fr: 'FR',
    it: 'IT',
    ja: 'JP',
    pt: 'BR',
  }
  return languageRegions[language] ?? 'US'
}
