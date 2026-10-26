import { describe, expect, it } from 'vitest'
import { menu } from '../data/menu'
import type { CartLine } from '../types'
import {
  describeSelection,
  findProduct,
  lineTotal,
  orderTotals,
  startingPrice,
  unitPrice,
  validateSelection,
} from './pricing'

describe('pricing', () => {
  it('calcula preço de produto sem opções (MUÇARELA id "4856190") = 4300', () => {
    const mucarela = findProduct(menu, '4856190')
    expect(mucarela).toBeDefined()
    expect(unitPrice(mucarela!, [])).toBe(4300)
    expect(validateSelection(mucarela!, []).valid).toBe(true)
  })

  it('calcula preço de "DOIS SABORES" (id "8672801") com 1/2 MUÇARELA + 1/2 MARGUERITA', () => {
    const doisSabores = findProduct(menu, '8672801')
    expect(doisSabores).toBeDefined()

    // 8672801-34609841 = 1/2 MUÇARELA (2150), 8672801-34609850 = 1/2 MARGUERITA (2250)
    const selected = ['8672801-34609841', '8672801-34609850']
    expect(validateSelection(doisSabores!, selected).valid).toBe(true)
    expect(unitPrice(doisSabores!, selected)).toBe(4400)
    expect(describeSelection(doisSabores!, selected)).toEqual([
      '1/2 MUÇARELA',
      '1/2 MARGUERITA',
    ])
  })

  it('valida seleção com 1 sabor ou 3 sabores em DOIS SABORES como inválida', () => {
    const doisSabores = findProduct(menu, '8672801')!

    const oneFlavor = validateSelection(doisSabores, ['8672801-34609841'])
    expect(oneFlavor.valid).toBe(false)
    expect(oneFlavor.errors['8672801-sabores']).toBe('Escolha pelo menos 2 opções')

    const threeFlavors = validateSelection(doisSabores, [
      '8672801-34609841',
      '8672801-34609850',
      '8672801-34609843',
    ])
    expect(threeFlavors.valid).toBe(false)
    expect(threeFlavors.errors['8672801-sabores']).toBe('Escolha no máximo 2 opções')
  })

  it('invalida id de opção de outro produto ou id repetido', () => {
    const doisSabores = findProduct(menu, '8672801')!

    // 4856191-22876971 pertence à CALABRESA (4856191)
    const foreignOption = validateSelection(doisSabores, [
      '8672801-34609841',
      '4856191-22876971',
    ])
    expect(foreignOption.valid).toBe(false)
    expect(foreignOption.errors._).toBeDefined()

    const duplicateOption = validateSelection(doisSabores, [
      '8672801-34609841',
      '8672801-34609841',
    ])
    expect(duplicateOption.valid).toBe(false)
    expect(duplicateOption.errors._).toBeDefined()
  })

  it('aceita 0 escolhas em grupos opcionais', () => {
    const calabresa = findProduct(menu, '4856191')!
    expect( validateSelection(calabresa, []).valid ).toBe(true)
  })

  it('calcula orderTotals somando taxa 600 em delivery e 0 em pickup', () => {
    const lines: CartLine[] = [
      {
        key: '4856190||',
        productId: '4856190',
        selectedOptionIds: [],
        quantity: 2,
        note: '',
      },
    ]

    expect(lineTotal(menu, lines[0])).toBe(8600)

    const deliveryTotals = orderTotals(menu, lines, 'delivery')
    expect(deliveryTotals).toEqual({
      subtotal: 8600,
      deliveryFee: 600,
      total: 9200,
    })

    const pickupTotals = orderTotals(menu, lines, 'pickup')
    expect(pickupTotals).toEqual({
      subtotal: 8600,
      deliveryFee: 0,
      total: 8600,
    })

    const emptyDelivery = orderTotals(menu, [], 'delivery')
    expect(emptyDelivery).toEqual({
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
    })
  })

  it('calcula startingPrice para MUÇARELA (4300) e DOIS SABORES (2 sabores distintos mais baratos = 2150 + 2250)', () => {
    const mucarela = findProduct(menu, '4856190')!
    expect(startingPrice(mucarela)).toBe(4300)

    const doisSabores = findProduct(menu, '8672801')!
    expect(startingPrice(doisSabores)).toBe(4400)
  })
})
