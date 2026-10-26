import { useEffect } from 'react'
import { Check } from './icons'

export interface ToastProps {
  message: string | null
  onDone: () => void
}

export function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => {
      onDone()
    }, 2500)
    return () => {
      window.clearTimeout(timer)
    }
  }, [message, onDone])

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none px-4 w-full max-w-sm flex justify-center"
    >
      {message && (
        <div className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-ink text-cream text-sm font-medium shadow-lg border border-crust/30 transition-[transform,opacity] duration-150">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-forest text-cream shrink-0">
            <Check className="w-3.5 h-3.5" />
          </span>
          <span className="truncate">{message}</span>
        </div>
      )}
    </div>
  )
}
