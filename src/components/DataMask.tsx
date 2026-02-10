import { cn } from '@/lib/utils'

interface DataMaskProps {
  children?: React.ReactNode
  className?: string
  width?: string | number
  showAuth?: boolean
  blur?: boolean
}

export function DataMask({ children, className, blur }: DataMaskProps) {
  // Enhanced component that applies a blur effect to sensitive data ONLY if requested
  // By default, content is fully visible to ensure legibility of non-sensitive data
  return (
    <span
      className={cn(
        'inline-block align-middle transition-all duration-300',
        // Apply blur only if sensitive/blur prop is true
        blur
          ? 'blur-[4px] hover:blur-0 select-none hover:select-text cursor-default'
          : '',
        className,
      )}
    >
      {children}
    </span>
  )
}
