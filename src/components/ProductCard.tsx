import { displayName, formatBRL } from '../lib/format'
import { startingPrice } from '../lib/pricing'
import { useCart } from '../state/CartContext'
import type { Product } from '../types'
import { Plus } from './icons'
import { ProductImage } from './ProductImage'

export interface ProductCardProps {
  product: Product
  onOpen: (productId: string) => void
  onAdded?: (product: Product) => void
}

export function ProductCard({ product, onOpen, onAdded }: ProductCardProps) {
  const { addItem } = useCart()
  const name = displayName(product.name)
  const description = product.description.trim()
  const hasOptions = product.optionGroups.length > 0
  const hasRequiredGroup = product.optionGroups.some((g) => g.min > 0)
  const priceToDisplay = hasRequiredGroup
    ? startingPrice(product)
    : product.basePrice

  const handleQuickAction = () => {
    if (hasOptions) {
      onOpen(product.id)
    } else {
      addItem(product.id, [], 1)
      onAdded?.(product)
    }
  }

  return (
    <article className="group relative flex items-stretch justify-between gap-3 p-3.5 bg-paper border border-line rounded-[14px] transition-colors duration-150 hover:border-crust">
      {/* Botão principal cobrindo todo o card */}
      <button
        type="button"
        onClick={() => onOpen(product.id)}
        aria-label={`Ver ${name}`}
        className="absolute inset-0 z-10 rounded-[14px] cursor-pointer text-left"
      />

      {/* Coluna de texto */}
      <div className="relative flex flex-col justify-between min-w-0 flex-1 py-0.5 pointer-events-none">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-display font-semibold text-base sm:text-lg text-ink leading-snug">
              {name}
            </h3>
            {hasOptions && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-crust-soft text-forest text-[11px] font-semibold tracking-wide">
                Personalizável
              </span>
            )}
          </div>

          {description.length > 0 && (
            <p className="mt-1 text-xs sm:text-sm text-muted line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          {hasRequiredGroup && (
            <span className="text-xs text-muted font-normal">a partir de</span>
          )}
          <span className="text-base font-semibold text-ink">
            {formatBRL(priceToDisplay)}
          </span>
        </div>
      </div>

      {/* Coluna da imagem + botão de ação rápida irmão do botão principal */}
      <div className="relative shrink-0 w-[104px] h-[104px] sm:w-[120px] sm:h-[120px]">
        <ProductImage
          product={product}
          className="w-full h-full rounded-xl border border-line/70 pointer-events-none"
        />

        <button
          type="button"
          onClick={handleQuickAction}
          aria-label={hasOptions ? `Personalizar ${name}` : `Adicionar ${name}`}
          className="absolute -bottom-1.5 -right-1.5 z-20 inline-flex items-center justify-center w-11 h-11 rounded-full bg-brand hover:bg-brand-dark text-white shadow-sm transition-transform duration-150 active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </article>
  )
}
