import { business } from '../config/business'
import { formatBRL } from '../lib/format'
import { Check, Clock, MapPin } from './icons'

export function RestaurantHero() {
  const radiusKm = business.delivery.radiusMeters / 1000
  const deliveryText = `Entrega ${formatBRL(business.delivery.fee)} (até ${radiusKm} km)`
  const hoursText =
    business.hours === null
      ? 'Horários: consulte o restaurante'
      : business.hours.map((h) => `${h.label}: ${h.opens}–${h.closes}`).join(' · ')

  return (
    <section
      aria-label="Apresentação da pizzaria"
      className="relative overflow-hidden bg-crust-soft border-b border-line"
    >
      {/* Círculo concêntrico decorativo discreto */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 w-96 h-96 rounded-full border-[28px] border-crust/35"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 w-64 h-64 rounded-full border-[14px] border-forest/10"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-6">
          <div className="sm:col-span-7 lg:col-span-8 flex flex-col items-start">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest mb-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>
                {business.address.neighborhood} · {business.address.city}/{business.address.state}
              </span>
            </p>

            <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-ink tracking-tight leading-tight">
              {business.name}
            </h1>

            <p className="mt-2 text-sm sm:text-base text-muted max-w-xl leading-relaxed">
              {business.description}
            </p>

            <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-ink/90">
              {business.fulfillment.delivery && (
                <li className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-forest shrink-0" />
                  <span>{deliveryText}</span>
                </li>
              )}
              {business.fulfillment.pickup && (
                <li className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-forest shrink-0" />
                  <span>Retirada no local</span>
                </li>
              )}
              <li className="inline-flex items-center gap-1.5 text-muted">
                <Clock className="w-4 h-4 text-forest shrink-0" />
                <span>{hoursText}</span>
              </li>
            </ul>

            <div className="mt-5">
              <a
                href="#cardapio"
                className="inline-flex items-center justify-center min-h-[48px] px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm sm:text-base shadow-sm transition-transform duration-150 active:scale-95"
              >
                Ver cardápio
              </a>
            </div>
          </div>

          <div className="hidden sm:flex sm:col-span-5 lg:col-span-4 justify-center sm:justify-end">
            <div className="relative w-56 h-48 md:w-64 md:h-56 lg:w-72 lg:h-60 select-none">
              <div className="absolute left-0 top-3 w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden bg-paper/80 border border-line p-2 shadow-md -rotate-6 transition-transform duration-200 hover:rotate-0">
                <img
                  src="/images/products/4856187.png"
                  alt="Pizza Dois Queijos com molho de tomate, catupiry e muçarela"
                  width={176}
                  height={176}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute right-0 bottom-1 w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden bg-paper border border-line p-2 shadow-lg rotate-6 transition-transform duration-200 hover:rotate-0">
                <img
                  src="/images/products/4856193.png"
                  alt="Pizza Marguerita com molho de tomate, muçarela, tomate e manjericão"
                  width={176}
                  height={176}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
