import type { CustomerDetails, FulfillmentMethod } from '../types'

export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    return digits.slice(2)
  }
  return digits
}

export function validateCustomer(
  method: FulfillmentMethod,
  c: CustomerDetails,
): Partial<Record<keyof CustomerDetails, string>> {
  const errors: Partial<Record<keyof CustomerDetails, string>> = {}

  if (c.name.trim().length < 2) {
    errors.name = 'Informe seu nome'
  }

  const normalizedPhone = normalizePhone(c.phone)
  if (normalizedPhone.length !== 10 && normalizedPhone.length !== 11) {
    errors.phone = 'Informe um telefone válido com DDD'
  }

  if (method === 'delivery') {
    if (!c.street.trim()) {
      errors.street = 'Informe a rua'
    }
    if (!c.number.trim()) {
      errors.number = 'Informe o número'
    }
    if (!c.neighborhood.trim()) {
      errors.neighborhood = 'Informe o bairro'
    }
  }

  return errors
}
