import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface DataMaskProps {
  children?: ReactNode
  className?: string
  blur?: boolean
}

export function DataMask({ children, className, blur }: DataMaskProps) {
  return (
    <span
      className={cn(
        'inline-block align-baseline transition-all duration-300',
        blur
          ? 'blur-sm select-none opacity-80 hover:blur-none hover:opacity-100 cursor-help'
          : 'filter-none opacity-100',
        className,
      )}
      aria-label={blur ? 'Sensitive data' : undefined}
      title={blur ? 'Sensitive data' : undefined}
    >
      {children}
    </span>
  )
}
