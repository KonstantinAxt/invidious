import { numberWithSeparator, shortNumber } from '../numbers'
import { DEFAULT_LOCALE, loadMessages } from './locales'

export async function translate(
  locale: string,
  key: string,
  text?: string | Record<string, string | number>,
): Promise<string> {
  const en = await loadMessages(DEFAULT_LOCALE)
  if (!(key in en)) {
    console.warn(`i18n: Missing translation key "${key}"`)
    return key
  }

  let raw: string | Record<string, string> | undefined
  if (locale !== DEFAULT_LOCALE) {
    const messages = await loadMessages(locale)
    if (key in messages) raw = messages[key]
  }
  if (raw === undefined) raw = en[key]

  let translation: string
  if (typeof raw === 'string') {
    translation = raw
  } else {
    translation = ''
    let matchLength = 0
    if (typeof text === 'string') {
      for (const [regexKey, value] of Object.entries(raw)) {
        const match = text.match(new RegExp(regexKey))
        if (match && match[0].length >= matchLength) {
          translation = value
          matchLength = match[0].length
        }
      }
    }
  }

  if (typeof text === 'string') {
    translation = translation.replaceAll('`x`', text)
  } else if (text && typeof text === 'object') {
    for (const [name, value] of Object.entries(text)) {
      translation = translation.replaceAll(`{{${name}}}`, String(value))
    }
  }

  return translation
}

export async function translateCount(
  locale: string,
  key: string,
  count: number,
  format: 'none' | 'separator' | 'short' = 'none',
): Promise<string> {
  const loaded = await loadMessages(locale)
  const useLocale = Object.keys(loaded).length > 0 ? locale : DEFAULT_LOCALE
  const messages = useLocale === locale ? loaded : await loadMessages(DEFAULT_LOCALE)

  const suffix = pluralSuffix(useLocale, count)
  let translation = messages[key + suffix]

  if (translation === undefined) {
    const singular = messages[key + pluralSuffix(useLocale, 1)]
    if (singular !== undefined) {
      translation = singular
    } else if (useLocale !== DEFAULT_LOCALE) {
      return translateCount(DEFAULT_LOCALE, key, count, format)
    } else {
      console.warn(`i18n: Missing translation key "${key}"`)
      return key
    }
  }

  let countText: string
  switch (format) {
    case 'separator':
      countText = numberWithSeparator(count)
      break
    case 'short':
      countText = shortNumber(count)
      break
    default:
      countText = String(count)
  }

  return translation.replaceAll('{{count}}', countText)
}

type PluralForm =
  | 'single_gt_one'
  | 'single_not_one'
  | 'none'
  | 'dual_slavic'
  | 'arabic'
  | 'czech_slovak'
  | 'polish_kashubian'
  | 'welsh'
  | 'irish'
  | 'scottish_gaelic'
  | 'icelandic'
  | 'javanese'
  | 'cornish'
  | 'lithuanian'
  | 'latvian'
  | 'macedonian'
  | 'mandinka'
  | 'maltese'
  | 'romanian'
  | 'slovenian'
  | 'hebrew'
  | 'odia'
  | 'spanish_italian'
  | 'french_portuguese'
  | 'hungarian_serbian'

const PLURAL_SETS: Record<PluralForm, string[]> = {
  single_gt_one: [
    'ach',
    'ak',
    'am',
    'arn',
    'br',
    'fa',
    'fil',
    'gun',
    'ln',
    'mfe',
    'mg',
    'mi',
    'oc',
    'pt-PT',
    'tg',
    'tl',
    'ti',
    'tr',
    'uz',
    'wa',
  ],
  single_not_one: [
    'af',
    'an',
    'ast',
    'az',
    'bg',
    'bn',
    'ca',
    'da',
    'de',
    'dev',
    'el',
    'en',
    'eo',
    'et',
    'eu',
    'fi',
    'fo',
    'fur',
    'fy',
    'gl',
    'gu',
    'ha',
    'hi',
    'hu',
    'hy',
    'ia',
    'kk',
    'kn',
    'ku',
    'lb',
    'mai',
    'ml',
    'mn',
    'mr',
    'nah',
    'nap',
    'nb',
    'ne',
    'nl',
    'nn',
    'no',
    'nso',
    'pa',
    'pap',
    'pms',
    'ps',
    'rm',
    'sco',
    'se',
    'si',
    'so',
    'son',
    'sq',
    'sv',
    'sw',
    'ta',
    'te',
    'tk',
    'ur',
    'yo',
  ],
  none: [
    'ay',
    'bo',
    'cgg',
    'ht',
    'id',
    'ja',
    'jbo',
    'ka',
    'km',
    'ko',
    'ky',
    'lo',
    'ms',
    'sah',
    'su',
    'th',
    'tt',
    'ug',
    'vi',
    'wo',
    'zh',
  ],
  dual_slavic: ['be', 'bs', 'cnr', 'dz', 'ru', 'uk'],
  arabic: [],
  czech_slovak: [],
  polish_kashubian: [],
  welsh: [],
  irish: [],
  scottish_gaelic: [],
  icelandic: [],
  javanese: [],
  cornish: [],
  lithuanian: [],
  latvian: [],
  macedonian: [],
  mandinka: [],
  maltese: [],
  romanian: [],
  slovenian: [],
  hebrew: [],
  odia: [],
  spanish_italian: [],
  french_portuguese: [],
  hungarian_serbian: [],
}

