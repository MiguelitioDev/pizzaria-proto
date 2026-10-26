import type { Cents } from '../types'

/**
 * Central business configuration. Every value here is either VERIFIED from the
 * original Yooga menu (see SOURCE_AUDIT.md) or an explicit empty placeholder.
 * Never fill a placeholder with a guess.
 */
export const business = {
  name: 'Pizzaria Vó Agripina',
  shortName: 'Vó Agripina',
  description: 'Pizza com massa artesanal super leve, sabores variados e super deliciosa.',
  logo: '/images/logo.jpeg',

  /** Verified from source (store address). */
  address: {
    street: 'Rua Dragão do Mar (Broadway)',
    number: 's/n',
    neighborhood: 'Canoa Quebrada',
    city: 'Aracati',
    state: 'CE',
  },

  /**
   * WhatsApp number in international digits only, e.g. "5588999999999".
   * NOT available in the source. Set VITE_WHATSAPP_NUMBER in .env or fill here.
   * While empty, checkout cannot open WhatsApp and offers "copy order" instead.
   */
  whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? '',

  /**
   * Opening hours: the source has NO hours configured (all days empty; the
   * store only shows "Aberto para agendamento"). null = do not display or
   * claim open/closed. Shape when known: one entry per weekday (0 = Sunday).
   */
  hours: null as null | { day: number; label: string; opens: string; closes: string }[],

  fulfillment: {
    /** Source: user_withdraw = 1. */
    pickup: true,
    /** Source offers delivery with a flat fee inside a circular radius. */
    delivery: true,
  },

  delivery: {
    /** Source: flat fee R$ 6,00 inside a 1000 m radius of the store. */
    fee: 600 as Cents,
    radiusMeters: 1000,
    /** Source: minimum_order = 0 and free_delivery_value = 0. */
    minimumOrder: 0 as Cents,
  },

  /**
   * Payment methods are NOT in the source. Empty = the checkout shows no
   * payment step and the WhatsApp message says payment is arranged in the chat.
   * Example once confirmed: ['Pix', 'Dinheiro', 'Cartão na entrega']
   */
  paymentMethods: [] as string[],
} as const
