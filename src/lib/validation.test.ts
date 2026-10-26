import { describe, expect, it } from 'vitest'
import type { CustomerDetails } from '../types'
import { normalizePhone, validateCustomer } from './validation'

describe('normalizePhone', () => {
  it('mantém apenas dígitos e remove prefixo 55 quando possui 12 ou 13 dígitos', () => {
    expect(normalizePhone('(88) 99999-9999')).toBe('88999999999')
    expect(normalizePhone('+55 88 99999-9999')).toBe('88999999999')
    expect(normalizePhone('+55 (88) 3421-1234')).toBe('8834211234')
    expect(normalizePhone('123')).toBe('123')
  })
})

describe('validateCustomer', () => {
  const validBase: CustomerDetails = {
    name: 'Maria',
    phone: '(88) 99999-9999',
    street: 'Rua Dragão do Mar',
    number: '123',
    neighborhood: 'Canoa Quebrada',
    complement: '',
  }

  it('exige rua, número e bairro quando o método é delivery', () => {
    expect(validateCustomer('delivery', validBase)).toEqual({})

    const missingAddress = validateCustomer('delivery', {
      ...validBase,
      street: '   ',
      number: '',
      neighborhood: '',
    })
    expect(missingAddress.street).toBe('Informe a rua')
    expect(missingAddress.number).toBe('Informe o número')
    expect(missingAddress.neighborhood).toBe('Informe o bairro')
  })

  it('ignora campos de endereço quando o método é pickup', () => {
    const errors = validateCustomer('pickup', {
      ...validBase,
      street: '',
      number: '',
      neighborhood: '',
    })
    expect(errors).toEqual({})
  })

  it('valida telefones válidos (com ou sem +55) e rejeita inválidos', () => {
    expect(
      validateCustomer('pickup', { ...validBase, phone: '(88) 99999-9999' }).phone,
    ).toBeUndefined()

    expect(
      validateCustomer('pickup', { ...validBase, phone: '+55 88 99999-9999' }).phone,
    ).toBeUndefined()

    expect(validateCustomer('pickup', { ...validBase, phone: '123' }).phone).toBe(
      'Informe um telefone válido com DDD',
    )
  })
})