const PLURAL_SINGLES: Record<string, PluralForm> = {
  ar: 'arabic',
  cs: 'czech_slovak',
  csb: 'polish_kashubian',
  cy: 'welsh',
  ga: 'irish',
  gd: 'scottish_gaelic',
  he: 'hebrew',
  is: 'icelandic',
  iw: 'hebrew',
  jv: 'javanese',
  kw: 'cornish',
  lt: 'lithuanian',
  lv: 'latvian',
  mk: 'macedonian',
  mnk: 'mandinka',
  mt: 'maltese',
  or: 'odia',
  pl: 'polish_kashubian',
  ro: 'romanian',
  sk: 'czech_slovak',
  sl: 'slovenian',
  es: 'spanish_italian',
  fr: 'french_portuguese',
  hr: 'hungarian_serbian',
  it: 'spanish_italian',
  pt: 'french_portuguese',
  sr: 'hungarian_serbian',
}

function getPluralForm(locale: string): PluralForm {
  const key = locale === 'pt-PT' ? locale : (locale.split('-')[0] ?? '')
  for (const [form, langs] of Object.entries(PLURAL_SETS)) {
    if (langs.includes(key)) return form as PluralForm
  }
  return PLURAL_SINGLES[key] ?? 'single_not_one'
}

function simplePlural(form: PluralForm): boolean {
  return (
    form === 'single_gt_one' ||
    form === 'single_not_one' ||
    form === 'icelandic' ||
    form === 'macedonian'
  )
}

function suffixIndex(form: PluralForm, count: number): number {
  switch (form) {
    case 'single_gt_one':
      return count > 1 ? 1 : 0
    case 'single_not_one':
      return count !== 1 ? 1 : 0
    case 'none':
      return 0
    case 'dual_slavic': {
      const mod10 = count % 10
      const mod100 = count % 100
      if (mod10 === 1 && mod100 !== 11) return 0
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 1
      return 2
    }
    case 'arabic': {
      if (count === 0 || count === 1 || count === 2) return count
      const mod100 = count % 100
      if (mod100 >= 3 && mod100 <= 10) return 3
      if (mod100 >= 11) return 4
      return 5
    }
    case 'czech_slovak':
      if (count === 1) return 0
      if (count >= 2 && count <= 4) return 1
      return 2
    case 'polish_kashubian': {
      if (count === 1) return 0
      const mod10 = count % 10
      const mod100 = count % 100
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 1
      return 2
    }
    case 'welsh':
      if (count === 1) return 0
      if (count === 2) return 1
      if (count !== 8 && count !== 11) return 2
      return 3
    case 'irish':
      if (count === 1) return 0
      if (count === 2) return 1
      if (count < 7) return 2
      if (count < 11) return 3
      return 4
    case 'scottish_gaelic':
      if (count === 1 || count === 11) return 0
      if (count === 2 || count === 12) return 1
      if (count > 2 && count < 20) return 2
      return 3
    case 'icelandic':
      return count % 10 !== 1 || count % 100 === 11 ? 1 : 0
    case 'javanese':
      return count !== 0 ? 1 : 0
    case 'cornish':
      if (count === 1) return 0
      if (count === 2) return 1
      if (count === 3) return 2
      return 3
    case 'lithuanian': {
      const mod10 = count % 10
      const mod100 = count % 100
      if (mod10 === 1 && mod100 !== 11) return 0
      if (mod10 >= 2 && (mod100 < 10 || mod100 >= 20)) return 1
      return 2
    }
    case 'latvian':
      if (count % 10 === 1 && count % 100 !== 11) return 0
      if (count !== 0) return 1
      return 2
    case 'macedonian':
      return count === 1 || (count % 10 === 1 && count % 100 !== 11) ? 0 : 1
    case 'mandinka':
      return count === 0 || count === 1 ? count : 2
    case 'maltese': {
      if (count === 1) return 0
      if (count === 0) return 1
      const mod100 = count % 100
      if (mod100 > 1 && mod100 < 11) return 1
      if (mod100 > 10 && mod100 < 20) return 2
      return 3
    }
    case 'romanian': {
      if (count === 1) return 0
      if (count === 0) return 1
      const mod100 = count % 100
      if (mod100 > 0 && mod100 < 20) return 1
      return 2
    }
    case 'slovenian': {
      const mod100 = count % 100
      if (mod100 === 1) return 1
      if (mod100 === 2) return 2
      if (mod100 === 3 || mod100 === 4) return 3
      return 0
    }
    case 'hebrew':
      if (count === 1) return 0
      if (count === 2) return 1
      if ((count < 0 || count > 10) && count % 10 === 0) return 2
      return 3
    case 'odia':
      return count === 1 ? 0 : 1
    case 'spanish_italian':
      if (count === 1) return 0
      if (count !== 0 && count % 1_000_000 === 0) return 1
      return 2
    case 'french_portuguese':
      if (count === 0 || count === 1) return 0
      if (count % 1_000_000 === 0) return 1
      return 2
    case 'hungarian_serbian': {
      const mod10 = count % 10
      const mod100 = count % 100
      if (mod10 === 1 && mod100 !== 11) return 0
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 1
      return 2
    }
    default:
      return 0
  }
}

export function pluralSuffix(locale: string, count: number): string {
  const form = getPluralForm(locale)
  if (form === 'none') return '_0'
  const idx = suffixIndex(form, Math.abs(count))
  if (simplePlural(form)) return idx === 1 ? '_plural' : ''
  return `_${idx}`
}
