import { MAX_QUANTITY } from '../lib/cart'
import { Minus, Plus, Trash } from './icons'

export interface QuantityStepperProps {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  label: string
  onRemoveAtMin?: () => void
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = MAX_QUANTITY,
  label,
  onRemoveAtMin,
}: QuantityStepperProps) {
  const isAtMin = value <= min
  const isAtMax = value >= max
  const showTrash = isAtMin && Boolean(onRemoveAtMin)

  const handleDecrement = () => {
    if (isAtMin) {
      if (onRemoveAtMin) {
        onRemoveAtMin()
      }
      return
    }
    onChange(Math.max(min, value - 1))
  }

  const handleIncrement = () => {
    if (isAtMax) return
    onChange(Math.min(max, value + 1))
  }

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center bg-cream border border-line rounded-xl p-0.5 select-none"
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isAtMin && !onRemoveAtMin}
        aria-label={showTrash ? `Remover (${label})` : `Diminuir (${label})`}
        className="inline-flex items-center justify-center w-11 h-11 rounded-[10px] text-ink hover:bg-crust-soft/70 disabled:opacity-40 disabled:pointer-events-none transition-colors duration-150 cursor-pointer"
      >
        {showTrash ? (
          <Trash className="w-4 h-4 text-brand" />
        ) : (
          <Minus className="w-4 h-4" />
        )}
      </button>

      <span
        aria-live="polite"
        className="min-w-[32px] px-1.5 text-center text-sm font-semibold text-ink tabular-nums"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={isAtMax}
        aria-label={`Aumentar (${label})`}
        className="inline-flex items-center justify-center w-11 h-11 rounded-[10px] text-ink hover:bg-crust-soft/70 disabled:opacity-40 disabled:pointer-events-none transition-colors duration-150 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}
