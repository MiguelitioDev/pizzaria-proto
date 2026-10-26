import { useEffect, useRef, useState } from 'react'
import { business } from '../config/business'
import { menu } from '../data/menu'
import { formatBRL } from '../lib/format'
import { orderTotals } from '../lib/pricing'
import { validateCustomer } from '../lib/validation'
import { useCart } from '../state/CartContext'
import type { CustomerDetails, FulfillmentMethod } from '../types'
import { MapPin } from './icons'
import { OrderSummary } from './OrderSummary'
import { WhatsAppCheckout } from './WhatsAppCheckout'

const CUSTOMER_STORAGE_KEY = 'voagripina:customer:v1'

const EMPTY_CUSTOMER: CustomerDetails = {
  name: '',
  phone: '',
  street: '',
  number: '',
  neighborhood: '',
  complement: '',
}

function loadCustomer(): CustomerDetails {
  if (typeof localStorage === 'undefined') return EMPTY_CUSTOMER
  try {
    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY)
    if (!raw) return EMPTY_CUSTOMER
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return EMPTY_CUSTOMER
    }
    const rec = parsed as Record<string, unknown>
    return {
      name: typeof rec.name === 'string' ? rec.name : '',
      phone: typeof rec.phone === 'string' ? rec.phone : '',
      street: typeof rec.street === 'string' ? rec.street : '',
      number: typeof rec.number === 'string' ? rec.number : '',
      neighborhood: typeof rec.neighborhood === 'string' ? rec.neighborhood : '',
      complement: typeof rec.complement === 'string' ? rec.complement : '',
    }
  } catch {
    return EMPTY_CUSTOMER
  }
}

function saveCustomer(customer: CustomerDetails): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer))
  } catch {
    // Ignore storage errors
  }
}

export interface CheckoutFormProps {
  onSuccessClose?: () => void
}

