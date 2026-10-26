import { menu } from '../data/menu'
import { displayName, formatBRL } from '../lib/format'
import { describeSelection, findProduct, lineTotal } from '../lib/pricing'
import { useCart } from '../state/CartContext'
import type { CartLine } from '../types'
import { ProductImage } from './ProductImage'
import { QuantityStepper } from './QuantityStepper'

export interface CartItemProps {
  line: CartLine
}

export function CartItem({ line }: CartItemProps) {
  const { setQuantity, removeItem } = useCart()
  const product = findProduct(menu, line.productId)

  if (!product) {
    return null
  }

  const baseName = displayName(product.name)
  const trimmedDesc = product.description.trim()
  const isBordaWithDesc =
    product.name.trim().toUpperCase() === 'BORDA' &&
    trimmedDesc.length > 0 &&
    trimmedDesc.length <= 20
  const title = isBordaWithDesc
    ? `${baseName} (${displayName(trimmedDesc)})`
    : baseName

  const optionLabels = describeSelection(product, line.selectedOptionIds).map(
    displayName,
  )
  const total = lineTotal(menu, line)
  const note = line.note.trim()

  return (
    <div className="flex items-start gap-3 p-3.5 bg-cream/60 border border-line rounded-2xl">
      <div className="w-14 h-14 shrink-0">
        <ProductImage
          product={product}
          className="w-14 h-14 rounded-xl border border-line"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-base text-ink leading-snug">
            {title}
          </h3>
          <span className="text-sm font-semibold text-ink shrink-0 tabular-nums">
            {formatBRL(total)}
          </span>
        </div>

        {optionLabels.length > 0 && (
          <p className="mt-1 text-xs text-muted leading-relaxed">
            {optionLabels.join(', ')}
          </p>
        )}

        {note.length > 0 && (
          <p className="mt-1 text-xs italic text-muted leading-relaxed">
            Obs: {note}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <QuantityStepper
            value={line.quantity}
            onChange={(qty) => setQuantity(line.key, qty)}
            onRemoveAtMin={() => removeItem(line.key)}
            label={`Quantidade de ${title}`}
          />

          <button
            type="button"
            onClick={() => removeItem(line.key)}
            className="text-xs font-medium text-muted hover:text-brand underline underline-offset-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  )
}
