import { cn } from '@/lib/utils'

interface DataMaskProps {
  children?: React.ReactNode
  className?: string
  width?: string | number
  showAuth?: boolean
}

export function DataMask({ children, className }: DataMaskProps) {
  // Pass-through component that renders children directly without any masking,
  // obscuring, or opacity reduction, ensuring full visibility.
  return (
    <span
      className={cn(
        'text-black opacity-100 bg-transparent inline-block align-middle',
        className,
      )}
    >
      {children}
    </span>
  )
}