export function CheckoutForm({ onSuccessClose }: CheckoutFormProps) {
  const { lines } = useCart()

  const defaultMethod: FulfillmentMethod = business.fulfillment.delivery
    ? 'delivery'
    : 'pickup'

  const [method, setMethod] = useState<FulfillmentMethod>(defaultMethod)
  const [customer, setCustomer] = useState<CustomerDetails>(() => loadCustomer())
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerDetails | 'paymentMethod', string>>
  >({})
  const [submitted, setSubmitted] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const streetRef = useRef<HTMLInputElement>(null)
  const numberRef = useRef<HTMLInputElement>(null)
  const neighborhoodRef = useRef<HTMLInputElement>(null)
  const paymentRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    saveCustomer(customer)
  }, [customer])

  const computeErrors = (
    nextMethod: FulfillmentMethod,
    nextCustomer: CustomerDetails,
    nextPayment: string,
  ) => {
    const fieldErrors: Partial<
      Record<keyof CustomerDetails | 'paymentMethod', string>
    > = {
      ...validateCustomer(nextMethod, nextCustomer),
    }
    if (business.paymentMethods.length > 0 && !nextPayment.trim()) {
      fieldErrors.paymentMethod = 'Selecione uma forma de pagamento'
    }
    return fieldErrors
  }

  const updateCustomerField = (field: keyof CustomerDetails, value: string) => {
    const updated = { ...customer, [field]: value }
    setCustomer(updated)
    if (submitted) {
      setErrors(computeErrors(method, updated, paymentMethod))
    }
  }

  const handleMethodChange = (nextMethod: FulfillmentMethod) => {
    setMethod(nextMethod)
    if (submitted) {
      setErrors(computeErrors(nextMethod, customer, paymentMethod))
    }
  }

  const handlePaymentChange = (nextPayment: string) => {
    setPaymentMethod(nextPayment)
    if (submitted) {
      setErrors(computeErrors(method, customer, nextPayment))
    }
  }

  const { subtotal } = orderTotals(menu, lines, method)
  const minimumOrder = business.delivery.minimumOrder
  const belowMinimumOrder =
    method === 'delivery' && minimumOrder > 0 && subtotal < minimumOrder

  const handleValidate = (): boolean => {
    setSubmitted(true)
    const nextErrors = computeErrors(method, customer, paymentMethod)
    setErrors(nextErrors)

    if (nextErrors.name) {
      nameRef.current?.focus()
      return false
    }
    if (nextErrors.phone) {
      phoneRef.current?.focus()
      return false
    }
    if (method === 'delivery') {
      if (nextErrors.street) {
        streetRef.current?.focus()
        return false
      }
      if (nextErrors.number) {
        numberRef.current?.focus()
        return false
      }
      if (nextErrors.neighborhood) {
        neighborhoodRef.current?.focus()
        return false
      }
    }
    if (nextErrors.paymentMethod) {
      paymentRef.current?.focus()
      return false
    }
    if (belowMinimumOrder) {
      return false
    }

    return Object.keys(nextErrors).length === 0
  }

  const bothFulfillments =
    business.fulfillment.delivery && business.fulfillment.pickup
  const { street, number, neighborhood, city, state } = business.address
  const storeAddressText = `${street}, ${number} — ${neighborhood}, ${city}/${state}`

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
      }}
      noValidate
      className="space-y-6"
    >
      {/* Escolha de entrega ou retirada */}
      <div className="space-y-2">
        <span
          id="fulfillment-label"
          className="block font-display font-semibold text-base text-ink"
        >
          Como deseja receber?
        </span>

        {bothFulfillments ? (
          <div
            role="radiogroup"
            aria-labelledby="fulfillment-label"
            className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-cream border border-line"
          >
            <button
              type="button"
              role="radio"
              aria-checked={method === 'delivery'}
              onClick={() => handleMethodChange('delivery')}
              className={`min-h-[42px] px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                method === 'delivery'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-ink hover:bg-crust-soft/50'
              }`}
            >
              Entrega
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={method === 'pickup'}
              onClick={() => handleMethodChange('pickup')}
              className={`min-h-[42px] px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                method === 'pickup'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-ink hover:bg-crust-soft/50'
              }`}
            >
              Retirada no local
            </button>
          </div>
        ) : (
          <div className="px-3.5 py-2.5 rounded-xl bg-cream border border-line text-sm font-semibold text-ink">
            {method === 'delivery' ? 'Entrega' : 'Retirada no local'}
          </div>
        )}
      </div>

      {/* Dados do cliente */}
      <div className="space-y-4">
        <h3 className="font-display font-semibold text-base text-ink">
          Seus dados
        </h3>

        <div className="space-y-1.5">
          <label
            htmlFor="customer-name"
            className="block text-xs font-semibold text-ink"
          >
            Seu nome *
          </label>
          <input
            ref={nameRef}
            id="customer-name"
            type="text"
            autoComplete="name"
            value={customer.name}
            onChange={(e) => updateCustomerField('name', e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'error-customer-name' : undefined}
            placeholder="Ex.: Maria Silva"
            className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-cream border text-sm text-ink placeholder:text-muted/70 ${
              errors.name ? 'border-brand' : 'border-line'
            }`}
          />
          {errors.name && (
            <p
              id="error-customer-name"
              role="alert"
              className="text-xs font-medium text-brand"
            >
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="customer-phone"
            className="block text-xs font-semibold text-ink"
          >
            WhatsApp / Telefone (com DDD) *
          </label>
          <input
            ref={phoneRef}
            id="customer-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={customer.phone}
            onChange={(e) => updateCustomerField('phone', e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'error-customer-phone' : undefined}
            placeholder="Ex.: (88) 99999-9999"
            className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-cream border text-sm text-ink placeholder:text-muted/70 ${
              errors.phone ? 'border-brand' : 'border-line'
            }`}
          />
          {errors.phone && (
            <p
              id="error-customer-phone"
              role="alert"
              className="text-xs font-medium text-brand"
            >
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      {/* Endereço de entrega ou informação de retirada */}
      {method === 'delivery' ? (
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-base text-ink">
            Endereço de entrega
          </h3>

          <div className="space-y-1.5">
            <label
              htmlFor="customer-street"
              className="block text-xs font-semibold text-ink"
            >
              Rua / Logradouro *
            </label>
            <input
              ref={streetRef}
              id="customer-street"
              type="text"
              autoComplete="address-line1"
              value={customer.street}
              onChange={(e) => updateCustomerField('street', e.target.value)}
              aria-invalid={Boolean(errors.street)}
              aria-describedby={
                errors.street ? 'error-customer-street' : undefined
              }
              placeholder="Ex.: Rua Dragão do Mar"
              className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-cream border text-sm text-ink placeholder:text-muted/70 ${
                errors.street ? 'border-brand' : 'border-line'
              }`}
            />
            {errors.street && (
              <p
                id="error-customer-street"
                role="alert"
                className="text-xs font-medium text-brand"
              >
                {errors.street}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="customer-number"
                className="block text-xs font-semibold text-ink"
              >
                Número *
              </label>
              <input
                ref={numberRef}
                id="customer-number"
                type="text"
                autoComplete="address-line2"
                value={customer.number}
                onChange={(e) => updateCustomerField('number', e.target.value)}
                aria-invalid={Boolean(errors.number)}
                aria-describedby={
                  errors.number ? 'error-customer-number' : undefined
                }
                placeholder="Ex.: 120 ou s/n"
                className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-cream border text-sm text-ink placeholder:text-muted/70 ${
                  errors.number ? 'border-brand' : 'border-line'
                }`}
              />
              {errors.number && (
                <p
                  id="error-customer-number"
                  role="alert"
                  className="text-xs font-medium text-brand"
                >
                  {errors.number}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="customer-neighborhood"
                className="block text-xs font-semibold text-ink"
              >
                Bairro *
              </label>
              <input
                ref={neighborhoodRef}
                id="customer-neighborhood"
                type="text"
                autoComplete="address-level2"
                value={customer.neighborhood}
                onChange={(e) =>
                  updateCustomerField('neighborhood', e.target.value)
                }
                aria-invalid={Boolean(errors.neighborhood)}
                aria-describedby={
                  errors.neighborhood ? 'error-customer-neighborhood' : undefined
                }
                placeholder="Ex.: Canoa Quebrada"
                className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-cream border text-sm text-ink placeholder:text-muted/70 ${
                  errors.neighborhood ? 'border-brand' : 'border-line'
                }`}
              />
              {errors.neighborhood && (
                <p
                  id="error-customer-neighborhood"
                  role="alert"
                  className="text-xs font-medium text-brand"
                >
                  {errors.neighborhood}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="customer-complement"
              className="block text-xs font-semibold text-ink"
            >
              Complemento / Ponto de referência (opcional)
            </label>
            <input
              id="customer-complement"
              type="text"
              autoComplete="off"
              value={customer.complement}
              onChange={(e) =>
                updateCustomerField('complement', e.target.value)
              }
              placeholder="Ex.: Próximo à duna, pousada..."
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-cream border border-line text-sm text-ink placeholder:text-muted/70"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-crust-soft/60 border border-line p-4 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-forest shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-semibold text-ink">Endereço para retirada</p>
            <p className="mt-0.5 text-muted leading-relaxed">
              {storeAddressText}
            </p>
          </div>
        </div>
      )}

      {/* Pagamento */}
      {business.paymentMethods.length > 0 ? (
        <div className="space-y-1.5">
          <label
            htmlFor="customer-payment"
            className="block text-xs font-semibold text-ink"
          >
            Forma de pagamento *
          </label>
          <select
            ref={paymentRef}
            id="customer-payment"
            value={paymentMethod}
            onChange={(e) => handlePaymentChange(e.target.value)}
            aria-invalid={Boolean(errors.paymentMethod)}
            aria-describedby={
              errors.paymentMethod ? 'error-customer-payment' : undefined
            }
            className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-cream border text-sm text-ink ${
              errors.paymentMethod ? 'border-brand' : 'border-line'
            }`}
          >
            <option value="">Selecione...</option>
            {business.paymentMethods.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
          {errors.paymentMethod && (
            <p
              id="error-customer-payment"
              role="alert"
              className="text-xs font-medium text-brand"
            >
              {errors.paymentMethod}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted px-1">
          Forma de pagamento: combinada com o restaurante pelo WhatsApp
        </p>
      )}

      {/* Aviso de pedido mínimo, se aplicável */}
      {belowMinimumOrder && (
        <div
          role="alert"
          className="rounded-xl bg-crust-soft border border-brand/40 p-3 text-xs font-medium text-brand"
        >
          O valor mínimo para entrega é {formatBRL(minimumOrder)}. Adicione mais
          itens para continuar.
        </div>
      )}

      {/* Resumo de valores */}
      <OrderSummary lines={lines} method={method} />

      {/* Ação de envio pelo WhatsApp / Cópia */}
      <WhatsAppCheckout
        lines={lines}
        method={method}
        customer={customer}
        paymentMethod={
          business.paymentMethods.length > 0 ? paymentMethod : undefined
        }
        onValidate={handleValidate}
        disabled={belowMinimumOrder}
        onClearAndReturn={onSuccessClose}
      />
    </form>
  )
}
