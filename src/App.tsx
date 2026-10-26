import { useCallback, useMemo, useState } from 'react'
import { CartBar } from './components/CartBar'
import { CategoryNavigation } from './components/CategoryNavigation'
import { Footer } from './components/Footer'
import { MenuSearch } from './components/MenuSearch'
import { ProductDetails } from './components/ProductDetails'
import { ProductGrid } from './components/ProductGrid'
import { RestaurantHeader } from './components/RestaurantHeader'
import { RestaurantHero } from './components/RestaurantHero'
import { ShoppingCart } from './components/ShoppingCart'
import { Toast } from './components/Toast'
import { menu } from './data/menu'
import { displayName } from './lib/format'
import { filterProducts } from './lib/search'
import { useCart } from './state/CartContext'
import type { Product } from './types'

export function App() {
  const { count } = useCart()
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const filteredProducts = useMemo(
    () => filterProducts(menu.products, query, categoryId),
    [query, categoryId],
  )

  const handleClearFilters = () => {
    setQuery('')
    setCategoryId(null)
  }

  const handleAdded = useCallback((product: Product) => {
    setToast(`Adicionado: ${displayName(product.name)}`)
  }, [])

  const handleToastDone = useCallback(() => {
    setToast(null)
  }, [])

  return (
    <div
      className={`min-h-svh flex flex-col bg-cream text-ink ${
        count > 0 ? 'pb-20 md:pb-0' : ''
      }`}
      data-selected-product={selectedProductId ?? undefined}
      data-cart-open={cartOpen ? 'true' : undefined}
    >
      <a href="#cardapio" className="skip-link">
        Pular para o cardápio
      </a>

      <RestaurantHeader onOpenCart={() => setCartOpen(true)} />

      <main className="flex-1">
        <RestaurantHero />

        <div className="sticky top-[60px] z-20 bg-cream/95 border-b border-line">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center gap-3">
            <div className="w-full md:w-80 shrink-0">
              <MenuSearch value={query} onChange={setQuery} />
            </div>
            <div className="min-w-0 flex-1">
              <CategoryNavigation
                selectedCategoryId={categoryId}
                onSelectCategory={setCategoryId}
              />
            </div>
          </div>
        </div>

        <ProductGrid
          products={filteredProducts}
          query={query}
          categoryId={categoryId}
          onClearFilters={handleClearFilters}
          onOpenProduct={(id) => setSelectedProductId(id)}
          onAdded={handleAdded}
        />
      </main>

      <Footer />

      <CartBar onOpenCart={() => setCartOpen(true)} />

      <ProductDetails
        key={selectedProductId ?? 'none'}
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
        onAdded={handleAdded}
      />

      <ShoppingCart key={cartOpen ? 'open' : 'closed'} open={cartOpen} onClose={() => setCartOpen(false)} />

      <Toast message={toast} onDone={handleToastDone} />
    </div>
  )
}

export default App
