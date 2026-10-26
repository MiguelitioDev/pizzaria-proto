import type { CartLine, Menu } from '../types'
import { findProduct, validateSelection } from './pricing'

export const MAX_QUANTITY = 99
export const MAX_NOTE_LENGTH = 200
export const CART_STORAGE_KEY = 'voagripina:cart:v1'

export type CartAction =
  | {
      type: 'add'
      productId: string
      selectedOptionIds: string[]
      quantity: number
      note: string
    }
  | {
      type: 'setQuantity'
      key: string
      quantity: number
    }
  | {
      type: 'remove'
      key: string
    }
  | {
      type: 'clear'
    }
  | {
      type: 'hydrate'
      lines: CartLine[]
    }

function sanitizeNote(note: string): string {
  return note.trim().slice(0, MAX_NOTE_LENGTH)
}

function clampQuantity(quantity: number): number {
  const intQty = Math.floor(quantity)
  if (!Number.isFinite(intQty) || intQty < 1) return 1
  return Math.min(intQty, MAX_QUANTITY)
}

export function makeLineKey(
  productId: string,
  selectedOptionIds: string[],
  note: string,
): string {
  const sortedIds = [...selectedOptionIds].sort().join(',')
  const normalizedNote = sanitizeNote(note).toLowerCase()
  return `${productId}|${sortedIds}|${normalizedNote}`
}

export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'add': {
      const cleanNote = sanitizeNote(action.note)
      const addQty = clampQuantity(action.quantity)
      const key = makeLineKey(action.productId, action.selectedOptionIds, cleanNote)
      const existingIndex = lines.findIndex((line) => line.key === key)

      if (existingIndex === -1) {
        return [
          ...lines,
          {
            key,
            productId: action.productId,
            selectedOptionIds: [...action.selectedOptionIds],
            quantity: addQty,
            note: cleanNote,
          },
        ]
      }

      return lines.map((line, index) =>
        index === existingIndex
          ? {
              ...line,
              quantity: Math.min(line.quantity + addQty, MAX_QUANTITY),
            }
          : line,
      )
    }

    case 'setQuantity': {
      const intQty = Math.floor(action.quantity)
      if (!Number.isFinite(intQty) || intQty <= 0) {
        return lines.filter((line) => line.key !== action.key)
      }
      const nextQty = Math.min(intQty, MAX_QUANTITY)
      return lines.map((line) =>
        line.key === action.key ? { ...line, quantity: nextQty } : line,
      )
    }

    case 'remove': {
      return lines.filter((line) => line.key !== action.key)
    }

    case 'clear': {
      return []
    }

    case 'hydrate': {
      return action.lines
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function sanitizeLines(raw: unknown, menu: Menu): CartLine[] {
  if (!Array.isArray(raw)) return []

  const sanitized: CartLine[] = []

  for (const item of raw) {
    if (!isRecord(item)) continue

    const { productId, selectedOptionIds, quantity, note } = item

    if (typeof productId !== 'string' || !productId) continue
    if (!Array.isArray(selectedOptionIds)) continue
    if (!selectedOptionIds.every((id): id is string => typeof id === 'string')) continue
    if (typeof quantity !== 'number' || !Number.isFinite(quantity)) continue

    const intQty = Math.floor(quantity)
    if (intQty < 1) continue

    const product = findProduct(menu, productId)
    if (!product) continue

    const validation = validateSelection(product, selectedOptionIds)
    if (!validation.valid) continue

    const cleanNote = typeof note === 'string' ? sanitizeNote(note) : ''
    const clampedQty = Math.min(intQty, MAX_QUANTITY)
    const key = makeLineKey(productId, selectedOptionIds, cleanNote)

    const existing = sanitized.find((line) => line.key === key)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + clampedQty, MAX_QUANTITY)
    } else {
      sanitized.push({
        key,
        productId,
        selectedOptionIds: [...selectedOptionIds],
        quantity: clampedQty,
        note: cleanNote,
      })
    }
  }

  return sanitized
}

export function loadCart(
  menu: Menu,
  storage: Pick<Storage, 'getItem'> | undefined,
): CartLine[] {
  if (!storage) return []
  try {
    const raw = storage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return sanitizeLines(parsed, menu)
  } catch {
    return []
  }
}

export function saveCart(
  lines: CartLine[],
  storage: Pick<Storage, 'setItem'> | undefined,
): void {
  if (!storage) return
  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // Ignore storage quota or security errors
  }
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}
