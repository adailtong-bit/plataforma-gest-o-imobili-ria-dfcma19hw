import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { usePrivacyStore } from '@/stores/usePrivacyStore'

interface DataMaskProps {
  children?: ReactNode
  className?: string
  blur?: boolean
}

export function DataMask({ children, className, blur }: DataMaskProps) {
  const { isPrivate } = usePrivacyStore()

  // If blur is explicitly provided, use it. Otherwise, fallback to the global privacy state.
  const shouldBlur = blur !== undefined ? blur : isPrivate

  return (
    <span
      className={cn(
        'inline-block align-baseline transition-all duration-300',
        shouldBlur
          ? 'blur-sm select-none opacity-80 hover:blur-none hover:opacity-100 cursor-help'
          : 'filter-none opacity-100',
        className,
      )}
      aria-label={shouldBlur ? 'Sensitive data' : undefined}
      title={shouldBlur ? 'Sensitive data' : undefined}
    >
      {children}
    </span>
  )
}
