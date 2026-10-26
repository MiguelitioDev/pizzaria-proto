import { describe, expect, it } from 'vitest'
import { menu } from '../data/menu'
import { filterProducts, normalizeText } from './search'

describe('normalizeText', () => {
  it('remove acentos, converte para minúsculas e colapsa espaços', () => {
    expect(normalizeText('  CAMARÃO   À  Moda  ')).toBe('camarao a moda')
    expect(normalizeText('Muçarela & Brócolis')).toBe('mucarela & brocolis')
  })
})

describe('filterProducts', () => {
  it('encontra Dois Queijos, Três Queijos e Quatro Queijos ao buscar por "queijo"', () => {
    const results = filterProducts(menu.products, 'queijo', null)
    const names = results.map((p) => p.name)
    expect(names).toContain('DOIS QUEIJOS')
    expect(names).toContain('TRÊS QUEIJOS')
    expect(names).toContain('QUATRO QUEIJOS')
  })

  it('encontra produtos pela descrição ao buscar por "calabresa"', () => {
    const results = filterProducts(menu.products, 'calabresa', null)
    const ids = results.map((p) => p.id)
    // TOSCANA (4856195) e MODA DO PIZZAOLO (4856196) têm calabresa na descrição
    expect(ids).toContain('4856191') // CALABRESA
    expect(ids).toContain('4856195') // TOSCANA
    expect(ids).toContain('4856196') // MODA DO PIZZAOLO
  })

  it('encontra "CAMARÃO ESPECIAL" ao buscar sem acento por "camarao"', () => {
    const results = filterProducts(menu.products, 'camarao', null)
    const names = results.map((p) => p.name)
    expect(names).toContain('CAMARÃO ESPECIAL')
    expect(names).toContain('CAMARÃO A MODA DA CASA')
  })

  it('combina filtro de categoria e busca textual', () => {
    const sweetBanana = filterProducts(menu.products, 'banana', 'pizza-doce')
    expect(sweetBanana.length).toBe(2)
    expect(sweetBanana.every((p) => p.categoryId === 'pizza-doce')).toBe(true)

    const drinksWithBanana = filterProducts(menu.products, 'banana', 'refrigerantes')
    expect(drinksWithBanana).toEqual([])
  })

  it('retorna lista vazia quando a busca não tem resultados', () => {
    expect(filterProducts(menu.products, 'sushi sashimi', null)).toEqual([])
  })
})
