import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface DataMaskProps {
  children?: ReactNode
  className?: string
  blur?: boolean
}

export function DataMask({ children, className, blur }: DataMaskProps) {
  // Enhanced component that provides privacy without compromising legibility when not blurred
  // Default state (blur=false) is perfectly clear with no residual effects
  // Blurred state provides protection with hover-to-reveal functionality

  return (
    <span
      className={cn(
        'transition-all duration-200 ease-in-out inline-block align-baseline',
        blur
          ? 'filter blur-[5px] hover:blur-0 cursor-pointer select-none hover:select-text opacity-70 hover:opacity-100 transition-all'
          : 'filter-none opacity-100',
        className,
      )}
      // Add aria-label and title for accessibility and user feedback
      aria-label={blur ? 'Sensitive data, hover to reveal' : undefined}
      title={blur ? 'Hover to reveal data' : undefined}
    >
      {children}
    </span>
  )
}
