import { useState } from 'react'
import { displayName } from '../lib/format'
import type { Product } from '../types'
import { LogoMark } from './LogoMark'

export interface ProductImageProps {
  product: Product
  className?: string
}

export function ProductImage({ product, className = '' }: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const imageSrc = product.image
  const showFallback = !imageSrc || failedSrc === imageSrc

  if (showFallback) {
    return (
      <div
        className={`aspect-square bg-crust-soft flex items-center justify-center overflow-hidden select-none ${className}`}
        aria-hidden="true"
      >
        <div className="opacity-50">
          <LogoMark size={48} decorative />
        </div>
      </div>
    )
  }

  const isPng = imageSrc.toLowerCase().endsWith('.png')

  return (
    <div
      className={`aspect-square bg-crust-soft overflow-hidden select-none ${
        isPng ? 'p-2' : ''
      } ${className}`}
    >
      <img
        src={imageSrc}
        alt={displayName(product.name)}
        width={120}
        height={120}
        loading="lazy"
        decoding="async"
        onError={() => setFailedSrc(imageSrc)}
        className={`w-full h-full ${isPng ? 'object-contain mix-blend-multiply' : 'object-cover'}`}
      />
    </div>
  )
}
