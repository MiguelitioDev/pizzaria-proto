import { business } from '../config/business'
import { useCart } from '../state/CartContext'
import { Bag } from './icons'
import { LogoMark } from './LogoMark'

export interface RestaurantHeaderProps {
  onOpenCart: () => void
}

export function RestaurantHeader({ onOpenCart }: RestaurantHeaderProps) {
  const { count } = useCart()
  const itemLabel = count === 1 ? '1 item' : `${count} itens`

  return (
    <header className="sticky top-0 z-30 h-[60px] bg-paper border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-3">
        <a
          href="#"
          className="flex items-center gap-3 min-w-0 rounded-xl py-1 pr-2 transition-opacity duration-150 hover:opacity-90"
        >
          <LogoMark size={40} className="ring-1 ring-line" />
          <div className="min-w-0">
            <span className="block font-display font-semibold text-base sm:text-lg leading-tight text-ink truncate">
              {business.shortName}
            </span>
            <span className="block text-xs text-muted leading-tight truncate">
              Pizzaria · {business.address.neighborhood}
            </span>
          </div>
        </a>

        <div className="flex items-center">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Abrir sacola, ${itemLabel}`}
            className="relative inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-cream border border-line text-ink font-medium text-sm transition-transform duration-150 active:scale-95 hover:border-crust cursor-pointer"
          >
            <Bag className="w-5 h-5 text-ink" />
            <span className="hidden sm:inline">Sacola</span>
            <span
              aria-live="polite"
              className={`${count === 0 ? 'hidden' : 'inline-flex'} items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-brand text-white text-xs font-semibold leading-none`}
            >
              {count}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
