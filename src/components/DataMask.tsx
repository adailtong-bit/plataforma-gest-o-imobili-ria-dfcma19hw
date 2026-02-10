import { cn } from '@/lib/utils'

interface DataMaskProps {
  children?: React.ReactNode
  className?: string
  width?: string | number
  showAuth?: boolean
}

export function DataMask({ children, className }: DataMaskProps) {
  // Enhanced component that applies a blur effect to sensitive data by default
  // This simulates data masking for sensitive fields across the application
  return (
    <span
      className={cn(
        'inline-block align-middle transition-all duration-300',
        // Default blur to mask sensitive info, hover to reveal
        'blur-[4px] hover:blur-0 select-none hover:select-text cursor-default',
        className,
      )}
    >
      {children}
    </span>
  )
}
