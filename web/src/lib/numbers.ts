export function numberWithSeparator(number: number): string {
  return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function shortNumber(number: number): string {
  const separated = numberWithSeparator(number).replaceAll(',', '.').split('')
  let text = separated.slice(0, 2).join('')

  if (separated[2] !== undefined && separated[2] !== '.') {
    text += separated[2]
  }

  text = text.replace(/\.0$/, '')

  if (Math.floor(number / 1_000_000_000) !== 0) text += 'B'
  else if (Math.floor(number / 1_000_000) !== 0) text += 'M'
  else if (Math.floor(number / 1_000) !== 0) text += 'K'

  return text
}
