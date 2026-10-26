import { Close, Search } from './icons'

export interface MenuSearchProps {
  value: string
  onChange: (value: string) => void
}

export function MenuSearch({ value, onChange }: MenuSearchProps) {
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
        <Search className="w-5 h-5" />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Buscar no cardápio"
        placeholder="Buscar pizza, bebida…"
        className="w-full h-12 pl-10 pr-11 rounded-xl bg-paper border border-line text-ink placeholder:text-muted text-sm sm:text-base transition-colors focus:border-forest [&::-webkit-search-cancel-button]:hidden"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          className="absolute inset-y-0 right-1 my-auto inline-flex items-center justify-center w-10 h-10 rounded-lg text-muted hover:text-ink cursor-pointer"
        >
          <Close className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
