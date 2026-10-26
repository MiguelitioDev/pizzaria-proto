import { describe, expect, it } from 'vitest'
import { menu } from '../data/menu'
import type { CartLine } from '../types'
import {
  CART_STORAGE_KEY,
  cartCount,
  cartReducer,
  loadCart,
  makeLineKey,
  sanitizeLines,
  saveCart,
} from './cart'

describe('cartReducer & makeLineKey', () => {
  it('soma quantidades ao adicionar item com a mesma key e faz clamp em 99', () => {
    let state: CartLine[] = []
    state = cartReducer(state, {
      type: 'add',
      productId: '4856190',
      selectedOptionIds: [],
      quantity: 2,
      note: '  Bem assada ',
    })
    expect(state).toHaveLength(1)
    expect(state[0].quantity).toBe(2)
    expect(state[0].note).toBe('Bem assada')

    state = cartReducer(state, {
      type: 'add',
      productId: '4856190',
      selectedOptionIds: [],
      quantity: 3,
      note: 'bem assada',
    })
    expect(state).toHaveLength(1)
    expect(state[0].quantity).toBe(5)

    state = cartReducer(state, {
      type: 'add',
      productId: '4856190',
      selectedOptionIds: [],
      quantity: 100,
      note: 'bem assada',
    })
    expect(state[0].quantity).toBe(99)
  })

  it('gera linhas diferentes para notas diferentes ou opções diferentes', () => {
    let state: CartLine[] = []
    state = cartReducer(state, {
      type: 'add',
      productId: '4856191',
      selectedOptionIds: [],
      quantity: 1,
      note: 'sem cebola',
    })
    state = cartReducer(state, {
      type: 'add',
      productId: '4856191',
      selectedOptionIds: [],
      quantity: 1,
      note: 'com bastante cebola',
    })
    state = cartReducer(state, {
      type: 'add',
      productId: '4856191',
      selectedOptionIds: ['4856191-22876971'],
      quantity: 1,
      note: 'sem cebola',
    })

    expect(state).toHaveLength(3)
    expect(cartCount(state)).toBe(3)
  })

  it('atualiza quantidade com setQuantity (0 remove, >99 faz clamp), remove e clear', () => {
    const key1 = makeLineKey('4856190', [], '')
    const key2 = makeLineKey('4856204', [], '')

    let state: CartLine[] = [
      { key: key1, productId: '4856190', selectedOptionIds: [], quantity: 1, note: '' },
      { key: key2, productId: '4856204', selectedOptionIds: [], quantity: 2, note: '' },
    ]

    state = cartReducer(state, { type: 'setQuantity', key: key1, quantity: 150 })
    expect(state.find((l) => l.key === key1)?.quantity).toBe(99)

    state = cartReducer(state, { type: 'setQuantity', key: key1, quantity: 0 })
    expect(state).toHaveLength(1)
    expect(state[0].key).toBe(key2)

    state = cartReducer(state, { type: 'remove', key: key2 })
    expect(state).toEqual([])

    state = cartReducer(state, {
      type: 'add',
      productId: '4856190',
      selectedOptionIds: [],
      quantity: 2,
      note: '',
    })
    expect(state).toHaveLength(1)

    state = cartReducer(state, { type: 'clear' })
    expect(state).toEqual([])
  })
})

describe('sanitizeLines, loadCart e saveCart', () => {
  it('descarta lixo (null, string, produto/opção inexistente, qty <= 0/NaN) e faz clamp 1000 -> 99', () => {
    expect(sanitizeLines(null, menu)).toEqual([])
    expect(sanitizeLines('invalido', menu)).toEqual([])

    const raw = [
      null,
      'string',
      { productId: 'inexistente', selectedOptionIds: [], quantity: 1, note: '' },
      { productId: '4856190', selectedOptionIds: ['opcao-falsa'], quantity: 1, note: '' },
      // DOIS SABORES exige 2 opções, passando apenas 1 deve ser descartado:
      { productId: '8672801', selectedOptionIds: ['8672801-34609841'], quantity: 1, note: '' },
      { productId: '4856190', selectedOptionIds: [], quantity: 0, note: '' },
      { productId: '4856190', selectedOptionIds: [], quantity: Number.NaN, note: '' },
      {
        key: 'chave-errada',
        productId: '4856190',
        selectedOptionIds: [],
        quantity: 1000,
        note: '  ok  ',
      },
    ]

    const sanitized = sanitizeLines(raw, menu)
    expect(sanitized).toHaveLength(1)
    expect(sanitized[0]).toEqual({
      key: '4856190||ok',
      productId: '4856190',
      selectedOptionIds: [],
      quantity: 99,
      note: 'ok',
    })
  })

  it('loadCart e saveCart funcionam com storage em memória e não lançam em JSON inválido ou undefined', () => {
    const store = new Map<string, string>()
    const mockStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v)
      },
    }

    const lines: CartLine[] = [
      {
        key: '4856190||',
        productId: '4856190',
        selectedOptionIds: [],
        quantity: 3,
        note: '',
      },
    ]

    saveCart(lines, mockStorage)
    expect(store.get(CART_STORAGE_KEY)).toBeDefined()
    expect(loadCart(menu, mockStorage)).toEqual(lines)

    // JSON inválido
    store.set(CART_STORAGE_KEY, '{json-quebrado')
    expect(loadCart(menu, mockStorage)).toEqual([])

    // Storage undefined
    expect(() => saveCart(lines, undefined)).not.toThrow()
    expect(loadCart(menu, undefined)).toEqual([])
  })
})
