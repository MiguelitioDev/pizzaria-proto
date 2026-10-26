import type { Cents } from '../types'

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const CONNECTORS = new Set([
  'a',
  'as',
  'o',
  'os',
  'de',
  'da',
  'do',
  'das',
  'dos',
  'e',
  'com',
  'em',
  'para',
])

export function formatBRL(cents: Cents): string {
  return brlFormatter.format(cents / 100).replace(/\u00a0/g, ' ')
}

function capitalizePart(part: string): string {
  if (!part) return part
  const lower = part.toLocaleLowerCase('pt-BR')
  return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1)
}

export function displayName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return ''

  const tokens = trimmed.split(/\s+/)
  let seenWord = false

  return tokens
    .map((token) => {
      const lower = token.toLocaleLowerCase('pt-BR')

      // Fractions or purely numeric/symbol tokens like "1/2" or "500"
      if (/^[\d/.,]+$/.test(token)) {
        return token
      }

      // Units like "1L", "500ml"
      const numUnitMatch = /^(\d+)(l|ml)$/i.exec(token)
      if (numUnitMatch) {
        const unit = numUnitMatch[2].toLowerCase() === 'l' ? 'L' : 'ml'
        return `${numUnitMatch[1]}${unit}`
      }

      // Standalone unit tokens "L" and "ml"
      if (lower === 'l') {
        return 'L'
      }
      if (lower === 'ml') {
        return 'ml'
      }

      const isFirstWord = !seenWord
      seenWord = true

      if (!isFirstWord && CONNECTORS.has(lower)) {
        return lower
      }

      // Hyphenated words like "COCA-COLA" -> "Coca-Cola"
      if (token.includes('-')) {
        return token.split('-').map(capitalizePart).join('-')
      }

      return capitalizePart(token)
    })
    .join(' ')
}
