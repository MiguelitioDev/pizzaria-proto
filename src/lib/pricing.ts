import { business } from '../config/business'
import type { CartLine, Cents, FulfillmentMethod, Menu, Product, ProductOption } from '../types'

export function findProduct(menu: Menu, id: string): Product | undefined {
  return menu.products.find((p) => p.id === id)
}

function buildOptionLookup(product: Product): Map<string, { option: ProductOption; groupId: string }> {
  const map = new Map<string, { option: ProductOption; groupId: string }>()
  for (const group of product.optionGroups) {
    for (const option of group.options) {
      map.set(option.id, { option, groupId: group.id })
    }
  }
  return map
}

export function validateSelection(
  product: Product,
  selectedOptionIds: string[],
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  const lookup = buildOptionLookup(product)
  const seen = new Set<string>()
  const countsByGroup = new Map<string, number>()

  for (const id of selectedOptionIds) {
    if (seen.has(id)) {
      errors._ = 'Opção repetida não é permitida'
      continue
    }
    seen.add(id)

    const entry = lookup.get(id)
    if (!entry) {
      errors._ = 'Opção selecionada não pertence a este produto'
      continue
    }

    countsByGroup.set(entry.groupId, (countsByGroup.get(entry.groupId) ?? 0) + 1)
  }

  for (const group of product.optionGroups) {
    const count = countsByGroup.get(group.id) ?? 0
    if (count < group.min) {
      errors[group.id] =
        group.min === 1
          ? 'Escolha pelo menos 1 opção'
          : `Escolha pelo menos ${group.min} opções`
    } else if (count > group.max) {
      errors[group.id] =
        group.max === 1
          ? 'Escolha no máximo 1 opção'
          : `Escolha no máximo ${group.max} opções`
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function unitPrice(product: Product, selectedOptionIds: string[]): Cents {
  const lookup = buildOptionLookup(product)
  let total: Cents = product.basePrice
  for (const id of selectedOptionIds) {
    const entry = lookup.get(id)
    if (entry) {
      total += entry.option.price
    }
  }
  return total
}

export function lineTotal(menu: Menu, line: CartLine): Cents {
  const product = findProduct(menu, line.productId)
  if (!product) return 0
  return unitPrice(product, line.selectedOptionIds) * line.quantity
}

export function orderTotals(
  menu: Menu,
  lines: CartLine[],
  method: FulfillmentMethod,
): { subtotal: Cents; deliveryFee: Cents; total: Cents } {
  let subtotal: Cents = 0
  let validLineCount = 0

  for (const line of lines) {
    if (line.quantity > 0 && findProduct(menu, line.productId)) {
      validLineCount += 1
      subtotal += lineTotal(menu, line)
    }
  }

  const hasItems = lines.length > 0 && validLineCount > 0
  const deliveryFee: Cents = method === 'delivery' && hasItems ? business.delivery.fee : 0

  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  }
}

export function describeSelection(product: Product, selectedOptionIds: string[]): string[] {
  const selectedSet = new Set(selectedOptionIds)
  const names: string[] = []

  for (const group of product.optionGroups) {
    for (const option of group.options) {
      if (selectedSet.has(option.id)) {
        names.push(option.name)
      }
    }
  }

  return names
}

export function startingPrice(product: Product): Cents {
  let total: Cents = product.basePrice
  for (const group of product.optionGroups) {
    if (group.min > 0) {
      const sortedPrices = group.options.map((o) => o.price).sort((a, b) => a - b)
      const count = Math.min(group.min, sortedPrices.length)
      for (let i = 0; i < count; i++) {
        total += sortedPrices[i]
      }
    }
  }
  return total
}

