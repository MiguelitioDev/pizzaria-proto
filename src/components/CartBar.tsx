import { menu } from '../data/menu'
import { formatBRL } from '../lib/format'
import { orderTotals } from '../lib/pricing'
import { useCart } from '../state/CartContext'
import { Bag } from './icons'

export interface CartBarProps {
  onOpenCart: () => void
}

export function CartBar({ onOpenCart }: CartBarProps) {
  const { lines, count } = useCart()

  if (count <= 0) {
    return null
  }

  const { subtotal } = orderTotals(menu, lines, 'pickup')
  const countLabel = count === 1 ? '1 item' : `${count} itens`

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 md:hidden bg-paper/95 border-t border-line px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]"
      role="region"
      aria-label="Resumo rápido da sacola"
    >
      <button
        type="button"
        onClick={onOpenCart}
        className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm flex items-center justify-between gap-3 shadow-sm transition-transform duration-150 active:scale-[0.99] cursor-pointer"
      >
        <span className="inline-flex items-center gap-2">
          <Bag className="w-5 h-5" />
          <span>Ver sacola · {countLabel}</span>
        </span>
        <span className="text-base font-bold tabular-nums">
          {formatBRL(subtotal)}
        </span>
      </button>
    </div>
  )
}
