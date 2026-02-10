import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface DataMaskProps {
  children?: ReactNode
  className?: string
  blur?: boolean
}

export function DataMask({ children, className, blur }: DataMaskProps) {
  // Enhanced component - Data is now fully visible by default as per user request
  // The blur functionality has been purposely removed to ensure clarity
  // We ignore the `blur` prop visually to meet the "Data Clarity" requirement

  return (
    <span
      className={cn(
        'inline-block align-baseline transition-all',
        // Ensuring data is sharp and legible, removing filter effects completely
        'filter-none opacity-100',
        className,
      )}
      // Retaining accessibility attributes for semantic context
      aria-label={blur ? 'Sensitive data' : undefined}
      title={blur ? 'Sensitive data' : undefined}
    >
      {children}
    </span>
  )
}
