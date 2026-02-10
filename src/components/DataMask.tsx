import { cn } from '@/lib/utils'

interface DataMaskProps {
  children?: React.ReactNode
  className?: string
  blur?: boolean
}

export function DataMask({ children, className, blur }: DataMaskProps) {
  // Enhanced component that applies a blur effect to sensitive data
  // The blur is removed on hover to reveal the data
  // Using 'group' to allow parent hover to trigger unblur if needed,
  // but primarily self-hover via 'hover:blur-0'

  return (
    <span
      className={cn(
        'transition-all duration-300 ease-in-out inline-block align-baseline',
        // If blur is enabled, apply filter and remove it on hover
        // Changed from blur-[5px] to blur-sm (4px) for a more subtle effect
        blur
          ? 'filter blur-sm hover:blur-0 cursor-default select-none hover:select-text'
          : '',
        className,
      )}
      // Add aria-label for accessibility indicating hidden data
      aria-label={blur ? 'Sensitive data, hover to reveal' : undefined}
    >
      {children}
    </span>
  )
}
