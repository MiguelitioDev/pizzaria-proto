import type { Product } from '../types'

export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

export function filterProducts(
  products: Product[],
  query: string,
  categoryId: string | null,
): Product[] {
  const normalizedQuery = normalizeText(query)
  const terms = normalizedQuery ? normalizedQuery.split(' ') : []

  return products.filter((product) => {
    if (categoryId !== null && product.categoryId !== categoryId) {
      return false
    }

    if (terms.length === 0) {
      return true
    }

    const haystack = normalizeText(`${product.name} ${product.description}`)
    return terms.every((term) => haystack.includes(term))
  })
}
