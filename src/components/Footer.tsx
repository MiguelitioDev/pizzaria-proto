import { business } from '../config/business'
import { MapPin } from './icons'
import { LogoMark } from './LogoMark'

export function Footer() {
  const { street, number, neighborhood, city, state } = business.address
  const fullAddress = `${street}, ${number} — ${neighborhood}, ${city}/${state}`

  return (
    <footer className="bg-ink text-cream border-t border-forest/40 mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <LogoMark size={44} decorative className="ring-2 ring-crust/40" />
            <div>
              <p className="font-display font-semibold text-lg text-cream leading-snug">
                {business.name}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs sm:text-sm text-cream/80">
                <MapPin className="w-4 h-4 text-crust shrink-0" />
                <span>{fullAddress}</span>
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-cream/80 max-w-md leading-relaxed border-l-2 border-crust/60 pl-3.5">
            Os pedidos são enviados pelo WhatsApp e só são confirmados quando o
            restaurante responder.
          </p>
        </div>
      </div>
    </footer>
  )
}
