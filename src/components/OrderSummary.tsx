import { business } from '../config/business'
import { menu } from '../data/menu'
import { formatBRL } from '../lib/format'
import { orderTotals } from '../lib/pricing'
import type { CartLine, FulfillmentMethod } from '../types'

export interface OrderSummaryProps {
  lines: CartLine[]
  method: FulfillmentMethod
}

function formatRadius(meters: number): string {
  if (meters >= 1000 && meters % 1000 === 0) {
    return `${meters / 1000} km`
  }
  if (meters >= 1000) {
    return `${(meters / 1000).toLocaleString('pt-BR')} km`
  }
  return `${meters} m`
}

export function OrderSummary({ lines, method }: OrderSummaryProps) {
  const { subtotal, deliveryFee, total } = orderTotals(menu, lines, method)
  const feeText =
    business.delivery.fee === 0 ? 'Grátis' : formatBRL(deliveryFee)
  const radiusLabel = formatRadius(business.delivery.radiusMeters)

  return (
    <div className="rounded-2xl bg-cream border border-line p-4 space-y-2.5">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>Subtotal</span>
        <span className="font-medium text-ink tabular-nums">
          {formatBRL(subtotal)}
        </span>
      </div>

      {method === 'delivery' && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>Taxa de entrega</span>
          <span className="font-medium text-ink tabular-nums">{feeText}</span>
        </div>
      )}

      <div className="flex items-baseline justify-between pt-2 border-t border-line">
        <span className="font-display font-semibold text-base text-ink">
          Total
        </span>
        <span className="font-display font-bold text-lg text-ink tabular-nums">
          {formatBRL(total)}
        </span>
      </div>

      {method === 'delivery' && (
        <p className="pt-1 text-xs text-muted leading-relaxed">
          Taxa de {formatBRL(business.delivery.fee)} para entregas até{' '}
          {radiusLabel} do restaurante. Se o endereço estiver fora dessa área, o
          restaurante combina com você pelo WhatsApp.
        </p>
      )}
    </div>
  )
}
