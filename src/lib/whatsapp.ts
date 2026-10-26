import { business } from '../config/business'
import type { CartLine, CustomerDetails, FulfillmentMethod, Menu, Product } from '../types'
import { displayName, formatBRL } from './format'
import { describeSelection, findProduct, lineTotal, orderTotals } from './pricing'

export interface OrderInput {
  menu: Menu
  lines: CartLine[]
  method: FulfillmentMethod
  customer: CustomerDetails
  paymentMethod?: string
}

function formatProductLabel(product: Product, selectedOptionIds: string[]): string {
  const baseName = displayName(product.name)
  const trimmedDesc = product.description.trim()
  const isBordaWithDesc =
    product.name.trim().toUpperCase() === 'BORDA' &&
    trimmedDesc.length > 0 &&
    trimmedDesc.length <= 20

  const nameWithBorda = isBordaWithDesc
    ? `${baseName} (${displayName(trimmedDesc)})`
    : baseName

  const optionNames = describeSelection(product, selectedOptionIds).map(displayName)
  if (optionNames.length > 0) {
    return `${nameWithBorda} (${optionNames.join(', ')})`
  }

  return nameWithBorda
}

export function buildOrderMessage(input: OrderInput): string {
  const { menu, lines, method, customer, paymentMethod } = input
  const itemLines: string[] = []

  for (const line of lines) {
    const product = findProduct(menu, line.productId)
    if (!product) continue

    const label = formatProductLabel(product, line.selectedOptionIds)
    const total = lineTotal(menu, line)
    itemLines.push(`${line.quantity}x ${label} — ${formatBRL(total)}`)

    const trimmedNote = line.note.trim()
    if (trimmedNote) {
      itemLines.push(`   Obs: ${trimmedNote}`)
    }
  }

  const totals = orderTotals(menu, lines, method)
  const totalsLines: string[] = [`Subtotal: ${formatBRL(totals.subtotal)}`]
  if (method === 'delivery') {
    totalsLines.push(`Taxa de entrega: ${formatBRL(totals.deliveryFee)}`)
  }
  totalsLines.push(`*Total: ${formatBRL(totals.total)}*`)

  const customerLines: string[] = [
    method === 'delivery' ? '*Entrega*' : '*Retirada no local*',
    `Nome: ${customer.name.trim()}`,
    `Telefone: ${customer.phone.trim()}`,
  ]

  if (method === 'delivery') {
    const street = customer.street.trim()
    const number = customer.number.trim()
    const neighborhood = customer.neighborhood.trim()
    const complement = customer.complement.trim()
    const complementSuffix = complement ? ` (Complemento: ${complement})` : ''
    customerLines.push(`Endereço: ${street}, ${number} — ${neighborhood}${complementSuffix}`)
  }

  const trimmedPayment = paymentMethod?.trim() ?? ''
  const paymentLine = trimmedPayment
    ? `Pagamento: ${trimmedPayment}`
    : 'Pagamento: a combinar pelo WhatsApp'

  return [
    `*Novo pedido — ${business.name}*`,
    '',
    '*Itens*',
    ...itemLines,
    '',
    ...totalsLines,
    '',
    ...customerLines,
    '',
    paymentLine,
    '',
    'Pedido feito pelo cardápio digital. Aguardo a confirmação do restaurante.',
  ].join('\n')
}

export function normalizeWhatsAppNumber(n: string): string | null {
  const digits = n.replace(/\D/g, '')
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    return digits
  }
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`
  }
  return null
}

export function buildWhatsAppUrl(number: string, message: string): string | null {
  const normalized = normalizeWhatsAppNumber(number)
  if (!normalized) return null
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}
