import { describe, expect, it } from 'vitest'
import { menu } from '../data/menu'
import type { CartLine, CustomerDetails } from '../types'
import { buildOrderMessage, buildWhatsAppUrl, normalizeWhatsAppNumber } from './whatsapp'

describe('whatsapp', () => {
  const sampleLines: CartLine[] = [
    {
      key: '4856191|4856191-22876971|sem cebola',
      productId: '4856191', // CALABRESA (4500)
      selectedOptionIds: ['4856191-22876971'], // 1/2 PORTUGUESA (+1900) => 6400 * 2 = 12800
      quantity: 2,
      note: 'sem cebola',
    },
    {
      key: '4856204||',
      productId: '4856204', // COCA-COLA 1 L (1200)
      selectedOptionIds: [],
      quantity: 1,
      note: '',
    },
  ]

  const sampleCustomer: CustomerDetails = {
    name: 'Maria',
    phone: '(88) 99999-9999',
    street: 'Rua X',
    number: '123',
    neighborhood: 'Bairro',
    complement: 'Casa B',
  }

  it('gera mensagem de delivery com Taxa de entrega, Endereço, nota Obs: e total correto', () => {
    const msg = buildOrderMessage({
      menu,
      lines: sampleLines,
      method: 'delivery',
      customer: sampleCustomer,
      paymentMethod: 'Pix',
    })

    expect(msg).toContain('*Novo pedido — Pizzaria Vó Agripina*')
    expect(msg).toContain('2x Calabresa (1/2 Portuguesa) — R$ 128,00')
    expect(msg).toContain('   Obs: sem cebola')
    expect(msg).toContain('1x Coca-Cola 1 L — R$ 12,00')
    expect(msg).toContain('Subtotal: R$ 140,00')
    expect(msg).toContain('Taxa de entrega: R$ 6,00')
    expect(msg).toContain('*Total: R$ 146,00*')
    expect(msg).toContain('*Entrega*')
    expect(msg).toContain('Endereço: Rua X, 123 — Bairro (Complemento: Casa B)')
    expect(msg).toContain('Pagamento: Pix')
  })

  it('gera mensagem de retirada sem Taxa de entrega, sem Endereço e com pagamento a combinar quando ausente', () => {
    const msg = buildOrderMessage({
      menu,
      lines: sampleLines,
      method: 'pickup',
      customer: sampleCustomer,
    })

    expect(msg).toContain('*Retirada no local*')
    expect(msg).not.toContain('Taxa de entrega:')
    expect(msg).not.toContain('Endereço:')
    expect(msg).toContain('*Total: R$ 140,00*')
    expect(msg).toContain('Pagamento: a combinar pelo WhatsApp')
  })

  it('inclui a descrição entre parênteses para produtos com nome BORDA', () => {
    const msg = buildOrderMessage({
      menu,
      lines: [
        {
          key: '5274043||',
          productId: '5274043', // BORDA - CHEDA
          selectedOptionIds: [],
          quantity: 1,
          note: '',
        },
      ],
      method: 'pickup',
      customer: sampleCustomer,
    })

    expect(msg).toContain('1x Borda (Cheda) — R$ 12,00')
  })

  it('normaliza número e constrói URL do WhatsApp ou retorna null se vazio/inválido', () => {
    expect(normalizeWhatsAppNumber('')).toBeNull()
    expect(normalizeWhatsAppNumber('123')).toBeNull()
    expect(normalizeWhatsAppNumber('(88) 99999-9999')).toBe('5588999999999')
    expect(normalizeWhatsAppNumber('5588999999999')).toBe('5588999999999')

    expect(buildWhatsAppUrl('', 'Oi')).toBeNull()

    const message = 'Pedido *Vó Agripina* — R$ 45,00'
    const url = buildWhatsAppUrl('(88) 99999-9999', message)
    expect(url).not.toBeNull()
    expect(url!.startsWith('https://wa.me/5588999999999?text=')).toBe(true)

    const encodedPart = url!.split('?text=')[1]
    expect(decodeURIComponent(encodedPart)).toBe(message)
  })
})
