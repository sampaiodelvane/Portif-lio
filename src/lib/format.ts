const LOCALE = 'pt-BR'

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' })
const timeFormatter = new Intl.DateTimeFormat(LOCALE, { timeStyle: 'short' })
const numberFormatter = new Intl.NumberFormat(LOCALE, { notation: 'compact' })
const relativeFormatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatTime(date: Date): string {
  return timeFormatter.format(date)
}

export function formatCompactNumber(value: number): string {
  return numberFormatter.format(value)
}

/** "há 3 dias", "ontem", "há 2 meses" */
export function formatRelativeDate(iso: string, now: Date = new Date()): string {
  const seconds = (new Date(iso).getTime() - now.getTime()) / 1000
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return relativeFormatter.format(Math.round(seconds / size), unit)
    }
  }
  return 'agora'
}
