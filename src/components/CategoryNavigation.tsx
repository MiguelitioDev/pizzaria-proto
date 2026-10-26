import { useRef } from 'react'
import { menu } from '../data/menu'
import { displayName } from '../lib/format'

export interface CategoryNavigationProps {
  selectedCategoryId: string | null
  onSelectCategory: (categoryId: string | null) => void
}

export function CategoryNavigation({
  selectedCategoryId,
  onSelectCategory,
}: CategoryNavigationProps) {
  const chipRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const handleSelect = (id: string | null, key: string) => {
    onSelectCategory(id)
    const btn = chipRefs.current.get(key)
    if (btn && typeof btn.scrollIntoView === 'function') {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      btn.scrollIntoView({
        inline: 'center',
        block: 'nearest',
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      })
    }
  }

  const items: { id: string | null; key: string; label: string }[] = [
    { id: null, key: '__all__', label: 'Todos' },
    ...menu.categories.map((cat) => ({
      id: cat.id,
      key: cat.id,
      label: displayName(cat.name),
    })),
  ]

  return (
    <nav aria-label="Categorias" className="w-full min-w-0">
      <ul className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory py-0.5">
        {items.map((item) => {
          const isSelected = selectedCategoryId === item.id
          return (
            <li key={item.key} className="snap-start shrink-0">
              <button
                ref={(el) => {
                  if (el) {
                    chipRefs.current.set(item.key, el)
                  } else {
                    chipRefs.current.delete(item.key)
                  }
                }}
                type="button"
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => handleSelect(item.id, item.key)}
                className={`inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-transform duration-150 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-brand text-white border border-brand shadow-xs'
                    : 'bg-paper text-ink border border-line hover:border-crust'
                }`}
              >
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
