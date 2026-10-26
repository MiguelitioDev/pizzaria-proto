import { menu } from '../data/menu'
import { displayName } from '../lib/format'
import type { Product } from '../types'
import { LogoMark } from './LogoMark'
import { ProductCard } from './ProductCard'

export interface ProductGridProps {
  products: Product[]
  query: string
  categoryId: string | null
  onClearFilters: () => void
  onOpenProduct: (productId: string) => void
  onAdded?: (product: Product) => void
}

export function ProductGrid({
  products,
  query,
  categoryId,
  onClearFilters,
  onOpenProduct,
  onAdded,
}: ProductGridProps) {
  const hasActiveFilter = query.trim().length > 0 || categoryId !== null
  const trimmedQuery = query.trim()

  const sections = menu.categories
    .map((category) => {
      const items = products.filter((p) => p.categoryId === category.id)
      return {
        category,
        items,
      }
    })
    .filter((section) => (hasActiveFilter ? section.items.length > 0 : true))

  const countAnnouncement =
    trimmedQuery.length > 0
      ? products.length === 1
        ? '1 item encontrado'
        : `${products.length} itens encontrados`
      : ''

  return (
    <section
      id="cardapio"
      aria-label="Cardápio de produtos"
      className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
    >
      <div className="sr-only" aria-live="polite" role="status">
        {countAnnouncement}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-paper border border-line rounded-2xl px-6 py-12 my-4">
          <div className="opacity-60 mb-4">
            <LogoMark size={64} decorative />
          </div>
          <p className="font-display font-semibold text-lg text-ink">
            {trimmedQuery.length > 0
              ? `Nenhum item encontrado para “${trimmedQuery}”`
              : 'Nenhum item encontrado nesta categoria'}
          </p>
          <p className="mt-1 text-sm text-muted max-w-md">
            Tente buscar por outro termo ou volte a exibir todos os itens do cardápio.
          </p>
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-5 inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-transform duration-150 active:scale-95 cursor-pointer"
          >
            Limpar busca e filtros
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map(({ category, items }) => {
            const headingId = `categoria-${category.id}`
            const categoryLabel = displayName(category.name)
            return (
              <section
                key={category.id}
                aria-labelledby={headingId}
                className="space-y-4"
              >
                <div className="flex items-baseline justify-between border-b border-line pb-2.5">
                  <h2
                    id={headingId}
                    className="font-display font-bold text-xl sm:text-2xl text-ink tracking-tight"
                  >
                    {categoryLabel}
                  </h2>
                  <span className="text-xs font-medium text-muted">
                    {items.length === 1 ? '1 item' : `${items.length} itens`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpen={onOpenProduct}
                      onAdded={onAdded}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </section>
  )
}
