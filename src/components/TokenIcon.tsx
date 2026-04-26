import type { Token } from '../store/dexStore'

interface TokenIconProps {
  token?: Pick<Token, 'symbol' | 'iconSrc' | 'iconClass'>
  className?: string
  fallbackClassName?: string
  ringClassName?: string
}

export default function TokenIcon({
  token,
  className = 'w-8 h-8 rounded-full',
  fallbackClassName,
  ringClassName,
}: TokenIconProps) {
  const baseClassName = ringClassName ? `${className} ${ringClassName}` : className

  if (token?.iconSrc) {
    return (
      <img
        src={token.iconSrc}
        alt={token.symbol}
        className={`${baseClassName} object-cover shrink-0`}
      />
    )
  }

  if (token?.iconClass) {
    return <span className={`${token.iconClass} ${baseClassName} shrink-0`} aria-hidden="true" />
  }

  return (
    <span
      className={`${baseClassName} grid place-items-center text-white font-bold shrink-0 ${fallbackClassName ?? ''}`.trim()}
      style={{ background: 'linear-gradient(135deg, var(--ncx-purple-300), var(--ncx-purple-700))' }}
      aria-hidden="true"
    >
      {token?.symbol?.[0] ?? '?'}
    </span>
  )
}
