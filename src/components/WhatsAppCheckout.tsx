import { useEffect, useRef, useState } from 'react'
import { business } from '../config/business'
import { menu } from '../data/menu'
import { buildOrderMessage, buildWhatsAppUrl } from '../lib/whatsapp'
import { useCart } from '../state/CartContext'
import type { CartLine, CustomerDetails, FulfillmentMethod } from '../types'
import { Check, Copy, WhatsApp } from './icons'

export interface WhatsAppCheckoutProps {
  lines: CartLine[]
  method: FulfillmentMethod
  customer: CustomerDetails
  paymentMethod?: string
  onValidate: () => boolean
  disabled?: boolean
  onClearAndReturn?: () => void
}

export function WhatsAppCheckout({
  lines,
  method,
  customer,
  paymentMethod,
  onValidate,
  disabled = false,
  onClearAndReturn,
}: WhatsAppCheckoutProps) {
  const { clear } = useCart()
  const [openedWhatsApp, setOpenedWhatsApp] = useState(false)
  const [copiedFeedback, setCopiedFeedback] = useState(false)
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null)
  const fallbackTextareaRef = useRef<HTMLTextAreaElement>(null)

  const isEmpty = lines.length === 0
  const isButtonDisabled = isEmpty || disabled

  const message = buildOrderMessage({
    menu,
    lines,
    method,
    customer,
    paymentMethod,
  })
  const url = buildWhatsAppUrl(business.whatsappNumber, message)

  useEffect(() => {
    if (!copiedFeedback) return
    const timer = window.setTimeout(() => {
      setCopiedFeedback(false)
    }, 2500)
    return () => {
      window.clearTimeout(timer)
    }
  }, [copiedFeedback])

  useEffect(() => {
    if (fallbackMessage && fallbackTextareaRef.current) {
      fallbackTextareaRef.current.focus()
      fallbackTextareaRef.current.select()
    }
  }, [fallbackMessage])

  const handleSendWhatsApp = () => {
    if (isButtonDisabled) return
    if (!onValidate()) return
    if (!url) return

    window.open(url, '_blank', 'noopener,noreferrer')
    setOpenedWhatsApp(true)
  }

  const handleCopyOrder = async () => {
    if (isButtonDisabled) return
    if (!onValidate()) return

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message)
        setCopiedFeedback(true)
        setFallbackMessage(null)
      } else {
        setFallbackMessage(message)
      }
    } catch {
      setFallbackMessage(message)
    }
  }

  const handleClearAndBack = () => {
    clear()
    setOpenedWhatsApp(false)
    setFallbackMessage(null)
    onClearAndReturn?.()
  }

  return (
    <div className="space-y-3">
      {url !== null ? (
        <>
          <button
            type="button"
            disabled={isButtonDisabled}
            aria-disabled={isButtonDisabled}
            onClick={handleSendWhatsApp}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-forest hover:opacity-95 disabled:bg-line disabled:text-muted text-cream font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2.5 transition-opacity duration-150 cursor-pointer disabled:cursor-not-allowed"
          >
            <WhatsApp className="w-5 h-5" />
            <span>Enviar pedido pelo WhatsApp</span>
          </button>

          <button
            type="button"
            disabled={isButtonDisabled}
            aria-disabled={isButtonDisabled}
            onClick={handleCopyOrder}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-cream border border-line hover:border-crust disabled:opacity-50 text-ink font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
          >
            {copiedFeedback ? (
              <>
                <Check className="w-4 h-4 text-forest" />
                <span>Pedido copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-muted" />
                <span>Copiar pedido</span>
              </>
            )}
          </button>

          {openedWhatsApp && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-2xl bg-crust-soft/80 border border-crust p-4 space-y-3 text-sm text-ink"
            >
              <p className="leading-relaxed">
                Abrimos o WhatsApp com o seu pedido. Ele só é confirmado quando
                o restaurante responder. Se nada abriu, use “Copiar pedido”.
              </p>
              <button
                type="button"
                onClick={handleClearAndBack}
                className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-paper border border-line hover:border-crust text-ink font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Limpar sacola e voltar ao cardápio
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div
            role="alert"
            className="rounded-2xl bg-crust-soft border border-crust/80 p-3.5 text-xs sm:text-sm text-ink leading-relaxed"
          >
            O número de WhatsApp do restaurante ainda não foi configurado. Você
            pode copiar o pedido e enviá-lo manualmente.
          </div>

          <button
            type="button"
            disabled={isButtonDisabled}
            aria-disabled={isButtonDisabled}
            onClick={handleCopyOrder}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-brand hover:bg-brand-dark disabled:bg-line disabled:text-muted text-white font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2.5 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
          >
            {copiedFeedback ? (
              <>
                <Check className="w-5 h-5" />
                <span>Pedido copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copiar pedido</span>
              </>
            )}
          </button>
        </>
      )}

      <div className="sr-only" aria-live="polite" role="status">
        {copiedFeedback ? 'Pedido copiado' : ''}
      </div>

      {fallbackMessage !== null && (
        <div className="space-y-1.5 pt-2">
          <label
            htmlFor="whatsapp-fallback-textarea"
            className="block text-xs font-semibold text-ink"
          >
            Copie o texto do pedido abaixo:
          </label>
          <textarea
            id="whatsapp-fallback-textarea"
            ref={fallbackTextareaRef}
            readOnly
            rows={6}
            value={fallbackMessage}
            onClick={(e) => e.currentTarget.select()}
            className="w-full rounded-xl bg-cream border border-line p-3 text-xs text-ink font-mono resize-y"
          />
        </div>
      )}
    </div>
  )
}
