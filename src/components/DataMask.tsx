import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface DataMaskProps {
  children?: ReactNode
  className?: string
  blur?: boolean
}

export function DataMask({ children, className, blur }: DataMaskProps) {
  // Enhanced component - Data is now fully visible by default as per user request
  // The blur functionality has been visually disabled to ensure legibility
  // while keeping the component structure for semantic data protection wrapping

  return (
    <span
      className={cn(
        'inline-block align-baseline transition-all',
        // Blur classes removed as requested, ensuring data is sharp and legible
        // Using filter-none explicitly to override any potential lingering blur styles
        'filter-none opacity-100',
        className,
      )}
      // Retaining accessibility attributes for context if needed in future
      aria-label={blur ? 'Sensitive data' : undefined}
      title={blur ? 'Sensitive data' : undefined}
    >
      {children}
    </span>
  )
}


