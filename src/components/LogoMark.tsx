import { business } from '../config/business'

export interface LogoMarkProps {
  size?: number
  decorative?: boolean
  className?: string
}

export function LogoMark({
  size = 40,
  decorative = false,
  className = '',
}: LogoMarkProps) {
  const width = size / 0.51
  const left = size / 2 - 0.486 * width
  const top = size / 2 - 0.2685 * width

  return (
    <div
      className={`relative overflow-hidden rounded-full shrink-0 select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden={decorative ? 'true' : undefined}
    >
      <img
        src={business.logo}
        alt={decorative ? '' : business.name}
        aria-hidden={decorative ? 'true' : undefined}
        style={{
          position: 'absolute',
          width: `${width}px`,
          left: `${left}px`,
          top: `${top}px`,
          maxWidth: 'none',
        }}
      />
    </div>
  )
}
