import { describe, expect, it } from 'vitest'
import { displayName, formatBRL } from './format'

describe('formatBRL', () => {
  it('formata valores em centavos para Real brasileiro com espaço normal', () => {
    expect(formatBRL(4500)).toBe('R$ 45,00')
    expect(formatBRL(150)).toBe('R$ 1,50')
    expect(formatBRL(0)).toBe('R$ 0,00')
    expect(formatBRL(12800)).toBe('R$ 128,00')
  })
})

describe('displayName', () => {
  it('converte CAIXA ALTA para Title Case pt-BR respeitando preposições e conectivos', () => {
    expect(displayName('CAMARÃO A MODA DA CASA')).toBe('Camarão a Moda da Casa')
    expect(displayName('FRANGO COM CATUPIRY')).toBe('Frango com Catupiry')
    expect(displayName('ROMEU E JULIETA')).toBe('Romeu e Julieta')
  })

  it('preserva frações no início e capitaliza a palavra seguinte', () => {
    expect(displayName('1/2 MUÇARELA')).toBe('1/2 Muçarela')
    expect(displayName('1/2 CAMARÃO A MODA DA CASA')).toBe('1/2 Camarão a Moda da Casa')
  })

  it('capitaliza palavras hifenizadas e mantém unidades L e ml', () => {
    expect(displayName('COCA-COLA 1 L')).toBe('Coca-Cola 1 L')
    expect(displayName('COCA-COLA ZERO 1 L')).toBe('Coca-Cola Zero 1 L')
    expect(displayName('Água com gás 500 ml')).toBe('Água com Gás 500 ml')
    expect(displayName('Água 1L')).toBe('Água 1L')
  })

  it('mantém nomes que já estão em Title Case', () => {
    expect(displayName('Nordestina')).toBe('Nordestina')
    expect(displayName('1/2 Três queijos')).toBe('1/2 Três Queijos')
  })
})
