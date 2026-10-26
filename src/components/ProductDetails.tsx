import { useState } from 'react'
import { menu } from '../data/menu'
import { MAX_NOTE_LENGTH } from '../lib/cart'
import { displayName, formatBRL } from '../lib/format'
import {
  findProduct,
  startingPrice,
  unitPrice,
  validateSelection,
} from '../lib/pricing'
import { useCart } from '../state/CartContext'
import type { OptionGroup, Product } from '../types'
import { Check, Close } from './icons'
import { Modal } from './Modal'
import { ProductImage } from './ProductImage'
import { QuantityStepper } from './QuantityStepper'

export interface ProductDetailsProps {
  productId: string | null
  onClose: () => void
  onAdded: (product: Product) => void
}

export function ProductDetails({
  productId,
  onClose,
  onAdded,
}: ProductDetailsProps) {
  const { addItem } = useCart()
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')

  const product = productId ? findProduct(menu, productId) : undefined
  const open = Boolean(product)
  const titleId = 'product-details-title'

  if (!product) {
    return (
      <Modal
        open={false}
        onClose={onClose}
        labelledBy={titleId}
        variant="sheet"
      >
        <div />
      </Modal>
    )
  }

  const name = displayName(product.name)
  const description = product.description.trim()
  const hasRequiredGroup = product.optionGroups.some((g) => g.min > 0)
  const baseOrStartingPrice = hasRequiredGroup
    ? startingPrice(product)
    : product.basePrice

  const validation = validateSelection(product, selectedOptionIds)
  const currentUnitPrice = unitPrice(product, selectedOptionIds)
  const totalPrice = currentUnitPrice * quantity

  const selectedSet = new Set(selectedOptionIds)

  const handleToggleOption = (group: OptionGroup, optionId: string) => {
    const groupOptionIds = new Set(group.options.map((o) => o.id))
    const currentGroupSelected = selectedOptionIds.filter((id) =>
      groupOptionIds.has(id),
    )
    const isSelected = selectedSet.has(optionId)

    if (group.max === 1) {
      if (isSelected) {
        if (group.min === 0) {
          setSelectedOptionIds(
            selectedOptionIds.filter((id) => !groupOptionIds.has(id)),
          )
        }
      } else {
        const others = selectedOptionIds.filter((id) => !groupOptionIds.has(id))
        setSelectedOptionIds([...others, optionId])
      }
      return
    }

    if (isSelected) {
      setSelectedOptionIds(selectedOptionIds.filter((id) => id !== optionId))
    } else if (currentGroupSelected.length < group.max) {
      setSelectedOptionIds([...selectedOptionIds, optionId])
    }
  }

  let firstErrorHelper: string | null = null
  if (!validation.valid) {
    for (const group of product.optionGroups) {
      const groupErr = validation.errors[group.id]
      if (groupErr) {
        const cleanGroupName = group.name.trim()
        firstErrorHelper = `${cleanGroupName}: ${groupErr.toLocaleLowerCase('pt-BR')} para continuar`
        break
      }
    }
    if (!firstErrorHelper && validation.errors._) {
      firstErrorHelper = validation.errors._
    }
  }

  const handleAdd = () => {
    if (!validation.valid) return
    addItem(product.id, selectedOptionIds, quantity, note)
    onAdded(product)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} variant="sheet">
      {/* Cabeçalho fixo */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-paper border-b border-line shrink-0">
        <h2
          id={titleId}
          className="font-display font-bold text-lg sm:text-xl text-ink truncate"
        >
          {name}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes do produto"
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-cream border border-line text-ink hover:border-crust transition-colors duration-150 shrink-0 cursor-pointer"
        >
          <Close className="w-5 h-5" />
        </button>
      </div>

      {/* Corpo rolável */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
          <div className="w-full max-w-[240px] max-h-[240px] sm:w-44 sm:h-44 shrink-0 mx-auto sm:mx-0">
            <ProductImage
              product={product}
              className="w-full h-full max-h-[240px] rounded-2xl border border-line"
            />
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <p className="font-display font-semibold text-xl text-ink">
              {name}
            </p>
            {description.length > 0 && (
              <p className="mt-1.5 text-sm text-muted leading-relaxed">
                {description}
              </p>
            )}
            <div className="mt-3 inline-flex items-baseline gap-1.5 px-3 py-1 rounded-lg bg-crust-soft/60 border border-line">
              {hasRequiredGroup && (
                <span className="text-xs text-muted">a partir de</span>
              )}
              <span className="text-base font-semibold text-ink">
                {formatBRL(baseOrStartingPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Grupos de opções */}
        {product.optionGroups.map((group) => {
          const groupOptionIds = new Set(group.options.map((o) => o.id))
          const selectedCount = selectedOptionIds.filter((id) =>
            groupOptionIds.has(id),
          ).length
          const isSingle = group.max === 1
          const isRequired = group.min > 0
          const hint =
            group.min === group.max
              ? `Escolha ${group.max}`
              : `Escolha até ${group.max}`

          return (
            <fieldset
              key={group.id}
              className="border border-line rounded-2xl bg-cream/50 p-3.5 sm:p-4 space-y-3"
            >
              <legend className="sr-only">{group.name}</legend>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-line">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-semibold text-base text-ink">
                      {group.name}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        isRequired
                          ? 'bg-brand text-white'
                          : 'bg-crust-soft text-muted'
                      }`}
                    >
                      {isRequired ? 'Obrigatório' : 'Opcional'}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{hint}</p>
                </div>

                <span
                  aria-live="polite"
                  className="text-xs font-semibold px-2.5 py-1 rounded-full bg-paper border border-line text-ink tabular-nums"
                >
                  {selectedCount}/{group.max}
                </span>
              </div>

              <div className="space-y-2">
                {group.options.map((option) => {
                  const isChecked = selectedSet.has(option.id)
                  const isDisabled =
                    !isSingle && !isChecked && selectedCount >= group.max
                  const optName = displayName(option.name)

                  return (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between gap-3 min-h-[48px] px-3.5 py-2.5 rounded-xl border transition-colors duration-150 ${
                        isChecked
                          ? 'bg-paper border-brand ring-1 ring-brand'
                          : 'bg-paper border-line hover:border-crust'
                      } ${
                        isDisabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type={isSingle ? 'radio' : 'checkbox'}
                          name={`group-${group.id}`}
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => {
                            if (!isSingle || !isChecked) {
                              handleToggleOption(group, option.id)
                            }
                          }}
                          onClick={() => {
                            if (isSingle && isChecked && group.min === 0) {
                              handleToggleOption(group, option.id)
                            }
                          }}
                          className="sr-only peer"
                        />
                        <span
                          aria-hidden="true"
                          className={`w-5 h-5 shrink-0 flex items-center justify-center border transition-colors peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-forest peer-focus-visible:outline-offset-2 ${
                            isSingle ? 'rounded-full' : 'rounded-md'
                          } ${
                            isChecked
                              ? 'bg-brand border-brand text-white'
                              : 'bg-cream border-muted/50'
                          }`}
                        >
                          {isChecked &&
                            (isSingle ? (
                              <span className="w-2 h-2 rounded-full bg-white" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            ))}
                        </span>
                        <span className="text-sm font-medium text-ink leading-snug">
                          {optName}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-ink shrink-0 tabular-nums">
                        + {formatBRL(option.price)}
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          )
        })}

        {/* Campo de observações */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="product-note"
              className="text-sm font-semibold text-ink"
            >
              Observações
            </label>
            <span className="text-xs text-muted tabular-nums">
              {note.length}/{MAX_NOTE_LENGTH}
            </span>
          </div>
          <textarea
            id="product-note"
            rows={2}
            maxLength={MAX_NOTE_LENGTH}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: sem cebola"
            className="w-full rounded-xl bg-cream border border-line px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-forest resize-none"
          />
        </div>
      </div>

      {/* Rodapé fixo */}
      <div className="px-4 sm:px-6 py-3.5 bg-paper border-t border-line shrink-0 space-y-2">
        {firstErrorHelper && (
          <p
            role="status"
            aria-live="polite"
            className="text-xs font-medium text-brand text-center sm:text-left"
          >
            {firstErrorHelper}
          </p>
        )}

        <div className="flex items-center gap-3">
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            label={`Quantidade de ${name}`}
          />

          <button
            type="button"
            disabled={!validation.valid}
            aria-disabled={!validation.valid}
            onClick={handleAdd}
            className="flex-1 inline-flex items-center justify-between gap-2 min-h-[48px] px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark disabled:bg-line disabled:text-muted text-white font-semibold text-sm sm:text-base transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Adicionar</span>
            <span className="tabular-nums">{formatBRL(totalPrice)}</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}
