import { useState } from 'react'
import { useCart } from '../state/CartContext'
import { CartItem } from './CartItem'
import { CheckoutForm } from './CheckoutForm'
import { ChevronLeft, ChevronRight, Close, Trash } from './icons'
import { LogoMark } from './LogoMark'
import { Modal } from './Modal'
import { OrderSummary } from './OrderSummary'

export interface ShoppingCartProps {
  open: boolean
  onClose: () => void
}

export function ShoppingCart({ open, onClose }: ShoppingCartProps) {
  const { lines, clear } = useCart()
  const [step, setStep] = useState<'cart' | 'checkout'>('cart')
  const [confirmClear, setConfirmClear] = useState(false)

  const isEmpty = lines.length === 0
  const titleId = 'shopping-cart-title'
  const headerTitle =
    step === 'checkout' && !isEmpty ? 'Finalizar pedido' : 'Sua sacola'

  const handleConfirmClear = () => {
    clear()
    setConfirmClear(false)
    setStep('cart')
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} variant="drawer">
      {/* Cabeçalho fixo */}
      <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3.5 bg-paper border-b border-line shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {step === 'checkout' && !isEmpty && (
            <button
              type="button"
              onClick={() => setStep('cart')}
              aria-label="Voltar para a sacola"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-cream border border-line text-ink hover:border-crust transition-colors shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h2
            id={titleId}
            className="font-display font-bold text-lg sm:text-xl text-ink truncate"
          >
            {headerTitle}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar sacola"
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-cream border border-line text-ink hover:border-crust transition-colors shrink-0 cursor-pointer"
        >
          <Close className="w-5 h-5" />
        </button>
      </div>

      {/* Conteúdo */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
          <div className="opacity-60 mb-4">
            <LogoMark size={64} decorative />
          </div>
          <p className="font-display font-semibold text-lg text-ink">
            Sua sacola está vazia
          </p>
          <p className="mt-1 text-sm text-muted max-w-xs">
            Escolha suas pizzas e bebidas no cardápio para montar seu pedido.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Ver cardápio
          </button>
        </div>
      ) : step === 'cart' ? (
        <>
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            <div className="space-y-3">
              {lines.map((line) => (
                <CartItem key={line.key} line={line} />
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end">
              {!confirmClear ? (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted hover:text-brand hover:bg-cream transition-colors cursor-pointer"
                >
                  <Trash className="w-4 h-4" />
                  <span>Esvaziar sacola</span>
                </button>
              ) : (
                <div
                  role="group"
                  aria-label="Confirmar esvaziar sacola"
                  className="flex flex-wrap items-center justify-end gap-2 px-3 py-2 rounded-xl bg-crust-soft/80 border border-crust text-xs"
                >
                  <span className="font-semibold text-ink">
                    Confirmar esvaziar?
                  </span>
                  <button
                    type="button"
                    onClick={handleConfirmClear}
                    className="px-3 py-1.5 rounded-lg bg-brand text-white font-semibold hover:bg-brand-dark transition-colors cursor-pointer"
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1.5 rounded-lg bg-paper border border-line text-ink font-medium hover:border-crust transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 bg-paper border-t border-line shrink-0 space-y-3">
            <OrderSummary lines={lines} method="pickup" />

            <button
              type="button"
              onClick={() => setStep('checkout')}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Continuar</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <CheckoutForm onSuccessClose={onClose} />
        </div>
      )}
    </Modal>
  )
}
